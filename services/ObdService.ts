
import { ObdConnectionState } from "../types";

// Service UUIDs
const OBD_SERVICE_UUID_CUSTOM = "0000fff0-0000-1000-8000-00805f9b34fb"; // Veepeak, etc.
const OBD_SERVICE_UUID_STANDARD = "000018f0-0000-1000-8000-00805f9b34fb"; // Standard

// Characteristic UUIDs (Custom)
const OBD_CHAR_WRITE_CUSTOM = "0000fff2-0000-1000-8000-00805f9b34fb";
const OBD_CHAR_NOTIFY_CUSTOM = "0000fff1-0000-1000-8000-00805f9b34fb";

// Characteristic UUIDs (Standard)
const OBD_CHAR_WRITE_STANDARD = "00002af1-0000-1000-8000-00805f9b34fb"; 
const OBD_CHAR_NOTIFY_STANDARD = "00002af0-0000-1000-8000-00805f9b34fb"; 

// Define Web Bluetooth types locally
type BluetoothDevice = any;
type BluetoothRemoteGATTServer = any;
type BluetoothRemoteGATTCharacteristic = any;

export class ObdService {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private writeChar: BluetoothRemoteGATTCharacteristic | null = null;
  private notifyChar: BluetoothRemoteGATTCharacteristic | null = null;
  
  private responseResolver: ((value: string) => void) | null = null;
  private currentResponse: string = "";
  private isBusy: boolean = false;

  constructor(private onStatusChange: (status: ObdConnectionState) => void) {}

