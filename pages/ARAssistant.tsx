
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useVehicleData } from '../hooks/useVehicleData';
import { generateComponentImage } from '../services/geminiService';
import { SensorDataPoint } from '../types';
import MicrophoneIcon from '../components/icons/MicrophoneIcon';

// --- Types & Config ---

interface ARNode {
    id: string;
    label: string;
    cx: number; // Percent X
    cy: number; // Percent Y
    dataKey?: keyof SensorDataPoint;
    unit?: string;
    description: string;
    normalRange: [number, number]; // Min, Max for healthy status
}

const AR_NODES: ARNode[] = [
    { 
        id: 'turbo', 
        label: 'Turbocharger', 
        cx: 78, cy: 45, 
        dataKey: 'turboBoost', unit: 'BAR', 
        description: 'Variable geometry turbine. Monitors boost pressure and spool speed.',
        normalRange: [-1.0, 1.8]
    },
    { 
        id: 'intake', 
        label: 'Intake Manifold', 
        cx: 35, cy: 25, 
        dataKey: 'inletAirTemp', unit: '°C', 
        description: 'High-flow composite manifold. Critical for air density and combustion efficiency.',
        normalRange: [10, 60]
    },
    { 
        id: 'ecu', 
        label: 'ECU Core', 
        cx: 55, cy: 20, 
        dataKey: 'rpm', unit: 'RPM', 
        description: 'Main processing unit. Controls timing, fuel trim, and sensor fusion.',
        normalRange: [0, 8000]
    },
    { 
        id: 'battery', 
        label: 'Power Unit', 
        cx: 85, cy: 75, 
        dataKey: 'batteryVoltage', unit: 'V', 
        description: 'Li-Ion starter battery. Stabilizes voltage for onboard electronics.',
        normalRange: [12.0, 14.8]
    },
    { 
        id: 'o2', 
        label: 'Lambda Sensor', 
        cx: 65, cy: 65, 
        dataKey: 'o2SensorVoltage', unit: 'V', 
        description: 'Wideband O2 sensor. Provides feedback for closed-loop fuel control.',
        normalRange: [0.1, 1.2]
    },
    { 
        id: 'oil', 
        label: 'Oil Filter', 
        cx: 45, cy: 80, 
        dataKey: 'oilPressure', unit: 'BAR', 
        description: 'High-efficiency filtration. Maintains oil pressure and contaminant removal.',
        normalRange: [1.0, 6.0]
    },
    {
        id: 'coolant',
        label: 'Coolant Res.',
        cx: 15, cy: 40,
        dataKey: 'engineTemp', unit: '°C',
        description: 'Expansion tank for engine thermal management system.',
        normalRange: [70, 105]
    }
];

const Sparkline: React.FC<{ data: number[], width: number, height: number, color: string }> = ({ data, width, height, color }) => {
    if (data.length < 2) return null;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
            <polyline points={points} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <circle cx={width} cy={height - ((data[data.length-1] - min) / range) * height} r="3" fill={color} />
        </svg>
    );
};

