
import React, { useEffect, useRef } from 'react';
import { SensorDataPoint } from '../../types';

declare global {
    interface Window {
        Plotly: any;
    }
}

interface LiveTelemetryGraphProps {
    data: SensorDataPoint[];
    height?: string;
}

const LiveTelemetryGraph: React.FC<LiveTelemetryGraphProps> = ({ data, height = "100%" }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const plotRef = useRef<any>(null);

    useEffect(() => {
        if (!window.Plotly || !containerRef.current) return;

        const plotData = [
            {
                x: [],
                y: [],
                name: 'RPM',
                mode: 'lines',
                line: { color: '#FCEE0A', width: 2 },
                fill: 'tozeroy',
                fillcolor: 'rgba(252, 238, 10, 0.1)'
            },
            {
                x: [],
                y: [],
                name: 'Boost (Bar)',
                yaxis: 'y2',
                mode: 'lines',
                line: { color: '#00F0FF', width: 2 }
            },
            {
                x: [],
                y: [],
                name: 'TPS (%)',
                yaxis: 'y3',
                mode: 'lines',
                line: { color: '#FFFFFF', width: 1, dash: 'dot' }
            }
        ];

        const layout = {
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'rgba(0,0,0,0.3)',
            margin: { l: 40, r: 40, t: 20, b: 40 },
            showlegend: true,
            legend: { x: 0, y: 1.1, orientation: 'h', font: { color: '#888', family: 'monospace' } },
            xaxis: {
                showgrid: true,
                gridcolor: '#1a1a1a',
                tickfont: { color: '#555' },
                showticklabels: false, // cleaner look for streaming
            },
            yaxis: {
                title: 'RPM',
                titlefont: { color: '#FCEE0A', size: 10 },
                tickfont: { color: '#FCEE0A' },
                gridcolor: '#222',
                range: [0, 9000]
            },
            yaxis2: {
                title: 'Boost',
                titlefont: { color: '#00F0FF', size: 10 },
                tickfont: { color: '#00F0FF' },
                overlaying: 'y',
                side: 'right',
                range: [-1, 2.5],
                showgrid: false
            },
            yaxis3: {
                overlaying: 'y',
                side: 'left',
                position: 0.05,
                range: [0, 105],
                showgrid: false,
                showticklabels: false
            },
            datarevision: 0
        };

        const config = { 
            responsive: true, 
            displayModeBar: false,
            staticPlot: false 
        };

        window.Plotly.newPlot(containerRef.current, plotData, layout, config).then((gd: any) => {
            plotRef.current = gd;
        });

        return () => {
             if (containerRef.current) window.Plotly.purge(containerRef.current);
        };
    }, []);

    // Efficient Update Loop
    useEffect(() => {
        if (!plotRef.current || !data.length) return;

        const times = data.map(d => new Date(d.time).toISOString());
        const rpm = data.map(d => d.rpm);
        const boost = data.map(d => d.turboBoost);
        const tps = data.map(d => d.engineLoad);

        // Use Plotly.react for efficient diffing updates, much faster than newPlot
        // Or simpler: Use 'update' if layout changes, 'restyle' if just data.
        // For streaming, extending traces is best, but we are replacing the window here.
        
        const update = {
            x: [times, times, times],
            y: [rpm, boost, tps]
        };

        window.Plotly.update(containerRef.current, update, {}, [0, 1, 2]);

    }, [data]);

    return (
        <div className="w-full h-full relative border border-white/10 rounded-lg bg-black overflow-hidden">
            <div ref={containerRef} className="w-full h-full" />
            
            {/* Overlay Data Tags */}
            <div className="absolute top-2 right-2 flex gap-4 pointer-events-none">
                <div className="text-right">
                    <span className="text-[9px] text-brand-yellow uppercase block font-bold">RPM Max</span>
                    <span className="text-xs font-mono text-white">{Math.max(...data.map(d=>d.rpm)).toFixed(0)}</span>
                </div>
                <div className="text-right">
                    <span className="text-[9px] text-brand-cyan uppercase block font-bold">Boost Peak</span>
                    <span className="text-xs font-mono text-white">{Math.max(...data.map(d=>d.turboBoost)).toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
};

export default LiveTelemetryGraph;
