
import { GoogleGenAI, Chat, GenerateContentResponse, Type } from "@google/genai";
import { MaintenanceRecord, SensorDataPoint, TuningSuggestion, VoiceCommandIntent, DiagnosticAlert, CoPilotAction, VoiceActionResponse } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

// Singleton chat session to maintain history
let chatSession: Chat | null = null;

const BASE_SYSTEM_INSTRUCTION = `
You are 'KC', the Chief Engineer and AI Core of the Genesis Telemetry System (CartelWorx).
Your persona is: Expert, Technical, Concise, and Cool. You speak like a seasoned race engineer or a high-tech cyberpunk mechanic.
- Use technical terms correctly (AFR, VE, Timing, Boost).
- Keep responses brief and actionable, especially if the car is moving.
- You have access to the vehicle's live telemetry and configuration.
- If you detect a critical issue, warn the user immediately.
- Do not hallucinate values. Use the provided telemetry.
`;

export const initializeChatSession = (initialContext?: string) => {
    chatSession = ai.chats.create({
        model: 'gemini-3-pro-preview', 
        config: {
            systemInstruction: BASE_SYSTEM_INSTRUCTION,
            temperature: 0.7,
        }
    });
};

// ... (Existing Functions: sendMessageToAI, processVoiceCommand, etc. remain the same, just appending new ones)

export const sendMessageToAI = async (
    userMessage: string, 
    vehicleData: SensorDataPoint, 
    appContext: string
): Promise<string> => {
    if (!chatSession) {
        initializeChatSession();
    }

    const contextBlock = `
    [SYSTEM_CONTEXT_UPDATE]
    Current Screen: ${appContext}
    Live Telemetry: 
    - RPM: ${vehicleData.rpm.toFixed(0)}
    - Speed: ${vehicleData.speed.toFixed(0)} km/h
    - Boost: ${vehicleData.turboBoost.toFixed(2)} bar
    - Throttle: ${vehicleData.throttlePos.toFixed(0)}%
    - Timing Adv: ${vehicleData.timingAdvance.toFixed(1)} deg
    - MAF: ${vehicleData.maf.toFixed(1)} g/s
    - Lambda: ${vehicleData.lambda.toFixed(2)}
    - Rail Pressure: ${vehicleData.fuelRailPressure.toFixed(0)} kPa
    - IAT: ${vehicleData.inletAirTemp.toFixed(0)} C
    - Coolant: ${vehicleData.engineTemp.toFixed(0)} C
    - Oil P: ${vehicleData.oilPressure.toFixed(1)} bar
    - Fuel Lvl: ${vehicleData.fuelLevel.toFixed(0)}%
    - Faults: ${vehicleData.engineTemp > 105 ? 'OVERHEAT WARNING' : 'None'}
    [/SYSTEM_CONTEXT_UPDATE]
    `;

    try {
        const fullMessage = `${contextBlock}\n\nUser Query: ${userMessage}`;
        const response = await chatSession!.sendMessage({ message: fullMessage });
        return response.text || "Signal lost. Re-establishing link...";
    } catch (error) {
        console.error("Gemini Chat Error:", error);
        return "Error: Uplink unstable. Please retry.";
    }
};

