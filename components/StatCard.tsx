
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  className?: string;
  children?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, unit, className, children }) => {
  return (
    <div className={`glass-panel p-6 rounded-2xl relative overflow-hidden group transition-transform duration-300 hover:scale-[1.02] ${className}`}>
      {/* Top decorative line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-cyan/50 to-transparent opacity-50"></div>
      
      <div className="flex items-center justify-between mb-2 relative z-10">
        <h3 className="text-[0.65rem] font-display font-bold uppercase tracking-[0.2em] text-gray-400 group-hover:text-brand-cyan transition-colors">{title}</h3>
        <div className="text-brand-cyan/80">
            {children}
        </div>
      </div>
      
      <div className="flex items-baseline relative z-10">
        <span className="text-4xl md:text-5xl font-display font-bold text-white neon-text tracking-tighter">{value}</span>
        {unit && <span className="ml-2 text-xs font-mono font-medium text-gray-500 uppercase tracking-widest">{unit}</span>}
      </div>

      {/* Subtle background glow on hover */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-brand-cyan/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
    </div>
  );
};

export default StatCard;
