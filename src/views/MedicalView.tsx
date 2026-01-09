
import React, { useState } from 'react';
import { User } from '../types';
import { analyzeSymptoms } from '../services/geminiService';
import { DataService } from '../services/dataService';
import { MedicalRequest, UserRole } from '../types';
import { useEffect } from 'react';

interface MedicalViewProps {
    user: User;
}

const MedicalView: React.FC<MedicalViewProps> = ({ user }) => {
    const [symptoms, setSymptoms] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [aiResult, setAiResult] = useState<any | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [medicalHistory, setMedicalHistory] = useState<MedicalRequest[]>([]);

    useEffect(() => {
        const unsubscribe = DataService.subscribeToMedicalRequests(user.id, (requests) => {
            setMedicalHistory(requests);
        });
        return () => unsubscribe();
    }, [user.id]);

    const handleAnalyze = async () => {
        if (!symptoms.trim()) return;
        setAnalyzing(true);
        const result = await analyzeSymptoms(symptoms);
        setAiResult(result);
        setAnalyzing(false);
    };

    const handleSubmitRequest = async () => {
        if (!aiResult) return;
        setSubmitting(true);

        const request: MedicalRequest = {
            id: `MED-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            studentId: user.id,
            studentName: user.name,
            symptoms: symptoms,
            symptomChecklist: [],
            aiAnalysis: `Condition: ${aiResult.condition}. Advice: ${aiResult.advice}`,
            requestedMedicines: aiResult.medicines || [],
            status: 'PENDING',
            createdAt: Date.now()
        };

        await DataService.createMedicalRequest(request);
        setSubmitting(false);
        setSuccess(true);
        setSymptoms('');
        setAiResult(null);

        setTimeout(() => setSuccess(false), 3000);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <header className="flex justify-between items-end border-b border-white/5 pb-6">
                <div>
                    <h2 className="text-2xl font-orbitron font-black uppercase tracking-wider">Medical Bay</h2>
                    <p className="text-xs text-[#00D4FF] tracking-[0.2em] font-bold mt-2">AI-ASSISTED TRIAGE SYSTEM</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="cyber-card p-6 rounded-3xl">
                    <h3 className="font-orbitron text-lg mb-4 flex items-center gap-3">
                        <i className="fas fa-heartbeat text-red-500"></i>
                        Symptom Analysis
                    </h3>

                    <textarea
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        placeholder="Describe your symptoms (e.g., 'Severe headache and nausea since morning')..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 min-h-[150px] mb-4 focus:border-[#00D4FF] focus:outline-none transition-colors"
                    />

                    <button
                        onClick={handleAnalyze}
                        disabled={analyzing || !symptoms}
                        className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 py-3 rounded-xl font-bold uppercase tracking-widest disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                    >
                        {analyzing ? (
                            <>
                                <i className="fas fa-circle-notch animate-spin"></i>
                                Analyzing Vitals...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-microchip"></i>
                                Run AI Diagnostics
                            </>
                        )}
                    </button>
                </div>

                <div className="space-y-6">
                    {aiResult && (
                        <div className="cyber-card p-6 rounded-3xl border-t-4 border-[#00D4FF] animate-fade-in">
                            <div className="flex items-center gap-2 mb-4 text-[#00D4FF]">
                                <i className="fas fa-robot text-xl"></i>
                                <span className="font-black tracking-widest uppercase text-sm">Diagnosis Result</span>
                            </div>

                            <div className="space-y-4 text-sm">
                                <div className="bg-white/5 p-4 rounded-xl">
                                    <span className="block text-[10px] uppercase opacity-50 font-bold mb-1">Possible Condition</span>
                                    <span className="text-lg font-bold">{aiResult.condition}</span>
                                </div>

                                <div className="bg-white/5 p-4 rounded-xl">
                                    <span className="block text-[10px] uppercase opacity-50 font-bold mb-1">First Aid Advice</span>
                                    <p className="leading-relaxed">{aiResult.advice}</p>
                                </div>

                                <div className="bg-white/5 p-4 rounded-xl">
                                    <span className="block text-[10px] uppercase opacity-50 font-bold mb-1">Recommended OTC Meds</span>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {aiResult.medicines?.map((med: string, i: number) => (
                                            <span key={i} className="px-3 py-1 bg-[#00D4FF]/10 text-[#00D4FF] rounded-lg text-xs font-bold border border-[#00D4FF]/20 cursor-default">
                                                {med}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                                    <i className="fas fa-exclamation-triangle text-red-500 mt-1"></i>
                                    <p className="text-[10px] text-red-300 font-bold uppercase leading-relaxed">
                                        Disclaimer: {aiResult.disclaimer || "AI suggestions are for first-aid only. Visit a doctor immediately for serious symptoms."}
                                    </p>
                                </div>

                                <button
                                    onClick={handleSubmitRequest}
                                    disabled={submitting}
                                    className="w-full bg-[#00D4FF] hover:opacity-90 text-black font-black py-4 rounded-xl uppercase tracking-widest transition-all mt-4"
                                >
                                    {submitting ? "Transmitting..." : "Request Meds from Warden"}
                                </button>
                            </div>
                        </div>
                    )}

                    {success && (
                        <div className="p-4 bg-green-500/10 border border-green-500/50 text-green-400 rounded-2xl flex items-center gap-4 animate-fade-in">
                            <i className="fas fa-check-circle text-2xl"></i>
                            <div>
                                <h4 className="font-bold uppercase tracking-wider">Request Sent</h4>
                                <p className="text-xs opacity-70">Warden validated. Awaiting approval.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-12">
                <h3 className="font-orbitron font-black text-sm mb-6 uppercase tracking-[0.4em] opacity-40">Medical Logs</h3>
                <div className="space-y-4">
                    {medicalHistory.map(req => (
                        <div key={req.id} className="cyber-card p-6 rounded-2xl bg-card-inner border border-border-app flex flex-row items-center justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${req.status === 'APPROVED' ? 'bg-green-500/10 text-green-500' :
                                            req.status === 'REJECTED' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
                                        }`}>
                                        {req.status}
                                    </span>
                                    <span className="text-[10px] font-bold opacity-30 text-text-muted">{new Date(req.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm font-bold text-text-main mb-1">{req.symptoms}</p>
                                {req.adminComments && (
                                    <p className="text-[11px] text-green-400 mt-2 font-medium">Directive: {req.adminComments}</p>
                                )}
                            </div>
                        </div>
                    ))}
                    {medicalHistory.length === 0 && (
                        <div className="text-center py-10 opacity-20 italic">No medical history recordings found.</div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default MedicalView;
