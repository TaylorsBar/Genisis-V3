
import React from 'react';
import { useVehicleStore } from '../../stores/vehicleStore';

const RallyDataBlock: React.FC<{ label: string; value: string | number; unit?: string; alert?: boolean }> = ({ label, value, unit, alert }) => (
    <div className={`relative p-3 border-l-4 ${alert ? 'bg-red-900/80 border-red-500 text-white animate-pulse' : 'bg-[#1a1a1a]/90 border-yellow-500 text-yellow-500'} skew-x-[-6deg] shadow-lg flex flex-col justify-between h-24`}>
        <div className="skew-x-[6deg]">
            <div className={`text-[10px] font-mono font-black uppercase tracking-widest ${alert ? 'text-white' : 'text-gray-400'}`}>{label}</div>
            <div className="flex items-baseline gap-1 mt-1">
                <span className="text-4xl font-black font-mono tracking-tighter">{value}</span>
                {unit && <span className="text-xs font-bold opacity-60">{unit}</span>}
            </div>
        </div>
    </div>
);

const RallyThemeDashboard: React.FC = () => {
    const { latestData } = useVehicleStore();
    const d = latestData;

    return (
        <div className="flex flex-col h-full w-full bg-[#050505] text-white overflow-hidden relative font-sans select-none">
            {/* Grit Texture */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]"></div>

            {/* Top Linear RPM */}
            <div className="w-full h-20 bg-black border-b-4 border-yellow-500 flex items-end px-1 gap-1 pt-1">
                {Array.from({length: 40}).map((_, i) => {
                    const pct = (d.rpm / 8000) * 100;
                    const barPct = (i / 40) * 100;
                    const active = pct >= barPct;
                    let color = 'bg-yellow-500';
                    if (barPct > 80) color = 'bg-red-600';
                    return <div key={i} className={`flex-1 transition-all duration-75 ${active ? color : 'bg-[#222]'} ${active ? 'h-full' : 'h-1/3'}`} />
                })}
            </div>

            <div className="flex-1 p-6 grid grid-cols-12 gap-6 z-10">
                {/* Left Stack */}
                <div className="col-span-3 flex flex-col gap-4 justify-center">
                    <RallyDataBlock label="Boost" value={d.turboBoost.toFixed(2)} unit="BAR" />
                    <RallyDataBlock label="Oil Press" value={d.oilPressure.toFixed(1)} unit="BAR" alert={d.oilPressure < 1.0} />
                </div>

                {/* Center Stage */}
                <div className="col-span-6 flex flex-col items-center justify-center">
                    <div className="relative">
                        <div className="text-[14rem] font-black text-white leading-none tracking-tighter" style={{ textShadow: '10px 10px 0px #eab308' }}>
                            {d.gear}
                        </div>
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-6 py-1 font-black text-xl uppercase tracking-widest skew-x-[-10deg]">
                            GEAR
                        </div>
                    </div>
                    <div className="mt-12 text-6xl font-black font-mono tracking-tighter text-gray-200">
                        {d.speed.toFixed(0)} <span className="text-2xl text-gray-500">KMH</span>
                    </div>
                </div>

                {/* Right Stack */}
                <div className="col-span-3 flex flex-col gap-4 justify-center">
                    <RallyDataBlock label="Temp" value={d.engineTemp.toFixed(0)} unit="°C" alert={d.engineTemp > 105} />
                    <RallyDataBlock label="Volts" value={d.batteryVoltage.toFixed(1)} unit="V" />
                </div>
            </div>
        </div>
    );
};

export default RallyThemeDashboard;
    