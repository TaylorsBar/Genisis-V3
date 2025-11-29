
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from 'recharts';
import { SensorDataPoint } from '../types';

interface SensorChartProps {
  data: SensorDataPoint[];
  lines: { dataKey: keyof SensorDataPoint; stroke: string; name: string }[];
  title: string;
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-3 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.8)]">
        <p className="text-[10px] font-mono text-gray-500 mb-1 uppercase tracking-wider">{new Date(label).toLocaleTimeString()}</p>
        {payload.map((pld: any) => (
          <div key={pld.dataKey} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: pld.color }}></div>
            <p className="text-sm font-display font-bold text-white">
                {pld.name}: <span className="text-brand-cyan">{Number(pld.value).toFixed(2)}</span>
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const SensorChart: React.FC<SensorChartProps> = ({ data, lines, title }) => {
  return (
    <div className="glass-panel p-5 rounded-2xl h-80 flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-[0.7rem] font-display font-bold uppercase tracking-[0.2em] text-gray-400">{title}</h3>
        <div className="flex gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse delay-75"></div>
        </div>
      </div>

      <div className="flex-grow w-full">
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
                {lines.map((line, index) => (
                    <linearGradient key={line.dataKey} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={line.stroke} stopOpacity={0.2}/>
                        <stop offset="95%" stopColor={line.stroke} stopOpacity={0}/>
                    </linearGradient>
                ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
                dataKey="time" 
                tickFormatter={(time) => ''}
                stroke="transparent"
            />
            <YAxis 
                stroke="rgba(255,255,255,0.1)" 
                tick={{fontSize: 10, fill: '#555', fontFamily: 'monospace'}} 
                tickLine={false}
                axisLine={false}
                width={30}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Legend wrapperStyle={{fontSize: "10px", fontFamily: "sans-serif", opacity: 0.7, paddingTop: "10px"}} iconType="circle" />
            {lines.map((line, index) => (
                <Line
                    key={line.dataKey}
                    type="monotone"
                    dataKey={line.dataKey}
                    name={line.name}
                    stroke={line.stroke}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#fff', stroke: line.stroke, strokeWidth: 2 }}
                    isAnimationActive={false} // Disable animation for performance in high-frequency updates
                />
            ))}
            </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SensorChart;
