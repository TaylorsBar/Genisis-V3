
import React, { useState, useEffect } from 'react';

interface MapEditorGridProps {
    data: number[][]; // 16x16
    xAxis: number[]; // RPM headers
    yAxis: number[]; // Load headers
    liveRpm: number;
    liveLoad: number;
    onCellChange: (row: number, col: number, value: number) => void;
}

const MapEditorGrid: React.FC<MapEditorGridProps> = ({ data, xAxis, yAxis, liveRpm, liveLoad, onCellChange }) => {
    const [selectedCell, setSelectedCell] = useState<{r: number, c: number} | null>(null);

    // Calculate active cell based on live data
    const activeR = Math.min(15, Math.max(0, Math.round(liveLoad / (100/15))));
    const activeC = Math.min(15, Math.max(0, Math.round(liveRpm / (8000/15))));

    const getHeatColor = (val: number) => {
        // Simple heatmap: 0=Blue, 60=Green, 120=Red
        const norm = Math.min(1, Math.max(0, val / 120));
        if (norm < 0.5) {
            // Blue to Green
            const g = Math.floor(norm * 2 * 255);
            const b = Math.floor((1 - norm * 2) * 255);
            return `rgba(0, ${g}, ${Math.max(0, b)}, 0.3)`;
        } else {
            // Green to Red
            const r = Math.floor((norm - 0.5) * 2 * 255);
            const g = Math.floor((1 - (norm - 0.5) * 2) * 255);
            return `rgba(${r}, ${g}, 0, 0.3)`;
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, r: number, c: number) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            onCellChange(r, c, data[r][c] + 1);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            onCellChange(r, c, data[r][c] - 1);
        } else if (e.key === 'PageUp') {
            e.preventDefault();
            onCellChange(r, c, data[r][c] + 5);
        } else if (e.key === 'PageDown') {
            e.preventDefault();
            onCellChange(r, c, data[r][c] - 5);
        }
    };

    return (
        <div className="w-full h-full overflow-auto bg-[#111] border border-surface-border rounded-lg relative font-mono text-[10px] select-none custom-scrollbar">
            <div className="inline-block min-w-full">
                {/* Header Row (RPM) */}
                <div className="flex sticky top-0 z-20 bg-[#1a1a1a] border-b border-surface-border">
                    <div className="w-10 shrink-0 bg-[#222] border-r border-surface-border sticky left-0 z-30 flex items-center justify-center font-bold text-gray-500">
                        VE
                    </div>
                    {xAxis.map((rpm, i) => (
                        <div key={i} className={`w-12 shrink-0 py-1 text-center border-r border-[#333] font-bold ${activeC === i ? 'bg-brand-cyan/20 text-brand-cyan' : 'text-gray-400'}`}>
                            {rpm}
                        </div>
                    ))}
                </div>

                {/* Rows */}
                {data.map((row, r) => (
                    <div key={r} className="flex border-b border-[#222]">
                        {/* Y Axis Header (Load) */}
                        <div className={`w-10 shrink-0 sticky left-0 z-10 border-r border-surface-border flex items-center justify-center font-bold ${activeR === r ? 'bg-brand-cyan/20 text-brand-cyan' : 'bg-[#1a1a1a] text-gray-400'}`}>
                            {yAxis[r].toFixed(0)}
                        </div>
                        
                        {/* Data Cells */}
                        {row.map((val, c) => {
                            const isLive = activeR === r && activeC === c;
                            const isSelected = selectedCell?.r === r && selectedCell?.c === c;
                            
                            return (
                                <div 
                                    key={c}
                                    onClick={() => setSelectedCell({r, c})}
                                    tabIndex={0}
                                    onKeyDown={(e) => handleKeyDown(e, r, c)}
                                    className={`
                                        w-12 shrink-0 h-8 flex items-center justify-center border-r border-[#222] cursor-pointer outline-none transition-colors relative
                                        ${isSelected ? 'bg-white text-black font-bold z-10 ring-2 ring-brand-cyan' : 'text-gray-300 hover:bg-white/5'}
                                    `}
                                    style={{ backgroundColor: !isSelected ? getHeatColor(val) : undefined }}
                                >
                                    {val.toFixed(0)}
                                    {isLive && (
                                        <div className="absolute inset-0 border-2 border-brand-cyan pointer-events-none animate-pulse"></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MapEditorGrid;
