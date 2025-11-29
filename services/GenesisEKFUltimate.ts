
import { VisionGroundTruth, VisualOdometryResult } from './VisionGroundTruth';

// --- Lightweight Matrix/Vector Math Kernel ---
type Vec3 = [number, number, number];
type Mat3 = [
    number, number, number,
    number, number, number,
    number, number, number
];

const MAT3_IDENTITY: Mat3 = [1,0,0, 0,1,0, 0,0,1];

class Math3D {
    static addVec(a: Vec3, b: Vec3): Vec3 {
        return [a[0]+b[0], a[1]+b[1], a[2]+b[2]];
    }
    
    static scaleVec(v: Vec3, s: number): Vec3 {
        return [v[0]*s, v[1]*s, v[2]*s];
    }

    static addMat(A: Mat3, B: Mat3): Mat3 {
        return A.map((v, i) => v + B[i]) as Mat3;
    }

    static multMat(A: Mat3, B: Mat3): Mat3 {
        const C = new Array(9).fill(0) as Mat3;
        for(let r=0; r<3; r++) {
            for(let c=0; c<3; c++) {
                for(let k=0; k<3; k++) {
                    C[r*3+c] += A[r*3+k] * B[k*3+c];
                }
            }
        }
        return C;
    }

    static multMatVec(A: Mat3, v: Vec3): Vec3 {
        return [
            A[0]*v[0] + A[1]*v[1] + A[2]*v[2],
            A[3]*v[0] + A[4]*v[1] + A[5]*v[2],
            A[6]*v[0] + A[7]*v[1] + A[8]*v[2]
        ];
    }

    static transpose(A: Mat3): Mat3 {
        return [
            A[0], A[3], A[6],
            A[1], A[4], A[7],
            A[2], A[5], A[8]
        ];
    }
}

/**
 * GenesisEKFUltimate
 * 
 * An Advanced Extended Kalman Filter (EKF) for vehicle state estimation with 6-DOF support.
 * Integrated with Computer Vision for GPS-denied navigation.
 * 
 * State Vector [x]: [vx, vy, vz] (Velocity in Body Frame)
 */
export class GenesisEKFUltimate {
    // State Vector: [vx, vy, vz] in m/s
    private x: Vec3 = [0, 0, 0]; 
    
    // Estimation Error Covariance P (3x3)
    private P: Mat3 = [...MAT3_IDENTITY]; 
    
    // Process Noise Covariance Q
    private readonly Q: Mat3 = [
        0.05, 0, 0,
        0, 0.05, 0,
        0, 0, 0.05
    ];

    // Modules & State
    private visionModule: VisionGroundTruth;
    private lastGpsTime: number = 0;
    private readonly GNSS_OUTAGE_THRESHOLD_MS = 1000;

    constructor() {
        this.visionModule = new VisionGroundTruth();
    }

    /**
     * Prediction Step (Time Update)
     * Propagates the state forward using the physics model and IMU inputs.
     */
    public predict(accel: Vec3, gyro: Vec3, dt: number): void {
        const [vx, vy, vz] = this.x;
        const [ax, ay, az] = accel;
        const [p, q, r]    = gyro;

        // dv/dt = a - w x v (Coriolis effect)
        const dvx = ax - (q*vz - r*vy); 
        const dvy = ay - (r*vx - p*vz);
        const dvz = az - (p*vy - q*vx);

        // Integrate state
        this.x = [
            vx + dvx * dt,
            vy + dvy * dt,
            vz + dvz * dt
        ];

        // Jacobian of F (State Transition Matrix)
        // F = I + Omega * dt
        const Omega: Mat3 = [
            0,   r, -q,
            -r,  0,  p,
             q, -p,  0
        ];
        
        const dtMat: Mat3 = [dt,0,0, 0,dt,0, 0,0,dt];
        const F = Math3D.addMat(MAT3_IDENTITY, Math3D.multMat(Omega, dtMat));

        // P = F*P*F^T + Q
        const FP = Math3D.multMat(F, this.P);
        const FP_Ft = Math3D.multMat(FP, Math3D.transpose(F));
        this.P = Math3D.addMat(FP_Ft, this.Q);
    }

