
import React, { useState, useMemo } from 'react';
import { useVehicleStore } from '../stores/vehicleStore';
import TuningSurface3D from '../components/dashboard/TuningSurface3D';
import DynoGraph from '../components/tuning/DynoGraph';
import AITuningSidebar from '../components/tuning/AITuningSidebar';
import MapEditorGrid from '../components/tuning/MapEditorGrid';

const TuningPage: React.FC = () => {
    const latestData = useVehicleStore(state => state.latestData);
    const tuning = useVehicleStore(state => state.tuning);
    const dyno = useVehicleStore(state => state.dyno);
    const updateMapCell = useVehicleStore(state => state.updateMapCell);
    const smoothMap = useVehicleStore(state => state.smoothMap);
    const startDynoRun = useVehicleStore(state => state.startDynoRun);
    const stopDynoRun = useVehicleStore(state => state.stopDynoRun);
    const toggleDynoRunVisibility = useVehicleStore(state => state.toggleDynoRunVisibility);
    const deleteDynoRun = useVehicleStore(state => state.deleteDynoRun);
    
    const [activeTab, setActiveTab] = useState<'ve' | 'ign' | 'dyno'>('dyno');

    // Generate Headers
    const xAxis = useMemo(() => Array.from({length: 16}, (_, i) => i * (8000/15)), []);
    const yAxis = useMemo(() => Array.from({length: 16}, (_, i) => i * (100/15)), []);

    // Active Data source
    const currentMapData = activeTab === 've' ? tuning.veTable : tuning.ignitionTable;

    return (
        <div className="flex h-full w-full bg-surface-dark text-white overflow-hidden font-sans relative">
             {/* Grid Background */}
             <div className="absolute inset-0 pointer-events-none opacity-10 bg-mesh"></div>

            {/* --- WORKSPACE HEADER --- */}
            <div className="h-16 bg-surface-panel border-b border-surface-border flex items-center justify-between px-6 z-20 shrink-0">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-display font-bold tracking-wider text-white">DYNO<span className="text-brand-cyan">LAB</span></h1>
                    <div className="h-6 w-px bg-surface-border mx-2"></div>
                    
                    {/* Tab Selector */}
                    <div className="flex bg-black rounded p-1 border border-surface-border">
                        <button 
                            onClick={() => setActiveTab('dyno')}
                            className={`px-6 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'dyno' ? 'bg-brand-red text-white shadow-[0_0_15px_rgba(255,50,50,0.4)]' : 'text-gray-500 hover:text-white'}`}
                        >
                            Dyno Run
                        </button>
                        <button 
                            onClick={() => setActiveTab('ve')}
                            className={`px-6 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 've' ? 'bg-brand-cyan text-black shadow-[0_0_10px_rgba(0,240,255,0.4)]' : 'text-gray-500 hover:text-white'}`}
                        >
                            Fuel Map
                        </button>
                        <button 
                            onClick={() => setActiveTab('ign')}
                            className={`px-6 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'ign' ? 'bg-brand-purple text-white shadow-[0_0_10px_rgba(180,50,200,0.4)]' : 'text-gray-500 hover:text-white'}`}
                        >
                            Ignition
                        </button>
                    </div>
                </div>

                {/* Live Strip */}
                <div className="flex items-center gap-8">
                     <div className="text-right">
                         <span className="text-[9px] text-gray-500 uppercase font-bold block">RPM</span>
                         <span className="text-xl font-mono text-white">{latestData.rpm.toFixed(0)}</span>
                     </div>
                     <div className="text-right">
                         <span className="text-[9px] text-gray-500 uppercase font-bold block">MAP</span>
                         <span className="text-xl font-mono text-brand-cyan">{(latestData.turboBoost + 1).toFixed(2)} <span className="text-xs text-gray-600">BAR</span></span>
                     </div>
                     <div className="text-right">
                         <span className="text-[9px] text-gray-500 uppercase font-bold block">LAMBDA</span>
                         <span className="text-xl font-mono text-green-400">{(latestData.o2SensorVoltage * 2).toFixed(2)}</span>
                     </div>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="flex-1 flex overflow-hidden relative">
                
                {/* DYNO MODE UI */}
                {activeTab === 'dyno' ? (
                    <div className="flex-1 flex gap-4 p-4 animate-in fade-in duration-500">
                        
                        {/* Left: Run Manager */}
                        <div className="w-64 bg-surface-panel border border-surface-border rounded-lg flex flex-col overflow-hidden">
                            <div className="p-3 border-b border-surface-border bg-black/20">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Run History</h3>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                                {dyno.runs.length === 0 && <div className="text-gray-600 text-[10px] text-center mt-4">No runs recorded</div>}
                                {dyno.runs.map(run => (
                                    <div key={run.id} className="bg-black border border-surface-border rounded p-2 hover:border-gray-600 transition-colors group relative">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="checkbox" 
                                                    checked={run.isVisible} 
                                                    onChange={() => toggleDynoRunVisibility(run.id)}
                                                    className="rounded border-gray-700 bg-[#222] accent-brand-cyan"
                                                />
                                                <span className="text-xs font-bold text-white">{run.name}</span>
                                            </div>
                                            <button onClick={() => deleteDynoRun(run.id)} className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100">&times;</button>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-gray-500 font-mono pl-5">
                                            <span style={{color: run.color}}>HP: {run.peakPower.toFixed(0)}</span>
                                            <span style={{color: run.color}}>TQ: {run.peakTorque.toFixed(0)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Control Panel */}
                            <div className="p-4 border-t border-surface-border bg-[#111]">
                                <div className="text-center mb-4">
                                    <span className="text-[9px] text-gray-500 uppercase font-bold">Correction Factor</span>
                                    <div className="text-xs font-mono text-brand-cyan">SAE J1349 (1.02)</div>
                                </div>
                                {!dyno.isRunning ? (
                                    <button 
                                        onClick={startDynoRun}
                                        className="w-full py-3 bg-brand-red hover:bg-red-600 text-white font-bold uppercase tracking-widest rounded shadow-[0_0_20px_rgba(255,0,0,0.3)] transition-all"
                                    >
                                        Start Pull
                                    </button>
                                ) : (
                                    <button 
                                        onClick={stopDynoRun}
                                        className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold uppercase tracking-widest rounded animate-pulse"
                                    >
                                        Abort Run
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Center: Large Graph */}
                        <div className="flex-1 bg-black border border-surface-border rounded-lg relative flex flex-col">
                            {/* Overlay Stats during Run */}
                            <div className="absolute top-4 right-4 z-10 flex gap-6 pointer-events-none">
                                {dyno.isRunning && (
                                    <>
                                        <div className="text-right">
                                            <span className="block text-[10px] font-bold text-brand-cyan uppercase tracking-widest">Power</span>
                                            <span className="text-5xl font-display font-black text-white">
                                                {dyno.currentRunData.length > 0 ? dyno.currentRunData[dyno.currentRunData.length-1].power.toFixed(0) : 0}
                                            </span>
                                            <span className="text-xs text-gray-500 font-bold ml-1">HP</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-[10px] font-bold text-brand-red uppercase tracking-widest">Torque</span>
                                            <span className="text-5xl font-display font-black text-white">
                                                {dyno.currentRunData.length > 0 ? dyno.currentRunData[dyno.currentRunData.length-1].torque.toFixed(0) : 0}
                                            </span>
                                            <span className="text-xs text-gray-500 font-bold ml-1">Nm</span>
                                        </div>
                                    </>
                                )}
                            </div>
                            
                            {dyno.isRunning && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                                    <span className="text-9xl font-black text-brand-red uppercase -rotate-12 border-4 border-brand-red px-8 py-2">DYNO MODE</span>
                                </div>
                            )}

                            <DynoGraph 
                                runs={dyno.runs} 
                                currentRunData={dyno.currentRunData}
                                isRunning={dyno.isRunning}
                            />
                        </div>
                    </div>
                ) : (
                    /* TUNING MODE UI (Maps) */
                    <div className="flex-1 flex flex-col p-3 gap-3 overflow-hidden min-w-0 animate-in fade-in duration-500">
                        {/* TOP PANE: 3D Surface */}
                        <div className="flex-[2] bg-surface-panel border border-surface-border rounded-lg relative overflow-hidden group min-h-[300px]">
                            <div className="absolute top-3 left-4 z-10 pointer-events-none">
                                <h3 className="text-xs font-display font-bold text-gray-400 uppercase tracking-widest">3D Map Visualizer</h3>
                                <p className="text-[10px] text-gray-600 font-mono">Table: {activeTab === 've' ? 'Main_Fuel_VE_1' : 'Ignition_Adv_1'}</p>
                            </div>
                            
                            <TuningSurface3D 
                                data={currentMapData} 
                                rpm={latestData.rpm} 
                                load={latestData.engineLoad} 
                            />
                        </div>

                        {/* BOTTOM PANE: Grid & Tools */}
                        <div className="flex-1 flex gap-3 min-h-[300px]">
                            <div className="flex-1 flex flex-col bg-surface-panel border border-surface-border rounded-lg overflow-hidden relative">
                                 <div className="bg-[#1a1a1a] px-3 py-1 border-b border-surface-border flex justify-between items-center">
                                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Map Table Editor</span>
                                     <div className="flex gap-2">
                                         <button onClick={() => smoothMap(activeTab)} className="text-[9px] bg-[#333] px-2 py-0.5 rounded text-white hover:bg-brand-cyan hover:text-black transition-colors">SMOOTH</button>
                                         <button className="text-[9px] bg-[#333] px-2 py-0.5 rounded text-white hover:bg-brand-cyan hover:text-black transition-colors">INTERP</button>
                                     </div>
                                 </div>
                                 <div className="flex-1 relative">
                                    <MapEditorGrid 
                                        data={currentMapData}
                                        xAxis={xAxis}
                                        yAxis={yAxis}
                                        liveRpm={latestData.rpm}
                                        liveLoad={latestData.engineLoad}
                                        onCellChange={(r, c, val) => updateMapCell(activeTab, r, c, val)}
                                    />
                                 </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* RIGHT SIDEBAR: AI Tuning Assistant (Always visible) */}
                <div className="w-80 border-l border-surface-border bg-surface-panel z-10 shadow-2xl hidden xl:flex flex-col">
                    <AITuningSidebar onApply={() => {}} />
                </div>

            </div>
        </div>
    );
};

export default TuningPage;
