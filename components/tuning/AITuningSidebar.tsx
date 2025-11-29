
import React, { useState } from 'react';
import { TuningSuggestion } from '../../types';

interface AITuningSidebarProps {
    onApply: (params: any) => void;
}

const AITuningSidebar: React.FC<AITuningSidebarProps> = ({ onApply }) => {
    const [messages, setMessages] = useState<{role: 'ai'|'user', text: string}[]>([
        { role: 'ai', text: 'I am monitoring the VE table. I noticed a lean spot at 4500 RPM under high load (1.2 lambda). Shall I smooth the adjacent cells?' }
    ]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input) return;
        setMessages(p => [...p, {role: 'user', text: input}]);
        setInput('');
        
        // Sim response
        setTimeout(() => {
            setMessages(p => [...p, {role: 'ai', text: 'Understood. Optimizing ignition timing for knock threshold... Done. +2° advance added to cruise cells.'}]);
        }, 1000);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f1014]">
            <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-brand-cyan/5 to-transparent">
                <h2 className="font-display font-bold text-brand-cyan tracking-widest text-sm">AI CO-TUNER</h2>
                <div className="flex items-center gap-2 mt-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] text-green-400 font-mono tracking-wide">MONITORING ECU STREAM</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {m.role === 'ai' && <div className="w-6 h-6 rounded bg-brand-cyan/20 flex items-center justify-center mr-2 border border-brand-cyan/50"><span className="text-[10px] font-bold text-brand-cyan">AI</span></div>}
                        <div className={`max-w-[85%] p-3 rounded-lg text-xs leading-relaxed ${
                            m.role === 'user' 
                            ? 'bg-brand-blue/20 text-white border border-brand-blue/50 rounded-br-none' 
                            : 'bg-gray-800/50 text-gray-300 border border-gray-700 rounded-bl-none'
                        }`}>
                            {m.text}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-gray-800 bg-[#0a0c10]">
                 <div className="relative">
                    <input 
                        className="w-full bg-black border border-gray-700 rounded-md py-3 pl-3 pr-10 text-xs text-white focus:border-brand-cyan focus:outline-none transition-colors"
                        placeholder="Command the AI..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                    />
                    <button onClick={handleSend} className="absolute right-2 top-2 p-1 text-brand-cyan hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                 </div>
                 <div className="grid grid-cols-2 gap-2 mt-3">
                     <button className="text-[10px] font-bold bg-gray-800 border border-gray-700 hover:border-gray-500 hover:bg-gray-700 py-2 rounded text-gray-300 transition-all">SMOOTH MAP</button>
                     <button className="text-[10px] font-bold bg-gray-800 border border-gray-700 hover:border-gray-500 hover:bg-gray-700 py-2 rounded text-gray-300 transition-all">INTERPOLATE</button>
                 </div>
            </div>
        </div>
    );
};

export default AITuningSidebar;
