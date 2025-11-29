
import React, { useEffect, useRef } from 'react';

declare global {
    interface Window {
        Plotly: any;
    }
}

interface FuelMap3DProps {
    rpm: number;
    load: number;
}

const FuelMap3D: React.FC<FuelMap3DProps> = ({ rpm, load }) => {
    const plotContainerRef = useRef<HTMLDivElement>(null);

    // Generate mock VE table data (16x16 grid)
    const rpmPoints = Array.from({length: 16}, (_, i) => i * 500); // 0 to 7500
    const loadPoints = Array.from({length: 16}, (_, i) => i * 6.66); // 0 to 100
    
    // Create a 2D array for VE values (z-axis) representing a typical engine curve
    const zValues = loadPoints.map(l => {
        return rpmPoints.map(r => {
            // Formula to simulate volumetric efficiency shape
            const rpmNorm = r / 8000;
            const loadNorm = l / 100;
            // Peak VE around 4500 RPM (0.56 normalized)
            const rpmFactor = Math.sin(rpmNorm * Math.PI) * 1.2; 
            const baseVE = 45;
            // Load adds fuel, RPM shape defines the curve
            return baseVE + (rpmFactor * 35 * (0.5 + loadNorm * 0.5)) + (loadNorm * 15);
        });
    });

    useEffect(() => {
        if (!window.Plotly || !plotContainerRef.current) return;

        const data = [{
            z: zValues,
            x: rpmPoints,
            y: loadPoints,
            type: 'surface',
            colorscale: [
                [0, 'rgb(0,0,50)'], 
                [0.5, 'rgb(0,100,255)'], 
                [1, 'rgb(0,255,255)']
            ],
            showscale: false,
            contours: {
                z: {
                    show: true,
                    usecolormap: true,
                    highlightcolor: "#fff",
                    project: { z: true }
                },
                x: { show: true, color: '#333' },
                y: { show: true, color: '#333' }
            },
            lightposition: {x: 100, y: 100, z: 2000}
        },
        // Live Trace Point
        {
            x: [rpm],
            y: [load],
            z: [85], // Placeholder Z, updated in animation
            mode: 'markers',
            type: 'scatter3d',
            marker: {
                size: 6,
                color: '#FF0055',
                symbol: 'circle',
                opacity: 1,
                line: {
                    color: 'white',
                    width: 2
                }
            },
            name: 'Engine State'
        }];

        const layout = {
            autosize: true,
            margin: { l: 0, r: 0, b: 0, t: 0 },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: {
                family: 'Inter, sans-serif',
                color: '#666'
            },
            scene: {
                xaxis: { title: 'RPM', color: '#666', gridcolor: '#222', showbackground: false },
                yaxis: { title: 'LOAD %', color: '#666', gridcolor: '#222', showbackground: false },
                zaxis: { title: 'VE %', color: '#666', gridcolor: '#222', showbackground: false },
                camera: {
                    eye: { x: 1.6, y: 1.6, z: 1.0 },
                    center: { x: 0, y: 0, z: -0.2 }
                },
                aspectratio: { x: 1, y: 1, z: 0.6 }
            },
            showlegend: false,
            hoverlabel: {
                bgcolor: '#111',
                bordercolor: '#333',
                font: { color: '#fff' }
            }
        };

        const config = { responsive: true, displayModeBar: false };

        window.Plotly.newPlot(plotContainerRef.current, data, layout, config);

        return () => {
             if (plotContainerRef.current) {
                 window.Plotly.purge(plotContainerRef.current);
             }
        }
    }, []); 

    // Update Trace Point
    useEffect(() => {
        if (!window.Plotly || !plotContainerRef.current) return;
        
        // Calculate Z height at current RPM/Load for the trace ball
        // Simple bilinear interpolation approximation for smooth visual
        const rIndex = Math.floor(rpm / 500);
        const lIndex = Math.floor(load / 6.66);
        const safeR = Math.max(0, Math.min(15, rIndex));
        const safeL = Math.max(0, Math.min(15, lIndex));
        
        // Lift the ball slightly above the surface
        const estimatedZ = zValues[safeL][safeR] + 5;

        window.Plotly.animate(plotContainerRef.current, {
            data: [{}, { x: [rpm], y: [load], z: [estimatedZ] }]
        }, {
            transition: { duration: 50, easing: 'linear' },
            frame: { duration: 50, redraw: false }
        });
        
    }, [rpm, load]);

    return (
        <div ref={plotContainerRef} className="w-full h-full" />
    );
};

export default FuelMap3D;
