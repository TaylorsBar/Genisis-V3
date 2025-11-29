
import React from 'react';

interface InfoPanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ title, children, className }) => {
  return (
    <div 
        className={`glass-panel h-full w-full p-5 flex flex-col rounded-2xl relative overflow-hidden group ${className}`}
    >
      {/* Corner accents */}
      <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-brand-cyan/30 rounded-tr-lg opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-brand-cyan/30 rounded-bl-lg opacity-50"></div>

      <h3 
        className="font-display text-[0.65rem] font-bold uppercase tracking-[0.25em] text-left text-gray-500 mb-3 group-hover:text-brand-cyan/70 transition-colors"
      >
          {title}
      </h3>
      <div className="flex-grow relative z-10">
        {children}
      </div>
    </div>
  );
};

export default InfoPanel;
