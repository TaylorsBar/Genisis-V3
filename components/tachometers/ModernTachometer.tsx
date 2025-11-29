import React from 'react';
import { useAnimatedValue } from '../../hooks/useAnimatedValue';

interface ModernTachometerProps {
    value: number;
    min: number;
    max: number;
    label: string;
    unit?: string;
    size: 'large' | 'small';
}

const ModernTachometer: React.FC<ModernTachometerProps> = ({ value, min, max, label, unit, size }) => {
    const animatedValue = useAnimatedValue(value);
    
    const isLarge = size === 'large';
    const radius = isLarge ? 150 : 100;
    const center = radius;
    const strokeWidth = isLarge ? 12 : 8;
    const ANGLE_MIN = 135;
    const ANGLE_MAX = 405;
    const angleRange = ANGLE_MAX - ANGLE_MIN;
    
    const valueRatio = (Math.max(min, Math.min(animatedValue, max)) - min) / (max - min);
    const angle = ANGLE_MIN + valueRatio * angleRange;

    const endPoint = (a: number) => {
        const x = center + radius * Math.cos(a * Math.PI / 180);
        const y = center + radius * Math.sin(a * Math.PI / 180);
        return { x, y };
    };

    const arcPath = `M ${endPoint(ANGLE_MIN).x} ${endPoint(ANGLE_MIN).y} A ${radius} ${radius} 0 1 1 ${endPoint(ANGLE_MAX).x} ${endPoint(ANGLE_MAX).y}`;

    return (
        <div className="relative flex flex-col items-center justify-center">
            <svg width={radius * 2} height={radius * 2} viewBox={`0 0 ${radius * 2} ${radius * 2}`} className="transform -rotate-90">
                <defs>
                    <filter id="glow-cyan-filter" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Background Track */}
                <path d={arcPath} fill="none" stroke="rgba(0, 255, 255, 0.1)" strokeWidth={strokeWidth} strokeLinecap="round" />

                {/* Ticks */}
                {Array.from({ length: isLarge ? 9 : 7 }).map((_, i) => {
                    const tickRatio = i / ( (isLarge ? 9 : 7) - 1);
                    const tickAngle = ANGLE_MIN + tickRatio * angleRange;
                    const start = endPoint(tickAngle);
                    const end = {
                        x: center + (radius - (isLarge ? 15 : 10)) * Math.cos(tickAngle * Math.PI / 180),
                        y: center + (radius - (isLarge ? 15 : 10)) * Math.sin(tickAngle * Math.PI / 180),
                    }
                    return <line key={i} x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="rgba(0, 255, 255, 0.4)" strokeWidth="2" />
                })}

                {/* Needle */}
                <g transform={`rotate(${angle} ${center} ${center})`} style={{ transition: 'transform 0.1s ease-out' }}>
                    <path d={`M ${center} ${center - (isLarge ? 8 : 5)} L ${center + radius} ${center} L ${center} ${center + (isLarge ? 8 : 5)} Z`} fill="var(--theme-accent-primary)" filter="url(#glow-cyan-filter)" />
                </g>
                <circle cx={center} cy={center} r={isLarge ? 20 : 15} fill="#0d1018" />
                <circle cx={center} cy={center} r={isLarge ? 12 : 8} fill="var(--theme-accent-primary)" />
            </svg>
            <div className="absolute text-center">
                <div className={`font-display font-bold text-[var(--theme-text-primary)] ${isLarge ? 'text-6xl' : 'text-4xl'}`} style={{ textShadow: '0 0 8px var(--theme-glow-color)' }}>
                    {animatedValue.toFixed(0)}
                </div>
                <div className={`font-sans text-[var(--theme-text-secondary)] uppercase tracking-widest ${isLarge ? 'text-lg' : 'text-md'}`}>
                    {label} {unit && `(${unit})`}
                </div>
            </div>
        </div>
    );
};

export default ModernTachometer;