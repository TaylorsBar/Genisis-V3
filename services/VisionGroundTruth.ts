
import { OpticalFlowProcessor, TrackedPoint } from './OpticalFlowProcessor';

/**
 * VisionGroundTruth Module
 * 
 * This module acts as the bridge between raw camera data and state estimation.
 * It can operate in two modes:
 * 1. Simulation: Generates synthetic noisy speed data based on physics engine ground truth.
 * 2. Real-Time: Processes video frames using Optical Flow to estimate velocity.
 */

export interface VisualOdometryResult {
    speed: number;       // Estimated speed in km/h
    confidence: number;  // 0.0 to 1.0
    isTracking: boolean; // True if visual features are locked
    features?: TrackedPoint[]; // Debug features for visualization
}

export class VisionGroundTruth {
    private processor: OpticalFlowProcessor;
    private features: TrackedPoint[] = [];
    
    // Simulation parameters
    private opticalNoiseFactor: number = 1.2;
    private trackingQuality: number = 1.0;

    // Real-world calibration (Arbitrary scale for demo)
    // Pixels/sec to KM/H conversion factor depends on camera FOV, height, and resolution
    private readonly OPTICAL_SCALE_FACTOR = 0.5; 

    constructor() {
        this.processor = new OpticalFlowProcessor();
    }

    /**
     * Processes a real video frame to extract velocity.
     */
    public processRealFrame(imageData: ImageData, dt: number): VisualOdometryResult {
        // Initialize processor with frame dimensions if needed
        this.processor.init(imageData.width, imageData.height);

        // 1. Feature Replenishment
        // If we lost too many points, detect new ones
        if (this.features.length < 50) {
            const newFeatures = this.processor.detectFeatures(imageData, 100 - this.features.length);
            // Assign unique IDs if not present (processor does this, but ensuring consistency)
            this.features = [...this.features, ...newFeatures];
        }

        // 2. Feature Tracking (Optical Flow)
        let estimatedSpeed = 0;
        let confidence = 0;
        
        if (this.features.length > 0) {
            const trackedFeatures = this.processor.trackFeatures(imageData, this.features);
            
            // 3. Velocity Estimation
            // Calculate average displacement magnitude
            let totalDisplacement = 0;
            let validCount = 0;

            trackedFeatures.forEach(p => {
                const prev = this.features.find(f => f.id === p.id);
                if (prev) {
                    const dx = p.x - prev.x;
                    const dy = p.y - prev.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    
                    // Filter outliers (massive jumps)
                    if (dist < imageData.width * 0.2) {
                        totalDisplacement += dist;
                        validCount++;
                    }
                }
            });

            if (validCount > 0) {
                const avgPixelDisp = totalDisplacement / validCount;
                const pixelsPerSecond = avgPixelDisp / dt;
                
                estimatedSpeed = pixelsPerSecond * this.OPTICAL_SCALE_FACTOR;
                confidence = Math.min(1.0, validCount / 20); // 20+ points = full confidence
            }

            this.features = trackedFeatures;
        }

        return {
            speed: estimatedSpeed,
            confidence: confidence,
            isTracking: this.features.length > 10,
            features: this.features
        };
    }

    /**
     * Simulates processing the next frame to extract velocity.
     * Used when camera is not available.
     */
    public computeVisualOdometry(trueSpeedSim: number, dt: number, lightingCondition: number = 1.0): VisualOdometryResult {
        // 1. Determine Tracking Quality based on lighting and speed (motion blur)
        let quality = lightingCondition;
        
        if (trueSpeedSim > 220) {
            quality *= 0.7; // Motion blur degradation at high speed
        }

        // Random fluctuation in feature tracking quality (simulating texture loss)
        const featureNoise = (Math.random() - 0.5) * 0.15;
        this.trackingQuality = Math.max(0, Math.min(1, quality + featureNoise));

        // 2. Tracking Loss Threshold
        if (this.trackingQuality < 0.3) {
            return {
                speed: 0,
                confidence: 0,
                isTracking: false
            };
        }

        // 3. Calculate Speed Estimate with Noise
        const speedNoise = (Math.random() - 0.5) * (this.opticalNoiseFactor + (trueSpeedSim * 0.01));
        const estimatedSpeed = Math.max(0, trueSpeedSim + speedNoise);

        return {
            speed: estimatedSpeed,
            confidence: this.trackingQuality,
            isTracking: true
        };
    }
}
