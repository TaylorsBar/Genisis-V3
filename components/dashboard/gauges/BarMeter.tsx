import React from 'react';
import { useAnimatedValue } from '../../hooks/useAnimatedValue';

interface BarMeterProps {
  label: string;
  value: number;
  target: number;
}

const BarMeter: React.FC<BarMeterProps> = ({ label, value, target }) => {
    const animatedValue = useAnimatedValue(value);
    const percentage = Math.min(100, (animatedValue / (target * 1.5)) * 100);

    return (
        <div className="w-full">
            <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm font-semibold text-gray-300">{label}</span>
                <div className="flex gap-4 font-mono text-lg">
                    <span>{animatedValue.toFixed(1)}</span>
                    <span className="text-gray-500">{target.toFixed(1)}</span>
                </div>
            </div>
            <div className="w-full h-8 bg-black border border-gray-700 p-1">
                <div className="h-full bg-[var(--theme-accent-primary)] transition-all duration-100" style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

export default BarMeter;
