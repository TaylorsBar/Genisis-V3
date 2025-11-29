
import React from 'react';

interface BatteryBarProps {
    percentage: number;
}

const NUM_SEGMENTS = 4;

const BatteryBar: React.FC<BatteryBarProps> = ({ percentage }) => {
    const activeSegments = Math.ceil((percentage / 100) * NUM_SEGMENTS);

    return (
        <div className="flex-grow flex items-center justify-center">
            <div 
                className="w-full max-w-[150px] h-12 border-2 border-gray-400 rounded-lg flex items-center p-1.5 gap-1.5"
            >
                {Array.from({ length: NUM_SEGMENTS }).map((_, i) => (
                    <div
                        key={i}
                        className="h-full flex-1 rounded-md transition-colors duration-300"
                        style={{
                            backgroundColor: i < activeSegments ? 'var(--theme-accent-primary)' : 'transparent',
                            boxShadow: i < activeSegments ? '0 0 10px var(--theme-glow-color)' : 'none',
                        }}
                    ></div>
                ))}
            </div>
        </div>
    );
};

export default BatteryBar;
