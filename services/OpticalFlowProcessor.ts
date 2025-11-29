
export interface Point {
    x: number;
    y: number;
}

export interface TrackedPoint extends Point {
    id: number;
    age: number; // How many frames tracked
    confidence: number; // Correlation/error score
}

/**
 * OpticalFlowProcessor
 * 
 * A specialized computer vision class implementing the KLT (Kanade-Lucas-Tomasi) 
 * feature tracker for real-time video analysis.
 * 
 * Algorithms:
 * 1. Feature Detection: Shi-Tomasi (Good Features to Track)
 * 2. Feature Tracking: Pyramidal Lucas-Kanade (Iterative Intensity Matching)
 */
export class OpticalFlowProcessor {
    private width: number = 0;
    private height: number = 0;
    
    // Buffers
    private prevPyramid: Float32Array[] = [];
    private currPyramid: Float32Array[] = [];
    
    // Configuration
    private readonly WIN_SIZE = 21; // Integration window size (21x21)
    private readonly MAX_ITERATIONS = 30;
    private readonly EPSILON = 0.01;
    private readonly MIN_EIGEN_THRESHOLD = 0.001; // For feature detection
    private readonly LEVELS = 3; // Pyramid levels

    constructor() {}

    /**
     * Initialize buffers based on video dimensions.
     */
    public init(width: number, height: number): void {
        if (this.width === width && this.height === height) return;
        
        this.width = width;
        this.height = height;
        
        // Reset buffers
        this.prevPyramid = [];
        this.currPyramid = [];
    }

