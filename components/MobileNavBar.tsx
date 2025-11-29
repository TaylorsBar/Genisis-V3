
import React from 'react';
import { NavLink } from 'react-router-dom';
import GaugeIcon from './icons/GaugeIcon';
import StopwatchIcon from './icons/StopwatchIcon';
import EngineIcon from './icons/EngineIcon';
import ARIcon from './icons/ARIcon';
import ChatIcon from './icons/ChatIcon';
import TuningForkIcon from './icons/TuningForkIcon';

const MobileNavBar: React.FC = () => {
    const navItems = [
        { name: 'Dash', href: '/', icon: GaugeIcon },
        { name: 'Race', href: '/race-pack', icon: StopwatchIcon },
        { name: 'AI', href: '/ai-engine', icon: EngineIcon },
        { name: 'AR', href: '/ar-assistant', icon: ARIcon },
        { name: 'Diag', href: '/diagnostics', icon: ChatIcon },
        { name: 'Tune', href: '/tuning', icon: TuningForkIcon },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-0 pointer-events-none">
            <div className="bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] pointer-events-auto flex items-center justify-around py-3 px-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.href}
                        className={({ isActive }) => `
                            flex flex-col items-center justify-center w-full relative group
                            ${isActive ? 'text-brand-cyan' : 'text-gray-500'}
                        `}
                    >
                        {({ isActive }) => (
                            <>
                                <div className={`
                                    absolute -top-10 transition-all duration-300 pointer-events-none
                                    ${isActive ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-50'}
                                `}>
                                    <div className="w-10 h-10 bg-brand-cyan/20 rounded-full blur-xl"></div>
                                </div>
                                
                                <item.icon className={`w-6 h-6 mb-1 transition-transform duration-200 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]' : 'group-active:scale-90'}`} />
                                <span className="text-[10px] font-bold uppercase tracking-wider">{item.name}</span>
                                
                                {isActive && (
                                    <div className="absolute -bottom-3 w-1 h-1 bg-brand-cyan rounded-full shadow-[0_0_5px_#00F0FF]"></div>
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </div>
    );
};

export default MobileNavBar;
