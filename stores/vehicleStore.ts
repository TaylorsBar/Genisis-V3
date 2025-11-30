
import { create } from 'zustand';
import { SensorDataPoint, ObdConnectionState, DynoRun, DynoPoint } from '../types';
import { ObdService } from '../services/ObdService';
import { GenesisEKFUltimate } from '../services/GenesisEKFUltimate';
import { VisualOdometryResult } from '../services/VisionGroundTruth';

// --- Constants ---
const UPDATE_INTERVAL_MS = 50; 
const MAX_DATA_POINTS = 300; // Increased buffer
const RPM_IDLE = 800;
const RPM_MAX = 8000;
const SPEED_MAX = 280;
const GEAR_RATIOS = [0, 3.6, 2.1, 1.4, 1.0, 0.8, 0.6];
const FINAL_DRIVE = 3.9;
const TIRE_DIAMETER_M = 0.65;
const VEHICLE_MASS_KG = 1500; // Configurable in future
const DEFAULT_LAT = -37.88;
const DEFAULT_LON = 175.55;

// Robust number sanitizer
const s = (val: any, fallback: number = 0): number => {
    if (typeof val === 'number' && !Number.isNaN(val) && Number.isFinite(val)) return val;
    return fallback;
};

const generateInitialData = (): SensorDataPoint[] => {
  const data: SensorDataPoint[] = [];
  const now = Date.now();
  for (let i = MAX_DATA_POINTS; i > 0; i--) {
    data.push({
      time: now - i * UPDATE_INTERVAL_MS,
      rpm: RPM_IDLE,
      speed: 0,
      gear: 1,
      fuelUsed: 19.4,
      inletAirTemp: 25.0,
      batteryVoltage: 12.7,
      engineTemp: 90.0,
      fuelTemp: 20.0,
      turboBoost: -0.8,
      fuelPressure: 3.5,
      oilPressure: 1.5,
      shortTermFuelTrim: 0,
      longTermFuelTrim: 1.5,
      o2SensorVoltage: 0.45,
      engineLoad: 15,
      distance: 0,
      gForceX: 0,
      gForceY: 0,
      latitude: DEFAULT_LAT,
      longitude: DEFAULT_LON,
      source: 'sim',
      maf: 3.5,
      timingAdvance: 10,
      throttlePos: 15,
      fuelLevel: 75,
      barometricPressure: 101.3,
      ambientTemp: 22,
      fuelRailPressure: 3500,
      lambda: 1.0
    });
  }
  return data;
};

const generateBaseMap = (): number[][] => {
    const map: number[][] = [];
    for (let loadIdx = 0; loadIdx < 16; loadIdx++) {
        const row: number[] = [];
        const load = loadIdx * (100/15);
        for (let rpmIdx = 0; rpmIdx < 16; rpmIdx++) {
            const rpm = rpmIdx * (8000/15);
            const rpmNorm = rpm / 8000;
            const loadNorm = load / 100;
            let ve = 40 + (loadNorm * 20); 
            ve += Math.sin(rpmNorm * Math.PI) * 40; 
            ve += (Math.random() * 2 - 1);
            row.push(s(Math.max(0, Math.min(120, ve))));
        }
        map.push(row);
    }
    return map;
};

// --- Module-Level State ---
enum SimState { IDLE, ACCELERATING, CRUISING, BRAKING, CORNERING }
let currentSimState = SimState.IDLE;
let simStateTimeout = 0;
let lastUpdateTime = Date.now();

const ekf = new GenesisEKFUltimate();
let obdService: ObdService | null = null;
let simulationInterval: any = null;
let gpsWatchId: number | null = null;
let gpsLatest: { speed: number | null, accuracy: number, latitude: number, longitude: number } | null = null;

let isObdPolling = false;
// Cache populated by Priority Polling
let obdCache = {
    rpm: 0, speed: 0, coolant: 0, intake: 0, load: 0, map: 0, voltage: 0,
    maf: 0, timing: 0, throttle: 0, fuelLevel: 0, baro: 0, ambient: 0, fuelRail: 0, lambda: 0,
    lastUpdate: 0
};

