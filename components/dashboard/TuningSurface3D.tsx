
import React, { useEffect, useRef } from 'react';

interface TuningSurface3DProps {
    data: number[][]; // 16x16 data grid
    rpm: number;
    load: number;
    height?: string;
}

const TuningSurface3D: React.FC<TuningSurface3DProps> = ({ data: mapData, rpm, load, height = "100%" }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Generate Axis Labels
    const size = 16;
    const x = Array.from({length: size}, (_, i) => i * (8000/(size-1))); // RPM 0-8000
    const y = Array.from({length: size}, (_, i) => i * (100/(size-1))); // Load 0-100

    useEffect(() => {
        if (!window.Plotly || !containerRef.current) return;

        // Flatten data for Plotly if needed, but surface accepts 2D array [y][x]
        const z = mapData; 

        const plotData = [
            {
                z: z,
                x: x,
                y: y,
                type: 'surface',
                colorscale: [
                    [0, 'rgb(10,10,30)'], 
                    [0.4, 'rgb(0, 100, 200)'], 
                    [0.7, 'rgb(180, 50, 180)'], 
                    [1, 'rgb(255, 200, 50)']
                ],
                showscale: false,
                contours: {
                    z: { show: true, usecolormap: true, highlightcolor: "#fff", project: { z: true }, width: 2 },
                    x: { show: true, color: 'rgba(255,255,255,0.1)', width: 1 },
                    y: { show: true, color: 'rgba(255,255,255,0.1)', width: 1 }
                },
                opacity: 0.95,
                lighting: {
                    ambient: 0.4,
                    diffuse: 0.5,
                    specular: 0.6,
                    roughness: 0.4,
                    fresnel: 0.2
                }
            },
            // Tracer Point
            {
                x: [rpm],
                y: [load],
                z: [100], // Updated via animation
                mode: 'markers',
                type: 'scatter3d',
                marker: {
                    size: 5,
                    color: '#00F0FF',
                    symbol: 'circle',
                    line: { color: 'white', width: 2 }
                },
                name: 'Live Point'
            }
        ];

        const layout = {
            autosize: true,
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            margin: { l: 0, r: 0, b: 0, t: 0 },
            scene: {
                xaxis: { title: 'RPM', color: '#666', gridcolor: '#222', backgroundcolor: 'rgba(0,0,0,0)' },
                yaxis: { title: 'LOAD %', color: '#666', gridcolor: '#222', backgroundcolor: 'rgba(0,0,0,0)' },
                zaxis: { title: 'VE', color: '#666', gridcolor: '#222', backgroundcolor: 'rgba(0,0,0,0)' },
                camera: {
                    eye: { x: 1.5, y: 1.2, z: 0.8 },
                    center: { x: 0, y: 0, z: -0.2 }
                },
            },
            showlegend: false,
            hovermode: 'closest'
        };

        const config = { responsive: true, displayModeBar: false };

        window.Plotly.newPlot(containerRef.current, plotData, layout, config);

        return () => {
             if (containerRef.current) window.Plotly.purge(containerRef.current);
        }
    }, []); // Run once on mount to init

    // Efficient Update Loop
    useEffect(() => {
        if (!window.Plotly || !containerRef.current) return;

        // Calculate tracer height from real map data
        // Bilinear interpolation for smooth movement on the grid
        const rpmNorm = Math.min(15, Math.max(0, rpm / (8000/15)));
        const loadNorm = Math.min(15, Math.max(0, load / (100/15)));
        
        const x0 = Math.floor(rpmNorm);
        const x1 = Math.min(15, x0 + 1);
        const y0 = Math.floor(loadNorm);
        const y1 = Math.min(15, y0 + 1);
        
        const wx = rpmNorm - x0;
        const wy = loadNorm - y0;
        
        const z00 = mapData[y0][x0];
        const z10 = mapData[y0][x1];
        const z01 = mapData[y1][x0];
        const z11 = mapData[y1][x1];
        
        const zInterp = (1-wy)*((1-wx)*z00 + wx*z10) + wy*((1-wx)*z01 + wx*z11);
        const traceHeight = zInterp + 2; // Offset slightly

        // We update the surface data AND the tracer point
        // Plotly.animate is smoother for the point, Plotly.react/restyle is better for data
        
        // Update surface data (in case it changed via editor)
        // Note: Full surface update is heavy, maybe throttle this if performance issues arise
        // For now we assume map edits happen less frequently than RPM updates.
        
        window.Plotly.animate(containerRef.current, {
            data: [
                { z: mapData }, 
                { x: [rpm], y: [load], z: [traceHeight] }
            ]
        }, {
            transition: { duration: 0 },
            frame: { duration: 0, redraw: false }
        });
        
    }, [rpm, load, mapData]);

    return (
        <div ref={containerRef} style={{ width: '100%', height: height }} className="rounded-lg overflow-hidden" />
    );
};

export default TuningSurface3D;
