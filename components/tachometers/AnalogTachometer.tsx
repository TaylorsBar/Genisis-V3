import React from 'react';
import { useAnimatedValue } from '../../hooks/useAnimatedValue';


interface AnalogTachometerProps {
  rpm: number;
  speed: number;
  gear: number;
}

const RPM_MAX = 10000;
const REDLINE_START = 8000;

const AnalogTachometer: React.FC<AnalogTachometerProps> = ({ rpm, speed, gear }) => {
  const animatedRpm = useAnimatedValue(rpm);
  const animatedSpeed = useAnimatedValue(speed);

  const rpmToAngle = (r: number) => {
    const minAngle = -150;
    const maxAngle = 150;
    const ratio = Math.max(0, Math.min(r, RPM_MAX)) / RPM_MAX;
    return minAngle + ratio * (maxAngle - minAngle);
  };
  
  const needleAngle = rpmToAngle(animatedRpm);
  const redlineOpacity = Math.max(0, (animatedRpm - (REDLINE_START - 1000)) / (RPM_MAX - (REDLINE_START - 1000)));

  return (
    <div className="relative w-full h-full max-w-[400px] aspect-square">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
          <radialGradient id="metal-grad" cx="50%" cy="50%" r="60%" fx="30%" fy="30%">
            <stop offset="0%" style={{ stopColor: '#d0d0d0' }} />
            <stop offset="100%" style={{ stopColor: '#707070' }} />
          </radialGradient>
          <filter id="glow-red">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
           <filter id="needle-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="1" dy="2" stdDeviation="1" floodColor="#000000" floodOpacity="0.5"/>
          </filter>
        </defs>
        
        <circle cx="100" cy="100" r="100" fill="var(--theme-gauge-bezel)" />
        <circle cx="100" cy="100" r="95" fill="var(--theme-gauge-face)" stroke="#000" strokeWidth="2" />
        
        {Array.from({ length: 11 }).map((_, i) => {
            const r = i * 1000;
            const angle = rpmToAngle(r);
            const isRed = r >= REDLINE_START;
            const isMajorTick = i % 2 === 0;
            return (
                <g key={`tick-${i}`} transform={`rotate(${angle} 100 100)`}>
                    <line x1="100" y1="10" x2="100" y2={isMajorTick ? "22" : "16"} stroke={isRed ? 'var(--theme-accent-red)' : 'var(--theme-text-secondary)'} strokeWidth="2" />
                     {isMajorTick && <text
                        x="100"
                        y="32"
                        textAnchor="middle"
                        fill={isRed ? 'var(--theme-accent-red)' : 'var(--theme-text-secondary)'}
                        fontSize="10"
                        transform="rotate(180 100 32)"
                        className="font-sans font-bold"
                     >
                        {i}
                    </text>}
                </g>
            )
        })}
        <path 
            d="M 39.3 154.6 A 85 85 0 0 1 160.7 154.6"
            fill="none"
            stroke="var(--theme-accent-red)"
            strokeWidth="8"
            strokeLinecap="round"
            filter="url(#glow-red)"
            style={{ opacity: redlineOpacity, transition: 'opacity 0.2s' }}
        />
        
        <foreignObject x="60" y="70" width="80" height="60">
            <div className="flex flex-col items-center justify-center text-center">
                <span className="font-sans text-xs text-gray-400">Speed</span>
                <span className="font-display font-bold text-4xl text-white -my-1">{animatedSpeed.toFixed(0)}</span>
                <span className="font-sans text-xs text-gray-400">km/h</span>
            </div>
        </foreignObject>
        <foreignObject x="110" y="90" width="40" height="40">
            <div className="flex flex-col items-center justify-center text-center">
                 <span className="font-sans text-xs text-gray-400">Gear</span>
                 <span className="font-display font-bold text-4xl text-white -my-1">{gear}</span>
            </div>
        </foreignObject>

        <g transform={`rotate(${needleAngle} 100 100)`} style={{ transition: 'transform 0.1s cubic-bezier(.4, 0, .2, 1)' }} filter="url(#needle-shadow)">
          <path d="M 100 100 L 100 10" stroke="var(--theme-needle-color)" strokeWidth="2" strokeLinecap="round" filter="url(#glow-red)" />
          <path d="M 100 115 L 100 100" stroke="var(--theme-needle-color)" strokeWidth="4" strokeLinecap="round" />
        </g>
        <circle cx="100" cy="100" r="5" fill="#333" stroke="var(--theme-gauge-bezel)" strokeWidth="1" />
      </svg>
    </div>
  );
};

export default AnalogTachometer;