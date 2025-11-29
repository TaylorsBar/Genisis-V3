
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import GaugeIcon from './icons/GaugeIcon';
import ChatIcon from './icons/ChatIcon';
import WrenchIcon from './icons/WrenchIcon';
import TuningForkIcon from './icons/TuningForkIcon';
import EngineIcon from './icons/EngineIcon';
import ShieldIcon from './icons/ShieldIcon';
import ARIcon from './icons/ARIcon';
import HederaIcon from './icons/HederaIcon';
import StopwatchIcon from './icons/StopwatchIcon';
import PaintBrushIcon from './icons/PaintBrushIcon';
import SoundWaveIcon from './icons/SoundWaveIcon';
import { useVehicleConnection } from '../hooks/useVehicleData';
import { ObdConnectionState } from '../types';

const navItems = [
  { name: 'Cockpit', href: '/', icon: GaugeIcon, category: 'drive' },
  { name: 'Race Telemetry', href: '/race-pack', icon: StopwatchIcon, category: 'drive' },
  { name: 'Dyno Lab', href: '/tuning', icon: TuningForkIcon, category: 'engineer' },
  { name: 'Diagnostics', href: '/diagnostics', icon: ChatIcon, category: 'engineer' },
  { name: 'AI Core', href: '/ai-engine', icon: EngineIcon, category: 'engineer' },
  { name: 'AR Vision', href: '/ar-assistant', icon: ARIcon, category: 'engineer' },
  { name: 'Maintenance', href: '/logbook', icon: WrenchIcon, category: 'manage' },
  { name: 'Security', href: '/security', icon: ShieldIcon, category: 'manage' },
  { name: 'Ledger', href: '/hedera', icon: HederaIcon, category: 'manage' },
  { name: 'Cabin', href: '/accessories', icon: SoundWaveIcon, category: 'config' },
  { name: 'System', href: '/appearance', icon: PaintBrushIcon, category: 'config' },
];

const Sidebar: React.FC = () => {
  const { obdState, connectObd, disconnectObd } = useVehicleConnection();
  const [expanded, setExpanded] = useState(false);

  const handleConnectionClick = () => {
    if (obdState === ObdConnectionState.Disconnected || obdState === ObdConnectionState.Error) {
      connectObd();
    } else {
      disconnectObd();
    }
  };

  return (
    <div 
        className={`hidden md:flex flex-col h-full bg-[#050505] border-r border-[#1F1F1F] z-50 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${expanded ? 'w-64' : 'w-16'}`}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
    >
        {/* Brand Mark */}
        <div className="h-16 flex items-center justify-center border-b border-[#1F1F1F] bg-black relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-cyan/20 to-transparent opacity-50"></div>
            <span className="font-display font-black text-2xl tracking-tighter text-white z-10">
                {expanded ? 'GENESIS' : 'G'}
            </span>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar flex flex-col gap-2">
            {navItems.map((item) => (
                <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) => `
                        relative flex items-center h-12 px-4 mx-2 rounded transition-all duration-200
                        ${isActive 
                            ? 'bg-brand-cyan/10 text-brand-cyan shadow-[0_0_15px_rgba(0,240,255,0.15)] border border-brand-cyan/30' 
                            : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'}
                    `}
                >
                    <item.icon className="w-6 h-6 min-w-[24px]" />
                    <span className={`ml-4 font-medium text-sm whitespace-nowrap transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                        {item.name}
                    </span>
                    
                    {/* Active Indicator Line */}
                    <NavLink to={item.href} className={({ isActive }) => isActive ? "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-brand-cyan rounded-r" : "hidden"} />
                </NavLink>
            ))}
        </div>

        {/* System Status Footer */}
        <div className="p-2 border-t border-[#1F1F1F] bg-black">
            <button
                onClick={handleConnectionClick}
                className={`w-full flex items-center ${expanded ? 'justify-start px-4' : 'justify-center'} h-12 rounded bg-[#111] border border-[#333] hover:border-brand-cyan/50 transition-all group relative overflow-hidden`}
            >
                <div className={`w-2 h-2 rounded-full ${obdState === ObdConnectionState.Connected ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500'}`}></div>
                <span className={`ml-3 font-mono text-xs font-bold text-gray-400 group-hover:text-white uppercase transition-all ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
                    {obdState === ObdConnectionState.Connected ? 'Online' : 'Offline'}
                </span>
                
                {/* Scanline effect on button hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>
        </div>
    </div>
  );
};

export default Sidebar;
