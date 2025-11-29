
import React from 'react';
import { useVehicleData } from '../../hooks/useVehicleData';
import { useAnimatedValue } from '../../hooks/useAnimatedValue';

const ThinGauge: React.FC<{ value: number; max: number; label: string; unit: string; color?: string }> = ({ value, max, label, unit, color = 'white' }) => {
    const animatedValue = useAnimatedValue(value);
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (animatedValue / max) * circumference;

    return (
        <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
                <circle cx="50%" cy="50%" r={radius} fill="none" stroke="#222" strokeWidth="2" />
                <circle 
                    cx="50%" cy="50%" r={radius} fill="none" stroke={color} strokeWidth="2" 
                    strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
                    className="transition-[stroke-dashoffset] duration-300"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-light text-white font-sans">{animatedValue.toFixed(0)}</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-sans mt-1">{unit}</span>
            </div>
            <div className="absolute bottom-[-1.5rem] text-xs font-medium text-gray-400 uppercase tracking-widest">{label}</div>
        </div>
    );
};

const StatItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex flex-col items-start p-4 border-l border-gray-800">
        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">{label}</span>
        <span className="text-xl font-medium text-white font-sans">{value}</span>
    </div>
);

const MinimalistDashboard: React.FC = () => {
    const { latestData } = useVehicleData();
    const d = latestData;

    return (
        <div className="w-full h-full bg-[#080808] flex flex-col items-center justify-center p-12 font-sans">
            {/* Header */}
            <div className="w-full max-w-5xl flex justify-between items-end mb-12 border-b border-gray-900 pb-4">
                <div>
                    <h1 className="text-white text-2xl font-light tracking-tight">Genesis <span className="text-gray-600">Pure</span></h1>
                    <p className="text-gray-600 text-xs mt-1">Zero Emissions Telemetry</p>
                </div>
                <div className="text-right">
                    <div className="text-4xl font-light text-white">{d.speed.toFixed(0)}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-widest">km/h</div>
                </div>
            </div>

            {/* Main Gauges */}
            <div className="flex flex-wrap justify-center gap-16 mb-16">
                <ThinGauge label="Motor RPM" value={d.rpm} max={8000} unit="RPM" />
                <ThinGauge label="Range" value={284} max={400} unit="KM" color="#4ade80" />
                <ThinGauge label="Efficiency" value={88} max={100} unit="%" color="#60a5fa" />
            </div>

            {/* Footer Stats */}
            <div className="w-full max-w-5xl grid grid-cols-4 gap-4">
                <StatItem label="Battery" value={`${d.batteryVoltage.toFixed(1)} V`} />
                <StatItem label="Motor Temp" value={`${d.engineTemp.toFixed(0)} °C`} />
                <StatItem label="Consumption" value="14.2 kWh" />
                <StatItem label="Regen" value="Level 2" />
            </div>
        </div>
    );
};

export default MinimalistDashboard;
