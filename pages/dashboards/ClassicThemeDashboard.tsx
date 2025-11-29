
import React from 'react';
import { useVehicleData } from '../../hooks/useVehicleData';
import { useAnimatedValue } from '../../hooks/useAnimatedValue';

const ClassicNeedle: React.FC<{ angle: number; length: number }> = ({ angle, length }) => (
    <g transform={`rotate(${angle} 100 100)`} className="transition-transform duration-300 ease-out">
        <line x1="100" y1="100" x2="100" y2={100 - length} stroke="#FF3300" strokeWidth="2" strokeLinecap="round" />
        <line x1="100" y1="100" x2="100" y2="115" stroke="#FF3300" strokeWidth="4" />
        <circle cx="100" cy="100" r="5" fill="#111" stroke="#333" strokeWidth="1" />
    </g>
);

const ClassicGauge: React.FC<{ 
    value: number; 
    min: number; 
    max: number; 
    label: string; 
    unit?: string; 
    size?: 'small' | 'large';
}> = ({ value, min, max, label, unit, size = 'small' }) => {
    const animatedValue = useAnimatedValue(value);
    const startAngle = -135;
    const endAngle = 135;
    const range = endAngle - startAngle;
    const ratio = (Math.min(max, Math.max(min, animatedValue)) - min) / (max - min);
    const angle = startAngle + ratio * range;

    return (
        <div className={`relative ${size === 'large' ? 'w-64 h-64' : 'w-32 h-32'} rounded-full bg-black border-4 border-gray-400 shadow-[inset_0_0_20px_rgba(0,0,0,0.8),0_5px_10px_rgba(0,0,0,0.5)]`}>
             {/* Reflection */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 to-transparent pointer-events-none z-20"></div>
            
            <svg viewBox="0 0 200 200" className="w-full h-full z-10">
                <defs>
                    <radialGradient id="faceGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="90%" stopColor="#1a1a1a" />
                        <stop offset="100%" stopColor="#000" />
                    </radialGradient>
                </defs>
                <circle cx="100" cy="100" r="98" fill="url(#faceGrad)" />
                
                {/* Ticks */}
                {Array.from({ length: 11 }).map((_, i) => {
                    const tickAngle = startAngle + (i / 10) * range;
                    const isMajor = i % 2 === 0;
                    return (
                        <g key={i} transform={`rotate(${tickAngle} 100 100)`}>
                            <line x1="100" y1="10" x2="100" y2={isMajor ? 20 : 15} stroke="#eee" strokeWidth={isMajor ? 2 : 1} />
                            {isMajor && (
                                <text 
                                    x="100" 
                                    y="35" 
                                    textAnchor="middle" 
                                    transform={`rotate(${-tickAngle} 100 35)`} 
                                    className="fill-white font-serif text-[14px] font-bold"
                                >
                                    {Math.round(min + (i/10) * (max-min))}
                                </text>
                            )}
                        </g>
                    )
                })}

                <text x="100" y="140" textAnchor="middle" className="fill-gray-400 font-serif text-sm font-bold uppercase tracking-widest">{label}</text>
                {unit && <text x="100" y="155" textAnchor="middle" className="fill-gray-500 font-sans text-xs">{unit}</text>}

                <ClassicNeedle angle={angle} length={size === 'large' ? 80 : 70} />
            </svg>
        </div>
    );
};

const ClassicThemeDashboard: React.FC = () => {
    const { latestData } = useVehicleData();
    const d = latestData;

    return (
        <div className="w-full h-full flex items-center justify-center p-8 bg-[#1a0f0a] relative overflow-hidden">
            {/* Woodgrain Texture */}
            <div className="absolute inset-0 z-0" style={{
                background: `
                    radial-gradient(circle at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%),
                    repeating-linear-gradient(45deg, #3d2314 0px, #3d2314 2px, #5c3a21 2px, #5c3a21 4px)
                `
            }}></div>
            
            {/* Chrome Trim */}
            <div className="absolute top-4 bottom-4 left-4 right-4 border-2 border-[#888] rounded-xl pointer-events-none opacity-50"></div>

            <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-5xl">
                
                {/* Main Cluster */}
                <div className="flex items-center justify-center gap-12 bg-black/40 p-10 rounded-[3rem] border-4 border-[#444] shadow-2xl backdrop-blur-sm">
                    {/* Small Gauges Left */}
                    <div className="flex flex-col gap-6">
                        <ClassicGauge label="TEMP" value={d.engineTemp} min={40} max={120} unit="°C" />
                        <ClassicGauge label="OIL" value={d.oilPressure} min={0} max={8} unit="BAR" />
                    </div>

                    {/* Main Gauges */}
                    <div className="flex gap-8">
                         <div className="flex flex-col items-center">
                             <ClassicGauge label="RPM x100" value={d.rpm / 100} min={0} max={80} size="large" />
                         </div>
                         <div className="flex flex-col items-center">
                             <ClassicGauge label="SPEED" value={d.speed} min={0} max={240} unit="KM/H" size="large" />
                         </div>
                    </div>

                    {/* Small Gauges Right */}
                    <div className="flex flex-col gap-6">
                        <ClassicGauge label="FUEL" value={75} min={0} max={100} unit="%" />
                        <ClassicGauge label="VOLTS" value={d.batteryVoltage} min={8} max={16} unit="V" />
                    </div>
                </div>

                {/* Turn Signals / Indicators */}
                <div className="flex gap-16">
                    <div className="w-8 h-8 rounded-full bg-[#111] border border-[#333] flex items-center justify-center shadow-inner">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-green-900"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
                    </div>
                     <div className="w-8 h-8 rounded-full bg-[#111] border border-[#333] flex items-center justify-center shadow-inner">
                        <span className="text-[10px] font-bold text-blue-900">HIGH</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#111] border border-[#333] flex items-center justify-center shadow-inner">
                         <svg viewBox="0 0 24 24" className="w-5 h-5 fill-green-900"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ClassicThemeDashboard;
