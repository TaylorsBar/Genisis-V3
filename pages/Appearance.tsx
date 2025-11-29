
import React, { useContext } from 'react';
import { AppearanceContext, Theme, ColorPalette, SurfaceMaterial, LEDMode } from '../contexts/AppearanceContext';

const themes: { id: Theme; name: string; description: string }[] = [
    { id: 'rally', name: 'World Rally', description: 'High-contrast, functional display for intense conditions.' },
    { id: 'modern', name: 'Modern Performance', description: 'Sleek, futuristic interface with radial data readouts.' },
    { id: 'classic', name: 'E-Tuner Pro', description: 'Professional tuner interface with a red-on-black aesthetic.' },
    { id: 'haltech', name: 'Haltech Pro', description: 'Emulates the popular Haltech digital dash.' },
    { id: 'minimalist', name: 'Minimalist EV', description: 'Clean, modern interface with a frosted glass aesthetic.' },
    { id: 'pro-tuner', name: 'Pro Tuner', description: 'A sleek, professional racing display.' },
];

const palettes: { id: ColorPalette; name: string; color: string }[] = [
    { id: 'cyan', name: 'Hyper Cyan', color: '#00F0FF' },
    { id: 'red', name: 'Race Red', color: '#FF3333' },
    { id: 'green', name: 'Matrix Green', color: '#33FF33' },
    { id: 'purple', name: 'Neon Purple', color: '#CC00FF' },
    { id: 'amber', name: 'Warning Amber', color: '#FFCC00' },
];

const materials: { id: SurfaceMaterial; name: string; description: string; previewClass: string }[] = [
    { id: 'glass', name: 'Aero Glass', description: 'Standard translucent glass look.', previewClass: 'bg-white/10 backdrop-blur-md' },
    { id: 'carbon', name: 'Carbon Fiber', description: 'Dark, woven texture overlay.', previewClass: 'bg-black/80 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_25%,rgba(255,255,255,0.05)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.05)_75%,rgba(255,255,255,0.05)),linear-gradient(45deg,rgba(255,255,255,0.05)_25%,transparent_25%,transparent_75%,rgba(255,255,255,0.05)_75%,rgba(255,255,255,0.05))] bg-[length:10px_10px]' },
    { id: 'brushed-metal', name: 'Brushed Metal', description: 'Industrial steel finish.', previewClass: 'bg-gradient-to-br from-gray-700 to-gray-800' },
    { id: 'matte', name: 'Stealth Matte', description: 'Solid, non-reflective dark grey.', previewClass: 'bg-[#1a1a1a]' },
];

const ledColors = [
    { name: 'Cyan', hex: '#00FFFF' },
    { name: 'Blue', hex: '#007FFF' },
    { name: 'Purple', hex: '#8A2BE2' },
    { name: 'Pink', hex: '#FF00FF' },
    { name: 'Red', hex: '#FF0000' },
    { name: 'Orange', hex: '#FFA500' },
    { name: 'Green', hex: '#00FF00' },
    { name: 'White', hex: '#FFFFFF' },
];

const ledModes: { id: LEDMode, name: string }[] = [
    { id: 'solid', name: 'Solid' },
    { id: 'pulse', name: 'Pulse' },
    { id: 'music', name: 'Music Sync' },
];