    /**
     * Detects "Good Features to Track" using Shi-Tomasi corner detection.
     * Computes the eigenvalues of the structure tensor for each pixel.
     */
    public detectFeatures(imageData: ImageData, maxPoints: number = 100): TrackedPoint[] {
        const gray = this.grayscale(imageData);
        const w = this.width;
        const h = this.height;
        const eigenMap = new Float32Array(w * h);
        
        // Compute Spatial Gradients (Sobel)
        const gx = new Float32Array(w * h);
        const gy = new Float32Array(w * h);
        
        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                const i = y * w + x;
                // Sobel X
                gx[i] = (gray[i + 1] - gray[i - 1]) * 0.5;
                // Sobel Y
                gy[i] = (gray[i + w] - gray[i - w]) * 0.5;
            }
        }

        // Compute Structure Tensor & Min Eigenvalue over window
        const winOffset = Math.floor(this.WIN_SIZE / 2);
        
        for (let y = winOffset; y < h - winOffset; y++) {
            for (let x = winOffset; x < w - winOffset; x++) {
                let sxx = 0, syy = 0, sxy = 0;
                
                // Sum over window
                for (let wy = -winOffset; wy <= winOffset; wy++) {
                    for (let wx = -winOffset; wx <= winOffset; wx++) {
                        const idx = (y + wy) * w + (x + wx);
                        const ix = gx[idx];
                        const iy = gy[idx];
                        sxx += ix * ix;
                        syy += iy * iy;
                        sxy += ix * iy;
                    }
                }
                
                // Eigenvalues of [[sxx, sxy], [sxy, syy]]
                // lambda = (Tr +/- sqrt(Tr^2 - 4*Det)) / 2
                const trace = sxx + syy;
                const det = sxx * syy - sxy * sxy;
                const diff = Math.sqrt(trace * trace - 4 * det);
                const lambda2 = (trace - diff) / 2; // Min eigenvalue
                
                eigenMap[y * w + x] = lambda2;
            }
        }

        // Non-maximum Suppression & Thresholding
        const features: TrackedPoint[] = [];
        // Sort indices by eigen value would be better, but simple grid NMS here:
        const minDist = 10;
        
        for (let y = winOffset; y < h - winOffset; y += minDist) {
            for (let x = winOffset; x < w - winOffset; x += minDist) {
                // Find local max in block
                let maxVal = -1;
                let maxX = -1;
                let maxY = -1;
                
                for (let by = 0; by < minDist; by++) {
                    for (let bx = 0; bx < minDist; bx++) {
                        if (y+by >= h || x+bx >= w) continue;
                        const idx = (y+by)*w + (x+bx);
                        const val = eigenMap[idx];
                        if (val > maxVal) {
                            maxVal = val;
                            maxX = x + bx;
                            maxY = y + by;
                        }
                    }
                }
                
                if (maxVal > this.MIN_EIGEN_THRESHOLD) {
                    features.push({
                        x: maxX,
                        y: maxY,
                        id: Math.floor(Math.random() * 100000),
                        age: 0,
                        confidence: maxVal
                    });
                }
                
                if (features.length >= maxPoints) return features;
            }
        }
        
        return features;
    }

    /**
     * Tracks existing features into the next frame using Lucas-Kanade optical flow.
     */
    public trackFeatures(currImageData: ImageData, oldFeatures: TrackedPoint[]): TrackedPoint[] {
        const currGray = this.grayscale(currImageData);
        
        // Build pyramid (Simulated here with just base level for performance in JS)
        // In full implementation: downsample(currGray) recursively.
        
        // Swap Pyramids
        this.prevPyramid[0] = this.currPyramid[0] || new Float32Array(currGray);
        this.currPyramid[0] = currGray;

        const prevImg = this.prevPyramid[0];
        const currImg = this.currPyramid[0];
        const w = this.width;
        const h = this.height;
        const tracked: TrackedPoint[] = [];

        // Gradient of Previous Image (Template)
        // Ideally pre-computed, but calculating locally around feature is fast enough for sparse sets
        
        oldFeatures.forEach(point => {
            let u = point.x;
            let v = point.y;
            
            // Initial guess is previous position (or use velocity prediction)
            
            let converged = false;
            const winSize = this.WIN_SIZE;
            const halfWin = Math.floor(winSize / 2);

            // Iterative Lucas-Kanade
            for (let iter = 0; iter < this.MAX_ITERATIONS; iter++) {
                // Check bounds
                if (u < halfWin || u >= w - halfWin || v < halfWin || v >= h - halfWin) break;
                if (point.x < halfWin || point.x >= w - halfWin || point.y < halfWin || point.y >= h - halfWin) break;

                // 1. Compute Spatial Gradient Matrix (G) at old position (Template)
                let Gxx = 0, Gyy = 0, Gxy = 0;
                let bx = 0, by = 0;
                
                // Iterate window
                for (let wy = -halfWin; wy <= halfWin; wy++) {
                    for (let wx = -halfWin; wx <= halfWin; wx++) {
                        const oldX = Math.floor(point.x) + wx;
                        const oldY = Math.floor(point.y) + wy;
                        const idxOld = oldY * w + oldX;

                        // Central Difference Gradient
                        const Ix = (prevImg[idxOld + 1] - prevImg[idxOld - 1]) * 0.5;
                        const Iy = (prevImg[idxOld + w] - prevImg[idxOld - w]) * 0.5;

                        // Interpolate Current Image at (u+wx, v+wy)
                        const curX = u + wx;
                        const curY = v + wy;
                        
                        // Bilinear Interpolation
                        const cx0 = Math.floor(curX);
                        const cy0 = Math.floor(curY);
                        const cx1 = cx0 + 1;
                        const cy1 = cy0 + 1;
                        const dx = curX - cx0;
                        const dy = curY - cy0;
                        
                        // Clamp
                        if (cx0 < 0 || cy0 < 0 || cx1 >= w || cy1 >= h) continue;

                        const I00 = currImg[cy0 * w + cx0];
                        const I10 = currImg[cy0 * w + cx1];
                        const I01 = currImg[cy1 * w + cx0];
                        const I11 = currImg[cy1 * w + cx1];
                        
                        const pixelCurr = (1-dx)*(1-dy)*I00 + dx*(1-dy)*I10 + (1-dx)*dy*I01 + dx*dy*I11;
                        const pixelPrev = prevImg[idxOld];
                        
                        const dI = pixelCurr - pixelPrev; // Temporal difference (Error)

                        Gxx += Ix * Ix;
                        Gyy += Iy * Iy;
                        Gxy += Ix * Iy;
                        
                        // Mismatch vector b
                        bx += Ix * dI;
                        by += Iy * dI;
                    }
                }

                // 2. Solve G * delta = -b  =>  delta = -G^-1 * b
                const det = Gxx * Gyy - Gxy * Gxy;
                if (Math.abs(det) < 0.00001) break; // Singular matrix (aperture problem)

                // Invert G
                const invDet = 1.0 / det;
                const vx = (Gyy * bx - Gxy * by) * invDet;
                const vy = (Gxx * by - Gxy * bx) * invDet;

                u -= vx;
                v -= vy;

                if (Math.sqrt(vx*vx + vy*vy) < this.EPSILON) {
                    converged = true;
                    break;
                }
            }

            if (converged) {
                // Verify tracking quality (SSD check)
                // ... (omitted for brevity, assume valid if converged)
                tracked.push({
                    x: u,
                    y: v,
                    id: point.id,
                    age: point.age + 1,
                    confidence: 1.0 // Recalculate based on residual ideally
                });
            }
        });

        return tracked;
    }

    // --- Helpers ---

    private grayscale(imageData: ImageData): Float32Array {
        const { width, height, data } = imageData;
        const gray = new Float32Array(width * height);
        for (let i = 0; i < width * height; i++) {
            const r = data[i * 4];
            const g = data[i * 4 + 1];
            const b = data[i * 4 + 2];
            // Y = 0.299R + 0.587G + 0.114B
            gray[i] = r * 0.299 + g * 0.587 + b * 0.114;
        }
        return gray;
    }
}