  public async connect(): Promise<void> {
    // @ts-ignore
    if (!navigator.bluetooth) {
      console.error("Web Bluetooth API not supported.");
      this.onStatusChange(ObdConnectionState.Error);
      return;
    }

    try {
      this.onStatusChange(ObdConnectionState.Connecting);

      // @ts-ignore
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
            { services: [OBD_SERVICE_UUID_CUSTOM] },
            { services: [OBD_SERVICE_UUID_STANDARD] }
        ],
        optionalServices: [OBD_SERVICE_UUID_CUSTOM, OBD_SERVICE_UUID_STANDARD]
      });

      this.device!.addEventListener('gattserverdisconnected', this.handleDisconnect);
      this.server = await this.device!.gatt!.connect();

      let service = null;
      try {
          service = await this.server!.getPrimaryService(OBD_SERVICE_UUID_CUSTOM);
          this.writeChar = await service.getCharacteristic(OBD_CHAR_WRITE_CUSTOM);
          this.notifyChar = await service.getCharacteristic(OBD_CHAR_NOTIFY_CUSTOM);
      } catch (e) {
          console.log("Custom service not found, trying standard...");
          try {
              service = await this.server!.getPrimaryService(OBD_SERVICE_UUID_STANDARD);
              const chars = await service.getCharacteristics();
              this.notifyChar = chars.find((c: any) => c.properties.notify);
              this.writeChar = chars.find((c: any) => c.properties.write || c.properties.writeWithoutResponse);
          } catch (standardErr) {
              throw new Error("Could not find a supported OBDII service.");
          }
      }

      if (!this.writeChar || !this.notifyChar) {
          throw new Error("Characteristics missing.");
      }

      await this.notifyChar.startNotifications();
      this.notifyChar.addEventListener('characteristicvaluechanged', this.handleNotification);

      await this.initializeElm327();

      this.onStatusChange(ObdConnectionState.Connected);
    } catch (error) {
      console.error("OBD Connection failed", error);
      this.onStatusChange(ObdConnectionState.Error);
      this.disconnect();
    }
  }

  public disconnect = () => {
    if (this.device) {
      if (this.device.gatt?.connected) {
        this.device.gatt.disconnect();
      }
      this.device.removeEventListener('gattserverdisconnected', this.handleDisconnect);
    }
    this.device = null;
    this.server = null;
    this.writeChar = null;
    this.notifyChar = null;
    this.onStatusChange(ObdConnectionState.Disconnected);
  };

  private handleDisconnect = () => {
    console.log("OBD Device disconnected unexpectedly.");
    this.onStatusChange(ObdConnectionState.Disconnected);
  };

  private handleNotification = (event: Event) => {
    // @ts-ignore
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    if (!target.value) return;

    const decoder = new TextDecoder('utf-8');
    const chunk = decoder.decode(target.value);
    
    this.currentResponse += chunk;

    if (this.currentResponse.includes('>')) {
      const fullResponse = this.currentResponse.replace('>', '').trim();
      this.currentResponse = "";
      
      if (this.responseResolver) {
        this.responseResolver(fullResponse);
        this.responseResolver = null;
      }
    }
  };

  private async initializeElm327() {
    this.onStatusChange(ObdConnectionState.Initializing);
    
    await this.runCommand("AT Z"); 
    await new Promise(r => setTimeout(r, 800)); 

    const initCommands = [
        "AT E0", "AT L0", "AT S0", "AT H0", "AT AT 1", "AT SP 0"
    ];

    for (const cmd of initCommands) {
        await this.runCommand(cmd);
        await new Promise(r => setTimeout(r, 50));
    }
    
    await this.runCommand("0100");
    console.log(`OBD Init Complete.`);
  }

  public async runCommand(cmd: string): Promise<string> {
    if (!this.writeChar || !this.device?.gatt?.connected) {
      return "";
    }

    while (this.isBusy) {
      await new Promise(r => setTimeout(r, 10));
    }
    this.isBusy = true;

    return new Promise<string>(async (resolve, reject) => {
      this.responseResolver = resolve;
      
      const timeout = setTimeout(() => {
        this.isBusy = false;
        this.responseResolver = null;
        resolve(""); 
      }, 1500); 

      try {
        const encoder = new TextEncoder();
        await this.writeChar!.writeValue(encoder.encode(cmd + "\r"));
      } catch (e) {
        clearTimeout(timeout);
        this.isBusy = false;
        reject(e);
      }

      const originalResolve = this.responseResolver;
      this.responseResolver = (val: string) => {
        clearTimeout(timeout);
        this.isBusy = false;
        originalResolve!(val);
      }
    });
  }

  // --- Diagnostics ---

  public async getDTCs(): Promise<string[]> {
      // Mode 03: Confirmed Codes
      const response03 = await this.runCommand("03");
      // Mode 07: Pending Codes
      const response07 = await this.runCommand("07");
      
      const codes = new Set<string>();
      
      [response03, response07].forEach(resp => {
          const clean = resp.replace(/[\s\r\n]/g, '');
          if (clean.includes("NODATA")) return;
          
          // Basic parser for CAN or ISO responses (43 xx xx xx...)
          // Removing the Mode response prefix (e.g. 43)
          let hexData = clean;
          if (clean.startsWith('43') || clean.startsWith('47')) {
              hexData = clean.substring(2);
          }
          
          // Each DTC is 2 bytes (4 hex chars)
          for (let i = 0; i < hexData.length; i += 4) {
              const dtcHex = hexData.substring(i, i+4);
              if (dtcHex === '0000' || dtcHex.length < 4) continue;
              
              const code = this.parseDTC(dtcHex);
              if (code) codes.add(code);
          }
      });
      
      return Array.from(codes);
  }

  public async clearDTCs(): Promise<boolean> {
      const response = await this.runCommand("04");
      return response.includes("OK") || response.length < 5; // ELM sometimes just returns prompt
  }

  private parseDTC(hex: string): string {
      const A = parseInt(hex.substring(0, 2), 16);
      const B = hex.substring(2, 4);
      
      const typeCode = (A & 0xC0) >> 6; // First 2 bits
      const typeChar = ['P', 'C', 'B', 'U'][typeCode];
      
      const digit2 = (A & 0x30) >> 4;
      const digit3 = A & 0x0F;
      
      return `${typeChar}${digit2}${digit3}${B}`;
  }

  // --- Data Parsers ---

  private extractData(response: string, servicePrefix: string): string | null {
      const clean = response.replace(/[\s\0>]/g, '');
      if (clean.includes("NODATA") || clean.includes("SEARCH") || clean.includes("ERROR") || clean.includes("STOPPED")) {
          return null;
      }
      const idx = clean.indexOf(servicePrefix);
      if (idx !== -1) {
          return clean.substring(idx + servicePrefix.length);
      }
      if (/^[0-9A-Fa-f]+$/.test(clean)) {
           return clean; 
      }
      return null;
  }

  public parseRpm(response: string): number {
    try {
        const data = this.extractData(response, "410C");
        if (!data || data.length < 4) return 0;
        const a = parseInt(data.substring(0, 2), 16);
        const b = parseInt(data.substring(2, 4), 16);
        const val = ((a * 256) + b) / 4;
        return isNaN(val) ? 0 : val;
    } catch { return 0; }
  }

  public parseSpeed(response: string): number {
    try {
        const data = this.extractData(response, "410D");
        if (!data || data.length < 2) return 0;
        const val = parseInt(data.substring(0, 2), 16);
        return isNaN(val) ? 0 : val;
    } catch { return 0; }
  }

  public parseCoolant(response: string): number {
      try {
        const data = this.extractData(response, "4105");
        if (!data || data.length < 2) return 0;
        const val = parseInt(data.substring(0, 2), 16) - 40;
        return isNaN(val) ? 0 : val;
      } catch { return 0; }
  }

  public parseIntakeTemp(response: string): number {
      try {
        const data = this.extractData(response, "410F");
        if (!data || data.length < 2) return 0;
        const val = parseInt(data.substring(0, 2), 16) - 40;
        return isNaN(val) ? 0 : val;
      } catch { return 0; }
  }

  public parseMap(response: string): number {
      try {
          const data = this.extractData(response, "410B");
          if (!data || data.length < 2) return 0;
          const val = parseInt(data.substring(0, 2), 16);
          return isNaN(val) ? 0 : val;
      } catch { return 0; }
  }

  public parseLoad(response: string): number {
      try {
          const data = this.extractData(response, "4104");
          if (!data || data.length < 2) return 0;
          const val = (parseInt(data.substring(0, 2), 16) * 100) / 255;
          return isNaN(val) ? 0 : val;
      } catch { return 0; }
  }

  public parseVoltage(response: string): number {
      if (response.includes("V")) {
          const val = parseFloat(response.replace("V", ""));
          return isNaN(val) ? 0 : val;
      }
      try {
          const data = this.extractData(response, "4142");
          if (data && data.length >= 4) {
               const a = parseInt(data.substring(0, 2), 16);
               const b = parseInt(data.substring(2, 4), 16);
               const val = ((a * 256) + b) / 1000;
               return isNaN(val) ? 0 : val;
          }
      } catch { return 0; }
      return 0;
  }

  public parseTimingAdvance(response: string): number {
      try {
          const data = this.extractData(response, "410E");
          if (!data || data.length < 2) return 0;
          const val = (parseInt(data.substring(0, 2), 16) - 128) / 2;
          return isNaN(val) ? 0 : val;
      } catch { return 0; }
  }

  public parseMaf(response: string): number {
      try {
          const data = this.extractData(response, "4110");
          if (!data || data.length < 4) return 0;
          const a = parseInt(data.substring(0, 2), 16);
          const b = parseInt(data.substring(2, 4), 16);
          const val = ((256 * a) + b) / 100;
          return isNaN(val) ? 0 : val;
      } catch { return 0; }
  }

  public parseThrottlePos(response: string): number {
      try {
          const data = this.extractData(response, "4111");
          if (!data || data.length < 2) return 0;
          const val = (parseInt(data.substring(0, 2), 16) * 100) / 255;
          return isNaN(val) ? 0 : val;
      } catch { return 0; }
  }

  public parseFuelRailPressure(response: string): number {
      try {
          const data = this.extractData(response, "4123");
          if (!data || data.length < 4) return 0;
          const a = parseInt(data.substring(0, 2), 16);
          const b = parseInt(data.substring(2, 4), 16);
          const val = ((256 * a) + b) * 10;
          return isNaN(val) ? 0 : val;
      } catch { return 0; }
  }

  public parseFuelLevel(response: string): number {
      try {
          const data = this.extractData(response, "412F");
          if (!data || data.length < 2) return 0;
          const val = (parseInt(data.substring(0, 2), 16) * 100) / 255;
          return isNaN(val) ? 0 : val;
      } catch { return 0; }
  }

  public parseBarometricPressure(response: string): number {
      try {
          const data = this.extractData(response, "4133");
          if (!data || data.length < 2) return 0;
          const val = parseInt(data.substring(0, 2), 16);
          return isNaN(val) ? 0 : val;
      } catch { return 0; }
  }

  public parseLambda(response: string): number {
      try {
          const data = this.extractData(response, "4144");
          if (!data || data.length < 4) return 0;
          const a = parseInt(data.substring(0, 2), 16);
          const b = parseInt(data.substring(2, 4), 16);
          const val = ((256 * a) + b) / 32768;
          return isNaN(val) ? 0 : val;
      } catch { return 0; }
  }

  public parseAmbientTemp(response: string): number {
      try {
          const data = this.extractData(response, "4146");
          if (!data || data.length < 2) return 0;
          const val = parseInt(data.substring(0, 2), 16) - 40;
          return isNaN(val) ? 0 : val;
      } catch { return 0; }
  }
}
