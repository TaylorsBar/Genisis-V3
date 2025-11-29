
import React from 'react';
import { useAnimatedValue } from '../../hooks/useAnimatedValue';

interface MinimalistGaugeProps {
    value: number;
    min: number;
    max: number;
    unit: string;
    size: 'large' | 'medium' | 'small';
}

const sizeConfig = {
    large: { radius: 150, ticks: 9, stroke: 4 },
    medium: { radius: 120, ticks: 9, stroke: 3 },
    small: { radius: 50, ticks: 5, stroke: 2 },
};

const MinimalistGauge: React.FC<MinimalistGaugeProps> = ({ value, min, max, unit, size }) => {
    const animatedValue = useAnimatedValue(value);
    const config = sizeConfig[size];
    const radius = config.radius;
    const center = radius;

    const ANGLE_MIN = -135;
    const ANGLE_MAX = 135;
    const angleRange = ANGLE_MAX - ANGLE_MIN;
    
    const valueRatio = (Math.max(min, Math.min(animatedValue, max)) - min) / (max - min);
    const angle = ANGLE_MIN + valueRatio * angleRange;

    const tickValue = (i: number) => min + (i / (config.ticks - 1)) * (max - min);

    return (
        <div className="relative" style={{ width: radius * 2, height: radius * 2 }}>
            <svg viewBox={`0 0 ${radius * 2} ${radius * 2}`} className="w-full h-full">
                <defs>
                    <filter id="minimalist-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Bezel and Face */}
                <circle cx={center} cy={center} r={radius} fill="var(--theme-gauge-bezel)" />
                <circle cx={center} cy={center} r={radius * 0.95} fill="var(--theme-gauge-face)" />

                {/* Ticks */}
                {Array.from({ length: config.ticks }).map((_, i) => {
                    const tickAngle = ANGLE_MIN + (i / (config.ticks - 1)) * angleRange;
                    const isMajor = size !== 'small' || i === 0 || i === config.ticks - 1;
                    return (
                        <g key={i} transform={`rotate(${tickAngle} ${center} ${center})`}>
                            <line 
                                x1={center} y1={radius * 0.1} 
                                x2={center} y2={radius * (isMajor ? 0.2 : 0.15)}
                                stroke="var(--theme-accent-primary)" 
                                strokeWidth={config.stroke}
                                filter="url(#minimalist-glow)"
                            />
                        </g>
                    );
                })}
                
                 {/* Needle */}
                <g transform={`rotate(${angle} ${center} ${center})`} style={{ transition: 'transform 0.1s ease-out' }}>
                    <path 
                        d={`M ${center} ${center + radius * 0.1} L ${center} ${radius * 0.1}`}
                        stroke="var(--theme-needle-color)" 
                        strokeWidth={config.stroke + 1}
                        strokeLinecap="round" 
                        filter="url(#minimalist-glow)"
                    />
                </g>
                <circle cx={center} cy={center} r={radius * 0.05} fill="#333" />
                
                {size !== 'small' &&
                    <foreignObject x={0} y={0} width={radius*2} height={radius*2}>
                        <div className="flex flex-col items-center justify-center h-full w-full">
                            <div className={`font-display font-bold text-black ${size === 'large' ? 'text-8xl' : 'text-6xl'}`}>
                                {unit === 'x1000 RPM' ? (animatedValue / 1000).toFixed(1) : animatedValue.toFixed(0)}
                            </div>
                             <div className={`font-sans text-gray-700 ${size === 'large' ? 'text-lg' : 'text-base'}`}>
                                {unit}
                            </div>
                        </div>
                    </foreignObject>
                }
            </svg>
        </div>
    );
};

export default MinimalistGauge;
