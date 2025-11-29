
import React, { useState } from 'react';
import { TimelineEvent, AlertLevel } from '../types';

const MOCK_EVENTS: TimelineEvent[] = [
    {
        id: '1',
        level: AlertLevel.Warning,
        title: 'O2 Sensor Degradation',
        timeframe: 'Next 1000 miles',
        details: {
            component: 'Oxygen Sensor (Bank 1)',
            rootCause: 'AI analysis of sensor voltage response times indicates a 15% slowdown under load, which is a leading indicator of sensor failure. This is likely due to age and carbon buildup.',
            recommendedActions: ['Monitor fuel economy.', 'Perform a live data scan during a test drive to confirm slow response.', 'Replace O2 sensor if performance does not improve.'],
            plainEnglishSummary: "Your engine's main oxygen sensor is getting slow. This can hurt your gas mileage and eventually cause a check engine light.",
            tsbs: ["TSB-21-004: O2 Sensor Software Update"],
        }
    },
    {
        id: '2',
        level: AlertLevel.Critical,
        title: 'Brake System Fault',
        timeframe: 'Immediate',
        details: {
            component: 'ABS Modulator',
            rootCause: 'The system has detected intermittent communication loss with the ABS control module, coupled with a slight, persistent drop in brake fluid pressure when idle. This indicates a potential internal leak or electronic failure in the module.',
            recommendedActions: ['DO NOT DRIVE. Tow to a qualified mechanic.', 'Perform a full ABS diagnostic scan.', 'Inspect for brake fluid leaks around the ABS module.'],
            plainEnglishSummary: "There's a serious issue with your anti-lock brake system. For your safety, the vehicle should not be driven until it's inspected.",
            tsbs: ["Recall #23V-102: ABS Modulator Inspection"],
        }
    },
    {
        id: '3',
        level: AlertLevel.Info,
        title: 'Air Filter Nearing EOL',
        timeframe: 'Next 3 months',
        details: {
            component: 'Engine Air Filter',
            rootCause: 'Based on mileage since last replacement and a slight increase in long-term fuel trim, the engine air filter is likely becoming restricted.',
            recommendedActions: ['Visually inspect air filter.', 'Replace if dirty.'],
            plainEnglishSummary: "It's almost time to change your engine's air filter. A clean filter helps your engine breathe better and saves fuel.",
        }
    }
];

// Define styles map with robust string keys
const levelStyles: Record<string, any> = {
    'Critical': {
        bg: 'bg-red-900/30',
        border: 'border-red-500',
        text: 'text-red-400',
        icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
    },
    'Warning': {
        bg: 'bg-yellow-900/30',
        border: 'border-yellow-500',
        text: 'text-yellow-400',
        icon: 'M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-4v4m0 4h.01'
    },
    'Info': {
        bg: 'bg-blue-900/30',
        border: 'border-blue-500',
        text: 'text-blue-400',
        icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    },
}

// Helper to safely get styles with a fallback
const getStyles = (level: AlertLevel | string) => {
    if (!level) return levelStyles['Info'];
    
    // Normalize input to handle case sensitivity or unexpected strings from AI
    const inputStr = level.toString().toLowerCase();
    
    if (inputStr.includes('crit')) return levelStyles['Critical'];
    if (inputStr.includes('warn')) return levelStyles['Warning'];
    
    return levelStyles['Info'];
};

const EventModal: React.FC<{ event: TimelineEvent, onClose: () => void }> = ({ event, onClose }) => {
    const styles = getStyles(event.level);
    
    // Robust fallback in case 'details' is missing from the AI response
    const details = event.details || {
        component: 'System',
        plainEnglishSummary: 'No detailed analysis available.',
        rootCause: 'Data insufficient for detailed breakdown.',
        recommendedActions: ['Perform manual inspection.'],
        tsbs: []
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className={`w-full max-w-2xl bg-base-900 rounded-lg border ${styles.border} shadow-lg relative`} onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">&times;</button>
                <div className="p-6">
                    <div className="flex items-center mb-4">
                        <svg className={`w-8 h-8 mr-4 ${styles.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={styles.icon} /></svg>
                        <div>
                             <h2 className={`text-2xl font-bold font-display ${styles.text}`}>{event.title}</h2>
                             <p className="text-sm text-gray-400">{event.timeframe} - {details.component}</p>
                        </div>
                    </div>
                   
                    <div className="space-y-4 text-gray-300">
                        <div>
                            <h4 className="font-semibold text-brand-cyan">Summary:</h4>
                            <p>{details.plainEnglishSummary}</p>
                        </div>
                         <div>
                            <h4 className="font-semibold text-brand-cyan">KC's Analysis (Root Cause):</h4>
                            <p>{details.rootCause}</p>
                        </div>
                         <div>
                            <h4 className="font-semibold text-brand-cyan">Recommended Actions:</h4>
                            <ul className="list-disc list-inside space-y-1">
                                {details.recommendedActions?.map((action, i) => <li key={i}>{action}</li>)}
                            </ul>
                        </div>
                        {details.tsbs && details.tsbs.length > 0 && (
                             <div>
                                <h4 className="font-semibold text-brand-cyan">Related Bulletins/Recalls:</h4>
                                <ul className="list-disc list-inside space-y-1">
                                    {details.tsbs.map((tsb, i) => <li key={i}>{tsb}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const RiskTimeline: React.FC<{events: TimelineEvent[]}> = ({ events }) => {
    const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

    const sortedEvents = [...events].sort((a, b) => 
        Object.values(AlertLevel).indexOf(b.level as AlertLevel) - Object.values(AlertLevel).indexOf(a.level as AlertLevel)
    );

    if (events.length === 0) {
        return (
            <div className="text-center py-10">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h3 className="mt-2 text-sm font-medium text-gray-200">All Systems Normal</h3>
                <p className="mt-1 text-sm text-gray-500">No potential issues detected at this time.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {sortedEvents.map(event => {
                const styles = getStyles(event.level);
                return (
                    <div key={event.id} onClick={() => setSelectedEvent(event)} className={`p-4 rounded-lg border-l-4 ${styles.border} ${styles.bg} flex items-center cursor-pointer hover:bg-opacity-50 transition-all`}>
                        <div className="flex-shrink-0 mr-4">
                            <svg className={`w-8 h-8 ${styles.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={styles.icon} /></svg>
                        </div>
                        <div className="flex-grow">
                            <p className={`font-bold ${styles.text}`}>{event.title}</p>
                            <p className="text-sm text-gray-400">{event.timeframe}</p>
                        </div>
                        <div className="text-sm text-gray-400">&gt;</div>
                    </div>
                )
            })}
            {selectedEvent && <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
        </div>
    );
};

export default RiskTimeline;
