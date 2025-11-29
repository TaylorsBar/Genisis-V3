
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAIStore } from '../stores/aiStore';
import { useVehicleTelemetry } from '../hooks/useVehicleData';
import { useVehicleStore } from '../stores/vehicleStore';
import { sendMessageToAI, processVoiceCommand } from '../services/geminiService';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import MicrophoneIcon from './icons/MicrophoneIcon';

const NeuralOrb: React.FC<{ state: string }> = ({ state }) => {
    return (
        <div className="relative w-24 h-24 flex items-center justify-center transition-all duration-300">
            {/* Core */}
            <div className={`absolute w-12 h-12 rounded-full bg-brand-cyan transition-all duration-500 z-10 ${state === 'speaking' ? 'scale-125 animate-pulse bg-brand-cyan' : (state === 'thinking' ? 'scale-90 bg-brand-purple' : (state === 'listening' ? 'scale-110 bg-green-500' : 'scale-100'))}`}></div>
            
            {/* Outer Rings */}
            <div className={`absolute inset-0 rounded-full border-2 border-brand-cyan/30 animate-[spin_4s_linear_infinite] ${state === 'thinking' ? 'border-brand-purple/50 duration-[1s]' : ''}`}></div>
            <div className={`absolute inset-4 rounded-full border border-brand-cyan/50 animate-[spin_3s_linear_infinite_reverse]`}></div>
            
            {/* Glow */}
            <div className={`absolute inset-[-20px] bg-brand-cyan/20 blur-xl rounded-full transition-opacity duration-500 ${state !== 'idle' ? 'opacity-100' : 'opacity-10'}`}></div>
            
            {/* Listening Ripple */}
            {state === 'listening' && (
                <>
                    <div className="absolute inset-0 rounded-full border border-green-500/50 animate-ping"></div>
                    <div className="absolute inset-0 rounded-full border border-green-500/30 animate-ping delay-150"></div>
                </>
            )}
        </div>
    );
};

