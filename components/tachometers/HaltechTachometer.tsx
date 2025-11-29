
import React, { useMemo } from 'react';
import { useAnimatedValue } from '../../hooks/useAnimatedValue';

interface HaltechTachometerProps {
  rpm: number;
  speed: number;
  gear: number;
  redline?: number;
  maxRpm?: number;
}

const HaltechTachometer: React.FC<HaltechTachometerProps> = ({ 
    rpm, 
    speed, 
    gear,
    redline = 7500,
    maxRpm = 9000 
}) => {
  const animatedRpm = useAnimatedValue(rpm);
  
  const startAngle = 135;
  const endAngle = 405;
  const totalAngle = endAngle - startAngle;
  const radius = 160;
  const cx = 200;
  const cy = 200;
  const strokeWidth = 28;

  const safeRpm = Number.isFinite(animatedRpm) ? animatedRpm : 0;
  const safeMaxRpm = maxRpm > 0 ? maxRpm : 9000;
  
  const rpmRatio = Math.min(1, Math.max(0, safeRpm / safeMaxRpm));
  const currentAngle = startAngle + (rpmRatio * totalAngle);
  
  const shiftLightThresholds = [
      redline * 0.50,
      redline * 0.65,
      redline * 0.80,
      redline * 0.90,
      redline * 0.98
  ];
  
  const activeShiftLights = shiftLightThresholds.filter(t => safeRpm >= t).length;
  const isRedlineFlash = safeRpm >= redline;

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
      // Robust NaN check to prevent React rendering errors with SVG paths
      if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(radius) || !Number.isFinite(startAngle) || !Number.isFinite(endAngle)) {
          return "M 0 0"; 
      }
      const start = polarToCartesian(x, y, radius, endAngle);
      const end = polarToCartesian(x, y, radius, startAngle);
      const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
      return [
          "M", start.x, start.y, 
          "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
      ].join(" ");
  }

  const ticks = useMemo(() => {
      return Array.from({length: 10}).map((_, i) => {
          const val = i * 1000;
          const angle = startAngle + (val / safeMaxRpm) * totalAngle;
          const p1 = polarToCartesian(cx, cy, radius - strokeWidth/2 - 2, angle);
          const p2 = polarToCartesian(cx, cy, radius - strokeWidth/2 - 12, angle);
          const labelPos = polarToCartesian(cx, cy, radius - 55, angle);
          
          const showLabel = i !== 0;

          return (
              <g key={i}>
                  <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="white" strokeWidth="3" />
                  {showLabel && (
                      <text 
                          x={labelPos.x} 
                          y={labelPos.y} 
                          textAnchor="middle" 
                          dominantBaseline="middle" 
                          fill="#eee" 
                          className="font-display font-bold text-lg"
                      >
                          {i}
                      </text>
                  )}
              </g>
          );
      });
  }, [safeMaxRpm, startAngle, totalAngle, radius, cx, cy, strokeWidth]);

  const gradientId = "rpmGradient";

  return (
    <div className="relative w-full h-full max-w-[450px] aspect-square flex items-center justify-center select-none">
        <svg viewBox="0 0 400 400" className="w-full h-full filter drop-shadow-2xl">
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00F0FF" />
                    <stop offset="40%" stopColor="#00FF00" />
                    <stop offset="70%" stopColor="#FFFF00" />
                    <stop offset="100%" stopColor="#FF0000" />
                </linearGradient>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
                <filter id="ledGlow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>

            <g transform="translate(200, 50)">
                {[-2, -1, 0, 1, 2].map((offset, i) => {
                    const isActive = activeShiftLights > i;
                    const colors = ['#00FF00', '#00FF00', '#FFFF00', '#FF0000', '#FF0000'];
                    const baseColor = colors[i];
                    const isFlashing = isRedlineFlash && i === 4;
                    const color = isActive ? baseColor : '#333';
                    
                    return (
                        <circle 
                            key={i}
                            cx={offset * 25} 
                            cy={Math.abs(offset) * 5}
                            r={8} 
                            fill={color} 
                            stroke="#111" 
                            strokeWidth="2"
                            filter={isActive ? "url(#ledGlow)" : ""}
                            className={isFlashing ? "animate-pulse" : ""}
                        />
                    )
                })}
            </g>

            <path 
                d={describeArc(cx, cy, radius, startAngle, endAngle)} 
                fill="none" 
                stroke="#1a1a1a" 
                strokeWidth={strokeWidth}
                strokeLinecap="butt"
            />

            <path 
                d={describeArc(cx, cy, radius, startAngle, currentAngle)} 
                fill="none" 
                stroke={`url(#${gradientId})`} 
                strokeWidth={strokeWidth}
                strokeLinecap="butt"
                filter="url(#glow)"
                style={{ transition: 'd 0.1s linear' }}
            />

            {rpmRatio > 0.01 && Number.isFinite(currentAngle) && (
                <g transform={`rotate(${currentAngle + 90} ${cx} ${cy})`} style={{ transition: 'transform 0.1s linear' }}>
                    <rect 
                        x={cx - 2} 
                        y={cy - radius - strokeWidth/2 - 4} 
                        width={4} 
                        height={strokeWidth + 8} 
                        fill="white" 
                        filter="url(#glow)"
                    />
                </g>
            )}

            {ticks}

            <text 
                x={cx} 
                y={cy + 10} 
                textAnchor="middle" 
                dominantBaseline="middle" 
                fill="white" 
                className="font-display font-black text-9xl tracking-tighter"
                style={{ textShadow: '0 0 20px rgba(0,240,255,0.2)' }}
            >
                {gear === 0 ? 'N' : gear}
            </text>
            
            <text x={cx} y={cy - 55} textAnchor="middle" fill="#666" className="font-mono font-bold text-xs tracking-[0.3em]">GEAR</text>

            <g transform={`translate(${cx}, ${cy + 90})`}>
                <rect x="-60" y="-25" width="120" height="50" fill="#111" rx="4" stroke="#333" />
                <text x="0" y="5" textAnchor="middle" fill="white" className="font-mono font-bold text-3xl">
                    {Number.isFinite(speed) ? speed.toFixed(0) : '0'}
                </text>
                <text x="0" y="18" textAnchor="middle" fill="#00F0FF" className="font-bold text-[8px] uppercase tracking-widest">
                    KM/H
                </text>
            </g>

            <text x={cx - 90} y={cy + 30} textAnchor="middle" fill="#888" className="font-mono text-[10px]">RPM</text>
            <text x={cx - 90} y={cy + 45} textAnchor="middle" fill="white" className="font-mono font-bold text-xl">{safeRpm.toFixed(0)}</text>

            {isRedlineFlash && (
                <circle cx={cx} cy={cy} r={radius + 20} fill="rgba(255, 0, 0, 0.1)" className="animate-pulse pointer-events-none" />
            )}

        </svg>
    </div>
  );
};

export default HaltechTachometer;
