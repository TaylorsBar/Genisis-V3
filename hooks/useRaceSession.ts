
import { useState, useEffect, useRef, useCallback } from 'react';
import { useVehicleData } from './useVehicleData';
import { SensorDataPoint, LapTime, RaceSession } from '../types';

const QUARTER_MILE_METERS = 402.336;

const initialSessionState: RaceSession = {
    isActive: false,
    startTime: null,
    elapsedTime: 0,
    data: [],
    lapTimes: [],
    zeroToHundredTime: null,
    quarterMileTime: null,
    quarterMileSpeed: null,
};

export const useRaceSession = () => {
    const { latestData } = useVehicleData();
    const [session, setSession] = useState<RaceSession>(initialSessionState);
    const sessionUpdateRef = useRef<number | null>(null);
    const isActiveRef = useRef(false);
    
    // Use a ref to access the latest data inside the rAF loop without triggering effect re-runs
    const latestDataRef = useRef(latestData);

    useEffect(() => {
        latestDataRef.current = latestData;
    }, [latestData]);

    const updateSession = useCallback(() => {
        if (!isActiveRef.current) {
            return;
        }

        setSession(prev => {
            if (!prev.isActive || !prev.startTime) return prev;

            const currentData = latestDataRef.current;
            const now = performance.now();
            const elapsedTime = now - prev.startTime;
            
            // Limit data array growth for performance (keep last 3000 points ~ 2.5 mins @ 20Hz)
            // Prevents "Max update depth" issues caused by massive array cloning/rendering
            const prevData = prev.data.length > 3000 ? prev.data.slice(1) : prev.data;
            const newData = [...prevData, currentData];

            let { zeroToHundredTime, quarterMileTime, quarterMileSpeed } = prev;

            // 0-100km/h check
            if (!zeroToHundredTime && currentData.speed >= 100) {
                const startData = newData.find(d => d.speed > 0);
                if (startData) {
                    zeroToHundredTime = (currentData.time - startData.time) / 1000;
                }
            }

            // 1/4 mile check
            if (!quarterMileTime && currentData.distance >= QUARTER_MILE_METERS) {
                const startData = newData[0];
                if (startData) {
                    // Find the exact point it crossed the line
                    const lastPoint = prev.data[prev.data.length - 1];
                    const fraction = (QUARTER_MILE_METERS - lastPoint.distance) / (currentData.distance - lastPoint.distance);
                    const crossingTime = lastPoint.time + (currentData.time - lastPoint.time) * fraction;
                    
                    quarterMileTime = (crossingTime - startData.time) / 1000;
                    quarterMileSpeed = currentData.speed;
                }
            }

            return {
                ...prev,
                elapsedTime,
                data: newData,
                zeroToHundredTime,
                quarterMileTime,
                quarterMileSpeed,
            };
        });

        // Check if still active before requesting next frame to prevent race conditions
        if (isActiveRef.current) {
            sessionUpdateRef.current = requestAnimationFrame(updateSession);
        }
    }, []);
    
    useEffect(() => {
        isActiveRef.current = session.isActive;
        
        if (session.isActive) {
            // Only start loop if not already running
            if (!sessionUpdateRef.current) {
                sessionUpdateRef.current = requestAnimationFrame(updateSession);
            }
        } else {
            if (sessionUpdateRef.current) {
                cancelAnimationFrame(sessionUpdateRef.current);
                sessionUpdateRef.current = null;
            }
        }
        
        // Cleanup on unmount
        return () => {
            isActiveRef.current = false;
            if (sessionUpdateRef.current) {
                cancelAnimationFrame(sessionUpdateRef.current);
                sessionUpdateRef.current = null;
            }
        };
    }, [session.isActive, updateSession]);


    const startSession = () => {
        setSession({
            ...initialSessionState,
            isActive: true,
            startTime: performance.now(),
            data: [latestDataRef.current], // Start with the very first data point
        });
    };

    const stopSession = () => {
        setSession(prev => ({
            ...prev,
            isActive: false,
        }));
    };

    const recordLap = () => {
        setSession(prev => {
            if (!prev.isActive || !prev.startTime) return prev;
            
            const totalPrevTime = prev.lapTimes.reduce((acc, l) => acc + l.time, 0);
            const currentLapTime = prev.elapsedTime - totalPrevTime;

            return {
                ...prev,
                lapTimes: [...prev.lapTimes, { lap: prev.lapTimes.length + 1, time: currentLapTime }],
            };
        });
    };

    return { session, startSession, stopSession, recordLap };
};
