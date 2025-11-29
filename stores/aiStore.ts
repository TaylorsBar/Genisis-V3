
import { create } from 'zustand';

export interface Message {
    id: string;
    role: 'user' | 'model' | 'system';
    text: string;
    timestamp: number;
}

export type AIState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface AIStore {
    isOpen: boolean;
    mode: 'voice' | 'chat'; // Voice = Minimal HUD, Chat = Full Terminal
    state: AIState;
    messages: Message[];
    currentContext: string; // e.g., "Tuning Page - Fuel Map VE1"
    
    // Actions
    setIsOpen: (open: boolean) => void;
    setMode: (mode: 'voice' | 'chat') => void;
    setState: (state: AIState) => void;
    addMessage: (role: 'user' | 'model' | 'system', text: string) => void;
    setContext: (context: string) => void;
    clearHistory: () => void;
}

export const useAIStore = create<AIStore>((set) => ({
    isOpen: false,
    mode: 'chat',
    state: 'idle',
    messages: [
        { 
            id: 'init-1', 
            role: 'model', 
            text: 'Genesis OS Core Online. I am KC, your Chief Engineer. Systems monitored. Ready for input.', 
            timestamp: Date.now() 
        }
    ],
    currentContext: 'Dashboard',

    setIsOpen: (isOpen) => set({ isOpen }),
    setMode: (mode) => set({ mode }),
    setState: (state) => set({ state }),
    
    addMessage: (role, text) => set((state) => ({
        messages: [
            ...state.messages,
            { id: Date.now().toString(), role, text, timestamp: Date.now() }
        ]
    })),
    
    setContext: (currentContext) => set({ currentContext }),
    
    clearHistory: () => set({ 
        messages: [{ 
            id: Date.now().toString(), 
            role: 'model', 
            text: 'Memory buffer flushed. Ready.', 
            timestamp: Date.now() 
        }] 
    })
}));
