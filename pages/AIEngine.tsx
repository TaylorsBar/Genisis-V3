
import React, { useState } from 'react';
import RiskTimeline from '../components/RiskTimeline';
import { useVehicleData } from '../hooks/useVehicleData';
import { getPredictiveAnalysis } from '../services/geminiService';
import { MOCK_LOGS } from './MaintenanceLog'; // Use mock logs for context
import { TimelineEvent, ObdConnectionState } from '../types';

const AIEngine: React.FC = () => {
    // Access global vehicle connection state and logic
    const { latestData, obdState, connectObd, disconnectObd } = useVehicleData();
    
    // Map global state to component state flags
    const isConnected = obdState === ObdConnectionState.Connected;
    const isConnecting = obdState === ObdConnectionState.Connecting || obdState === ObdConnectionState.Initializing;
    
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleConnect = () => {
        // Trigger the real Bluetooth permissions request
        connectObd();
    };

    const handleAnalyze = async () => {
        if (!isConnected || !latestData) return;
        setIsAnalyzing(true);
        setError(null);
        setTimelineEvents([]);

        try {
            const result = await getPredictiveAnalysis(latestData, MOCK_LOGS);
            if (result.error) {
                setError(result.error);
                setTimelineEvents([]);
            } else {
                setTimelineEvents(result.timelineEvents || []);
            }
        } catch (e) {
            setError("An unexpected error occurred during analysis.");
            setTimelineEvents([]);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
                <h1 className="text-2xl font-bold text-white font-display uppercase tracking-widest">Predictive Command</h1>
                <p className="text-gray-500 text-sm mt-1">Gemini-Powered Vehicle Health Forecasting</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Connection & Control Panel */}
                <div className="lg:col-span-1 bg-[#0a0a0a] p-6 rounded-lg border border-white/10 shadow-xl space-y-6 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-cyan to-transparent"></div>
                    
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Input Streams</h2>
                    
                    <div className="space-y-3">
                        {/* OBD-II Connection */}
                        <div className="flex items-center justify-between p-4 bg-[#111] border border-white/5 rounded transition-all hover:border-brand-cyan/30">
                            <div className="flex items-center">
                                <span className="font-semibold text-gray-200 text-sm">OBD-II Telemetry</span>
                            </div>
                            <div className={`flex items-center gap-2 text-xs font-bold ${isConnected ? 'text-green-500' : 'text-gray-600'}`}>
                                {isConnected ? 'LIVE' : (obdState === ObdConnectionState.Error ? 'ERROR' : 'OFFLINE')}
                                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : (obdState === ObdConnectionState.Error ? 'bg-red-500' : 'bg-gray-600')}`}></div>
                            </div>
                        </div>
                        
                        {/* Maintenance Log */}
                         <div className="flex items-center justify-between p-4 bg-[#111] border border-white/5 rounded">
                            <div className="flex items-center">
                                 <span className="font-semibold text-gray-200 text-sm">Service History</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-green-500">
                                SYNCED
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            </div>
                        </div>

                        {/* Driver Profile */}
                        <div className="flex items-center justify-between p-4 bg-[#111] border border-white/5 rounded">
                            <div className="flex items-center">
                                <span className="font-semibold text-gray-200 text-sm">Driver Profile</span>
                            </div>
                             <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                STATIC
                                <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="pt-4">
                        {!isConnected ? (
                            <button onClick={handleConnect} disabled={isConnecting} className="w-full bg-white/10 text-white border border-white/20 font-bold py-3 rounded hover:bg-white/20 transition-all focus:outline-none uppercase tracking-widest text-sm backdrop-blur-sm">
                                {isConnecting ? 'Establishing Uplink...' : 'Initialize System'}
                            </button>
                        ) : (
                             <button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full bg-brand-cyan text-black font-bold py-3 rounded hover:bg-cyan-300 transition-all focus:outline-none shadow-[0_0_20px_rgba(0,240,255,0.3)] uppercase tracking-widest text-sm">
                                {isAnalyzing ? 'Processing...' : 'Run Prediction Model'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Risk Timeline */}
                <div className="lg:col-span-2 bg-[#0a0a0a] p-6 rounded-lg border border-white/10 shadow-xl min-h-[400px] relative">
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-transparent"></div>
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Strategic Analysis</h2>
                    
                    {isAnalyzing && (
                        <div className="flex flex-col justify-center items-center h-64">
                            <div className="w-16 h-16 border-4 border-brand-cyan border-t-transparent rounded-full animate-spin"></div>
                            <p className="mt-4 text-brand-cyan font-mono text-sm animate-pulse">Running Inference Engine...</p>
                        </div>
                    )}
                    
                    {error && <div className="text-red-400 border border-red-500/30 bg-red-500/10 p-4 rounded text-center text-sm font-bold">{error}</div>}
                    
                    {!isAnalyzing && !error && (
                        <RiskTimeline events={timelineEvents} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIEngine;
