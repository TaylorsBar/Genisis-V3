
import React from 'react';
import { DiagnosticAlert, AlertLevel } from '../types';

export const MOCK_ALERTS: DiagnosticAlert[] = [
  { id: '1', level: AlertLevel.Warning, component: 'O2 Sensor (Bank 1)', message: 'Sensor response time lag detected.', timestamp: '2m ago', isFaultRelated: true },
  { id: '2', level: AlertLevel.Info, component: 'Tire Pressure', message: 'RR Pressure -2 PSI.', timestamp: '1h ago' },
  { id: '3', level: AlertLevel.Critical, component: 'MAP Sensor', message: 'Erratic voltage. Risk of stall.', timestamp: 'Now', isFaultRelated: true },
];

const alertStyles = {
  [AlertLevel.Critical]: 'border-l-2 border-brand-red bg-gradient-to-r from-brand-red/10 to-transparent',
  [AlertLevel.Warning]: 'border-l-2 border-yellow-500 bg-gradient-to-r from-yellow-500/10 to-transparent',
  [AlertLevel.Info]: 'border-l-2 border-brand-blue bg-gradient-to-r from-brand-blue/10 to-transparent',
};

const textStyles = {
    [AlertLevel.Critical]: 'text-brand-red neon-text-red',
    [AlertLevel.Warning]: 'text-yellow-400',
    [AlertLevel.Info]: 'text-brand-blue',
};

const AlertIcon: React.FC<{level: AlertLevel}> = ({level}) => {
    const className = `w-5 h-5 ${textStyles[level]}`;
    if (level === AlertLevel.Critical) {
        return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
    }
    if (level === AlertLevel.Warning) {
        return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    }
    return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
}

const Alerts: React.FC = () => {
  return (
    <div className="glass-panel p-5 rounded-2xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
        <h3 className="text-[0.7rem] font-display font-bold uppercase tracking-[0.2em] text-gray-400">System Alerts</h3>
        <span className="px-2 py-0.5 text-[10px] font-bold bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 rounded-sm">
            {MOCK_ALERTS.length} ACTIVE
        </span>
      </div>
      <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {MOCK_ALERTS.sort((a,b) => Object.values(AlertLevel).indexOf(b.level) - Object.values(AlertLevel).indexOf(a.level)).map((alert) => (
          <div key={alert.id} className={`p-3 rounded-r-lg transition-all hover:bg-white/5 ${alertStyles[alert.level]}`}>
            <div className="flex gap-3 items-start">
              <div className="flex-shrink-0 mt-0.5">
                <AlertIcon level={alert.level} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                    <p className={`text-xs font-display font-bold truncate ${textStyles[alert.level]}`}>{alert.component}</p>
                    <span className="text-[9px] text-gray-600 font-mono uppercase">{alert.timestamp}</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5 leading-snug">{alert.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Alerts;
