import React from 'react';
import { useAnimatedValue } from '../../hooks/useAnimatedValue';

interface HaltechGaugeProps {
    value: number;
    min: number;
    max: number;
    redlineStart: number;
    label: string;
    unit?: string;
    size: 'large' | 'small';
}

const HaltechGauge: React.FC<HaltechGaugeProps> = ({ value, min, max, redlineStart, label, unit, size }) => {
    const animatedValue = useAnimatedValue(value);
    
    const isLarge = size === 'large';
    const radius = isLarge ? 120 : 80;
    const center = radius;
    const strokeWidth = isLarge ? 10 : 6;
    const ANGLE_MIN = -150;
    const ANGLE_MAX = 150;
    const angleRange = ANGLE_MAX - ANGLE_MIN;
    
    const valueToAngle = (val: number) => {
        const valueRatio = (Math.max(min, Math.min(val, max)) - min) / (max - min);
        return ANGLE_MIN + valueRatio * angleRange;
    }

    const needleAngle = valueToAngle(animatedValue);
    const redlineStartAngle = valueToAngle(redlineStart);

    const describeArc = (x:number, y:number, radius:number, startAngle:number, endAngle:number) => {
        const startRad = (startAngle - 90) * Math.PI / 180;
        const endRad = (endAngle - 90) * Math.PI / 180;
        const start = {
            x: x + radius * Math.cos(startRad),
            y: y + radius * Math.sin(startRad)
        };
        const end = {
            x: x + radius * Math.cos(endRad),
            y: y + radius * Math.sin(endRad)
        };
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
        return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
    }

    const numTicks = isLarge ? 11 : 9;

    return (
        <div className="relative flex flex-col items-center justify-center">
            <svg width={radius * 2} height={radius * 2} viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
                <defs>
                    <radialGradient id="haltech-bezel-grad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" stopColor="#888" />
                        <stop offset="95%" stopColor="#111" />
                        <stop offset="100%" stopColor="#444" />
                    </radialGradient>
                    <filter id="haltech-needle-glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>

                {/* Bezel and Face */}
                <circle cx={center} cy={center} r={radius} fill="url(#haltech-bezel-grad)" />
                <circle cx={center} cy={center} r={radius * 0.95} fill="var(--theme-haltech-dark-gray)" />
                <circle cx={center} cy={center} r={radius * 0.9} fill="#000" />
                
                {/* Ticks and Numbers */}
                {Array.from({ length: numTicks }).map((_, i) => {
                    const tickVal = min + i * ((max - min) / (numTicks - 1));
                    const angle = valueToAngle(tickVal);
                    const isRed = tickVal >= redlineStart;
                    return (
                        <g key={i} transform={`rotate(${angle} ${center} ${center})`}>
                            <line
                                x1={center} y1={radius * 0.1}
                                x2={center} y2={radius * 0.2}
                                stroke={isRed ? 'var(--theme-haltech-red)' : 'var(--theme-haltech-light-gray)'}
                                strokeWidth={isLarge ? 2 : 1.5}
                            />
                            { (isLarge || i % 2 === 0) &&
                                <text
                                    x={center} y={radius * 0.3}
                                    textAnchor="middle"
                                    fill={isRed ? 'var(--theme-haltech-red)' : 'white'}
                                    fontSize={isLarge ? "12" : "10"}
                                    transform={`rotate(180 ${center} ${radius*0.3})`}
                                    className="font-sans"
                                >
                                    {label === 'RPM' ? tickVal / 1000 : tickVal.toFixed(0)}
                                </text>
                            }
                        </g>
                    )
                })}
                
                {/* Redline Arc */}
                <path
                    d={describeArc(center, center, radius * 0.85, redlineStartAngle, ANGLE_MAX)}
                    fill="none"
                    stroke="var(--theme-haltech-red)"
                    strokeWidth={strokeWidth}
                />

                {/* Center Digital Displays */}
                <foreignObject x={center * 0.5} y={center * 1.2} width={center} height={center * 0.6}>
                    <div className="flex flex-col items-center justify-center text-center text-white w-full h-full">
                         <span className={`font-mono font-bold tracking-wider ${isLarge ? 'text-4xl' : 'text-2xl'}`}>{animatedValue.toFixed(unit === 'bar' ? 2 : 0)}</span>
                         <span className={`font-sans uppercase text-sm ${isLarge ? 'text-base' : 'text-sm'}`}>{unit}</span>
                    </div>
                </foreignObject>
                <text x={center} y={center * 0.8} textAnchor="middle" fill="white" className={`font-sans font-bold uppercase ${isLarge ? 'text-lg' : 'text-base'}`}>{label}</text>


                {/* Needle */}
                <g transform={`rotate(${needleAngle} ${center} ${center})`} style={{ transition: 'transform 0.1s ease-out' }}>
                    <path d={`M ${center} ${center + (isLarge ? 15 : 10)} L ${center} ${radius * 0.1}`} stroke="var(--theme-needle-color)" strokeWidth={isLarge ? 3 : 2} strokeLinecap="round" filter="url(#haltech-needle-glow)" />
                </g>
                <circle cx={center} cy={center} r={isLarge ? 8 : 5} fill="#111" stroke="#333" strokeWidth="1" />
            </svg>
        </div>
    );
};

export default HaltechGauge;