const GlobalAssistant: React.FC = () => {
    const { isOpen, setIsOpen, mode, setMode, messages, addMessage, state, setState, currentContext } = useAIStore();
    const { latestData } = useVehicleTelemetry();
    const dtcs = useVehicleStore(state => state.dtcs); // Get DTCs for diagnostics
    const { speak, cancel } = useTextToSpeech();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (text: string) => {
        if (!text.trim()) return;
        
        addMessage('user', text);
        setInputValue('');
        setState('thinking');

        try {
            if (mode === 'voice') {
                // --- Voice Mode: Structured Command Processing ---
                const response = await processVoiceCommand(text, latestData, location.pathname, dtcs);
                
                // Execute Action
                if (response.action === 'NAVIGATE' && response.target) {
                    navigate(response.target);
                }

                // Speak Response
                addMessage('model', response.speech);
                setState('speaking');
                
                speak(response.speech, () => {
                    // CONTINUOUS LOOP: Start listening again after speaking
                    if (isOpen && mode === 'voice') {
                        setState('listening');
                        startListening();
                    } else {
                        setState('idle');
                    }
                });

            } else {
                // --- Chat Mode: Standard Text Conversation ---
                const response = await sendMessageToAI(text, latestData, currentContext);
                addMessage('model', response);
                setState('speaking');
                
                // Auto-speak only if it's a short response
                if (response.length < 150) {
                    speak(response, () => setState('idle'));
                } else {
                    setState('idle');
                }
            }
        } catch (e) {
            console.error(e);
            setState('idle');
        }
    };

    const { isListening, startListening, stopListening, transcript } = useSpeechRecognition((text) => {
        handleSend(text);
    });

    // Sync listening state
    useEffect(() => {
        if (isListening) setState('listening');
        else if (state === 'listening' && !isListening) {
            // Logic handled in useSpeechRecognition onResult
        }
    }, [isListening]);

    // Cleanup on unmount or close
    useEffect(() => {
        if (!isOpen) {
            stopListening();
            cancel();
            setState('idle');
        }
    }, [isOpen]);

    const toggleVoice = () => {
        if (isListening) {
            stopListening();
            setState('idle');
        } else {
            setMode('voice');
            setIsOpen(true);
            setState('listening');
            startListening();
        }
    };

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-black/80 backdrop-blur-md border border-brand-cyan/50 shadow-[0_0_20px_rgba(0,240,255,0.3)] flex items-center justify-center z-50 group hover:scale-110 transition-all"
            >
                <div className="absolute inset-0 bg-brand-cyan/10 rounded-full animate-ping opacity-20 group-hover:opacity-40"></div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-cyan to-blue-600 flex items-center justify-center">
                    <MicrophoneIcon className="w-4 h-4 text-black" />
                </div>
            </button>
        );
    }

    return (
        <div className={`fixed z-50 transition-all duration-500 ease-out flex flex-col ${mode === 'voice' ? 'bottom-0 left-0 w-full h-full bg-black/90 backdrop-blur-xl items-center justify-center' : 'bottom-6 right-6 w-[400px] h-[600px]'}`}>
            
            {/* Main Panel */}
            <div className={`
                glass-panel border border-white/10 shadow-2xl overflow-hidden flex flex-col relative
                ${mode === 'voice' ? 'w-full max-w-2xl h-auto min-h-[400px] rounded-3xl bg-transparent border-none shadow-none' : 'rounded-xl h-full bg-[#050505]/90 backdrop-blur-2xl'}
            `}>
                
                {/* Header (Chat Mode) */}
                {mode === 'chat' && (
                    <div className="flex items-center justify-between p-3 border-b border-white/10 bg-black/40">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse"></div>
                            <span className="text-xs font-display font-bold text-white tracking-widest">KC // AI CORE</span>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => { setMode('voice'); startListening(); }} className="p-1 hover:text-brand-cyan text-gray-500"><MicrophoneIcon className="w-4 h-4" /></button>
                            <button onClick={() => setIsOpen(false)} className="p-1 hover:text-white text-gray-500">&times;</button>
                        </div>
                    </div>
                )}

                {/* Content Area */}
                {mode === 'voice' ? (
                    // Voice Mode UI
                    <div className="flex flex-col items-center w-full h-full justify-center relative">
                        {/* Background Grid FX */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,240,255,0.1)_0%,_rgba(0,0,0,0)_70%)] pointer-events-none"></div>
                        
                        <NeuralOrb state={state} />
                        
                        <div className="mt-12 text-center max-w-lg px-6 z-10">
                            <p className={`font-mono text-sm uppercase tracking-[0.3em] mb-4 transition-colors ${state === 'listening' ? 'text-green-400' : 'text-brand-cyan'}`}>
                                {state === 'listening' ? 'LISTENING...' : (state === 'speaking' ? 'RESPONDING' : 'PROCESSING')}
                            </p>
                            <p className="text-white font-display font-bold text-2xl md:text-3xl leading-tight min-h-[4rem] drop-shadow-lg">
                                "{state === 'listening' ? (transcript || "Say a command...") : messages[messages.length-1]?.text}"
                            </p>
                        </div>

                        {/* Voice Controls */}
                        <div className="mt-16 flex gap-6 z-10">
                            <button 
                                onClick={() => { stopListening(); cancel(); setIsOpen(false); }} 
                                className="px-8 py-3 rounded-full bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 text-xs font-bold uppercase tracking-widest transition-all text-gray-400 hover:text-red-400"
                            >
                                Terminate
                            </button>
                            <button 
                                onClick={() => { stopListening(); setMode('chat'); }} 
                                className="px-8 py-3 rounded-full bg-brand-cyan/10 hover:bg-brand-cyan/20 border border-brand-cyan/30 hover:border-brand-cyan text-brand-cyan text-xs font-bold uppercase tracking-widest transition-all"
                            >
                                Terminal Mode
                            </button>
                        </div>
                    </div>
                ) : (
                    // Chat Mode UI
                    <>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-lg text-xs leading-relaxed font-mono ${
                                        msg.role === 'user' 
                                        ? 'bg-brand-blue/20 text-white border border-brand-blue/50 rounded-br-none' 
                                        : 'bg-[#111] text-gray-300 border border-gray-700 rounded-bl-none shadow-lg'
                                    }`}>
                                        {msg.text}
                                    </div>
                                    <span className="text-[9px] text-gray-600 mt-1 uppercase">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                                </div>
                            ))}
                            {state === 'thinking' && (
                                <div className="flex items-center gap-1 pl-2">
                                    <div className="w-1 h-1 bg-brand-cyan rounded-full animate-bounce"></div>
                                    <div className="w-1 h-1 bg-brand-cyan rounded-full animate-bounce delay-75"></div>
                                    <div className="w-1 h-1 bg-brand-cyan rounded-full animate-bounce delay-150"></div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-3 bg-black/60 border-t border-white/10">
                            <div className="relative flex items-center gap-2">
                                <input 
                                    className="flex-1 bg-[#111] border border-gray-700 rounded px-3 py-2 text-xs text-white focus:border-brand-cyan focus:outline-none"
                                    placeholder={`Message KC about ${currentContext}...`}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)}
                                />
                                <button 
                                    onClick={() => { setMode('voice'); setState('listening'); startListening(); }}
                                    className={`p-2 rounded border ${isListening ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-black border-gray-700 text-gray-400 hover:text-white'}`}
                                >
                                    <MicrophoneIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default GlobalAssistant;
