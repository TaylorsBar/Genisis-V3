import React from 'react';
import { useAnimatedValue } from '../../hooks/useAnimatedValue';

interface HaltechSideBarGaugeProps {
    label: string;
    value: number;
    min: number;
    max: number;
    unit: string;
    orientation: 'left' | 'right';
}

const NUM_SEGMENTS = 16;

const HaltechSideBarGauge: React.FC<HaltechSideBarGaugeProps> = ({ label, value, min, max, unit, orientation }) => {
    const animatedValue = useAnimatedValue(value);
    const valueRatio = (Math.max(min, Math.min(animatedValue, max)) - min) / (max - min);
    const activeSegments = Math.round(valueRatio * NUM_SEGMENTS);
    const isLeft = orientation === 'left';

    const segmentPath = (y: number, height: number) => `M 10 ${y} C 20 ${y}, 25 ${y + height * 0.2}, 25 ${y + height / 2} S 20 ${y + height}, 10 ${y + height}`;

    return (
        <div className="w-full max-w-[200px] aspect-[1/3] relative font-sans">
            <svg viewBox="0 0 100 300" className="w-full h-full">
                <defs>
                    <linearGradient id="bezel-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#555" />
                        <stop offset="50%" stopColor="#eee" />
                        <stop offset="100%" stopColor="#555" />
                    </linearGradient>
                </defs>
                <g transform={isLeft ? '' : 'translate(100, 0) scale(-1, 1)'}>
                    {/* Bezel */}
                    <path d="M 30 10 C 40 10, 50 20, 50 40 L 50 260 C 50 280, 40 290, 30 290" fill="none" stroke="url(#bezel-grad)" strokeWidth="3" />
                    <path d="M 50 40 L 20 40 C 5 40, 5 60, 20 60 L 50 60" fill="none" stroke="url(#bezel-grad)" strokeWidth="3" />
                    <path d="M 50 260 L 20 260 C 5 260, 5 240, 20 240 L 50 240" fill="none" stroke="url(#bezel-grad)" strokeWidth="3" />
                    
                    {/* Background track */}
                    <rect x="24" y="55" width="12" height="190" fill="#1a1a1a" />

                    {/* Segments */}
                    {Array.from({ length: NUM_SEGMENTS }).map((_, i) => {
                         const y = 245 - (i + 1) * 12;
                         const isActive = i < activeSegments;
                         return (
                            <rect
                                key={i}
                                x="26"
                                y={y}
                                width="8"
                                height="10"
                                fill={isActive ? 'white' : '#444'}
                                className="transition-colors duration-100"
                            />
                         )
                    })}
                </g>
            </svg>
            <div className={`absolute top-4 w-full ${isLeft ? 'text-left pl-14' : 'text-right pr-14'}`}>
                <p className="text-gray-400 text-sm">{label}</p>
                <p className="text-white font-bold text-xl">{animatedValue.toFixed(label === 'BOOST' ? 2 : 1)} <span className="text-gray-400">{unit}</span></p>
            </div>
             <div className={`absolute bottom-4 w-full ${isLeft ? 'text-left pl-14' : 'text-right pr-14'}`}>
                 <p className="text-white text-xs">{isLeft ? 'L' : 'R'}</p>
             </div>
        </div>
    );
};

export default HaltechSideBarGauge;