const Appearance: React.FC = () => {
    const { 
        theme, setTheme, 
        colorPalette, setColorPalette, 
        surfaceMaterial, setSurfaceMaterial,
        ledSettings, setLedSettings 
    } = useContext(AppearanceContext);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-100 font-display">Appearance Settings</h1>
                <p className="text-gray-400 mt-1">Customize the look and feel of your dashboard and cabin.</p>
            </div>

            <div className="glass-panel p-6 rounded-lg">
                <h2 className="text-lg font-semibold border-b border-white/10 pb-2 mb-6 font-display text-brand-cyan">Dashboard Theme</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {themes.map(t => (
                        <div
                            key={t.id}
                            onClick={() => setTheme(t.id)}
                            className={`p-4 rounded-lg cursor-pointer border-2 transition-all group ${theme === t.id ? 'border-brand-cyan bg-brand-cyan/10 shadow-[0_0_15px_var(--brand-glow)]' : 'border-base-700 hover:border-white/30 hover:bg-white/5'}`}
                        >
                            <h3 className={`font-bold transition-colors ${theme === t.id ? 'text-brand-cyan' : 'text-white'}`}>{t.name}</h3>
                            <p className="text-sm text-gray-400 mt-1 group-hover:text-gray-300">{t.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="glass-panel p-6 rounded-lg">
                <h2 className="text-lg font-semibold border-b border-white/10 pb-2 mb-6 font-display text-brand-cyan">Interface Color Palette</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {palettes.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setColorPalette(p.id)}
                            className={`relative p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${colorPalette === p.id ? 'border-white scale-105 shadow-lg bg-white/5' : 'border-transparent hover:bg-white/5'}`}
                        >
                            <div 
                                className="w-12 h-12 rounded-full shadow-lg" 
                                style={{ backgroundColor: p.color, boxShadow: `0 0 15px ${p.color}80` }}
                            ></div>
                            <span className={`text-sm font-bold ${colorPalette === p.id ? 'text-white' : 'text-gray-400'}`}>{p.name}</span>
                            {colorPalette === p.id && (
                                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white shadow-[0_0_5px_white]"></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="glass-panel p-6 rounded-lg">
                <h2 className="text-lg font-semibold border-b border-white/10 pb-2 mb-6 font-display text-brand-cyan">Panel Material</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {materials.map(m => (
                        <div
                            key={m.id}
                            onClick={() => setSurfaceMaterial(m.id)}
                            className={`cursor-pointer group flex flex-col items-center`}
                        >
                            <div className={`w-full aspect-video rounded-lg border-2 mb-3 relative overflow-hidden transition-all ${surfaceMaterial === m.id ? 'border-brand-cyan shadow-[0_0_15px_var(--brand-glow)]' : 'border-gray-700 group-hover:border-white/30'}`}>
                                <div className={`absolute inset-0 ${m.previewClass}`}></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-1/2 h-1 bg-brand-cyan/50 rounded-full"></div>
                                </div>
                            </div>
                            <h3 className={`font-bold ${surfaceMaterial === m.id ? 'text-brand-cyan' : 'text-gray-300'}`}>{m.name}</h3>
                            <p className="text-xs text-gray-500 text-center mt-1">{m.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="glass-panel p-6 rounded-lg">
                <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-6">
                    <h2 className="text-lg font-semibold font-display text-brand-cyan">Interior Ambient Lighting</h2>
                     <div className="flex items-center">
                        <span className={`mr-3 text-sm font-medium ${ledSettings.isOn ? 'text-white' : 'text-gray-500'}`}>
                            {ledSettings.isOn ? 'On' : 'Off'}
                        </span>
                        <button
                            onClick={() => setLedSettings({ isOn: !ledSettings.isOn })}
                            className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none ${ledSettings.isOn ? 'bg-brand-cyan' : 'bg-base-700'}`}
                            role="switch"
                            aria-checked={ledSettings.isOn}
                        >
                            <span
                                aria-hidden="true"
                                className={`inline-block h-5 w-5 rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200 ${ledSettings.isOn ? 'translate-x-5' : 'translate-x-0'}`}
                            />
                        </button>
                    </div>
                </div>
                
                <div className={`space-y-6 ${!ledSettings.isOn ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div>
                        <h3 className="text-md font-semibold text-gray-300 mb-3">LED Color</h3>
                        <div className="flex flex-wrap gap-4">
                            {ledColors.map(c => (
                                <button
                                    key={c.hex}
                                    onClick={() => setLedSettings({ color: c.hex })}
                                    className={`w-10 h-10 rounded-full border-2 transition-all ${ledSettings.color === c.hex ? 'border-white scale-110 shadow-[0_0_10px_white]' : 'border-transparent'}`}
                                    style={{ backgroundColor: c.hex }}
                                    aria-label={c.name}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="brightness" className="block text-md font-semibold text-gray-300 mb-2">Brightness</label>
                        <div className="flex items-center space-x-4">
                            <input
                                type="range"
                                id="brightness"
                                name="brightness"
                                min="0"
                                max="100"
                                value={ledSettings.brightness}
                                onChange={e => setLedSettings({ brightness: parseInt(e.target.value) })}
                                className="w-full h-2 bg-base-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan"
                            />
                            <span className="font-mono text-lg w-12 text-right text-brand-cyan">{ledSettings.brightness}%</span>
                        </div>
                    </div>
                    
                     <div>
                        <h3 className="text-md font-semibold text-gray-300 mb-3">Lighting Mode</h3>
                        <div className="flex gap-4">
                            {ledModes.map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => setLedSettings({ mode: m.id })}
                                    className={`px-4 py-2 rounded-md font-semibold text-sm transition-colors border ${ledSettings.mode === m.id ? 'bg-brand-cyan text-black border-brand-cyan' : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500'}`}
                                >
                                    {m.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Appearance;
