
import React, { useState } from 'react';
import { HederaRecord, HederaEventType } from '../types';

const MOCK_INITIAL_RECORDS: HederaRecord[] = [
    { id: '1', timestamp: '2024-07-22 14:35:12', eventType: HederaEventType.Diagnostic, vin: 'JN1AZ00Z9ZT000123', summary: 'Critical alert: ABS Modulator Failure Predicted.', hederaTxId: '0.0.12345@1658498112.123456789', dataHash: 'a1b2c3d4...' },
    { id: '2', timestamp: '2024-07-22 11:15:45', eventType: HederaEventType.Tuning, vin: 'JN1AZ00Z9ZT000123', summary: "AI tune 'Track Day' simulated.", hederaTxId: '0.0.12345@1658486145.987654321', dataHash: 'e5f6g7h8...' },
    { id: '3', timestamp: '2024-07-15 09:00:00', eventType: HederaEventType.Maintenance, vin: 'JN1AZ00Z9ZT000123', summary: 'Oil & Filter Change (Verified)', hederaTxId: '0.0.12345@1657875600.555555555', dataHash: 'i9j0k1l2...' },
];

const Hedera: React.FC = () => {
    const [records, setRecords] = useState<HederaRecord[]>(MOCK_INITIAL_RECORDS);
    const [vin, setVin] = useState('JN1AZ00Z9ZT000123');
    const [eventType, setEventType] = useState<HederaEventType>(HederaEventType.Maintenance);
    const [summary, setSummary] = useState('');
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionResult, setSubmissionResult] = useState<{ success: boolean; txId: string; error?: string } | null>(null);
    
    const [verifyingRecordId, setVerifyingRecordId] = useState<string | null>(null);
    const [verificationStatus, setVerificationStatus] = useState<{ [key: string]: 'success' | 'fail' }>({});

    const handleLogEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!summary.trim()) return;

        setIsSubmitting(true);
        setSubmissionResult(null);

        // Simulate API call to log data and get Hedera Tx ID
        await new Promise(resolve => setTimeout(resolve, 1500));

        const newRecord: HederaRecord = {
            id: (records.length + 1).toString(),
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            eventType,
            vin,
            summary,
            hederaTxId: `0.0.12345@${Date.now() / 1000 | 0}.${Math.floor(Math.random() * 1e9)}`,
            dataHash: 'f4a5b6c7...' // a new mock hash
        };
        
        setRecords(prev => [newRecord, ...prev]);
        setSubmissionResult({ success: true, txId: newRecord.hederaTxId });
        setSummary('');
        setIsSubmitting(false);
    };
    
    const handleVerify = async (recordId: string) => {
        setVerifyingRecordId(recordId);
        // Simulate hash check against DLT
        await new Promise(resolve => setTimeout(resolve, 1000));
        setVerificationStatus(prev => ({ ...prev, [recordId]: 'success' }));
        setVerifyingRecordId(null);
    };

    return (
        <div className="h-full bg-[#050508] font-mono text-gray-300 relative overflow-hidden flex flex-col p-6">
            {/* Background Network Mesh */}
             <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, #444 1px, transparent 1px)`,
                backgroundSize: '30px 30px'
            }}></div>

            <div className="mb-8 flex justify-between items-end border-b border-gray-800 pb-4 z-10">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-widest uppercase">Distributed Ledger // NODE</h1>
                    <p className="text-xs text-gray-500 mt-1">Network: <span className="text-green-500">HEDERA MAINNET</span> // Consensus: <span className="text-green-500">ACTIVE</span></p>
                </div>
                <div className="text-right">
                    <div className="text-xs text-gray-500 uppercase mb-1">Account Balance</div>
                    <div className="text-xl font-bold text-white">4,501.2345 <span className="text-gray-600 text-sm">HBAR</span></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 z-10 flex-1 min-h-0">
                {/* Left Panel: Submission Form */}
                <div className="lg:col-span-1 bg-[#0a0a0a] border border-gray-800 p-6 flex flex-col shadow-lg">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-800 pb-2">Submit Transaction</h2>
                    
                    <form onSubmit={handleLogEvent} className="space-y-4 flex-1">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Target Asset (VIN)</label>
                            <input type="text" value={vin} onChange={e => setVin(e.target.value)} className="w-full bg-[#111] border border-gray-700 rounded-none px-3 py-2 text-white focus:border-brand-cyan focus:outline-none" required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Event Class</label>
                            <select value={eventType} onChange={e => setEventType(e.target.value as HederaEventType)} className="w-full bg-[#111] border border-gray-700 rounded-none px-3 py-2 text-white focus:border-brand-cyan focus:outline-none">
                                {Object.values(HederaEventType).map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Payload Data</label>
                            <textarea value={summary} onChange={e => setSummary(e.target.value)} className="w-full bg-[#111] border border-gray-700 rounded-none px-3 py-2 text-white focus:border-brand-cyan focus:outline-none" rows={4} placeholder="Enter service details or diagnostic codes..." required></textarea>
                        </div>
                        
                        <div className="pt-4">
                             <button type="submit" disabled={isSubmitting} className="w-full bg-white text-black font-bold py-3 hover:bg-gray-200 transition-colors disabled:opacity-50 uppercase tracking-widest text-sm">
                                {isSubmitting ? 'Hashing & Broadcasting...' : 'Sign & Broadcast'}
                            </button>
                        </div>
                    </form>

                    {submissionResult && (
                        <div className={`mt-4 p-3 border-l-2 ${submissionResult.success ? 'border-green-500 bg-green-900/10' : 'border-red-500 bg-red-900/10'}`}>
                            <div className="text-xs font-bold uppercase mb-1">{submissionResult.success ? 'Transaction Confirmed' : 'Transaction Failed'}</div>
                            {submissionResult.success && <div className="text-[10px] text-gray-500 break-all">{submissionResult.txId}</div>}
                        </div>
                    )}
                </div>

                {/* Right Panel: The Ledger */}
                <div className="lg:col-span-2 bg-[#0a0a0a] border border-gray-800 flex flex-col shadow-lg">
                    <div className="p-4 border-b border-gray-800 bg-[#111]">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Immutable Record Stream</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                        {records.map((rec, i) => (
                            <div key={rec.id} className="border-b border-gray-800 p-4 hover:bg-[#111] transition-colors group">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="text-xs text-brand-cyan uppercase font-bold tracking-wider flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-brand-cyan rounded-full"></div>
                                        {rec.eventType}
                                    </div>
                                    <div className="text-xs text-gray-600">{rec.timestamp}</div>
                                </div>
                                <div className="text-sm text-gray-300 mb-2 font-sans">{rec.summary}</div>
                                <div className="flex justify-between items-end">
                                    <div className="flex flex-col gap-1">
                                        <div className="text-[10px] text-gray-600 uppercase">TX ID</div>
                                        <div className="text-[10px] text-gray-500 font-mono bg-black px-2 py-1 border border-gray-800 rounded-sm">{rec.hederaTxId}</div>
                                    </div>
                                    
                                    <div>
                                         {verificationStatus[rec.id] === 'success' ? (
                                             <div className="text-green-500 text-xs font-bold uppercase flex items-center">
                                                 [ Verified On-Chain ]
                                             </div>
                                         ) : (
                                            <button onClick={() => handleVerify(rec.id)} disabled={verifyingRecordId === rec.id} className="text-xs text-gray-500 hover:text-white underline decoration-gray-700 uppercase">
                                                {verifyingRecordId === rec.id ? 'Validating...' : 'Verify Hash'}
                                            </button>
                                         )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hedera;
