
import React from 'react';
import { useVehicleStore } from '../../stores/vehicleStore';
import LiveTelemetryGraph from '../../components/dashboard/LiveTelemetryGraph';

const ChannelRow: React.FC<{ label: string; value: string; unit: string; color?: string }> = ({ label, value, unit, color = 'text-white' }) => (
    <div className="flex items-center justify-between py-1 border-b border-gray-800 hover:bg-white/5 px-2">
        <span className="text-[10px] font-bold text-gray-500 uppercase">{label}</span>
        <div className="flex items-baseline gap-1">
            <span className={`font-mono text-sm font-bold ${color}`}>{value}</span>
            <span className="text-[9px] text-gray-600">{unit}</span>
        </div>
    </div>
);

const ProTunerDashboard: React.FC = () => {
    const { latestData, data } = useVehicleStore();
    const d = latestData;

    return (
        <div className="w-full h-full bg-[#111] flex flex-col font-sans overflow-hidden">
            {/* Top Toolbar */}
            <div className="h-8 bg-[#1a1a1a] border-b border-[#333] flex items-center px-2 gap-4 text-[10px] font-bold text-gray-400">
                <span className="hover:text-white cursor-pointer">FILE</span>
                <span className="hover:text-white cursor-pointer">VIEW</span>
                <span className="hover:text-white cursor-pointer">DATA</span>
                <div className="flex-1"></div>
                <span className="text-green-500">LOGGING ACTIVE [20Hz]</span>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Channel List */}
                <div className="w-48 bg-[#0a0a0a] border-r border-[#333] flex flex-col overflow-y-auto custom-scrollbar">
                    <div className="p-2 bg-[#151515] border-b border-[#333] text-[10px] font-bold text-white uppercase">Channels</div>
                    <ChannelRow label="Engine Speed" value={d.rpm.toFixed(0)} unit="RPM" color="text-yellow-400" />
                    <ChannelRow label="Vehicle Speed" value={d.speed.toFixed(0)} unit="km/h" color="text-brand-cyan" />
                    <ChannelRow label="Throttle Pos" value={d.engineLoad.toFixed(1)} unit="%" />
                    <ChannelRow label="Manifold Press" value={d.turboBoost.toFixed(2)} unit="bar" />
                    <ChannelRow label="Coolant Temp" value={d.engineTemp.toFixed(0)} unit="C" color={d.engineTemp > 100 ? 'text-red-500' : 'text-white'} />
                    <ChannelRow label="Intake Air" value={d.inletAirTemp.toFixed(0)} unit="C" />
                    <ChannelRow label="Oil Press" value={d.oilPressure.toFixed(1)} unit="bar" />
                    <ChannelRow label="Lambda 1" value={(d.o2SensorVoltage*2).toFixed(2)} unit="LA" />
                    <ChannelRow label="Battery" value={d.batteryVoltage.toFixed(1)} unit="V" />
                    <ChannelRow label="Gear" value={d.gear.toString()} unit="" />
                    <ChannelRow label="Long Accel" value={d.gForceY.toFixed(2)} unit="G" />
                    <ChannelRow label="Lat Accel" value={d.gForceX.toFixed(2)} unit="G" />
                </div>

                {/* Main Workspace */}
                <div className="flex-1 flex flex-col bg-[#050505] p-1">
                    {/* Top Chart Area */}
                    <div className="flex-[2] border border-[#333] bg-black relative mb-1">
                        <LiveTelemetryGraph data={data} />
                    </div>

                    {/* Bottom Panels */}
                    <div className="flex-1 grid grid-cols-3 gap-1">
                        <div className="bg-[#0a0a0a] border border-[#333] p-2">
                            <span className="text-[10px] text-gray-500 font-bold uppercase block mb-2">Track Map</span>
                            <div className="h-full flex items-center justify-center border border-dashed border-[#333] rounded">
                                <span className="text-xs text-gray-600">GPS Trace</span>
                            </div>
                        </div>
                        <div className="bg-[#0a0a0a] border border-[#333] p-2 flex flex-col justify-center items-center">
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Lap Time</span>
                            <span className="text-4xl font-mono font-bold text-white mt-1">1:24.05</span>
                            <span className="text-xs font-bold text-green-500 mt-1">-0.12</span>
                        </div>
                        <div className="bg-[#0a0a0a] border border-[#333] p-2">
                             <span className="text-[10px] text-gray-500 font-bold uppercase block mb-2">Alarms</span>
                             <div className="space-y-1">
                                 {d.engineTemp > 100 && <div className="bg-red-900/50 text-red-400 px-2 py-1 text-xs font-bold border border-red-500">HIGH COOLANT TEMP</div>}
                                 {d.oilPressure < 1.0 && <div className="bg-red-900/50 text-red-400 px-2 py-1 text-xs font-bold border border-red-500">LOW OIL PRESS</div>}
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProTunerDashboard;
    