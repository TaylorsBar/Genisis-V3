
import React from 'react';
import { AuditLogEntry, AuditEvent } from '../types';

const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
    { id: '1', timestamp: '2024-07-22 14:35:12 UTC', event: AuditEvent.AiAnalysis, description: 'Predictive analysis run on live OBD-II data stream.', ipAddress: '192.168.1.1 (Local)', status: 'Success' },
    { id: '2', timestamp: '2024-07-22 14:30:05 UTC', event: AuditEvent.Login, description: 'User authenticated successfully via biometrics.', ipAddress: '203.0.113.25', status: 'Success' },
    { id: '3', timestamp: '2024-07-22 11:15:45 UTC', event: AuditEvent.TuningChange, description: "AI tuning suggestion 'Track Day' applied to sandbox.", ipAddress: '192.168.1.1 (Local)', status: 'Success' },
    { id: '4', timestamp: '2024-07-22 11:14:20 UTC', event: AuditEvent.DiagnosticQuery, description: "User asked: 'Why is my idle rough?'", ipAddress: '192.168.1.1 (Local)', status: 'Success' },
    { id: '5', timestamp: '2024-07-22 08:00:01 UTC', event: AuditEvent.DataSync, description: 'Encrypted vehicle health report synced to cloud backup.', ipAddress: 'System', status: 'Success' },
    { id: '6', timestamp: '2024-07-21 18:05:11 UTC', event: AuditEvent.Login, description: 'User authenticated successfully.', ipAddress: '203.0.113.25', status: 'Success' },
];

const Security: React.FC = () => {
  return (
    <div className="h-full flex flex-col space-y-6 relative overflow-hidden p-2">
       {/* Background Grid */}
       <div className="absolute inset-0 opacity-10 pointer-events-none" 
            style={{ 
                backgroundImage: 'radial-gradient(circle at 50% 50%, #1a1a1a 1px, transparent 1px)', 
                backgroundSize: '20px 20px' 
            }}>
       </div>

      <div className="flex justify-between items-end border-b border-gray-800 pb-4 z-10">
        <div>
            <h1 className="text-2xl font-display font-bold text-white tracking-wider">NETSEC <span className="text-brand-cyan">OPS</span></h1>
            <p className="text-gray-500 text-xs mt-1 font-mono uppercase">System Integrity & Audit Control</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-900/20 border border-green-500/30 rounded-full">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-bold text-green-500 uppercase tracking-widest">Systems Secure</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 z-10">
        {/* Encryption Status Card */}
        <div className="bg-[#0a0a0a] p-6 rounded-lg border border-gray-800 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg className="w-24 h-24 text-brand-cyan" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
          </div>
          
          <div className="flex items-center mb-4">
             <div className="p-2 bg-brand-cyan/10 rounded border border-brand-cyan/30 mr-3">
                 <svg className="w-6 h-6 text-brand-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
             </div>
             <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-widest">Lockdown Protocol</h2>
                <p className="text-[10px] text-gray-400 font-mono">AES-256 GCM ENCRYPTION</p>
             </div>
          </div>
          
          <div className="space-y-2">
              <div className="flex justify-between items-center text-xs border-b border-gray-800 pb-2">
                  <span className="text-gray-400">Data Stream</span>
                  <span className="text-green-500 font-mono font-bold">SECURE</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-gray-800 pb-2">
                  <span className="text-gray-400">Cloud Sync</span>
                  <span className="text-green-500 font-mono font-bold">ENCRYPTED</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-1">
                  <span className="text-gray-400">Biometrics</span>
                  <span className="text-green-500 font-mono font-bold">ACTIVE</span>
              </div>
          </div>
        </div>

        {/* Data Residency Card */}
        <div className="bg-[#0a0a0a] p-6 rounded-lg border border-gray-800 shadow-lg relative overflow-hidden group">
           <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Globe.svg/1200px-Globe.svg.png')] opacity-5 bg-no-repeat bg-right-bottom bg-contain pointer-events-none grayscale"></div>
           
           <div className="flex items-center mb-4 relative z-10">
             <div className="p-2 bg-purple-500/10 rounded border border-purple-500/30 mr-3">
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h8a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.885 5.105a.5.5 0 01.115-.665l2.25-1.5a.5.5 0 01.666 0l2.25 1.5a.5.5 0 01.115.665l-2.617 3.926a.5.5 0 01-.88 0L7.885 5.105zM12 21a9 9 0 100-18 9 9 0 000 18z"></path></svg>
             </div>
             <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-widest">Data Sovereignty</h2>
                <p className="text-[10px] text-gray-400 font-mono">NZ PRIVACY ACT 2020</p>
             </div>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed relative z-10">
            Primary storage nodes located in <span className="text-white font-bold">Auckland, NZ</span>. 
            Redundant shards distributed across compliant APAC zones. No data leaves sovereign jurisdiction without explicit key authorization.
          </p>
        </div>
      </div>

      {/* Terminal Style Audit Trail */}
      <div className="flex-1 bg-black rounded-lg border border-gray-800 shadow-2xl flex flex-col overflow-hidden z-10">
        <div className="p-3 bg-[#111] border-b border-gray-800 flex justify-between items-center">
            <h2 className="text-xs font-bold text-gray-300 font-mono uppercase">System_Audit_Log.log</h2>
            <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
            </div>
        </div>
        
        <div className="flex-1 overflow-auto custom-scrollbar p-4 font-mono text-xs relative bg-black">
             {/* Scanline Effect */}
             <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 2px, 3px 100%' }}></div>
             
             <table className="w-full text-left border-collapse relative z-10">
                <thead className="text-gray-500 border-b border-gray-800">
                  <tr>
                    <th className="py-2 pl-2">TIMESTAMP</th>
                    <th className="py-2">EVENT_TYPE</th>
                    <th className="py-2">DESCRIPTION</th>
                    <th className="py-2">SRC_IP</th>
                    <th className="py-2 pr-2 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  {MOCK_AUDIT_LOGS.map((log) => (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors group border-l-2 border-transparent hover:border-brand-cyan">
                      <td className="py-2 pl-2 text-gray-500 group-hover:text-brand-cyan transition-colors">{log.timestamp}</td>
                      <td className="py-2 font-bold text-white uppercase">{log.event}</td>
                      <td className="py-2 text-gray-400 truncate max-w-md">{log.description}</td>
                      <td className="py-2 text-gray-500">{log.ipAddress}</td>
                       <td className="py-2 pr-2 text-right">
                        {log.status === 'Success' ? (
                          <span className="text-green-500 bg-green-900/20 px-1 py-0.5 rounded text-[10px] uppercase">OK</span>
                        ) : (
                          <span className="text-red-500 bg-red-900/20 px-1 py-0.5 rounded text-[10px] uppercase">FAIL</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 text-green-500 animate-pulse">_</div>
        </div>
      </div>
    </div>
  );
};

export default Security;
