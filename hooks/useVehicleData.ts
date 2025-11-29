
import { useEffect } from 'react';
import { useVehicleStore } from '../stores/vehicleStore';

/**
 * Hook for high-frequency sensor data (20Hz).
 * Use this only in components that need to render real-time gauges or graphs.
 */
export const useVehicleTelemetry = () => {
    const latestData = useVehicleStore(state => state.latestData);
    const data = useVehicleStore(state => state.data);
    const hasActiveFault = useVehicleStore(state => state.hasActiveFault);
    
    return { latestData, data, hasActiveFault };
};

/**
 * Hook for connection state and system controls (Low frequency).
 * Use this for UI elements like sidebars, settings, or connection buttons.
 * This will NOT trigger re-renders on every sensor update.
 */
export const useVehicleConnection = () => {
    const obdState = useVehicleStore(state => state.obdState);
    const ekfStats = useVehicleStore(state => state.ekfStats);
    const connectObd = useVehicleStore(state => state.connectObd);
    const disconnectObd = useVehicleStore(state => state.disconnectObd);
    const startSimulation = useVehicleStore(state => state.startSimulation);
    const stopSimulation = useVehicleStore(state => state.stopSimulation);

    return { 
        obdState, 
        ekfStats, 
        connectObd, 
        disconnectObd, 
        startSimulation,
        stopSimulation
    };
};

/**
 * @deprecated Use useVehicleTelemetry or useVehicleConnection for better performance.
 * Legacy hook combining all state for backward compatibility with existing pages.
 */
export const useVehicleData = () => {
    const telemetry = useVehicleTelemetry();
    const connection = useVehicleConnection();

    // Auto-start simulation logic preserved for legacy components relying on this side-effect
    useEffect(() => {
        connection.startSimulation();
    }, []);

    return { 
        ...telemetry, 
        ...connection 
    };
};
