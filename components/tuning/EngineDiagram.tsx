
import React from 'react';

interface EngineDiagramProps {
  highlightedPart: string | null;
}

const EngineDiagram: React.FC<EngineDiagramProps> = ({ highlightedPart }) => {
  const getPartClass = (partName: string) => {
    if (!highlightedPart) return 'fill-gray-600/20 stroke-gray-400';
    if (highlightedPart === partName) return 'fill-brand-cyan/80 stroke-brand-cyan animate-pulse';
    return 'fill-gray-600/10 stroke-gray-600';
  };

  return (
    <div className="w-full max-w-lg aspect-video relative">
      <svg viewBox="0 0 400 225" className="w-full h-full">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Main engine block */}
        <path d="M50 80 H350 L340 200 H60 Z" className="fill-gray-700 stroke-gray-500" strokeWidth="1" />
        {/* Head */}
        <path d="M45 80 H355 L360 50 H40 Z" className="fill-gray-800 stroke-gray-600" strokeWidth="1" />
        
        {/* Pistons and Cylinders */}
        {[80, 140, 200, 260].map((x, i) => (
          <g key={`cylinder-${i}`}>
            <rect x={x} y="80" width="40" height="100" className="fill-gray-800/50 stroke-gray-600" strokeWidth="0.5" />
            <rect x={x+5} y="110" width="30" height="40" className="fill-gray-600" />
            <line x1={x+20} y1="150" x2={x+20} y2="180" className="stroke-gray-500" strokeWidth="3" />
          </g>
        ))}

        {/* Spark Plugs */}
        <g className={`transition-all duration-300 ${getPartClass('spark-plugs')}`}>
          <rect x="90" y="35" width="20" height="15" />
          <rect x="150" y="35" width="20" height="15" />
          <rect x="210" y="35" width="20" height="15" />
          <rect x="270" y="35" width="20" height="15" />
        </g>
        
        {/* Fuel Rail & Injectors */}
        <g className={`transition-all duration-300 ${getPartClass('injectors')}`}>
           <rect x="70" y="60" width="240" height="10" rx="2"  />
           <rect x="95" y="70" width="10" height="10" />
           <rect x="155" y="70" width="10" height="10" />
           <rect x="215" y="70" width="10" height="10" />
           <rect x="275" y="70" width="10" height="10" />
        </g>

        {/* Turbo */}
        <g transform="translate(300, 100)" className={`transition-all duration-300 ${getPartClass('turbo')}`}>
          <circle cx="40" cy="40" r="30" />
          <path d="M40 40 L 70 40 A 30 30 0 0 1 40 10 Z" className="fill-gray-800/50" />
          <circle cx="40" cy="40" r="5" className="fill-gray-500" />
        </g>

         {/* Pulleys */}
        <circle cx="50" cy="140" r="20" className="fill-gray-800 stroke-gray-600" strokeWidth="1" />
        <circle cx="55" cy="190" r="15" className="fill-gray-800 stroke-gray-600" strokeWidth="1" />
        
        <path d="M70 140 C 80 120, 80 160, 70 180" fill="none" className="stroke-gray-500" strokeWidth="2" />

      </svg>
    </div>
  );
};

export default EngineDiagram;
