
export interface SensorDataPoint {
  time: number;
  rpm: number;
  speed: number;
  gear: number;
  fuelUsed: number;
  inletAirTemp: number;
  batteryVoltage: number;
  engineTemp: number;
  fuelTemp: number;
  turboBoost: number;
  fuelPressure: number;
  oilPressure: number;
  // New detailed OBD-II params for AI Engine
  shortTermFuelTrim: number;
  longTermFuelTrim: number;
  o2SensorVoltage: number;
  engineLoad: number;
  // For Race Pack
  distance: number;
  gForceX: number; // Lateral G
  gForceY: number; // Longitudinal G
  // For GPS
  latitude: number;
  longitude: number;
  // Source tracking
  source?: 'sim' | 'live_obd';
  // Additional Sensor Data
  maf: number;
  timingAdvance: number;
  throttlePos: number;
  fuelLevel: number;
  barometricPressure: number;
  ambientTemp: number;
  fuelRailPressure: number;
  lambda: number;
}

export enum AlertLevel {
  Info = 'Info',
  Warning = 'Warning',
  Critical = 'Critical'
}

export enum ObdConnectionState {
  Disconnected = 'Disconnected',
  Connecting = 'Connecting',
  Initializing = 'Initializing', // Sending AT commands
  Connected = 'Connected',
  Error = 'Error'
}

export interface DiagnosticAlert {
  id: string;
  level: AlertLevel;
  component: string;
  message: string;
  timestamp: string;
  isFaultRelated?: boolean; // New field for Co-Pilot context
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  service: string;
  notes: string;
  verified: boolean;
  isAiRecommendation: boolean;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

// Types for the new Predictive AI Engine
export interface PredictiveIssue {
    component: string;
    rootCause: string;
    recommendedActions: string[];
    plainEnglishSummary: string;
    tsbs?: string[];
}

export interface TimelineEvent {
    id: string;
    level: AlertLevel;
    title: string;
    timeframe: string; // e.g., "Immediate", "Next 3 months", "Within 5000 miles"
    details: PredictiveIssue;
}

// Types for the new AI Tuning Assistant
export interface TuningSuggestion {
  suggestedParams: {
    fuelMap: number;
    ignitionTiming: number;
    boostPressure: number;
  };
  analysis: {
    predictedGains: string;
    potentialRisks: string;
  };
}

// Types for Security Audit Trail
export enum AuditEvent {
    Login = 'User Login',
    AiAnalysis = 'AI Analysis',
    DataSync = 'Data Sync',
    TuningChange = 'Tuning Change',
    DiagnosticQuery = 'Diagnostic Query'
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  event: AuditEvent;
  description: string;
  ipAddress: string;
  status: 'Success' | 'Failure';
}

// Types for AR Assistant
export enum IntentAction {
  ShowComponent = 'SHOW_COMPONENT',
  QueryService = 'QUERY_SERVICE',
  HideComponent = 'HIDE_COMPONENT',
  Unknown = 'UNKNOWN',
}

export interface VoiceCommandIntent {
  intent: IntentAction;
  component?: string; // e.g., 'o2-sensor', 'map-sensor'
  confidence: number;
}

export interface ComponentHotspot {
  id: string;
  name: string;
  cx: string;
  cy: string;
  status: 'Normal' | 'Warning' | 'Failing';
}

// Types for Hedera DLT Integration
export enum HederaEventType {
    Maintenance = 'Maintenance',
    Tuning = 'AI Tuning',
    Diagnostic = 'Diagnostic Alert',
}

export interface HederaRecord {
    id: string;
    timestamp: string;
    eventType: HederaEventType;
    vin: string;
    summary: string;
    hederaTxId: string;
    dataHash: string; // The hash of the off-chain data
}

// Types for Race Pack
export interface LapTime {
    lap: number;
    time: number;
}

export interface RaceSession {
    isActive: boolean;
    startTime: number | null;
    elapsedTime: number;
    data: SensorDataPoint[];
    lapTimes: LapTime[];
    zeroToHundredTime: number | null;
    quarterMileTime: number | null;
    quarterMileSpeed: number | null;
}

// Types for Co-Pilot Intelligent Actions
export interface CoPilotAction {
  action: 'NAVIGATE' | 'SPEAK' | 'TOGGLE_FEATURE' | 'ANALYZE';
  payload?: string; // Route path, feature name, or null
  textToSpeak: string;
}

// New: Structured Voice Response from Gemini
export interface VoiceActionResponse {
    speech: string;
    action: 'NAVIGATE' | 'NONE';
    target: string | null;
}

// --- Dyno Lab Types ---
export interface DynoPoint {
    rpm: number;
    torque: number; // Nm
    power: number; // HP
    afr: number;
    boost: number; // bar
}

export interface DynoRun {
    id: string;
    timestamp: number;
    name: string;
    data: DynoPoint[];
    peakPower: number;
    peakTorque: number;
    color: string;
    isVisible: boolean;
}
