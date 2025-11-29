
import React, { useState } from 'react';
import { useVehicleData } from '../../hooks/useVehicleData';
import HaltechTachometer from '../../components/tachometers/HaltechTachometer';
import { KarapiroLogo } from '../../components/KarapiroLogo';
import LiveTelemetryGraph from '../../components/dashboard/LiveTelemetryGraph';

// --- UI Components ---
const DataTile = ({ label, value, unit, color = "text-white", border = false }: { label: string, value: string, unit: string, color?: string, border?: boolean }) => (
    <div className={`flex flex-col justify-center p-3 bg-surface-panel backdrop-blur-sm ${border ? 'border-l-2 border-brand-cyan' : ''} rounded-sm min-w-[100px]`}>
        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
        <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-mono font-bold ${color} tracking-tight`}>{value}</span>
            <span className="text-[9px] text-gray-600 font-bold">{unit}</span>
        </div>
    </div>
);

const HaltechDashboard: React.FC = () => {
    const { latestData, data, ekfStats, hasActiveFault } = useVehicleData();
    const d = latestData;
    const [viewMode, setViewMode] = useState<'dash' | 'trace'>('dash');

    return (
        <div className="w-full h-full bg-surface-dark flex flex-col overflow-hidden relative selection:bg-brand-cyan/30">
            
            {/* Background FX */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-blue/5 blur-[150px] rounded-full"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-brand-purple/5 blur-[150px] rounded-full"></div>
            </div>

            {/* Header Status Bar */}
            <div className="h-12 border-b border-surface-border bg-surface-panel/80 backdrop-blur flex items-center justify-between px-6 z-20">
                <div className="flex items-center gap-6">
                    <KarapiroLogo className="h-6 w-auto opacity-80" />
                    <div className="h-4 w-px bg-white/10"></div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setViewMode('dash')} 
                            className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded transition-all ${viewMode === 'dash' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
                        >
                            Cockpit
                        </button>
                        <button 
                            onClick={() => setViewMode('trace')} 
                            className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded transition-all ${viewMode === 'trace' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
                        >
                            Telemetry
                        </button>
                    </div>
                </div>
                
                <div className="flex items-center gap-4 text-[10px] font-mono font-bold text-gray-500">
                    <span className={ekfStats.gpsActive ? 'text-green-500' : ''}>GPS: {ekfStats.gpsActive ? '3D FIX' : 'SEARCH'}</span>
                    <span className={hasActiveFault ? 'text-brand-red animate-pulse' : 'text-green-500'}>ECU: {hasActiveFault ? 'FAULT' : 'OK'}</span>
                    <span className="text-brand-cyan">VIS: {Math.round(ekfStats.visionConfidence * 100)}%</span>
                </div>
            </div>

            {/* Main Viewport */}
            <div className="flex-1 relative p-6 flex flex-col z-10">
                
                {viewMode === 'dash' && (
                    <div className="flex-1 flex items-center justify-center animate-in fade-in zoom-in-95 duration-500">
                        
                        {/* Left Floating Data */}
                        <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col gap-4">
                            <DataTile label="Boost" value={d.turboBoost.toFixed(2)} unit="BAR" color="text-brand-cyan" border />
                            <DataTile label="IAT" value={d.inletAirTemp.toFixed(0)} unit="°C" />
                            <DataTile label="Oil Press" value={d.oilPressure.toFixed(1)} unit="BAR" />
                        </div>

                        {/* Center Tach */}
                        <div className="transform scale-125 drop-shadow-2xl">
                            <HaltechTachometer rpm={d.rpm} speed={d.speed} gear={d.gear} />
                        </div>

                        {/* Right Floating Data */}
                        <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 items-end text-right">
                            <div className="flex flex-col justify-center p-3 bg-surface-panel backdrop-blur-sm border-r-2 border-green-500 rounded-sm min-w-[100px] items-end">
                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Lambda</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-mono font-bold text-green-400 tracking-tight">{(d.o2SensorVoltage * 2).toFixed(2)}</span>
                                    <span className="text-[9px] text-gray-600 font-bold">LA</span>
                                </div>
                            </div>
                            <div className="flex flex-col justify-center p-3 bg-surface-panel backdrop-blur-sm rounded-sm min-w-[100px] items-end">
                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Coolant</span>
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-2xl font-mono font-bold tracking-tight ${d.engineTemp > 100 ? 'text-brand-red animate-pulse' : 'text-white'}`}>{d.engineTemp.toFixed(0)}</span>
                                    <span className="text-[9px] text-gray-600 font-bold">°C</span>
                                </div>
                            </div>
                            <div className="flex flex-col justify-center p-3 bg-surface-panel backdrop-blur-sm rounded-sm min-w-[100px] items-end">
                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Battery</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-mono font-bold text-white tracking-tight">{d.batteryVoltage.toFixed(1)}</span>
                                    <span className="text-[9px] text-gray-600 font-bold">V</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {viewMode === 'trace' && (
                    <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex-1 bg-surface-panel border border-surface-border rounded-lg p-1 relative">
                            <div className="absolute top-3 left-4 z-10 bg-black/60 backdrop-blur px-3 py-1 rounded border border-white/10">
                                <span className="text-[10px] font-bold text-brand-yellow uppercase tracking-widest">Live Log Buffer [20Hz]</span>
                            </div>
                            <LiveTelemetryGraph data={data} />
                        </div>
                        
                        {/* Stats Footer */}
                        <div className="h-24 mt-4 grid grid-cols-4 gap-4">
                            <div className="bg-surface-panel border border-surface-border rounded p-4 flex flex-col justify-between">
                                <span className="text-[10px] text-gray-500 uppercase font-bold">Throttle</span>
                                <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden mt-2">
                                    <div className="bg-white h-full transition-all duration-75" style={{width: `${d.engineLoad}%`}}></div>
                                </div>
                                <span className="text-xl font-mono text-white mt-1">{d.engineLoad.toFixed(1)}%</span>
                            </div>
                            <div className="bg-surface-panel border border-surface-border rounded p-4 flex flex-col justify-between">
                                <span className="text-[10px] text-gray-500 uppercase font-bold">Fuel Trim (ST)</span>
                                <span className={`text-xl font-mono mt-auto ${Math.abs(d.shortTermFuelTrim) > 5 ? 'text-brand-red' : 'text-green-500'}`}>
                                    {d.shortTermFuelTrim > 0 ? '+' : ''}{d.shortTermFuelTrim.toFixed(1)}%
                                </span>
                            </div>
                             <div className="bg-surface-panel border border-surface-border rounded p-4 flex flex-col justify-between">
                                <span className="text-[10px] text-gray-500 uppercase font-bold">Ignition Adv</span>
                                <span className="text-xl font-mono text-brand-purple mt-auto">24.5°</span>
                            </div>
                             <div className="bg-surface-panel border border-surface-border rounded p-4 flex flex-col justify-between">
                                <span className="text-[10px] text-gray-500 uppercase font-bold">Knock Level</span>
                                <span className="text-xl font-mono text-white mt-auto">0.02V</span>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default HaltechDashboard;
