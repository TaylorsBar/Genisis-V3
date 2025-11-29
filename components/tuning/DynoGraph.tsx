
import React from 'react';
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Line } from 'recharts';
import { DynoRun, DynoPoint } from '../../types';

interface DynoGraphProps {
    runs: DynoRun[];
    currentRunData?: DynoPoint[];
    isRunning: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-black/90 border border-gray-700 p-3 rounded shadow-xl font-mono text-xs">
                <div className="font-bold text-gray-400 mb-2 border-b border-gray-800 pb-1">{Number(label).toFixed(0)} RPM</div>
                {payload.map((p: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></div>
                        <span className="text-gray-300 w-16">{p.name}:</span>
                        <span className="text-white font-bold">{Number(p.value).toFixed(1)}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const DynoGraph: React.FC<DynoGraphProps> = ({ runs, currentRunData, isRunning }) => {
    // 1. Prepare Data
    // To allow multiple lines on one X-axis, we ideally need a normalized X-axis (RPM)
    // We create a base bucket set (e.g. 100 RPM increments) and map run data to it.
    
    const bucketSize = 100;
    const maxRpm = 8500;
    
    // Create buckets
    const plotData = Array.from({ length: maxRpm / bucketSize }, (_, i) => {
        const rpm = i * bucketSize;
        const point: any = { rpm };
        
        // Map Saved Runs
        runs.filter(r => r.isVisible).forEach(run => {
            const match = run.data.find(d => Math.abs(d.rpm - rpm) < bucketSize / 2);
            if (match) {
                point[`${run.id}_power`] = match.power;
                point[`${run.id}_torque`] = match.torque;
            }
        });

        // Map Live Run
        if (isRunning && currentRunData) {
            const match = currentRunData.find(d => Math.abs(d.rpm - rpm) < bucketSize / 2);
            if (match) {
                point['live_power'] = match.power;
                point['live_torque'] = match.torque;
            }
        }
        
        return point;
    });

    return (
        <div className="w-full h-full relative bg-[#080808] rounded-lg border border-white/10 overflow-hidden">
             {/* Grid Overlay for aesthetics */}
             <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(0deg,transparent_24%,rgba(255,255,255,.3)_25%,rgba(255,255,255,.3)_26%,transparent_27%,transparent_74%,rgba(255,255,255,.3)_75%,rgba(255,255,255,.3)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(255,255,255,.3)_25%,rgba(255,255,255,.3)_26%,transparent_27%,transparent_74%,rgba(255,255,255,.3)_75%,rgba(255,255,255,.3)_76%,transparent_77%,transparent)] bg-[length:50px_50px]"></div>

             <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={plotData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    
                    <XAxis 
                        dataKey="rpm" 
                        stroke="#444" 
                        tick={{fill: '#666', fontSize: 10, fontFamily: 'monospace'}} 
                        tickLine={false}
                        axisLine={false}
                        type="number"
                        domain={[2000, 8500]}
                        tickCount={9}
                    />
                    
                    {/* Power Axis */}
                    <YAxis 
                        yAxisId="power" 
                        orientation="left" 
                        stroke="#00F0FF" 
                        tick={{fill: '#00F0FF', fontSize: 10, fontFamily: 'monospace'}} 
                        tickLine={false}
                        axisLine={false}
                        width={40}
                        domain={[0, 'auto']}
                        label={{ value: 'POWER (HP)', angle: -90, position: 'insideLeft', fill: '#00F0FF', fontSize: 10, opacity: 0.5 }}
                    />
                    
                    {/* Torque Axis */}
                    <YAxis 
                        yAxisId="torque" 
                        orientation="right" 
                        stroke="#FF3333" 
                        tick={{fill: '#FF3333', fontSize: 10, fontFamily: 'monospace'}} 
                        tickLine={false}
                        axisLine={false}
                        width={40}
                        domain={[0, 'auto']}
                        label={{ value: 'TORQUE (Nm)', angle: 90, position: 'insideRight', fill: '#FF3333', fontSize: 10, opacity: 0.5 }}
                    />
                    
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.2)' }} />
                    
                    {/* Historic Runs */}
                    {runs.filter(r => r.isVisible).map(run => (
                        <React.Fragment key={run.id}>
                            <Line 
                                yAxisId="power"
                                type="monotone" 
                                dataKey={`${run.id}_power`} 
                                stroke={run.color} 
                                strokeWidth={2} 
                                dot={false}
                                name={`${run.name} HP`}
                                strokeOpacity={0.7}
                                isAnimationActive={false}
                            />
                            <Line 
                                yAxisId="torque"
                                type="monotone" 
                                dataKey={`${run.id}_torque`} 
                                stroke={run.color} 
                                strokeWidth={1} 
                                strokeDasharray="4 4"
                                dot={false}
                                name={`${run.name} Tq`}
                                strokeOpacity={0.5}
                                isAnimationActive={false}
                            />
                        </React.Fragment>
                    ))}

                    {/* Live Run */}
                    {isRunning && (
                        <>
                            <Line 
                                yAxisId="power"
                                type="monotone" 
                                dataKey="live_power" 
                                stroke="#FFFFFF" 
                                strokeWidth={3} 
                                dot={false}
                                name="Live Power"
                                animationDuration={0}
                            />
                            <Line 
                                yAxisId="torque"
                                type="monotone" 
                                dataKey="live_torque" 
                                stroke="#FF0000" 
                                strokeWidth={2} 
                                strokeDasharray="5 5"
                                dot={false}
                                name="Live Torque"
                                animationDuration={0}
                            />
                        </>
                    )}

                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DynoGraph;