let lastVisionUpdate = 0;

interface TuningState {
    veTable: number[][]; 
    ignitionTable: number[][];
    boostTarget: number;
    globalFuelTrim: number;
}

interface DynoState {
    isRunning: boolean;
    currentRunData: DynoPoint[];
    runs: DynoRun[];
}

interface VehicleStoreState {
  data: SensorDataPoint[];
  latestData: SensorDataPoint;
  hasActiveFault: boolean;
  obdState: ObdConnectionState;
  ekfStats: { visionConfidence: number; gpsActive: boolean; fusionUncertainty: number };
  tuning: TuningState;
  dyno: DynoState;
  
  // Diagnostics
  dtcs: string[];
  isScanning: boolean;

  // Actions
  startSimulation: () => void;
  stopSimulation: () => void;
  connectObd: () => Promise<void>;
  disconnectObd: () => void;
  scanVehicle: () => Promise<void>;
  clearFaults: () => Promise<void>;
  
  processVisionFrame: (imageData: ImageData) => VisualOdometryResult;
  updateMapCell: (table: 've' | 'ign', row: number, col: number, value: number) => void;
  smoothMap: (table: 've' | 'ign') => void;
  startDynoRun: () => void;
  stopDynoRun: () => void;
  toggleDynoRunVisibility: (id: string) => void;
  deleteDynoRun: (id: string) => void;
}

// Enterprise Grade Priority Polling Loop
const startObdPolling = async () => {
    isObdPolling = true;
    let loopCount = 0;

    while (isObdPolling && obdService) {
        try {
            // HIGH PRIORITY (Critical for physics/display) - Every Loop
            // Using 'high' priority pushes these to front of queue
            const p1 = [
                obdService.runCommand("010C", 'high').then(r => { const v = obdService!.parseRpm(r); if(Number.isFinite(v)) obdCache.rpm = v; }),
                obdService.runCommand("010D", 'high').then(r => { const v = obdService!.parseSpeed(r); if(Number.isFinite(v)) obdCache.speed = v; }),
                obdService.runCommand("010B", 'high').then(r => { const v = obdService!.parseMap(r); if(Number.isFinite(v)) obdCache.map = v; }),
                obdService.runCommand("0111", 'high').then(r => { const v = obdService!.parseThrottlePos(r); if(Number.isFinite(v)) obdCache.throttle = v; }),
                obdService.runCommand("010E", 'high').then(r => { const v = obdService!.parseTimingAdvance(r); if(Number.isFinite(v)) obdCache.timing = v; }),
            ];
            
            // MEDIUM PRIORITY (Engine Health) - Every 10th loop (~500ms)
            if (loopCount % 10 === 0) {
                p1.push(obdService.runCommand("0144", 'low').then(r => { const v = obdService!.parseLambda(r); if(Number.isFinite(v)) obdCache.lambda = v; }));
                p1.push(obdService.runCommand("0105", 'low').then(r => { const v = obdService!.parseCoolant(r); if(Number.isFinite(v)) obdCache.coolant = v; }));
            }

            // LOW PRIORITY (Environmental) - Every 50th loop (~2.5s)
            if (loopCount % 50 === 0) {
                obdService.runCommand("010F", 'low').then(r => { const v = obdService!.parseIntakeTemp(r); if(Number.isFinite(v)) obdCache.intake = v; });
                obdService.runCommand("0142", 'low').then(r => { const v = obdService!.parseVoltage(r); if(Number.isFinite(v)) obdCache.voltage = v; });
                obdService.runCommand("012F", 'low').then(r => { const v = obdService!.parseFuelLevel(r); if(Number.isFinite(v)) obdCache.fuelLevel = v; });
            }

            await Promise.all(p1); // Wait for criticals
            
            obdCache.lastUpdate = Date.now();
            loopCount++;
            if (loopCount > 1000) loopCount = 0;
            
            // Small throttle to allow UI frame
            await new Promise(r => setTimeout(r, 10));
        } catch (e) {
            console.warn("Polling hiccup", e);
            await new Promise(r => setTimeout(r, 100));
        }
    }
};

