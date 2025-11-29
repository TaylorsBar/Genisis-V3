
import { useState, useEffect, useRef } from 'react';

const DURATION = 100;

export const useAnimatedValue = (targetValue: number, config: { duration?: number } = {}) => {
  const { duration = DURATION } = config;
  
  // Sanitize: Only accept valid numbers
  const safeTarget = (typeof targetValue === 'number' && Number.isFinite(targetValue)) ? targetValue : 0;
  
  const [currentValue, setCurrentValue] = useState(safeTarget);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);
  const startValueRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const startAnimation = () => {
      startTimeRef.current = performance.now();
      startValueRef.current = currentValue;

      const animate = (now: number) => {
        const elapsed = now - (startTimeRef.current ?? now);
        const progress = Math.min(elapsed / duration, 1);
        
        const easedProgress = 1 - Math.pow(1 - progress, 3); 

        const nextValue = (startValueRef.current ?? 0) + (safeTarget - (startValueRef.current ?? 0)) * easedProgress;
        
        if (Number.isFinite(nextValue)) {
            setCurrentValue(nextValue);
        }

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      };

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Check for significant difference to prevent micro-looping
    const diff = Math.abs(safeTarget - currentValue);
    
    // Only animate if diff > 0.01, otherwise just snap or do nothing
    if (diff > 0.01) {
      startAnimation();
    } else if (diff > 0) {
      // If tiny difference, just snap to prevent endless small updates
      setCurrentValue(safeTarget);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [safeTarget, duration]); // Depend ONLY on safeTarget

  return currentValue;
};
