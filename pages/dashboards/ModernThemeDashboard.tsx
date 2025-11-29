
import React, { useContext } from 'react';
import { useVehicleData } from '../../hooks/useVehicleData';
import { AppearanceContext } from '../../contexts/AppearanceContext';
import AutometerTach from '../../components/tachometers/AutometerTach';

// Enhanced Angled Side Widget
const DataWidget: React.FC<{ 
    label: string; 
    value: string | number; 
    unit: string; 
    color?: string;
    align?: 'left' | 'right';
}> = ({ label, value, unit, color = 'text-white', align = 'left' }) => (
    <div className={`
        group relative flex flex-col justify-center py-4 px-6 mb-4
        bg-[#0a0a0a]/80 backdrop-blur-md border border-white/10
        transition-all duration-300 hover:bg-white/10 hover:border-brand-cyan/50 hover:scale-[1.02]
        shadow-[0_4px_20px_rgba(0,0,0,0.5)] transform
        ${align === 'left' ? 'skew-x-[-10deg] border-l-4 border-l-brand-cyan items-start' : 'skew-x-[10deg] border-r-4 border-r-brand-red items-end'}
    `}>
        {/* Content Container (Un-skewed) */}
        <div className={`transform ${align === 'left' ? 'skew-x-[10deg]' : 'skew-x-[-10deg]'} flex flex-col ${align === 'left' ? 'items-start' : 'items-end'}`}>
            {/* Label */}
            <span className="text-[10px] font-display font-bold uppercase tracking-[0.2em] text-gray-500 mb-0.5 group-hover:text-brand-cyan transition-colors">
                {label}
            </span>
            
            {/* Value & Unit */}
            <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-display font-black ${color} tracking-tighter leading-none drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]`}>
                    {value}
                </span>
                <span className="text-xs font-mono font-bold text-gray-600 uppercase">{unit}</span>
            </div>
        </div>

        {/* Scanline Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"></div>
    </div>
);

const ModernThemeDashboard: React.FC = () => {
    const { latestData, hasActiveFault } = useVehicleData();
    const d = latestData;
    
    // Dynamic Ambience based on RPM
    const isRedline = d.rpm > 7200;
    const glowColor = isRedline ? 'rgba(239, 68, 68, 0.4)' : 'rgba(0, 240, 255, 0.1)';

    const format = (val: number | undefined, prec: number = 0) => 
        (val !== undefined && !isNaN(val)) ? val.toFixed(prec) : "0";

    return (
        <div className="w-full h-full bg-[#050505] relative overflow-hidden flex flex-col font-sans selection:bg-brand-cyan/30">
            
            {/* --- Background Layers --- */}
            
            {/* 1. Dynamic RPM Glow */}
            <div 
                className="absolute inset-0 pointer-events-none transition-colors duration-500 ease-out z-0"
                style={{
                    background: `radial-gradient(circle at 50% 50%, ${glowColor} 0%, transparent 80%)`
                }}
            ></div>

            {/* 2. Carbon Fiber Texture */}
            <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" style={{
                backgroundImage: `
                    linear-gradient(27deg, #151515 5px, transparent 5px) 0 5px,
                    linear-gradient(207deg, #151515 5px, transparent 5px) 10px 0px,
                    linear-gradient(27deg, #222 5px, transparent 5px) 0px 10px,
                    linear-gradient(207deg, #222 5px, transparent 5px) 10px 5px,
                    linear-gradient(90deg, #1b1b1b 10px, transparent 10px)
                `,
                backgroundSize: '20px 20px',
                backgroundColor: '#080808'
            }}></div>
            
            {/* 3. Vignette */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)] pointer-events-none"></div>

            {/* --- Main Layout --- */}
            <div className="relative z-10 flex-1 flex items-center justify-between px-4 lg:px-12 py-6">
                
                {/* LEFT DATA STACK */}
                <div className="hidden md:flex flex-col w-56 gap-4 z-20">
                    <DataWidget label="Boost" value={format(d.turboBoost, 2)} unit="BAR" color="text-brand-cyan neon-text" align="left" />
                    <DataWidget label="A/F Ratio" value={format((d.o2SensorVoltage * 2 + 9), 1)} unit="AFR" color="text-yellow-400" align="left" />
                    <DataWidget label="Intake" value={format(d.inletAirTemp, 0)} unit="°C" align="left" />
                </div>

                {/* CENTER CLUSTER */}
                <div className="flex-1 flex flex-col items-center justify-center relative h-full">
                    
                    {/* The TACHOMETER */}
                    <div className="relative transform scale-100 lg:scale-125 transition-transform duration-500">
                        {/* Back Glow */}
                        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full blur-[80px] transition-colors duration-300 ${isRedline ? 'bg-red-600/30' : 'bg-cyan-900/10'}`}></div>
                        
                        <AutometerTach 
                            rpm={isNaN(d.rpm) ? 0 : d.rpm} 
                            speed={d.speed}
                            gear={d.gear}
                            shiftPoint={7500} 
                            redline={8000} 
                            maxRpm={10000} 
                            size={600} 
                        />
                    </div>
                </div>

                {/* RIGHT DATA STACK */}
                <div className="hidden md:flex flex-col w-56 gap-4 z-20">
                    <DataWidget label="Oil Press" value={format(d.oilPressure, 1)} unit="BAR" color="text-white" align="right" />
                    <DataWidget label="Coolant" value={format(d.engineTemp, 0)} unit="°C" color={d.engineTemp > 100 ? "text-red-500 animate-pulse" : "text-white"} align="right" />
                    <DataWidget label="Voltage" value={format(d.batteryVoltage, 1)} unit="V" color={d.batteryVoltage < 12.5 ? "text-yellow-500" : "text-green-400"} align="right" />
                </div>
            </div>

            {/* --- Bottom Status Bar --- */}
            <div className="h-14 bg-[#080808]/90 backdrop-blur border-t border-white/10 flex items-center justify-between px-8 z-20 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
                 
                 {/* Map Switch */}
                 <div className="flex items-center gap-4">
                     <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Map</span>
                     <div className="px-4 py-1 bg-brand-cyan/10 border border-brand-cyan/30 rounded skew-x-[-10deg] text-brand-cyan text-xs font-bold shadow-[0_0_10px_rgba(0,240,255,0.15)] uppercase tracking-wider">
                         <span className="block skew-x-[10deg]">Race (E85)</span>
                     </div>
                 </div>

                 {/* Warnings / Status */}
                 <div className="flex items-center gap-6">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded ${hasActiveFault ? 'bg-red-900/20 border border-red-600/50' : 'opacity-30 grayscale'}`}>
                        <div className={`w-2 h-2 rounded-full ${hasActiveFault ? 'bg-red-500 animate-pulse' : 'bg-gray-600'}`}></div>
                        <span className={`text-[10px] font-bold uppercase ${hasActiveFault ? 'text-red-400' : 'text-gray-500'}`}>Check Engine</span>
                    </div>
                 </div>

                 {/* Temp Status */}
                 <div className="flex items-center gap-3">
                     <div className="flex flex-col items-end">
                         <span className={`text-xs font-bold tracking-wider uppercase ${d.engineTemp > 85 ? 'text-green-500' : 'text-yellow-500'}`}>
                             {d.engineTemp > 85 ? 'Optimal' : 'Warming Up'}
                         </span>
                         <span className="text-[9px] text-gray-600 uppercase">Engine Status</span>
                     </div>
                     <div className={`w-3 h-3 rounded-full ${d.engineTemp > 85 ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-yellow-500 animate-pulse'}`}></div>
                 </div>
            </div>
        </div>
    );
};

export default ModernThemeDashboard;
