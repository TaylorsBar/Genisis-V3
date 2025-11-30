
import React from 'react';
import { useVehicleStore } from '../../stores/vehicleStore';
import { useAnimatedValue } from '../../hooks/useAnimatedValue';

const RallyInfoBlock: React.FC<{ 
    label: string; 
    value: string | number; 
    unit?: string; 
    alert?: boolean;
    className?: string;
}> = ({ label, value, unit, alert, className }) => (
    <div className={`
        relative p-4 flex flex-col justify-between 
        bg-black/80 border-2 
        ${alert ? 'border-brand-red' : 'border-[#444]'} 
        shadow-lg
        ${className}
    `}>
        {/* Scanline Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.2)_50%,transparent_50%)] bg-[size:100%_4px] opacity-50 pointer-events-none"></div>
        
        <div className={`text-[10px] font-mono font-black uppercase tracking-[0.2em] ${alert ? 'text-red-400' : 'text-gray-500'}`}>{label}</div>
        <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-4xl font-black font-mono tracking-tighter ${alert ? 'text-white animate-pulse' : 'text-brand-yellow'}`}>{value}</span>
            {unit && <span className="text-sm font-bold opacity-60 text-gray-400">{unit}</span>}
        </div>
    </div>
);

const ShiftLightBar: React.FC<{ rpm: number; maxRpm: number; redline: number }> = ({ rpm, maxRpm, redline }) => {
    const segments = 16;
    const activeSegments = Math.floor((rpm / maxRpm) * segments);
    const flash = rpm > redline && Math.floor(Date.now() / 100) % 2 === 0;

    const getColor = (i: number) => {
        const pct = (i + 1) / segments;
        if (pct > 0.9) return flash ? 'bg-white shadow-[0_0_15px_white]' : 'bg-red-600 shadow-[0_0_10px_#ef4444]';
        if (pct > 0.7) return 'bg-orange-500 shadow-[0_0_10px_#f97316]';
        if (pct > 0.5) return 'bg-yellow-400 shadow-[0_0_10px_#facc15]';
        return 'bg-green-500 shadow-[0_0_10px_#22c55e]';
    };

    return (
        <div className="flex gap-1.5 p-2 bg-black/50 border-y-2 border-[#333] shadow-inner">
            {Array.from({ length: segments }).map((_, i) => (
                <div 
                    key={i}
                    className={`h-6 flex-1 rounded-sm transition-all duration-75 transform skew-x-[-15deg] border-b-2 border-black/50 ${i < activeSegments ? getColor(i) : 'bg-[#1a1a1a]'}`}
                />
            ))}
        </div>
    );
};


const RallyThemeDashboard: React.FC = () => {
    const { latestData } = useVehicleStore();
    const d = latestData;
    const animatedSpeed = useAnimatedValue(d.speed);

    // Mock Stage Timer for visual effect
    const [stageTime, setStageTime] = React.useState(84080);
    React.useEffect(() => {
        if (d.speed > 10) {
            const interval = setInterval(() => setStageTime(t => t + 47), 47);
            return () => clearInterval(interval);
        }
    }, [d.speed > 10]);

    const formatStageTime = (ms: number) => {
        const minutes = Math.floor(ms / 60000).toString().padStart(1, '0');
        const seconds = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
        const hundredths = Math.floor((ms % 1000) / 10).toString().padStart(2, '0');
        return `${minutes}:${seconds}.${hundredths}`;
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#0a0a0a] text-white overflow-hidden relative font-sans select-none">
            {/* Background Layers: Grit + Vignette */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,#000_100%)]"></div>

            {/* Top: Shift Lights & Digital RPM */}
            <div className="relative z-20 pt-2 px-2">
                <ShiftLightBar rpm={d.rpm} maxRpm={8000} redline={7200} />
                <div className="absolute top-4 right-6 text-right">
                    <span className="font-mono text-2xl font-black text-white">{d.rpm.toFixed(0)}</span>
                    <span className="text-xs font-bold text-gray-500 ml-1">RPM</span>
                </div>
            </div>

            <div className="flex-1 p-4 grid grid-cols-5 gap-4 z-10">
                {/* Left Stack */}
                <div className="col-span-1 flex flex-col gap-4 justify-around">
                    <RallyInfoBlock label="Boost" value={d.turboBoost.toFixed(2)} unit="BAR" />
                    <RallyInfoBlock label="Oil Temp" value={d.engineTemp.toFixed(0)} unit="°C" alert={d.engineTemp > 105} />
                    <RallyInfoBlock label="Oil Press" value={d.oilPressure.toFixed(1)} unit="BAR" alert={d.oilPressure < 1.0 && d.rpm > 1000} />
                </div>

                {/* Center Stage */}
                <div className="col-span-3 flex flex-col items-center justify-center gap-6">
                    {/* Stage Timer */}
                    <div className="text-center">
                        <div className="font-mono text-5xl font-black text-white tracking-wider">{formatStageTime(stageTime)}</div>
                        <div className="mt-1">
                            <span className="text-2xl font-mono font-bold text-green-400 bg-black/50 px-3 py-1 border border-green-800 rounded">-0.2s</span>
                        </div>
                    </div>

                    {/* Main Gear & Speed Cluster */}
                    <div className="relative flex items-center justify-center w-full">
                        <span 
                            className="absolute font-black text-white/5 text-[22rem] leading-none -translate-y-4 pointer-events-none"
                        >
                            {d.gear === 0 ? 'N' : d.gear}
                        </span>
                        <div className="z-10 text-center">
                            <div className="text-[16rem] font-black text-white leading-none tracking-tighter" style={{ textShadow: '8px 8px 0px rgba(255,255,255,0.1)' }}>
                                {d.gear === 0 ? 'N' : d.gear}
                            </div>
                            <div className="text-7xl font-black font-mono tracking-tighter text-brand-yellow -mt-8">
                                {animatedSpeed.toFixed(0)} <span className="text-4xl text-gray-500">KM/H</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Stack */}
                <div className="col-span-1 flex flex-col gap-4 justify-around">
                    <RallyInfoBlock label="G-Force" value={d.gForceX.toFixed(2)} unit="LAT" />
                    <RallyInfoBlock label="IAT" value={d.inletAirTemp.toFixed(0)} unit="°C" />
                    <RallyInfoBlock label="Voltage" value={d.batteryVoltage.toFixed(1)} unit="V" alert={d.batteryVoltage < 12.0} />
                </div>
            </div>
        </div>
    );
};

export default RallyThemeDashboard;
