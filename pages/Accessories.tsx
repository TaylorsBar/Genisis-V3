
import React, { useState, useContext } from 'react';
import { AppearanceContext, CopilotAudioOutput } from '../contexts/AppearanceContext';
import SoundWaveIcon from '../components/icons/SoundWaveIcon';

const Accessories: React.FC = () => {
    const { copilotAudioOutput, setCopilotAudioOutput } = useContext(AppearanceContext);

    const [isConnected, setIsConnected] = useState(true);
    const [stereoName, setStereoName] = useState('Pioneer AVH-Z9200DAB');
    const [volume, setVolume] = useState(75);
    const [source, setSource] = useState<'Radio' | 'Bluetooth' | 'USB'>('Bluetooth');

    return (
        <div className="h-full flex flex-col space-y-6 relative overflow-hidden p-2">
             {/* Subtle Texture */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]"></div>

            <div className="flex justify-between items-end border-b border-gray-800 pb-4 z-10">
                <div>
                    <h1 className="text-2xl font-display font-bold text-white tracking-wider">CABIN <span className="text-brand-cyan">CONTROL</span></h1>
                    <p className="text-gray-500 text-xs mt-1 font-mono uppercase">Comfort & Entertainment Module</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 z-10 max-w-6xl mx-auto w-full">
                
                {/* HEAD UNIT */}
                <div className="bg-[#111] rounded-xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col relative">
                     {/* Glossy Screen Overlay */}
                     <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none z-20"></div>
                     
                     {/* Faceplate Bezel */}
                     <div className="h-12 bg-[#0a0a0a] border-b border-gray-800 flex items-center justify-between px-6 z-10">
                         <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Pioneer Reference Series</div>
                         <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' : 'bg-red-900'}`}></div>
                     </div>

                     {/* Screen Area */}
                     <div className="flex-1 bg-black p-8 flex flex-col items-center justify-center relative">
                         {/* Album Art / Source Icon Placeholder */}
                         <div className="w-32 h-32 rounded-full border-4 border-[#222] bg-[#0f0f0f] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,0,0,0.8)] relative group">
                            <div className="absolute inset-0 rounded-full border border-gray-700 opacity-50"></div>
                             {source === 'Bluetooth' && <svg className="w-12 h-12 text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" fill="currentColor" viewBox="0 0 24 24"><path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z"/></svg>}
                             {source === 'Radio' && <SoundWaveIcon className="w-12 h-12 text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" />}
                             {source === 'USB' && <svg className="w-12 h-12 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" fill="currentColor" viewBox="0 0 24 24"><path d="M15 7v4h1v2h-3V7h1V2h-1c-1.1 0-2 .9-2 2v3h1v4h1v2h-3v-2h1V7h1V4c0-2.21 1.79-4 4-4s4 1.79 4 4v3h1zM8.7 18.3l-1 1.7c-.2.4-.6.6-1.1.6-.4 0-.8-.2-1.1-.5L3.4 18c-.6-.5-.7-1.4-.2-2l3-5.2c.2-.4.7-.6 1.1-.6.4 0 .8.2 1.1.5l2.1 2.1c.6.5.7 1.4.2 2l-1 1.7z"/></svg>}
                         </div>
                         
                         <h2 className="text-2xl font-display font-bold text-white mb-1 tracking-wide">{isConnected ? "Connected" : "No Device"}</h2>
                         <p className="text-brand-cyan text-sm font-medium tracking-widest uppercase mb-8">{isConnected ? stereoName : "Searching..."}</p>

                         {/* Source Selectors */}
                         <div className="flex gap-4 p-2 bg-[#111] rounded-full border border-gray-800 shadow-inner">
                            {(['Radio', 'Bluetooth', 'USB'] as const).map(src => (
                                <button
                                    key={src}
                                    onClick={() => setSource(src)}
                                    className={`px-6 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
                                        source === src 
                                        ? 'bg-gradient-to-b from-gray-700 to-black text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_2px_4px_rgba(0,0,0,0.5)] border border-gray-600' 
                                        : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                    }`}
                                >
                                    {src}
                                </button>
                            ))}
                         </div>
                     </div>

                     {/* Bottom Controls */}
                     <div className="h-24 bg-[#0a0a0a] border-t border-gray-800 flex items-center px-8 gap-8 z-10">
                        {/* Power/Connect Button */}
                        <button
                            onClick={() => setIsConnected(prev => !prev)}
                            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 active:scale-95 shadow-lg ${
                                isConnected 
                                ? 'border-blue-500/50 text-blue-500 bg-blue-900/10 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                                : 'border-gray-700 text-gray-600 bg-black'
                            }`}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </button>

                        {/* Volume Fader */}
                        <div className="flex-1 flex flex-col justify-center">
                            <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                                <span>Volume</span>
                                <span>{volume}%</span>
                            </div>
                            <div className="relative h-2 bg-black rounded-full border border-gray-800 shadow-inner">
                                <div 
                                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-900 to-brand-cyan rounded-full transition-all duration-100" 
                                    style={{ width: `${volume}%` }}
                                ></div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={volume}
                                    onChange={e => setVolume(parseInt(e.target.value))}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>
                     </div>
                </div>

                {/* CO-PILOT INTEGRATION */}
                <div className="flex flex-col gap-6">
                    <div className="bg-[#111] p-6 rounded-xl border border-gray-700 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                        
                        <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-purple-500/20 flex items-center justify-center border border-purple-500/50">
                                <span className="text-[10px]">AI</span>
                            </div>
                            Co-Pilot Audio Routing
                        </h2>
                        
                        <div className="grid grid-cols-2 gap-4">
                            {(['phone', 'stereo'] as const).map(output => (
                                <button
                                    key={output}
                                    onClick={() => setCopilotAudioOutput(output)}
                                    disabled={output === 'stereo' && !isConnected}
                                    className={`h-24 rounded-lg border-2 flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
                                        copilotAudioOutput === output 
                                        ? 'border-purple-500 bg-purple-900/10 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                                        : 'border-gray-800 bg-[#0a0a0a] hover:border-gray-600'
                                    } ${output === 'stereo' && !isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {output === 'phone' 
                                        ? <svg className={`w-8 h-8 ${copilotAudioOutput === output ? 'text-purple-400' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                        : <SoundWaveIcon className={`w-8 h-8 ${copilotAudioOutput === output ? 'text-purple-400' : 'text-gray-600'}`} />
                                    }
                                    <span className="text-xs font-bold uppercase text-gray-400">{output}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Accessories;
