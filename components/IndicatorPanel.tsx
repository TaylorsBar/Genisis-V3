
import React from 'react';

interface IconProps {
  active?: boolean;
}

const SeatbeltIcon: React.FC<IconProps> = ({ active }) => (
  <svg className={`w-8 h-8 ${active ? 'text-red-500' : 'text-gray-600'}`} viewBox="0 0 24 24" fill="currentColor"><path d="M16,11.26V9a4,4,0,0,0-8,0v2.26L6.21,17.5A3,3,0,0,0,9,22h6a3,3,0,0,0,2.79-4.5ZM9.17,11.26a1,1,0,0,0,1,1h3.66a1,1,0,0,0,1-1V9a2,2,0,0,0-4,0Zm7,4.86L15.32,13H8.68L7.83,16.12A1,1,0,0,1,9,15h6a1,1,0,0,1,.17,1.12Z"/></svg>
);
const HighBeamIcon: React.FC<IconProps> = ({ active }) => (
  <svg className={`w-8 h-8 ${active ? 'text-blue-400' : 'text-gray-600'}`} viewBox="0 0 24 24" fill="currentColor"><path d="M5.5,16.5L2,12l3.5-4.5H12V6H4A2,2,0,0,0,2,8v8a2,2,0,0,0,2,2h8v-1.5H5.5M22,12l-3.5,4.5H12V18h8a2,2,0,0,0,2-2V8a2,2,0,0,0-2-2h-8v1.5h6.5M12,14h-1v-4h1V14z"/></svg>
);
const BatteryIcon: React.FC<IconProps> = ({ active }) => (
  <svg className={`w-8 h-8 ${active ? 'text-red-500' : 'text-gray-600'}`} viewBox="0 0 24 24" fill="currentColor"><path d="M16.67,4H15V2H9V4H7.33A1.33,1.33,0,0,0,6,5.33V20.67C6,21.4,6.6,22,7.33,22H16.67A1.33,1.33,0,0,0,18,20.67V5.33A1.33,1.33,0,0,0,16.67,4M15,18H9V16h6Zm0-4H9V12h6Zm0-4H9V8h6Z"/></svg>
);
const OilIcon: React.FC<IconProps> = ({ active }) => (
  <svg className={`w-8 h-8 ${active ? 'text-yellow-500' : 'text-gray-600'}`} viewBox="0 0 24 24" fill="currentColor"><path d="M5,4h14a2,2,0,0,1,2,2v3.5a2.5,2.5,0,0,1-2.5,2.5H16v2.34c2,1.3,2.5,4.24,2.5,5.16a.5.5,0,0,1-.5.5H6a.5.5,0,0,1-.5-.5c0-.92.5-3.86,2.5-5.16V12H5.5A2.5,2.5,0,0,1,3,9.5V6A2,2,0,0,1,5,4m1.5,4h2A1.5,1.5,0,0,0,10,6.5,1.5,1.5,0,0,0,8.5,5h-2A1.5,1.5,0,0,0,5,6.5,1.5,1.5,0,0,0,6.5,8M21.5,12a.5.5,0,0,1,0,1h-1a.5.5,0,0,1,0-1Z"/></svg>
);
const EngineIcon: React.FC<IconProps> = ({ active }) => (
  <svg className={`w-8 h-8 ${active ? 'text-yellow-500' : 'text-gray-600'}`} viewBox="0 0 24 24" fill="currentColor"><path d="M7,14v-2h2v2H7z m6,0v-2h2v2h-2z M5,10V8h2v2H5z m6,0V8h2v2h-2z M9,6V4h2v2H9z M3,22v-2h2v2H3z m16,0v-2h2v2h-2z M17,2H7v1.17c-1.16,1-2,2.42-2,4.83v2h2v-2c0-1.84,0.45-3.19,1-4v12H6v2h12v-2h-2V6c0.55,0.81,1,2.16,1,4v2h2v-2c0-2.41-0.84-3.83-2-4.83V2H17z"/></svg>
);
const BrakeIcon: React.FC<IconProps> = ({ active }) => (
  <svg className={`w-8 h-8 ${active ? 'text-red-500' : 'text-gray-600'}`} viewBox="0 0 24 24" fill="currentColor"><path d="M12,2A10,10,0,0,0,2,12a10,10,0,0,0,10,10,10,10,0,0,0,10-10A10,10,0,0,0,12,2M12,4a8,8,0,0,1,8,8,8,8,0,0,1-8,8,8,8,0,0,1-8-8,8,8,0,0,1,8-8M7,11h3v2H7v-2m5,0h5v2h-5v-2m-1-1a1,1,0,0,1,1,1,1,1,0,0,1-1,1,1,1,0,0,1-1-1,1,1,0,0,1,1-1z"/></svg>
);


const IndicatorPanel: React.FC = () => {
    return (
        <div className="flex justify-start items-center gap-4 bg-base-900 p-2 rounded-md">
           <SeatbeltIcon active={true} />
           <HighBeamIcon />
           <BatteryIcon />
           <BrakeIcon active={true} />
           <EngineIcon />
           <OilIcon />
        </div>
    );
}

export default IndicatorPanel;
