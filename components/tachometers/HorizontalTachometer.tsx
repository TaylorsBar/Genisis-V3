import React from 'react';
import { useAnimatedValue } from '../../hooks/useAnimatedValue';

interface HorizontalTachometerProps {
  rpm: number;
}

const RPM_MAX = 8000;
const REDLINE_START = 6500;
const NUM_SEGMENTS = 80;

const HorizontalTachometer: React.FC<HorizontalTachometerProps> = ({ rpm }) => {
  const animatedRpm = useAnimatedValue(rpm);
  const rpmForDisplay = Math.floor(animatedRpm);
  const activeSegments = Math.round((animatedRpm / RPM_MAX) * NUM_SEGMENTS);

  const isRedlining = animatedRpm > REDLINE_START;
  const flash = isRedlining && Math.floor(Date.now() / 150) % 2 === 0;

  const getSegmentColor = (i: number, isActive: boolean) => {
    if (!isActive) return 'var(--theme-indicator-inactive)';
    const segmentRpm = (i + 1) * (RPM_MAX / NUM_SEGMENTS);
    if (segmentRpm > REDLINE_START) {
      return flash ? 'bg-white' : 'bg-[var(--theme-accent-red)] shadow-[0_0_6px_var(--theme-accent-red)]';
    }
    if (segmentRpm > 4500) return 'bg-[var(--theme-accent-secondary)]';
    return 'bg-[var(--theme-accent-primary)]';
  };

  const segments = Array.from({ length: NUM_SEGMENTS }, (_, i) => {
    const isActive = i < activeSegments;
    const colorClass = getSegmentColor(i, isActive);
    return <div key={i} className={`h-10 flex-1 transition-colors duration-75 ${colorClass}`} />;
  });

  return (
    <div className="w-full flex flex-col items-center gap-2">
        <div className="flex justify-between w-full px-2 text-sm font-mono text-gray-400">
            <span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8k</span>
        </div>
        <div className="w-full flex gap-[2px] p-1 bg-black/50 border-2 border-gray-800/50 rounded-md">
            {segments}
        </div>
        <div className="mt-2 text-5xl font-display text-white">{rpmForDisplay} <span className="text-xl text-gray-400">RPM</span></div>
    </div>
  );
};

export default HorizontalTachometer;