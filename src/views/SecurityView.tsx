
import React, { useState, useEffect } from 'react';
import { User, GateEntry } from '../types.ts';
import { DataService } from '../services/dataService.ts';

interface SecurityViewProps {
  user: User;
  activeTab: string;
}

const SecurityView: React.FC<SecurityViewProps> = ({ user, activeTab }) => {
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error' | 'already_used'>('idle');
  const [student, setStudent] = useState<any>(null);
  const [history, setHistory] = useState<GateEntry[]>([]);

  useEffect(() => {
    const unsubscribe = DataService.subscribeToGateHistory((newHistory) => {
      setHistory(newHistory);
    });
    return () => unsubscribe();
  }, []);

  const handleVerify = async () => {
    if (otp.length < 6) return;
    setStatus('verifying');

    try {
      const result = await DataService.verifyOtp(otp);

      if (result.valid && result.student) {
        const entry: GateEntry = {
          id: 'TEMP', // Will be replaced by Firestore
          studentId: result.student.id,
          studentName: result.student.name,
          timestamp: Date.now(),
          otp: otp,
          action: 'EXIT'
        };

        await DataService.logGateEntry(entry);
        setStudent(result.student);
        setStatus('success');
      } else {
        setStatus(result.error === 'ALREADY_USED' ? 'already_used' : 'error');
      }
    } catch (e) {
      setStatus('error');
    }
  };

  const renderVerification = () => (
    <div className="space-y-12 animate-fade-in max-w-4xl mx-auto">
      <div className="w-full cyber-card p-10 rounded-3xl bg-app-side border-t-4 border-[#CF6679] shadow-2xl relative overflow-hidden">
        {status === 'success' && student && (
          <div className="absolute inset-0 bg-green-500/10 backdrop-blur-xl z-20 flex flex-col items-center justify-center p-8 animate-fade-in text-center">
            <i className="fas fa-check-circle text-6xl text-green-500 mb-4 animate-bounce"></i>
            <h3 className="font-orbitron font-black text-2xl mb-1 text-white">{student.name}</h3>
            <p className="text-xs opacity-60 text-white mb-2">Room: {student.room}</p>
            <p className="text-[10px] font-black uppercase text-green-500 mb-8 tracking-[0.4em]">Authorized Clearance Granted</p>
            <button onClick={() => { setStatus('idle'); setOtp(''); }} className="w-full py-4 bg-green-500 text-black font-black rounded-xl uppercase text-xs tracking-widest shadow-lg shadow-green-500/20">Resume Surveillance</button>
          </div>
        )}

        {status === 'error' && (
          <div className="absolute inset-0 bg-red-500/10 backdrop-blur-xl z-20 flex flex-col items-center justify-center p-8 animate-fade-in text-center">
            <i className="fas fa-times-circle text-6xl text-red-500 mb-4"></i>
            <h3 className="font-orbitron font-black text-xl mb-1 text-white">INVALID SIGNATURE</h3>
            <p className="text-[10px] font-black uppercase text-red-500 mb-8 tracking-[0.4em]">Uplink Denied • Verify Code</p>
            <button onClick={() => setStatus('idle')} className="w-full py-4 bg-red-500 text-black font-black rounded-xl uppercase text-xs tracking-widest">Retry Uplink</button>
          </div>
        )}

        {status === 'already_used' && (
          <div className="absolute inset-0 bg-orange-500/10 backdrop-blur-xl z-20 flex flex-col items-center justify-center p-8 animate-fade-in text-center">
            <i className="fas fa-history text-6xl text-orange-500 mb-4"></i>
            <h3 className="font-orbitron font-black text-xl mb-1 text-white">CODE EXPIRED</h3>
            <p className="text-[10px] font-black uppercase text-orange-500 mb-8 tracking-[0.4em]">Signature Previously Used • Access Denied</p>
            <button onClick={() => setStatus('idle')} className="w-full py-4 bg-orange-500 text-black font-black rounded-xl uppercase text-xs tracking-widest">Acknowledge</button>
          </div>
        )}

        <div className="w-20 h-20 rounded-full bg-[#CF6679]/10 border border-[#CF6679]/30 flex items-center justify-center mx-auto mb-6 text-[#CF6679] text-3xl">
          <i className="fas fa-fingerprint animate-pulse"></i>
        </div>
        <h2 className="text-2xl font-orbitron font-bold mb-8 text-center uppercase tracking-widest text-[#CF6679]">Gate Authorization</h2>
        <input
          type="text"
          maxLength={6}
          value={otp}
          onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
          className="w-full bg-[#0a0a0c] border-b-2 border-border-app p-6 text-center text-4xl font-orbitron focus:outline-none focus:border-[#CF6679] tracking-[0.5em] mb-10 text-white placeholder:opacity-10"
          placeholder="XXXXXX"
        />
        <button
          onClick={handleVerify}
          disabled={otp.length < 6 || status === 'verifying'}
          className="w-full bg-[#CF6679] text-black font-black py-6 rounded-2xl uppercase tracking-[0.3em] text-[11px] disabled:opacity-20 hover:scale-[1.02] transition-all shadow-xl shadow-[#CF6679/20]"
        >
          {status === 'verifying' ? <span className="flex items-center justify-center gap-3"><i className="fas fa-circle-notch animate-spin"></i> Analyzing Protocol...</span> : 'Authorize Signature'}
        </button>
      </div>

      <div className="cyber-card p-8 rounded-3xl bg-app-side border-l-4 border-white/10">
        <h3 className="font-orbitron font-black text-xs mb-8 uppercase tracking-[0.4em] opacity-40">Recent Clearances History</h3>
        <div className="space-y-4">
          {history.map(h => (
            <div key={h.id} className="flex items-center gap-6 p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                <i className="fas fa-user-check"></i>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white uppercase tracking-tighter">{h.studentName}</p>
                <p className="text-[9px] opacity-40 font-black uppercase tracking-widest">ID: {h.studentId} • Code: {h.otp}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-[#CF6679] uppercase mb-1">Clearance Valid</p>
                <p className="text-[8px] opacity-30 font-bold">{new Date(h.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
          {history.length === 0 && <div className="text-center py-10 opacity-20 font-black uppercase tracking-widest text-[10px]">Registry_History_Clean</div>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full">
      {activeTab === 'gate' ? renderVerification() : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in max-w-6xl mx-auto">
          <StatCard title="Total Exits" value={`${history.length}`} sub="Shift Log Count" color="#CF6679" icon="fas fa-door-open" />
          <StatCard title="Security" value="Active" sub="Nexus Node #1" color="#03DAC6" icon="fas fa-shield-alt" />
          <StatCard title="Uplink" value="Sync" sub="Zero Latency" color="#BB86FC" icon="fas fa-wifi" />
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ title: string, value: string, sub: string, color: string, icon: string }> = ({ title, value, sub, color, icon }) => (
  <div className="cyber-card p-8 rounded-[2rem] relative overflow-hidden group bg-app-side/40">
    <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: color }}></div>
    <div className="flex justify-between items-start mb-6">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">{title}</span>
      <i className={`${icon} opacity-20 text-xl group-hover:scale-110 transition-transform`} style={{ color }}></i>
    </div>
    <div className="text-3xl font-orbitron font-black mb-1 text-white">{value}</div>
    <div className="text-[10px] opacity-50 font-bold uppercase tracking-widest">{sub}</div>
  </div>
);

export default SecurityView;
