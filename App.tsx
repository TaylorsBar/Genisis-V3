
import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import SystemStatusBar from './components/SystemStatusBar';
import MobileNavBar from './components/MobileNavBar';
import Dashboard from './pages/Dashboard';
import Diagnostics from './pages/Diagnostics';
import MaintenanceLog from './pages/MaintenanceLog';
import TuningPage from './pages/TuningPage';
import AIEngine from './pages/AIEngine';
import Security from './pages/Security';
import ARAssistant from './pages/ARAssistant';
import Hedera from './pages/Hedera';
import Appearance from './pages/Appearance';
import Accessories from './pages/Accessories';
import { AppearanceProvider } from './contexts/AppearanceContext';
import { useVehicleStore } from './stores/vehicleStore';
import { useAIStore } from './stores/aiStore';
import RacePack from './pages/RacePack';
import GlobalAssistant from './components/GlobalAssistant';

const MainLayout: React.FC = () => {
  const location = useLocation();
  
  // PERFORMANCE FIX: Select ONLY the startSimulation action.
  // Using specific selectors prevents this component from re-rendering 
  // when the vehicle data (which updates 20Hz) changes.
  const startSimulation = useVehicleStore(state => state.startSimulation);
  const setContext = useAIStore(state => state.setContext);

  useEffect(() => {
    startSimulation();
  }, [startSimulation]);

  // Update AI Context on route change
  useEffect(() => {
      const routeName = location.pathname === '/' ? 'Cockpit Dashboard' : 
                        location.pathname.replace('/', '').replace('-', ' ').toUpperCase();
      setContext(routeName);
  }, [location.pathname, setContext]);

  const isFullScreenRoute = [
    '/', 
    '/race-pack', 
    '/ar-assistant', 
    '/tuning',
    '/ai-engine'
  ].includes(location.pathname);

  return (
    <div className="flex h-screen w-screen bg-transparent text-gray-200 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <SystemStatusBar />
        
        <main className={`flex-1 overflow-x-hidden overflow-y-auto relative z-10 scroll-smooth custom-scrollbar ${isFullScreenRoute ? 'p-0 pb-20 md:pb-0' : 'p-4 md:p-6 pb-24 md:pb-6'}`}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/diagnostics" element={<Diagnostics />} />
            <Route path="/logbook" element={<MaintenanceLog />} />
            <Route path="/tuning" element={<TuningPage />} />
            <Route path="/ai-engine" element={<AIEngine />} />
            <Route path="/ar-assistant" element={<ARAssistant />} />
            <Route path="/security" element={<Security />} />
            <Route path="/hedera" element={<Hedera />} />
            <Route path="/race-pack" element={<RacePack />} />
            <Route path="/accessories" element={<Accessories />} />
            <Route path="/appearance" element={<Appearance />} />
          </Routes>
        </main>
        
        <GlobalAssistant />
        <MobileNavBar />
      </div>
    </div>
  );
};

const BootSequence: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const steps = [
            setTimeout(() => setStep(1), 500),  // Kernel
            setTimeout(() => setStep(2), 1200), // Modules
            setTimeout(() => setStep(3), 2000), // GUI
            setTimeout(() => onComplete(), 2800) // Finish
        ];
        return () => steps.forEach(clearTimeout);
    }, [onComplete]);

    return (
        <div className="h-screen w-screen bg-black flex flex-col items-center justify-center font-mono text-xs z-[100]">
            <div className="w-64 space-y-2">
                <div className="flex justify-between text-gray-500">
                    <span>GENESIS BIOS v4.02</span>
                    <span>MEM: 64TB OK</span>
                </div>
                <div className="h-1 w-full bg-[#111] overflow-hidden">
                    <div className="h-full bg-brand-cyan transition-all duration-500 ease-out" style={{ width: `${(step/3)*100}%` }}></div>
                </div>
                <div className="space-y-1 text-gray-400">
                    {step >= 0 && <div className="text-white">> Mounting Kernel... OK</div>}
                    {step >= 1 && <div className="text-white">> Loading Drivers [ECU, VIS, NAV]... OK</div>}
                    {step >= 2 && <div className="text-brand-cyan">> Initializing Graphic Interface...</div>}
                </div>
            </div>
        </div>
    );
};

const App: React.FC = () => {
  const [booted, setBooted] = useState(false);

  return (
    <AppearanceProvider>
      {!booted ? (
          <BootSequence onComplete={() => setBooted(true)} />
      ) : (
          <HashRouter>
            <MainLayout />
          </HashRouter>
      )}
    </AppearanceProvider>
  );
};

export default App;
