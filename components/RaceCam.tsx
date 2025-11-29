
import React, { useEffect, useRef, useState } from 'react';
import { useVehicleStore } from '../stores/vehicleStore';
import GForceMeter from './widgets/GForceMeter';
import { TrackedPoint } from '../services/OpticalFlowProcessor';

const RaceCam: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayRef = useRef<HTMLCanvasElement>(null);
    
    const [streamActive, setStreamActive] = useState(false);
    const latestData = useVehicleStore(state => state.latestData);
    const processVisionFrame = useVehicleStore(state => state.processVisionFrame);
    const d = latestData;

    // Vision Processing Loop
    useEffect(() => {
        let animationFrameId: number;
        let lastProcess = 0;

        const loop = (time: number) => {
            if (videoRef.current && canvasRef.current && streamActive && !videoRef.current.paused) {
                
                // Limit processing rate to ~15-20 FPS for performance
                if (time - lastProcess > 50) { 
                    lastProcess = time;
                    
                    const video = videoRef.current;
                    const canvas = canvasRef.current;
                    const ctx = canvas.getContext('2d', { willReadFrequently: true });
                    
                    if (ctx && video.videoWidth > 0) {
                        // 1. Downscale for processing (320x240 is sufficient for flow)
                        const width = 320;
                        const height = 240;
                        
                        if (canvas.width !== width) canvas.width = width;
                        if (canvas.height !== height) canvas.height = height;
                        
                        ctx.drawImage(video, 0, 0, width, height);
                        const imageData = ctx.getImageData(0, 0, width, height);
                        
                        // 2. Send to Vision System
                        const result = processVisionFrame(imageData);
                        
                        // 3. Render Overlay (Points)
                        if (overlayRef.current && result.features) {
                            renderOverlay(overlayRef.current, result.features, width, height);
                        }
                    }
                }
            }
            animationFrameId = requestAnimationFrame(loop);
        };

        if (streamActive) {
            animationFrameId = requestAnimationFrame(loop);
        }

        return () => cancelAnimationFrame(animationFrameId);
    }, [streamActive, processVisionFrame]);

    const renderOverlay = (canvas: HTMLCanvasElement, points: TrackedPoint[], procW: number, procH: number) => {
        const ctx = canvas.getContext('2d');
        if (!ctx || !videoRef.current) return;
        
        // Match overlay size to display size
        if (canvas.width !== videoRef.current.clientWidth || canvas.height !== videoRef.current.clientHeight) {
            canvas.width = videoRef.current.clientWidth;
            canvas.height = videoRef.current.clientHeight;
        }

        const scaleX = canvas.width / procW;
        const scaleY = canvas.height / procH;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw Features
        ctx.strokeStyle = '#00F0FF';
        ctx.fillStyle = '#00F0FF';
        ctx.lineWidth = 2;

        points.forEach(p => {
            const x = p.x * scaleX;
            const y = p.y * scaleY;
            
            // Crosshair
            ctx.beginPath();
            ctx.moveTo(x - 5, y);
            ctx.lineTo(x + 5, y);
            ctx.moveTo(x, y - 5);
            ctx.lineTo(x, y + 5);
            ctx.stroke();
            
            // ID Label (optional, messy with many points)
            // ctx.fillText(p.id.toString(), x + 5, y - 5);
        });
        
        // Draw HUD Text
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(10, 10, 160, 25);
        ctx.fillStyle = '#00F0FF';
        ctx.font = '12px monospace';
        ctx.fillText(`TRACKING: ${points.length} PTS`, 20, 27);
    };

    useEffect(() => {
        let localStream: MediaStream | null = null;

        const startCamera = async () => {
            try {
                try {
                    localStream = await navigator.mediaDevices.getUserMedia({ 
                        video: { 
                            width: { ideal: 1280 },
                            height: { ideal: 720 },
                            facingMode: "environment" 
                        }, 
                        audio: false 
                    });
                } catch (primaryErr) {
                    console.warn("Primary camera config failed, trying fallback...", primaryErr);
                    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                }
                
                if (videoRef.current && localStream) {
                    videoRef.current.srcObject = localStream;
                    videoRef.current.play().then(() => {
                        setStreamActive(true);
                    }).catch(playErr => {
                        console.error("Video play failed:", playErr);
                        setStreamActive(true);
                    });
                }
            } catch (err) {
                console.error("Camera access denied or unavailable:", err);
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

    // RPM Bar Calculation
    const rpmPercent = Math.min(100, Math.max(0, (d.rpm / 8000) * 100));
    const isRedline = d.rpm > 7000;

    const throttlePct = d.engineLoad;
    const brakePct = d.gForceY < -0.2 ? Math.min(100, Math.abs(d.gForceY) * 80) : 0;

    return (
        <div className="relative w-full h-full bg-black overflow-hidden flex items-center justify-center">
            
            {/* 1. Video Layer */}
            <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-500 ${streamActive ? 'opacity-100' : 'opacity-0'}`}
            />
            
            {/* Hidden Processing Canvas */}
            <canvas ref={canvasRef} className="hidden" />
            
            {/* AR Overlay Canvas */}
            <canvas 
                ref={overlayRef} 
                className="absolute inset-0 w-full h-full z-1 pointer-events-none"
            />

            {/* Fallback Background */}
            {!streamActive && (
                <div className="absolute inset-0 w-full h-full object-cover z-0 bg-[url('https://images.unsplash.com/photo-1542228776-6c70b6d21397?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center grayscale-[30%]">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/60 backdrop-blur px-4 py-2 rounded border border-white/10 text-xs text-gray-400 font-mono">
                            INITIALIZING OPTICAL SENSORS...
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Professional Overlay Layer */}
            <div className="absolute inset-0 z-10 pointer-events-none p-8 flex flex-col justify-between">
                
                {/* Top Bar: Session Info */}
                <div className="flex justify-between items-start">
                    <div className="bg-[#0a0a0a]/80 backdrop-blur-md border-l-4 border-brand-cyan px-4 py-2 skew-x-[-10deg]">
                        <div className="skew-x-[10deg] flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lap Time</span>
                            <span className="text-3xl font-mono font-bold text-white leading-none">
                                {d.speed > 10 ? "1:24.08" : "--:--.--"}
                            </span>
                        </div>
                    </div>

                    <div className="bg-[#0a0a0a]/80 backdrop-blur-md border-r-4 border-red-600 px-4 py-2 skew-x-[10deg]">
                         <div className="skew-x-[-10deg] flex flex-col items-end">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Delta</span>
                            <span className="text-2xl font-mono font-bold text-green-500 leading-none">-0.342</span>
                        </div>
                    </div>
                </div>

                {/* Bottom Cluster: The "Halo" HUD */}
                <div className="flex items-end justify-between gap-4">
                    
                    {/* Left: Track Map & G-Force */}
                    <div className="flex flex-col gap-2">
                        <div className="w-32 h-32 bg-[#0a0a0a]/60 backdrop-blur-sm rounded-full border border-white/10 flex items-center justify-center relative">
                            {/* Track Map SVG */}
                            <svg viewBox="0 0 100 100" className="w-20 h-20 opacity-80 stroke-white fill-none stroke-2">
                                <path d="M 20 80 L 20 60 C 20 50, 30 40, 40 40 L 70 40 C 80 40, 80 20, 70 20 L 50 20" />
                            </svg>
                            {/* Player Dot */}
                            <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-brand-cyan rounded-full border-2 border-white shadow-[0_0_10px_#00F0FF]"></div>
                        </div>
                        
                        <div className="w-32 h-32 bg-[#0a0a0a]/60 backdrop-blur-sm rounded-full border border-white/10 p-2">
                            <div className="scale-75 origin-top-left">
                                <GForceMeter x={d.gForceX} y={d.gForceY} size={150} />
                            </div>
                        </div>
                    </div>

                    {/* Center: Main Telemetry Stack */}
                    <div className="flex-1 flex flex-col items-center mb-4">
                        
                        {/* RPM Arc/Bar */}
                        <div className="w-full max-w-2xl h-16 bg-[#0a0a0a]/80 backdrop-blur-md border border-white/10 rounded-t-2xl relative overflow-hidden flex items-end px-1 gap-0.5">
                             {/* RPM Ticks */}
                            {Array.from({length: 40}).map((_, i) => {
                                const step = 100 / 40;
                                const isActive = rpmPercent >= (i * step);
                                const isWarning = (i * step) > 85;
                                let bg = isActive ? (isWarning ? 'bg-red-500' : 'bg-brand-cyan') : 'bg-gray-800/30';
                                if (isActive && isRedline) bg = 'bg-red-500 animate-pulse';

                                return (
                                    <div key={i} className={`flex-1 ${bg} transition-all duration-75 rounded-t-sm`} style={{ height: `${20 + (i/40)*80}%` }}></div>
                                )
                            })}
                            
                            {/* RPM Text Overlay */}
                            <div className="absolute top-2 right-4 font-mono font-bold text-gray-400 text-xs">
                                {d.rpm.toFixed(0)} <span className="text-[10px]">RPM</span>
                            </div>
                        </div>

                        {/* Digital Readout Box */}
                        <div className="w-full max-w-xl flex bg-[#0a0a0a]/90 backdrop-blur-xl border-x border-b border-white/20 rounded-b-xl shadow-2xl relative overflow-hidden">
                            {/* Gear (Left) */}
                            <div className="w-1/3 flex items-center justify-center border-r border-white/10 p-4 bg-gradient-to-r from-brand-cyan/10 to-transparent">
                                <span className="text-8xl font-display font-black text-white italic" style={{ textShadow: '4px 4px 0px rgba(0,0,0,0.5)' }}>
                                    {d.gear === 0 ? 'N' : d.gear}
                                </span>
                            </div>

                            {/* Speed (Center) */}
                            <div className="flex-1 flex flex-col items-center justify-center p-2">
                                <span className="text-7xl font-display font-bold text-white tracking-tighter tabular-nums leading-none">
                                    {d.speed.toFixed(0)}
                                </span>
                                <span className="text-brand-cyan text-xs font-bold uppercase tracking-[0.5em]">KM/H</span>
                            </div>

                            {/* Inputs (Right) */}
                            <div className="w-1/4 flex gap-2 p-3 items-end justify-center">
                                {/* Throttle */}
                                <div className="flex flex-col items-center h-full w-4 gap-1">
                                    <div className="flex-1 w-full bg-gray-800 rounded-sm relative overflow-hidden">
                                        <div className="absolute bottom-0 left-0 right-0 bg-green-500 transition-all duration-75" style={{ height: `${throttlePct}%` }}></div>
                                    </div>
                                    <span className="text-[8px] font-bold text-green-500">THR</span>
                                </div>
                                {/* Brake */}
                                <div className="flex flex-col items-center h-full w-4 gap-1">
                                    <div className="flex-1 w-full bg-gray-800 rounded-sm relative overflow-hidden">
                                        <div className="absolute bottom-0 left-0 right-0 bg-red-500 transition-all duration-75" style={{ height: `${brakePct}%` }}></div>
                                    </div>
                                    <span className="text-[8px] font-bold text-red-500">BRK</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Sector Times */}
                    <div className="flex flex-col gap-1 w-48">
                        <div className="bg-[#0a0a0a]/80 backdrop-blur-md px-3 py-1 flex justify-between items-center border-l-2 border-purple-500">
                            <span className="text-[10px] text-gray-400 font-bold uppercase">Sector 1</span>
                            <span className="font-mono text-sm font-bold text-purple-400">24.505</span>
                        </div>
                        <div className="bg-[#0a0a0a]/80 backdrop-blur-md px-3 py-1 flex justify-between items-center border-l-2 border-green-500">
                            <span className="text-[10px] text-gray-400 font-bold uppercase">Sector 2</span>
                            <span className="font-mono text-sm font-bold text-green-500">31.200</span>
                        </div>
                         <div className="bg-[#0a0a0a]/80 backdrop-blur-md px-3 py-1 flex justify-between items-center border-l-2 border-yellow-500">
                            <span className="text-[10px] text-gray-400 font-bold uppercase">Sector 3</span>
                            <span className="font-mono text-sm font-bold text-white">--.---</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default RaceCam;
