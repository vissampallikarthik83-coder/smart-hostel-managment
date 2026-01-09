
import React, { useState, useEffect } from 'react';
import { User, MedicalRequest, Medicine } from '../types';
import { DataService } from '../services/dataService';

interface WardenMedicalProps {
    user: User;
}

const WardenMedicalView: React.FC<WardenMedicalProps> = ({ user }) => {
    const [requests, setRequests] = useState<MedicalRequest[]>([]);
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [loading, setLoading] = useState(true);

    // Demo inventory data simulation
    useEffect(() => {
        const unsubscribe = DataService.subscribeToMedicalRequests(undefined, (reqs) => {
            setRequests(reqs.sort((a, b) => b.createdAt - a.createdAt));
            setLoading(false);
        });

        // Simulating inventory fetch
        setMedicines([
            { id: 'M1', name: 'Paracetamol', category: 'OTC', stock: 120, minStock: 20, description: 'Fever/Pain', lastRestocked: Date.now() },
            { id: 'M2', name: 'Bandages', category: 'FIRST_AID', stock: 45, minStock: 50, description: 'Wound care', lastRestocked: Date.now() },
            { id: 'M3', name: 'Cetirizine', category: 'OTC', stock: 30, minStock: 15, description: 'Allergy', lastRestocked: Date.now() },
            { id: 'M4', name: 'ORS', category: 'OTC', stock: 10, minStock: 20, description: 'Hydration', lastRestocked: Date.now() },
        ]);

        return () => unsubscribe();
    }, []);

    const handleUpdateStatus = async (id: string, newStatus: any) => {
        await DataService.updateMedicalRequestStatus(id, newStatus);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <header className="flex justify-between items-end border-b border-white/5 pb-6">
                <div>
                    <h2 className="text-2xl font-orbitron font-black uppercase tracking-wider text-[#BB86FC]">Infirmary Control</h2>
                    <p className="text-xs opacity-50 tracking-[0.2em] font-bold mt-2">MEDICAL REQUESTS & INVENTORY</p>
                </div>
                <button onClick={() => { }} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"><i className="fas fa-sync-alt"></i></button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Request Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="font-orbitron font-black text-sm uppercase tracking-widest opacity-60">Pending Triage</h3>
                    {requests.length === 0 && <div className="p-12 text-center opacity-20 font-black tracking-widest uppercase text-sm">No Active Medical Alerts</div>}

                    {requests.map(req => (
                        <div key={req.id} className="cyber-card p-6 rounded-3xl border-l-4 border-red-500/50 relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-black text-lg text-white">{req.studentName}</h4>
                                    <p className="text-[10px] opacity-50 uppercase tracking-widest">ID: {req.studentId} • {new Date(req.createdAt).toLocaleTimeString()}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${req.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}>{req.status}</span>
                            </div>

                            <div className="bg-white/5 p-4 rounded-xl mb-4">
                                <div className="text-[10px] font-black uppercase opacity-40 mb-1">Symptoms</div>
                                <p className="text-sm font-medium">{req.symptoms}</p>
                            </div>

                            {req.aiAnalysis && (
                                <div className="bg-[#BB86FC]/5 border border-[#BB86FC]/10 p-4 rounded-xl mb-4">
                                    <div className="text-[10px] font-black uppercase text-[#BB86FC] mb-1"><i className="fas fa-robot mr-2"></i>AI Assessment</div>
                                    <p className="text-xs opacity-70 italic">{req.aiAnalysis}</p>
                                </div>
                            )}

                            {req.status === 'PENDING' && (
                                <div className="flex gap-4 mt-6">
                                    <button onClick={() => handleUpdateStatus(req.id, 'APPROVED')} className="flex-1 py-3 bg-green-500/20 text-green-500 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-green-500/30 transition-all border border-green-500/20">Approve Aid</button>
                                    <button onClick={() => handleUpdateStatus(req.id, 'REJECTED')} className="px-6 py-3 bg-red-500/10 text-red-500 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-red-500/20 transition-all border border-red-500/10">Deny</button>
                                </div>
                            )}
                            {req.status === 'APPROVED' && (
                                <button onClick={() => handleUpdateStatus(req.id, 'FULFILLED')} className="w-full py-3 bg-[#BB86FC]/20 text-[#BB86FC] font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-[#BB86FC]/30 transition-all border border-[#BB86FC]/20">Mark Dispensed</button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Inventory Side Panel */}
                <div className="space-y-6">
                    <h3 className="font-orbitron font-black text-sm uppercase tracking-widest opacity-60">Stock Monitor</h3>

                    <div className="cyber-card p-6 rounded-3xl bg-app-side/50">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-[10px] uppercase font-black tracking-widest opacity-40">Total SKUs</span>
                            <span className="text-xl font-bold font-orbitron">{medicines.length}</span>
                        </div>

                        <div className="space-y-4">
                            {medicines.map(med => (
                                <div key={med.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                    <div>
                                        <p className="text-xs font-bold text-zinc-200">{med.name}</p>
                                        <p className="text-[9px] opacity-40 uppercase tracking-widest">{med.category}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-black font-orbitron ${med.stock < med.minStock ? 'text-red-500 animate-pulse' : 'text-[#BB86FC]'}`}>{med.stock}</p>
                                        {med.stock < med.minStock && <i className="fas fa-exclamation-circle text-red-500 text-[10px]"></i>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-6 py-3 border border-white/10 rounded-xl text-[10px] uppercase font-black twitter-spacing hover:bg-white/5 transition-all">
                            <i className="fas fa-plus mr-2"></i> Restock Request
                        </button>
                    </div>

                    {/* AI Insight */}
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-[#BB86FC]/10 to-transparent border border-[#BB86FC]/20">
                        <div className="flex items-center gap-3 mb-3 text-[#BB86FC]">
                            <i className="fas fa-brain text-xl"></i>
                            <h4 className="font-orbitron font-black text-xs uppercase tracking-widest">Inventory Prediction</h4>
                        </div>
                        <p className="text-xs leading-relaxed opacity-70">
                            Based on recent seasonal trends, demand for **Cetirizine** and **ORS** is projected to rise by 40% next week due to weather changes. Recommendation: Increase stock levels immediately.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WardenMedicalView;
