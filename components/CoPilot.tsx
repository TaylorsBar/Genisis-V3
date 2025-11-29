
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { interpretHandsFreeCommand } from '../services/geminiService';
import { SensorDataPoint, DiagnosticAlert } from '../types';
import MicrophoneIcon from './icons/MicrophoneIcon';

enum CoPilotState {
  Idle,
  Listening,
  Thinking,
  Speaking,
}

interface CoPilotProps {
  latestVehicleData: SensorDataPoint;
  activeAlerts: DiagnosticAlert[];
}

const AudioVisualizer: React.FC<{ active: boolean, color: string }> = ({ active, color }) => (
  <div className={`flex items-center gap-1 h-8 ${active ? '' : 'opacity-0'} transition-opacity duration-300`}>
    {[...Array(5)].map((_, i) => (
      <div 
        key={i}
        className={`w-1 bg-current rounded-full transition-all duration-75 ${color}`}
        style={{ 
          height: active ? `${Math.random() * 100}%` : '20%',
          animation: active ? `pulse 0.5s infinite ${i * 0.1}s` : 'none'
        }}
      ></div>
    ))}
  </div>
);

const CoPilot: React.FC<CoPilotProps> = ({ latestVehicleData, activeAlerts }) => {
  const [state, setState] = useState<CoPilotState>(CoPilotState.Idle);
  const [userTranscript, setUserTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [handsFreeMode, setHandsFreeMode] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { speak, isSpeaking, cancel } = useTextToSpeech();
  
  // Use ref to track mount state to prevent updates on unmount
  const isMounted = useRef(true);
  useEffect(() => { return () => { isMounted.current = false; }; }, []);

  // Handle the action returned by Gemini
  const handleAiAction = useCallback((actionData: { action: string, payload?: string, textToSpeak: string }) => {
    if (!isMounted.current) return;
    
    setAiResponse(actionData.textToSpeak);
    setState(CoPilotState.Speaking);

    // Execute Navigation if requested
    if (actionData.action === 'NAVIGATE' && actionData.payload) {
        navigate(actionData.payload);
    }

    // Speak the response
    speak(actionData.textToSpeak, () => {
        if (!isMounted.current) return;
        
        if (handsFreeMode) {
             // Delay to prevent self-triggering
             setTimeout(() => {
                if (isMounted.current && handsFreeMode) {
                    setState(CoPilotState.Listening);
                }
             }, 800);
        } else {
            setState(CoPilotState.Idle);
            // Auto-close after short delay if not hands-free
            setTimeout(() => setIsOpen(false), 3000);
        }
    });
  }, [navigate, speak, handsFreeMode]);

  const processCommand = useCallback(async (command: string) => {
    if (!command.trim()) {
        if (handsFreeMode) {
             setState(CoPilotState.Listening);
        } else {
             setState(CoPilotState.Idle);
        }
        return;
    }

    setUserTranscript(command);
    setState(CoPilotState.Thinking);
    setAiResponse('');
    
    // Call Gemini Service
    const result = await interpretHandsFreeCommand(
        command, 
        location.pathname, 
        latestVehicleData, 
        activeAlerts
    );
    
    handleAiAction({
        action: result.action,
        payload: result.payload,
        textToSpeak: result.textToSpeak
    });

  }, [latestVehicleData, activeAlerts, location.pathname, handleAiAction, handsFreeMode]);

  const { isListening, startListening, stopListening, hasSupport } = useSpeechRecognition(processCommand);

  // Sync internal state with hook state
  useEffect(() => {
    if (isListening) {
        setState(CoPilotState.Listening);
    }
  }, [isListening]);
  
  // Hands-free loop manager
  useEffect(() => {
      if (handsFreeMode && state === CoPilotState.Listening && !isListening && !isSpeaking) {
          startListening();
      }
  }, [handsFreeMode, state, isListening, isSpeaking, startListening]);

  const toggleCoPilot = () => {
    if (!hasSupport) {
        alert("Speech Recognition is not supported in this browser.");
        return;
    }
      
    if (!isOpen) {
      setIsOpen(true);
      setHandsFreeMode(true);
      setState(CoPilotState.Listening);
      startListening();
    } else {
      setHandsFreeMode(false);
      stopListening();
      cancel(); 
      setState(CoPilotState.Idle);
      setIsOpen(false);
    }
  };

  // Dynamic Styles based on state
  const getStatusColor = () => {
      switch (state) {
          case CoPilotState.Listening: return 'text-red-500 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]';
          case CoPilotState.Thinking: return 'text-purple-400 border-purple-400 shadow-[0_0_15px_rgba(192,132,252,0.4)]';
          case CoPilotState.Speaking: return 'text-brand-cyan border-brand-cyan shadow-[0_0_15px_rgba(0,240,255,0.4)]';
          default: return 'text-gray-400 border-gray-600';
      }
  };

  const getStatusText = () => {
    switch (state) {
      case CoPilotState.Listening: return 'LISTENING...';
      case CoPilotState.Thinking: return 'ANALYZING...';
      case CoPilotState.Speaking: return 'RESPONDING';
      default: return 'STANDBY';
    }
  };

  return (
    <>
      {/* Floating Activation Button (FAB) */}
      <button
        onClick={toggleCoPilot}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 z-50 ${
            isOpen ? 'bg-red-600 rotate-45' : 'bg-brand-cyan hover:scale-110 hover:shadow-[0_0_20px_var(--brand-glow)]'
        } shadow-lg`}
        aria-label="Toggle AI Co-Pilot"
      >
        {isOpen ? (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        ) : (
            <MicrophoneIcon className="w-6 h-6 text-black" />
        )}
      </button>

      {/* HUD Panel Overlay */}
      <div 
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
            isOpen ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
        }`}
      >
        <div className={`glass-panel bg-black/80 backdrop-blur-xl border p-6 rounded-2xl w-[90vw] max-w-lg flex flex-col items-center gap-4 ${getStatusColor()}`}>
            
            {/* Status Header */}
            <div className="flex items-center justify-between w-full border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${state === CoPilotState.Listening ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
                    <span className="text-xs font-display font-bold tracking-widest uppercase">{getStatusText()}</span>
                </div>
                <div className="text-[10px] font-mono text-gray-500">KC-AI CORE v3.1</div>
            </div>

            {/* Main Interaction Area */}
            <div className="flex flex-col items-center justify-center min-h-[80px] w-full text-center">
                {state === CoPilotState.Listening && (
                    <div className="text-xl font-light text-white italic">
                        "Listening..."
                    </div>
                )}
                
                {state === CoPilotState.Thinking && (
                    <div className="flex gap-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-75"></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-150"></div>
                    </div>
                )}

                {state === CoPilotState.Speaking && (
                    <p className="text-lg font-medium text-brand-cyan animate-in fade-in slide-in-from-bottom-2">
                        {aiResponse}
                    </p>
                )}
            </div>

            {/* User Transcript Display */}
            {userTranscript && state !== CoPilotState.Listening && (
                <div className="text-xs text-gray-500 font-mono border-t border-white/10 pt-2 w-full text-center">
                    CMD: {userTranscript}
                </div>
            )}
            
            {/* Visualizer Footer */}
            <div className="h-6 w-full flex items-center justify-center">
                 <AudioVisualizer active={state === CoPilotState.Speaking || state === CoPilotState.Listening} color={state === CoPilotState.Listening ? 'text-red-500' : 'text-brand-cyan'} />
            </div>

        </div>
      </div>
    </>
  );
};

export default CoPilot;
