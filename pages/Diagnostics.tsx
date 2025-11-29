
import React, { useState } from 'react';
import { useVehicleStore } from '../stores/vehicleStore';
import { sendMessageToAI } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const Diagnostics: React.FC = () => {
  const { dtcs, isScanning, hasActiveFault, scanVehicle, clearFaults, latestData, obdState } = useVehicleStore();
  
  const [selectedDtc, setSelectedDtc] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async (code: string) => {
      setSelectedDtc(code);
      setIsAnalyzing(true);
      setAiAnalysis(null);
      const result = await sendMessageToAI(`Analyze diagnostic trouble code ${code}. Explain root cause and fix.`, latestData, 'Diagnostics');
      setAiAnalysis(result);
      setIsAnalyzing(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#050508] relative overflow-hidden font-sans">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-[#0a0a0a] flex justify-between items-center z-10">
        <div>
            <h2 className="text-xl font-display font-bold text-white tracking-widest uppercase">Scan Tool <span className="text-brand-cyan">PRO</span></h2>
            <div className="flex gap-4 text-xs font-mono mt-1 text-gray-500">
                <span>ECU: <span className={obdState === 'Connected' ? 'text-green-500' : 'text-red-500'}>{obdState.toUpperCase()}</span></span>
                <span>PROTOCOL: <span className="text-white">ISO 15765-4 (CAN)</span></span>
            </div>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => scanVehicle()} 
                disabled={isScanning}
                className="bg-brand-cyan hover:bg-cyan-400 text-black font-bold px-6 py-2 rounded uppercase text-xs tracking-wider transition-all disabled:opacity-50"
            >
                {isScanning ? 'Scanning Bus...' : 'Full System Scan'}
            </button>
            <button 
                onClick={() => clearFaults()}
                className="bg-red-900/30 hover:bg-red-900/50 border border-red-500 text-red-500 font-bold px-6 py-2 rounded uppercase text-xs tracking-wider transition-all"
            >
                Clear DTCs
            </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
          {/* Left: System Topology */}
          <div className="w-1/4 bg-[#0a0a0a] border-r border-white/10 p-4 flex flex-col gap-2 overflow-y-auto">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">System Status</h3>
              {['PCM - Powertrain', 'TCM - Transmission', 'ABS - Brakes', 'SRS - Airbag', 'BCM - Body', 'IPC - Cluster'].map(sys => {
                  const hasFault = hasActiveFault && sys.includes("PCM");
                  return (
                    <div key={sys} className={`p-3 rounded border flex justify-between items-center ${hasFault ? 'bg-red-900/10 border-red-500/50' : 'bg-[#111] border-white/5'}`}>
                        <span className={`text-xs font-bold ${hasFault ? 'text-white' : 'text-gray-400'}`}>{sys}</span>
                        <div className={`w-2 h-2 rounded-full ${hasFault ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                    </div>
                  )
              })}
          </div>

          {/* Center: DTC Grid */}
          <div className="flex-1 bg-[#050505] p-6 overflow-y-auto">
              {isScanning ? (
                  <div className="flex flex-col items-center justify-center h-full">
                      <div className="w-16 h-16 border-4 border-brand-cyan border-t-transparent rounded-full animate-spin"></div>
                      <p className="mt-4 text-brand-cyan font-mono text-xs animate-pulse">QUERYING MODULES...</p>
                  </div>
              ) : dtcs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-600">
                      <svg className="w-16 h-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <p className="text-sm font-bold uppercase">No Faults Detected</p>
                  </div>
              ) : (
                  <div className="grid gap-4">
                      {dtcs.map(code => (
                          <div key={code} className="bg-[#111] border-l-4 border-red-500 p-4 rounded shadow-lg flex justify-between items-center group hover:bg-[#151515] transition-colors">
                              <div>
                                  <h3 className="text-2xl font-display font-bold text-white">{code}</h3>
                                  <p className="text-xs text-red-400 font-bold uppercase mt-1">Confirmed / Active</p>
                              </div>
                              <button 
                                  onClick={() => handleAnalyze(code)}
                                  className="bg-white/5 hover:bg-brand-cyan hover:text-black border border-white/10 text-brand-cyan px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all"
                              >
                                  AI Analysis
                              </button>
                          </div>
                      ))}
                  </div>
              )}
          </div>

          {/* Right: AI Analysis Panel */}
          {selectedDtc && (
              <div className="w-1/3 bg-[#0a0a0a] border-l border-white/10 p-6 flex flex-col shadow-2xl animate-in slide-in-from-right">
                  <div className="flex justify-between items-start mb-6">
                      <h3 className="text-lg font-bold text-brand-cyan font-display">Analysis: {selectedDtc}</h3>
                      <button onClick={() => setSelectedDtc(null)} className="text-gray-500 hover:text-white">&times;</button>
                  </div>
                  
                  {isAnalyzing ? (
                      <div className="flex-1 flex items-center justify-center">
                          <div className="flex gap-1">
                              <div className="w-2 h-2 bg-brand-cyan rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-brand-cyan rounded-full animate-bounce delay-75"></div>
                              <div className="w-2 h-2 bg-brand-cyan rounded-full animate-bounce delay-150"></div>
                          </div>
                      </div>
                  ) : (
                      <div className="prose prose-sm prose-invert max-w-none font-mono text-xs text-gray-300">
                          <ReactMarkdown>{aiAnalysis || ""}</ReactMarkdown>
                      </div>
                  )}
              </div>
          )}
      </div>
    </div>
  );
};

export default Diagnostics;
    