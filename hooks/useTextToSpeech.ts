
import { useState, useEffect, useRef, useCallback } from 'react';
import { generateGeminiSpeech } from '../services/geminiService';

// Helper to decode raw PCM 16-bit data from Gemini
const pcmToAudioBuffer = (
    buffer: ArrayBuffer, 
    ctx: AudioContext, 
    sampleRate: number = 24000, 
    channels: number = 1
): AudioBuffer => {
    // Ensure buffer length is even for Int16Array
    const byteLength = buffer.byteLength;
    const adjustedBuffer = byteLength % 2 === 0 ? buffer : buffer.slice(0, byteLength - 1);
    
    const pcmData = new Int16Array(adjustedBuffer);
    const frameCount = pcmData.length / channels;
    const audioBuffer = ctx.createBuffer(channels, frameCount, sampleRate);

    for (let channel = 0; channel < channels; channel++) {
        const channelData = audioBuffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            // Normalize 16-bit integer to float [-1.0, 1.0]
            channelData[i] = pcmData[i * channels + channel] / 32768.0;
        }
    }
    return audioBuffer;
};

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    // Initialize AudioContext on mount, but it might start suspended
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
        audioContextRef.current = new AudioContext();
    }
    
    return () => {
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
    };
  }, []);

  const speak = useCallback(async (text: string, onEnd?: () => void) => {
    if (!text) return;

    try {
        setIsSpeaking(true);

        // Resume context if suspended (browser autoplay policy)
        if (audioContextRef.current) {
            if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
            }
        }

        // Generate audio from Gemini
        const audioData = await generateGeminiSpeech(text);
        
        if (!audioData || !audioContextRef.current) {
            console.error("Failed to generate audio or no audio context.");
            setIsSpeaking(false);
            if (onEnd) onEnd();
            return;
        }

        // Decode raw PCM data manually
        // Gemini returns raw PCM 16-bit, not a WAV/MP3 container
        const audioBuffer = pcmToAudioBuffer(audioData, audioContextRef.current);

        // Stop previous source if playing
        if (sourceRef.current) {
            try { sourceRef.current.stop(); } catch (e) {}
        }

        // Create new source
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        
        source.onended = () => {
            setIsSpeaking(false);
            if (onEnd) onEnd();
        };

        sourceRef.current = source;
        source.start();

    } catch (error) {
        console.error("Error in TTS playback:", error);
        setIsSpeaking(false);
        if (onEnd) onEnd();
    }
  }, []);
  
  const cancel = useCallback(() => {
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch (e) {}
      sourceRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  return { isSpeaking, speak, cancel };
};