const ARAssistant: React.FC = () => {
    const { data, latestData } = useVehicleData();
    const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(true);
    
    // Image Generation State
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    // Video Stream State
    const videoRef = useRef<HTMLVideoElement>(null);
    const [streamActive, setStreamActive] = useState(false);

    // Derived State
    const activeNode = useMemo(() => AR_NODES.find(n => n.id === activeNodeId), [activeNodeId]);
    
    // Get recent history for sparkline (last 50 points)
    const historyData = useMemo(() => {
        if (!activeNode || !activeNode.dataKey) return [];
        return data.slice(-50).map(d => d[activeNode.dataKey!] as number);
    }, [data, activeNode]);

    useEffect(() => {
        let localStream: MediaStream | null = null;
        const startCamera = async () => {
            try {
                localStream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: 'environment' }, 
                    audio: false 
                });
                
                if (videoRef.current) {
                    videoRef.current.srcObject = localStream;
                    await videoRef.current.play();
                    setStreamActive(true);
                }
            } catch (err) {
                console.error("AR Camera Access Failed:", err);
                setStreamActive(false);
            }
        };

        startCamera();

        return () => {
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Handle Node Click
    const handleNodeClick = (id: string) => {
        setActiveNodeId(id);
        setIsScanning(false);
        setGeneratedImage(null); // Reset image on new selection
    };

    // Generate AI Schematic
    const handleGenerateSchematic = async () => {
        if (!activeNode) return;
        setIsGenerating(true);
        try {
            const img = await generateComponentImage(activeNode.label);
            setGeneratedImage(img);
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="relative h-full w-full bg-black overflow-hidden flex">
            
            {/* --- AR VIEWPORT (Full Screen Layer) --- */}
            <div className="absolute inset-0 z-0 bg-black">
                {/* Live Video Feed */}
                 <video 
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${streamActive ? 'opacity-100' : 'opacity-0'}`}
                />

                {/* Engine Wireframe Background (Fallback) */}
                <div className={`absolute inset-0 flex items-center justify-center bg-[#050505] transition-opacity duration-700 ${streamActive ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                     <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,40,60,0.4)_0%,_rgba(0,0,0,0.9)_100%)]"></div>
                     <img 
                        src="https://storage.googleapis.com/fpl-assets/ar-engine-wireframe.svg" 
                        alt="AR Feed" 
                        className="w-full h-full object-cover opacity-40 mix-blend-screen"
                        style={{ filter: 'contrast(1.2) brightness(0.8)' }}
                     />
                     {!streamActive && <div className="absolute font-mono text-brand-cyan text-xs animate-pulse">INITIALIZING OPTICAL SENSORS...</div>}
                </div>

                {/* SVG Overlay Layer for HUD Lines & Nodes */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <defs>
                        <filter id="glow-ar" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    
                    {AR_NODES.map((node) => {
                        const isActive = activeNodeId === node.id;
                        const val = node.dataKey ? latestData[node.dataKey] : 0;
                        const isWarning = typeof val === 'number' && (val < node.normalRange[0] || val > node.normalRange[1]);
                        const color = isWarning ? '#EF4444' : (isActive ? '#00F0FF' : '#FFFFFF');

                        return (
                            <g key={node.id}>
                                {/* Connecting Line (Only when active or scanning) */}
                                {isActive && (
                                    <path 
                                        d={`M ${node.cx}% ${node.cy}% L ${node.cx + 10}% ${node.cy - 10}% L 90% ${node.cy - 10}%`}
                                        fill="none"
                                        stroke={color}
                                        strokeWidth="1"
                                        strokeDasharray="4 2"
                                        opacity="0.6"
                                        className="animate-[dash_20s_linear_infinite]"
                                    />
                                )}

                                {/* Target Reticle */}
                                <g 
                                    transform={`translate(${node.cx * window.innerWidth / 100}, ${node.cy * window.innerHeight / 100})`}
                                    className="cursor-pointer pointer-events-auto"
                                    onClick={() => handleNodeClick(node.id)}
                                >
                                    {/* Outer Ring */}
                                    <circle r={isActive ? 30 : 8} stroke={color} strokeWidth="1.5" fill="black" fillOpacity="0.5" 
                                        className={`transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`} 
                                    />
                                    
                                    {/* Inner Pulse */}
                                    <circle r={4} fill={color} className={isWarning ? 'animate-ping' : ''} />
                                    
                                    {/* Brackets for Active State */}
                                    {isActive && (
                                        <>
                                            <path d="M -35 -20 L -35 -35 L -20 -35" fill="none" stroke={color} strokeWidth="2" />
                                            <path d="M 35 -20 L 35 -35 L 20 -35" fill="none" stroke={color} strokeWidth="2" />
                                            <path d="M -35 20 L -35 35 L -20 35" fill="none" stroke={color} strokeWidth="2" />
                                            <path d="M 35 20 L 35 35 L 20 35" fill="none" stroke={color} strokeWidth="2" />
                                        </>
                                    )}
                                    
                                    {/* Floating Mini Label (When not active) */}
                                    {!isActive && (
                                        <text y="25" textAnchor="middle" fill="white" fontSize="10" fontFamily="monospace" opacity="0.8" className="uppercase font-bold drop-shadow-md">
                                            {node.label}
                                        </text>
                                    )}
                                </g>
                            </g>
                        );
                    })}
                </svg>
                
                {/* Scanline Effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-cyan/5 to-transparent h-[5px] w-full animate-[scan_4s_linear_infinite] pointer-events-none"></div>
            </div>

            {/* --- UI LAYER (Interactive Elements) --- */}
            <div className="relative z-10 w-full h-full flex flex-col justify-between pointer-events-none p-6">
                
                {/* Top HUD Bar */}
                <div className="flex justify-between items-start pointer-events-auto">
                    <div className="bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-lg shadow-lg">
                        <h1 className="text-brand-cyan font-display font-bold text-xl uppercase tracking-widest flex items-center gap-3">
                            <div className="w-3 h-3 bg-brand-cyan animate-pulse shadow-[0_0_10px_#00F0FF]"></div>
                            AR Inspector
                        </h1>
                        <div className="flex gap-4 mt-2 text-[10px] font-mono text-gray-400">
                            <span>GPS: <span className="text-white">LOCKED</span></span>
                            <span>VISION: <span className={streamActive ? "text-green-500" : "text-yellow-500"}>{streamActive ? "ACTIVE" : "NO SIGNAL"}</span></span>
                            <span>OBJ: <span className="text-brand-cyan">{AR_NODES.length}</span></span>
                        </div>
                    </div>

                    {/* Mode Toggle */}
                    <button 
                        onClick={() => { setActiveNodeId(null); setIsScanning(true); }}
                        className={`px-6 py-2 rounded border font-bold uppercase text-xs tracking-wider transition-all ${isScanning ? 'bg-brand-cyan text-black border-brand-cyan' : 'bg-black/60 text-gray-400 border-gray-700 hover:border-white'}`}
                    >
                        {isScanning ? 'Scanning...' : 'Reset View'}
                    </button>
                </div>

                {/* Center Focus Reticle (Decoration) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white/10 rounded-full pointer-events-none flex items-center justify-center">
                    <div className="w-60 h-60 border border-white/5 rounded-full border-dashed animate-[spin_20s_linear_infinite]"></div>
                    <div className="w-1 h-4 bg-brand-cyan/50 absolute top-0"></div>
                    <div className="w-1 h-4 bg-brand-cyan/50 absolute bottom-0"></div>
                    <div className="w-4 h-1 bg-brand-cyan/50 absolute left-0"></div>
                    <div className="w-4 h-1 bg-brand-cyan/50 absolute right-0"></div>
                </div>

                {/* Bottom/Right Inspector Panel */}
                <div className="flex items-end justify-end h-full pointer-events-none">
                    {activeNode && (
                        <div className="w-full max-w-md pointer-events-auto animate-in slide-in-from-right duration-500">
                            {/* Detail Card */}
                            <div className="bg-[#0a0a0a]/90 backdrop-blur-xl border-l-2 border-brand-cyan p-6 shadow-2xl relative overflow-hidden group">
                                {/* Tech Background */}
                                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_25%,rgba(255,255,255,0.1)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.1)_75%,rgba(255,255,255,0.1))] bg-[length:4px_4px]"></div>
                                
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-4 border-b border-gray-800 pb-2">
                                        <div>
                                            <h2 className="text-2xl font-display font-black text-white uppercase italic tracking-wider">{activeNode.label}</h2>
                                            <p className="text-[10px] font-mono text-brand-cyan uppercase tracking-widest">ID: {activeNode.id.toUpperCase()}_SYS_01</p>
                                        </div>
                                        <div className="text-right">
                                             <div className="text-4xl font-mono font-bold text-white leading-none">
                                                 {latestData[activeNode.dataKey!] !== undefined 
                                                    ? (latestData[activeNode.dataKey!] as number).toFixed(activeNode.dataKey === 'rpm' ? 0 : 1)
                                                    : '--'}
                                             </div>
                                             <div className="text-xs text-gray-500 font-bold uppercase">{activeNode.unit}</div>
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-300 mb-6 leading-relaxed">{activeNode.description}</p>

                                    {/* Live Sparkline */}
                                    <div className="h-24 bg-black/50 border border-gray-800 rounded mb-4 relative p-2">
                                        <div className="absolute top-2 left-2 text-[9px] text-gray-500 uppercase">Live Telemetry</div>
                                        <Sparkline data={historyData} width={300} height={80} color="#00F0FF" />
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <button className="bg-white/5 hover:bg-white/10 border border-gray-700 text-white py-3 text-xs font-bold uppercase tracking-wider rounded transition-colors">
                                            Diag Check
                                        </button>
                                        <button 
                                            onClick={handleGenerateSchematic}
                                            disabled={isGenerating}
                                            className="bg-brand-cyan/10 hover:bg-brand-cyan hover:text-black border border-brand-cyan text-brand-cyan py-3 text-xs font-bold uppercase tracking-wider rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isGenerating ? (
                                                <>
                                                   <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                                   Generating...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                                    Schematic
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- MODALS --- */}
            {generatedImage && (
                <div 
                    className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-8 animate-in fade-in duration-300"
                    onClick={() => setGeneratedImage(null)}
                >
                    <div className="relative max-w-4xl max-h-full bg-[#111] border border-gray-700 rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden" onClick={e => e.stopPropagation()}>
                         <div className="absolute top-0 left-0 right-0 p-4 bg-black/80 border-b border-gray-800 flex justify-between items-center z-10">
                             <h3 className="text-white font-mono text-sm uppercase">Generative Schematic // {activeNode?.label}</h3>
                             <button onClick={() => setGeneratedImage(null)} className="text-gray-500 hover:text-white">&times;</button>
                         </div>
                         <img src={generatedImage} alt="Generated Schematic" className="max-w-full max-h-[80vh] object-contain" />
                         <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full border border-white/10">
                             <div className="w-2 h-2 bg-brand-cyan rounded-full"></div>
                             <span className="text-[10px] text-gray-300 uppercase">AI Generated</span>
                         </div>
                    </div>
                </div>
            )}
            
            {/* Scanning Overlay (when no node selected) */}
            {isScanning && (
                <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
                    <div className="text-center">
                         <div className="inline-block px-4 py-1 bg-brand-cyan/10 border border-brand-cyan/50 text-brand-cyan text-xs font-mono mb-2 animate-pulse">
                             SYSTEM SCANNING...
                         </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ARAssistant;