export const useVehicleStore = create<VehicleStoreState>((set, get) => ({
  data: generateInitialData(),
  latestData: generateInitialData()[generateInitialData().length - 1],
  hasActiveFault: false,
  obdState: ObdConnectionState.Disconnected,
  ekfStats: { visionConfidence: 0, gpsActive: false, fusionUncertainty: 0 },
  tuning: { veTable: generateBaseMap(), ignitionTable: generateBaseMap(), boostTarget: 18.0, globalFuelTrim: 0 },
  dyno: { isRunning: false, currentRunData: [], runs: [] },
  dtcs: [],
  isScanning: false,

  scanVehicle: async () => {
      const { obdState } = get();
      if (obdState !== ObdConnectionState.Connected || !obdService) {
          // Simulation Mock
          set({ isScanning: true });
          await new Promise(r => setTimeout(r, 2000));
          set({ isScanning: false, dtcs: ['P0300', 'P0171'], hasActiveFault: true });
          return;
      }

      set({ isScanning: true });
      isObdPolling = false; // Halt telemetry to free bus
      await new Promise(r => setTimeout(r, 200));

      try {
          const codes = await obdService.getDTCs();
          set({ dtcs: codes, hasActiveFault: codes.length > 0 });
      } catch (e) {
          console.error("Scan failed", e);
      } finally {
          set({ isScanning: false });
          startObdPolling(); // Resume
      }
  },

  clearFaults: async () => {
      if (obdService) {
          isObdPolling = false;
          await new Promise(r => setTimeout(r, 200));
          await obdService.clearDTCs();
          startObdPolling();
      }
      set({ dtcs: [], hasActiveFault: false });
  },

  processVisionFrame: (imageData: ImageData) => {
      const now = Date.now();
      let dt = (now - lastVisionUpdate) / 1000;
      if (dt <= 0 || dt > 1.0) dt = 0.05; 
      lastVisionUpdate = now;
      const result = ekf.processCameraFrame(imageData, dt);
      set(state => ({ ekfStats: { ...state.ekfStats, visionConfidence: s(result.confidence) } }));
      return result;
  },

  updateMapCell: (table, row, col, value) => {
      set(state => {
          const newMap = table === 've' ? [...state.tuning.veTable] : [...state.tuning.ignitionTable];
          newMap[row] = [...newMap[row]]; 
          newMap[row][col] = s(value);
          return { tuning: { ...state.tuning, [table === 've' ? 'veTable' : 'ignitionTable']: newMap } };
      });
  },

  smoothMap: (table) => {
      set(state => {
           const map = table === 've' ? state.tuning.veTable : state.tuning.ignitionTable;
           const newMap = map.map((row, r) => row.map((val, c) => {
               let sum = val;
               let count = 1;
               if (r>0) { sum += map[r-1][c]; count++; }
               if (r<15) { sum += map[r+1][c]; count++; }
               if (c>0) { sum += map[r][c-1]; count++; }
               if (c<15) { sum += map[r][c+1]; count++; }
               return s(sum / count);
           }));
           return { tuning: { ...state.tuning, [table === 've' ? 'veTable' : 'ignitionTable']: newMap } }
      });
  },
  
  startDynoRun: () => set(state => ({ dyno: { ...state.dyno, isRunning: true, currentRunData: [] } })),
  
  stopDynoRun: () => set(state => {
      if (!state.dyno.isRunning) return state;
      const newRun: DynoRun = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          name: `Run ${state.dyno.runs.length + 1}`,
          data: state.dyno.currentRunData,
          peakPower: Math.max(...state.dyno.currentRunData.map(p => p.power), 0),
          peakTorque: Math.max(...state.dyno.currentRunData.map(p => p.torque), 0),
          color: `hsl(${Math.random() * 360}, 70%, 50%)`,
          isVisible: true
      };
      return { dyno: { ...state.dyno, isRunning: false, runs: [...state.dyno.runs, newRun], currentRunData: [] } };
  }),
  
  toggleDynoRunVisibility: (id) => set(state => ({ dyno: { ...state.dyno, runs: state.dyno.runs.map(r => r.id === id ? { ...r, isVisible: !r.isVisible } : r) } })),
  
  deleteDynoRun: (id) => set(state => ({ dyno: { ...state.dyno, runs: state.dyno.runs.filter(r => r.id !== id) } })),

  connectObd: async () => {
    if (!obdService) {
      obdService = new ObdService((status) => {
          set({ obdState: status });
          if (status === ObdConnectionState.Disconnected) isObdPolling = false;
      });
    }
    await obdService.connect();
    startObdPolling();
  },

  disconnectObd: () => { isObdPolling = false; obdService?.disconnect(); },

  startSimulation: () => {
    if (simulationInterval) return;
    if ('geolocation' in navigator && !gpsWatchId) {
      try {
        gpsWatchId = navigator.geolocation.watchPosition(
          (pos) => { if (pos && pos.coords) gpsLatest = { speed: pos.coords.speed ?? 0, accuracy: pos.coords.accuracy, latitude: pos.coords.latitude, longitude: pos.coords.longitude }; },
          (err) => {}, { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
        );
      } catch (e) {}
    }

    simulationInterval = setInterval(() => {
      const state = get();
      const now = Date.now();
      let deltaTimeSeconds = (now - lastUpdateTime) / 1000.0;
      if (deltaTimeSeconds <= 0 || isNaN(deltaTimeSeconds)) deltaTimeSeconds = 0.05; 
      lastUpdateTime = now;
      const prev = state.latestData;
      
      const isObdFresh = state.obdState === ObdConnectionState.Connected && (now - obdCache.lastUpdate < 5000);
      let newPointSource: 'sim' | 'live_obd' = isObdFresh ? 'live_obd' : 'sim';

      let { rpm, gear } = prev;
      
      // --- VIRTUAL DYNO PHYSICS ---
      // If we are in a dyno run, override physics with sweep
      if (state.dyno.isRunning) {
          gear = 4; 
          rpm += 800 * deltaTimeSeconds; // Sweep rate
          if (rpm >= RPM_MAX) { state.stopDynoRun(); rpm = 2000; } 
          else {
              // Synthetic power calculation
              const rpmNorm = s(rpm) / 7000;
              const torqueCurve = (Math.sin(rpmNorm * Math.PI) + 0.5) * 300;
              const boostFactor = 1 + (Math.max(0, prev.turboBoost) * 0.5);
              const currentTorque = s(torqueCurve * boostFactor * (0.95 + Math.random()*0.1));
              const currentPowerHP = s((currentTorque * 0.737 * rpm) / 5252);
              state.dyno.currentRunData.push({ rpm: s(rpm), torque: currentTorque, power: currentPowerHP, afr: 12.5, boost: s(prev.turboBoost) });
          }
      } else if (!isObdFresh) {
          // Simulation Logic
          if (now > simStateTimeout) {
            currentSimState = [SimState.ACCELERATING, SimState.CRUISING, SimState.BRAKING][Math.floor(Math.random()*3)];
            simStateTimeout = now + 5000;
          }
          switch (currentSimState) {
            case SimState.ACCELERATING: rpm += 300; if (rpm > 6000 && gear < 6) { gear++; rpm=3500; } break;
            case SimState.CRUISING: rpm += (Math.random()-0.5)*50; break;
            case SimState.BRAKING: rpm *= 0.95; if (rpm < 1500 && gear > 1) { gear--; rpm=2500; } break;
          }
          rpm = Math.max(RPM_IDLE, Math.min(rpm, RPM_MAX));
      } else {
          // Use OBD Cache
          rpm = obdCache.rpm;
          
          // VIRTUAL GEAR CALCULATOR
          // ratio = (RPM * 60) / (SpeedKMH * 1000 / (Circumference))
          if (obdCache.speed > 10 && rpm > 500) {
              const tireCirc = Math.PI * TIRE_DIAMETER_M;
              const currentRatio = (rpm * 60) / (obdCache.speed * 1000 / 60 * tireCirc); // Simplistic
              // Find closest gear
              // In production we would map specific ratios
              if (currentRatio > 3.0) gear = 1;
              else if (currentRatio > 2.0) gear = 2;
              else if (currentRatio > 1.3) gear = 3;
              else if (currentRatio > 1.0) gear = 4;
              else if (currentRatio > 0.8) gear = 5;
              else gear = 6;
          }
      }

      let inputSpeed = 0;
      if (isObdFresh) {
          inputSpeed = obdCache.speed;
          ekf.fuseObdSpeed(inputSpeed * 1000 / 3600); 
      } else {
          // Physics speed
          const simSpeed = (rpm / (GEAR_RATIOS[gear||1] * 300)) * (1 - (1 / (gear||1))) * 10;
          inputSpeed = Math.max(0, Math.min(simSpeed, SPEED_MAX));
          ekf.fuseObdSpeed(inputSpeed * 1000 / 3600);
      }
      
      // EKF Prediction
      // If we had IMU, we'd pass it here. For now passing zero bias.
      ekf.predict([0,0,0], [0,0,0], deltaTimeSeconds);
      if (gpsLatest) ekf.fuseGps(gpsLatest.speed ?? 0, gpsLatest.accuracy);

      const fusedSpeedKph = ekf.getEstimatedSpeed() * 3.6;
      
      const newPoint: SensorDataPoint = {
        time: now,
        rpm: s(rpm),
        speed: s(fusedSpeedKph),
        gear: s(gear),
        fuelUsed: s(prev.fuelUsed + 0.001), 
        inletAirTemp: s(isObdFresh ? obdCache.intake : 35),
        batteryVoltage: s(isObdFresh ? obdCache.voltage : 13.8),
        engineTemp: s(isObdFresh ? obdCache.coolant : 90),
        fuelTemp: 40,
        turboBoost: s(isObdFresh ? (obdCache.map - 100) / 100 : 0.5),
        fuelPressure: 3.5, oilPressure: 3.0, shortTermFuelTrim: 0, longTermFuelTrim: 0, o2SensorVoltage: 0.5, engineLoad: s(isObdFresh ? obdCache.load : 25),
        distance: s(prev.distance + (fusedSpeedKph/3600)*deltaTimeSeconds),
        gForceX: 0, gForceY: 0,
        latitude: s(gpsLatest ? gpsLatest.latitude : prev.latitude),
        longitude: s(gpsLatest ? gpsLatest.longitude : prev.longitude),
        source: newPointSource,
        maf: s(isObdFresh ? obdCache.maf : 3.5),
        timingAdvance: s(isObdFresh ? obdCache.timing : 10),
        throttlePos: s(isObdFresh ? obdCache.throttle : 15),
        fuelLevel: s(isObdFresh ? obdCache.fuelLevel : 75),
        barometricPressure: 101.3,
        ambientTemp: 22,
        fuelRailPressure: 3500,
        lambda: s(isObdFresh ? obdCache.lambda : 1.0)
      };

      const newData = [...state.data, newPoint];
      if (newData.length > MAX_DATA_POINTS) newData.shift();

      set(state => ({
        data: newData,
        latestData: newPoint,
        ekfStats: { ...state.ekfStats, gpsActive: gpsLatest !== null, fusionUncertainty: s(ekf.getUncertainty()) },
        dyno: { ...state.dyno, currentRunData: state.dyno.isRunning ? [...state.dyno.currentRunData] : state.dyno.currentRunData }
      }));
    }, UPDATE_INTERVAL_MS);
  },

  stopSimulation: () => {
    if (simulationInterval) { clearInterval(simulationInterval); simulationInterval = null; }
    if (gpsWatchId) navigator.geolocation.clearWatch(gpsWatchId);
  }
}));