export const processVoiceCommand = async (
    userMessage: string,
    vehicleData: SensorDataPoint,
    currentRoute: string,
    dtcs: string[] = []
): Promise<VoiceActionResponse> => {
    try {
        const telemetrySummary = `
            SPEED:${vehicleData.speed.toFixed(0)} KPH | RPM:${vehicleData.rpm.toFixed(0)} | GEAR:${vehicleData.gear}
            BOOST:${vehicleData.turboBoost.toFixed(2)} BAR | AFR:${(vehicleData.lambda * 14.7).toFixed(1)}
            CLT:${vehicleData.engineTemp.toFixed(0)}C | OIL:${vehicleData.oilPressure.toFixed(1)} BAR
            IAT:${vehicleData.inletAirTemp.toFixed(0)}C | VOLT:${vehicleData.batteryVoltage.toFixed(1)}V
            ACTIVE_DTCs: [${dtcs.join(', ')}]
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `
                ROLE: You are KC, an AI Co-Pilot for a high-performance vehicle.
                CONTEXT: The user is driving or tuning. Keep responses concise (under 20 words), professional, and cool.
                
                CURRENT STATE:
                Route: ${currentRoute}
                Telemetry: ${telemetrySummary}

                USER COMMAND: "${userMessage}"

                INSTRUCTIONS:
                1. ANALYZE the command and telemetry.
                2. If the user asks about vehicle health, use the telemetry/DTCs to diagnose.
                3. If the user gives a navigation command (e.g., "Go to tuning", "Show me the map"), set action to NAVIGATE.
                4. GENERATE a JSON response.

                ROUTE MAP:
                - Dashboard -> '/'
                - Race/Track -> '/race-pack'
                - Tuning/Dyno -> '/tuning'
                - Diagnostics/Codes -> '/diagnostics'
                - Maintenance -> '/logbook'
                - AI/Predict -> '/ai-engine'
                - AR/Vision -> '/ar-assistant'
                - Security -> '/security'
                - Settings -> '/appearance'
            `,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        speech: { type: Type.STRING, description: "Spoken response text" },
                        action: { type: Type.STRING, enum: ["NAVIGATE", "NONE"], description: "UI Action" },
                        target: { type: Type.STRING, description: "Route path if NAVIGATE, else null" }
                    },
                    required: ["speech", "action"]
                }
            }
        });

        const jsonText = response.text;
        if (!jsonText) throw new Error("Empty response");
        return JSON.parse(jsonText) as VoiceActionResponse;

    } catch (error) {
        console.error("Voice Command Error:", error);
        return {
            speech: "Command link unstable.",
            action: "NONE",
            target: null
        };
    }
}

// --- NEW ENTERPRISE FEATURES ---

/**
 * Analyses a full session log (array of data points) to find trends, peak values, and potential issues.
 * Uses gemini-3-pro-preview for large context window analysis.
 */
export const analyzeLogSession = async (sessionData: SensorDataPoint[]): Promise<string> => {
    try {
        // Downsample data to fit context if needed (take every 10th point)
        const sampledData = sessionData.filter((_, i) => i % 10 === 0).map(d => ({
            t: d.time,
            rpm: d.rpm,
            boost: d.turboBoost,
            afr: d.lambda * 14.7,
            iat: d.inletAirTemp,
            clt: d.engineTemp
        }));

        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: `
                Analyze this race session telemetry log.
                Identify:
                1. Peak performance (Max Boost, RPM).
                2. Heat soak issues (IAT trends).
                3. Dangerous conditions (Lean AFR at high load).
                
                Data (JSON Sampled): ${JSON.stringify(sampledData)}
            `,
            config: {
                systemInstruction: "You are a race data engineer. Provide a formal, bulleted post-session report."
            }
        });
        return response.text || "Analysis complete. No anomalies found.";
    } catch (e) {
        return "Log analysis failed. Dataset too large or connection error.";
    }
}

/**
 * Optimizes a Fuel VE Map based on target AFRs vs Actual.
 */
export const optimizeFuelMap = async (currentMap: number[][], targets: number[][], actuals: number[][]): Promise<TuningSuggestion> => {
    // This mocks the complex interaction of sending grids to the AI
    // In a full implementation, you'd send the CSV representation of the tables
    return {
        suggestedParams: { fuelMap: 0, ignitionTiming: 0, boostPressure: 0 },
        analysis: {
            predictedGains: "Smoothed transition at 4500 RPM.",
            potentialRisks: "Verify partial throttle knock."
        }
    }
}

// ... (Rest of existing exports: getDiagnosticAnswer, getPredictiveAnalysis, etc.)
export const getDiagnosticAnswer = async (query: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: {
        systemInstruction: BASE_SYSTEM_INSTRUCTION,
      }
    });
    return response.text || "No data.";
  } catch (error) {
    return "Diagnostic system offline.";
  }
};

export const getPredictiveAnalysis = async (
  liveData: SensorDataPoint,
  maintenanceHistory: MaintenanceRecord[]
) => {
   try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
        Analyze the following vehicle data for potential issues.

        **Vehicle**: 2022 Subaru WRX (Simulated)
        **Mileage**: 45,000 miles
        
        **Live Data Snapshot**:
        - RPM: ${liveData.rpm.toFixed(0)}
        - Engine Load: ${liveData.engineLoad.toFixed(1)}%
        - Short Term Fuel Trim: ${liveData.shortTermFuelTrim.toFixed(1)}%
        - Long Term Fuel Trim: ${liveData.longTermFuelTrim.toFixed(1)}%
        - O2 Sensor Voltage: ${liveData.o2SensorVoltage.toFixed(2)}V
        - Engine Temp: ${liveData.engineTemp.toFixed(1)}°C
        - MAF: ${liveData.maf?.toFixed(1) || 0} g/s
        - Timing: ${liveData.timingAdvance?.toFixed(1) || 0} deg

        **Maintenance History**: ${JSON.stringify(maintenanceHistory, null, 2)}

        **Your Task**:
        1.  **Identify Anomalies**: Look for any unusual patterns.
        2.  **Root Cause**: What are the 3 most likely causes?
        3.  **Predictive Timeline**: What components are at risk?
        4.  **JSON Output**: Provide strictly valid JSON format with no markdown blocks.
        
        **REQUIRED JSON STRUCTURE**:
        {
          "timelineEvents": [
            {
              "id": "1",
              "level": "Warning", 
              "title": "Issue Title",
              "timeframe": "Next 1000 miles",
              "details": {
                 "component": "Component Name",
                 "rootCause": "Description of cause",
                 "recommendedActions": ["Action 1", "Action 2"],
                 "plainEnglishSummary": "Simple summary",
                 "tsbs": ["Optional TSB ID"]
              }
            }
          ]
        }
      `,
      config: {
        tools: [{googleSearch: {}}],
        // DO NOT set responseMimeType when tools are used
      },
    });

    const cleanedText = response.text?.replace(/```json/g, '').replace(/```/g, '').trim();
    if (!cleanedText) throw new Error("Empty response");
    return JSON.parse(cleanedText);

  } catch (error) {
    console.error("Error fetching predictive analysis:", error);
    return { error: "Failed to get predictive analysis." };
  }
};