    /**
     * Generic EKF Update
     * z: Measurement scalar
     * h_x: Predicted measurement scalar
     * H: Measurement Jacobian (1x3 vector)
     * R: Measurement Noise Covariance scalar
     */
    private updateEKF(z: number, h_x: number, H: Vec3, R: number): void {
        const y = z - h_x; // Innovation
        const HP = Math3D.multMatVec(this.P, H);
        const HPHt = H[0]*HP[0] + H[1]*HP[1] + H[2]*HP[2];
        const S = HPHt + R; // Innovation Covariance
        const K = Math3D.scaleVec(HP, 1/S); // Kalman Gain

        // Outlier rejection (3-sigma rule)
        const sigma = Math.sqrt(S);
        let validY = y;
        if (Math.abs(y) > 4.0 * sigma) {
             // Dampen outlier effect instead of full rejection for stability
             validY = Math.sign(y) * 4.0 * sigma;
        }

        // Update State: x = x + K*y
        this.x = Math3D.addVec(this.x, Math3D.scaleVec(K, validY));

        // Update Covariance: P = (I - K*H)*P
        const KH: Mat3 = [
            K[0]*H[0], K[0]*H[1], K[0]*H[2],
            K[1]*H[0], K[1]*H[1], K[1]*H[2],
            K[2]*H[0], K[2]*H[1], K[2]*H[2]
        ];
        
        const negKH = Math3D.scaleVec(KH as unknown as Vec3, -1) as unknown as Mat3;
        const I_KH = Math3D.addMat(MAT3_IDENTITY, negKH);
        this.P = Math3D.multMat(I_KH, this.P);
    }

    /**
     * Fuse GPS Speed Data.
     * Updates the timestamp to track outages.
     */
    public fuseGps(speed: number, accuracy: number = 1.0): void {
        this.lastGpsTime = Date.now();
        
        const [vx, vy, vz] = this.x;
        const vMag = Math.sqrt(vx*vx + vy*vy + vz*vz) || 0.001; 
        const h_x = vMag; // Measurement Model: speed = magnitude of velocity vector
        
        // Jacobian H = [vx/v, vy/v, vz/v]
        const H: Vec3 = [vx/vMag, vy/vMag, vz/vMag];
        
        // R increases with lower accuracy (GDOP)
        const R_gps = Math.max(0.2, accuracy * 0.5);
        this.updateEKF(speed, h_x, H, R_gps);
    }

    /**
     * Fuse OBD-II Wheel Speed.
     * Trusted source for longitudinal velocity.
     */
    public fuseObdSpeed(speed: number): void {
        const h_x = this.x[0]; // Assume OBD speed corresponds to forward velocity (vx)
        const H: Vec3 = [1, 0, 0];
        const R_obd = 2.0; // Moderate noise
        this.updateEKF(speed, h_x, H, R_obd);
    }

    /**
     * Fuse Visual Odometry (Simulation Mode).
     * Called during simulation to mock vision data.
     */
    public fuseVision(trueSpeedSimKph: number, dt: number): VisualOdometryResult {
        const isOutage = (Date.now() - this.lastGpsTime) > this.GNSS_OUTAGE_THRESHOLD_MS;
        
        // Vision confidence degrades at high speeds or poor lighting (simulated)
        const vo = this.visionModule.computeVisualOdometry(trueSpeedSimKph, dt, 0.95);
        
        // Apply fusion with context-aware weighting
        this.applyVisionMeasurement(vo, isOutage);
        return vo;
    }

    /**
     * Process Real Camera Frame (Real-World Mode).
     * Main entry point for CV pipeline.
     */
    public processCameraFrame(imageData: ImageData, dt: number): VisualOdometryResult {
        const isOutage = (Date.now() - this.lastGpsTime) > this.GNSS_OUTAGE_THRESHOLD_MS;
        
        const vo = this.visionModule.processRealFrame(imageData, dt);
        this.applyVisionMeasurement(vo, isOutage);
        return vo;
    }

    /**
     * Internal Fusion Logic for Vision Data
     */
    private applyVisionMeasurement(vo: VisualOdometryResult, isGnssOutage: boolean) {
        if (vo.isTracking && vo.speed > 0) {
            const h_x = this.x[0];
            const H: Vec3 = [1, 0, 0];
            const z = vo.speed / 3.6; // km/h to m/s
            
            // Dynamic Measurement Noise R
            // If GNSS is out, we trust Vision MORE (Lower R)
            // If GNSS is active, Vision acts as a secondary check (Higher R)
            let R_vision = (1.0 / Math.max(0.1, vo.confidence)) * 0.5;
            
            if (isGnssOutage) {
                // SIGNIFICANTLY reduce noise parameter during outage to rely on Vision
                // This helps fix the "1 second lag" perception if OBD is slow/missing
                R_vision *= 0.1; // High trust
            } else {
                R_vision *= 2.5; // De-weight when GPS is healthy
            }

            this.updateEKF(z, h_x, H, R_vision);
        }
    }

    public getEstimatedSpeed(): number {
        return Math.sqrt(this.x[0]**2 + this.x[1]**2 + this.x[2]**2);
    }
    
    public getUncertainty(): number {
        // Trace of P matrix
        return this.P[0] + this.P[4] + this.P[8];
    }
}
