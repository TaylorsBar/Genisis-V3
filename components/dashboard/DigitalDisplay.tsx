import React from 'react';

interface DigitalDisplayProps {
  label: string;
  value: string | number;
  unit: string;
}

const DigitalDisplay: React.FC<DigitalDisplayProps> = ({ label, value, unit }) => {
    return (
        <div className="flex items-center justify-between p-2 border-y border-gray-700">
            <span className="font-semibold text-gray-300">{label}</span>
            <span className="font-mono text-xl text-white">
                {value} <span className="text-gray-500">{unit}</span>
            </span>
        </div>
    );
};

export default DigitalDisplay;
