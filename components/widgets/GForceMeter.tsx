
import React, { useEffect, useRef } from 'react';

interface GForceMeterProps {
    x: number; // Lateral G (Left/Right)
    y: number; // Longitudinal G (Accel/Brake)
    size?: number;
}

const GForceMeter: React.FC<GForceMeterProps> = ({ x, y, size = 200 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const historyRef = useRef<{x: number, y: number}[]>([]);
    
    // Limits
    const MAX_G = 1.5;
    
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const scale = (w / 2) / MAX_G; // Pixels per G

        // Update history
        // Only push valid finite numbers
        if (Number.isFinite(x) && Number.isFinite(y)) {
            historyRef.current.push({ x, y });
            if (historyRef.current.length > 30) historyRef.current.shift();
        }

        // Clear
        ctx.clearRect(0, 0, w, h);

        // Draw Rings (0.5G, 1.0G, 1.5G)
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        
        [0.5, 1.0, 1.5].forEach(g => {
            ctx.beginPath();
            ctx.arc(cx, cy, g * scale, 0, Math.PI * 2);
            ctx.stroke();
            
            // Labels
            ctx.fillStyle = '#555';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`${g.toFixed(1)}G`, cx, cy - (g * scale) + 10);
        });

        // Draw Crosshair
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(w, cy);
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, h);
        ctx.stroke();

        // Draw Trail
        if (historyRef.current.length > 1) {
            ctx.beginPath();
            historyRef.current.forEach((pt, i) => {
                const px = cx + (pt.x * scale);
                const py = cy - (pt.y * scale); // Invert Y (Up is Accel, Down is Brake usually)
                
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            });
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Draw Current Dot
        const dotX = cx + (x * scale);
        const dotY = cy - (y * scale); // Invert Y
        
        // Ensure coordinates are valid numbers before drawing gradient
        if (Number.isFinite(dotX) && Number.isFinite(dotY)) {
            try {
                const gradient = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, 15);
                gradient.addColorStop(0, 'rgba(0, 240, 255, 1)');
                gradient.addColorStop(0.5, 'rgba(0, 240, 255, 0.4)');
                gradient.addColorStop(1, 'rgba(0, 240, 255, 0)');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(dotX, dotY, 15, 0, Math.PI * 2);
                ctx.fill();

                // Solid Center
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
                ctx.fill();
            } catch (e) {
                // Suppress finite gradient errors
            }
        }

        // Text Values
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`LAT: ${(Number.isFinite(x) ? x : 0).toFixed(2)}G`, w - 10, h - 20);
        ctx.textAlign = 'left';
        ctx.fillText(`LNG: ${(Number.isFinite(y) ? y : 0).toFixed(2)}G`, 10, h - 20);

    }, [x, y, MAX_G, size]);

    return (
        <div className="relative bg-black rounded-full border border-gray-800 shadow-[inset_0_0_20px_rgba(0,0,0,1)]" style={{ width: size, height: size }}>
             <canvas 
                ref={canvasRef} 
                width={size} 
                height={size} 
                className="w-full h-full rounded-full"
            />
        </div>
    );
};

export default GForceMeter;