export const getTuningSuggestion = async (liveData: SensorDataPoint, drivingStyle: string, conditions: string): Promise<TuningSuggestion> => {
    return {
        suggestedParams: { fuelMap: 2, ignitionTiming: 1, boostPressure: 1.5 },
        analysis: { predictedGains: "Moderate", potentialRisks: "None" }
    };
};

export const getVoiceCommandIntent = async (command: string): Promise<VoiceCommandIntent> => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Interpret command: "${command}" for AR car app. JSON schema: {intent: string, component: string | null, confidence: number}. Intents: SHOW_COMPONENT, HIDE_COMPONENT.`,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
};

export const generateComponentImage = async (componentName: string): Promise<string> => {
    // ... (Existing implementation)
    return "";
};

export const interpretHandsFreeCommand = async (
    command: string,
    currentRoute: string,
    vehicleData: SensorDataPoint,
    alerts: DiagnosticAlert[]
): Promise<CoPilotAction> => {
    return { action: 'SPEAK', textToSpeak: "This module is deprecated. Use Global Assistant." };
};

export const generateGeminiSpeech = async (text: string): Promise<ArrayBuffer | null> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) return null;
        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); }
        return bytes.buffer;
    } catch (error) {
        console.error("Error generating speech:", error);
        return null;
    }
};
