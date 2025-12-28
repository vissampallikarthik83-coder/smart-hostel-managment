
import React, { useState } from 'react';
import { User, UserRole, Announcement } from '../types';

interface SecurityViewProps {
  user: User;
  activeTab: string;
}

const SecurityView: React.FC<SecurityViewProps> = ({ user, activeTab }) => {
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [entryMode, setEntryMode] = useState<'structured' | 'manual'>('structured');
  const [showFreePassModal, setShowFreePassModal] = useState(false);
  const [freePassReason, setFreePassReason] = useState('');

  const wardenAnnouncements: Announcement[] = [
    {
      id: 'wa1',
      title: 'Emergency: Late Entry Protocol',
      content: 'Due to ongoing maintenance, all students entering after 11 PM must provide physical ID alongside OTP verification.',
      author: 'Head Warden Mike',
      role: UserRole.WARDEN,
      createdAt: Date.now() - 3600000
    },
    {
      id: 'h1',
      title: 'Holiday Notice: Mid-Semester Break',
      content: 'Major holiday starting May 15. Expect heavy exit traffic. Ensure all OTPs are verified against ID cards.',
      author: 'Chief Warden',
      role: UserRole.WARDEN,
      createdAt: Date.now() - 14400000
    }
  ];

  const handleVerify = () => {
    if (otp.length < 6 && entryMode === 'manual') return;
    setStatus('verifying');
    setTimeout(() => {
      // Mocking successful OTPs: 742910 is from StudentView mock, 123456 is generic
      if (otp.replace(/\s/g, '') === '742910' || otp.replace(/\s/g, '') === '123456') {
        setStatus('success');
      } else {
        setStatus('error');
      }
    }, 1200);
  };

  const handleFreePass = () => {
    if (!freePassReason.trim()) return;
    setStatus('verifying');
    setTimeout(() => {
      setStatus('success');
      setShowFreePassModal(false);
      setFreePassReason('');
      setOtp('BYPASS');
    }, 1000);
  };

  const renderHome = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Exits" value="142" sub="Today" color="#CF6679" icon="fas fa-door-open" />
        <StatCard title="Active Passes" value="18" sub="Current Hour" color="#BB86FC" icon="fas fa-clock" />
        <StatCard title="Incidents" value="2" sub="Logged Overrides" color="#03DAC6" icon="fas fa-shield-alt" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="cyber-card p-8 rounded-3xl flex flex-col items-center justify-center text-center border-l-4 border-[#CF6679]">
          <i className="fas fa-key text-5xl text-[#CF6679] mb-4 opacity-50"></i>
          <h3 className="text-xl font-orbitron font-bold uppercase tracking-widest mb-4">Gate Protocol</h3>
          <p className="text-sm opacity-60 mb-6">Launch the verification interface to authorize student exits via 6-digit cryptographic signatures or manual override.</p>
          <div className="flex gap-4">
            <div className="p-3 bg-card-inner rounded-xl border border-border-app text-center">
               <p className="text-[10px] opacity-40 uppercase font-black">Auth Sync</p>
               <p className="text-xs font-bold text-green-500">Encrypted</p>
            </div>
            <div className="p-3 bg-card-inner rounded-xl border border-border-app text-center">
               <p className="text-[10px] opacity-40 uppercase font-black">Gate State</p>
               <p className="text-xs font-bold text-blue-500">Locked</p>
            </div>
          </div>
        </div>

        <div className="cyber-card p-8 rounded-3xl">
           <h3 className="text-sm font-orbitron font-bold uppercase tracking-widest mb-6 opacity-70">Shift Registry</h3>
           <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="flex justify-between items-center p-4 bg-card-inner rounded-2xl border border-border-app">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-card-inner flex items-center justify-center text-[10px] opacity-40">
                         <i className="fas fa-user-shield"></i>
                      </div>
                      <span className="text-xs font-bold">Officer HX-00{i}</span>
                   </div>
                   <span className="text-[10px] opacity-40 uppercase font-black">On Duty</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );

  const renderVerification = () => (
    <div className="h-full flex flex-col items-center justify-center space-y-6 animate-fade-in relative">
      <div className="w-full max-w-md cyber-card p-10 rounded-3xl text-center bg-app-side border-t-4 border-[#CF6679] relative overflow-hidden">
        {status === 'success' && (
          <div className="absolute inset-0 bg-green-500/10 backdrop-blur-sm z-20 flex items-center justify-center animate-fade-in">
             <div className="text-center p-8">
                <i className="fas fa-check-circle text-6xl text-green-500 mb-4 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]"></i>
                <h3 className="text-2xl font-orbitron font-black text-white uppercase tracking-widest">Access Granted</h3>
                <p className="text-xs text-white/70 mt-2">GATE_ACTUATOR_ENGAGED</p>
                <button 
                  onClick={() => { setStatus('idle'); setOtp(''); }} 
                  className="mt-6 px-8 py-2 bg-green-500 text-black font-black rounded-xl uppercase text-[10px] tracking-widest"
                >
                  Clear Terminal
                </button>
             </div>
          </div>
        )}

        <div className="w-20 h-20 rounded-full bg-[#CF6679]/10 border-2 border-[#CF6679]/30 flex items-center justify-center mx-auto mb-6 text-[#CF6679] text-3xl shadow-lg shadow-[#CF667920]">
          <i className="fas fa-id-card"></i>
        </div>
        <h2 className="text-2xl font-orbitron font-bold mb-2 uppercase tracking-widest">Gate <span className="text-[#CF6679]">Verification</span></h2>
        
        <div className="flex justify-center gap-4 mb-8">
          <button 
            onClick={() => { setEntryMode('structured'); setOtp(''); }}
            className={`text-[9px] font-black uppercase tracking-widest pb-1 transition-all ${entryMode === 'structured' ? 'text-[#CF6679] border-b-2 border-[#CF6679]' : 'opacity-40'}`}
          >
            Structured
          </button>
          <button 
            onClick={() => { setEntryMode('manual'); setOtp(''); }}
            className={`text-[9px] font-black uppercase tracking-widest pb-1 transition-all ${entryMode === 'manual' ? 'text-[#CF6679] border-b-2 border-[#CF6679]' : 'opacity-40'}`}
          >
            Manual Entry
          </button>
        </div>

        <div className="space-y-6">
          {entryMode === 'structured' ? (
            <div className="flex justify-center gap-2">
              {[0, 1, 2, 3, 4, 5].map(i => (
                 <input 
                   key={i}
                   type="text"
                   maxLength={1}
                   className="w-12 h-14 bg-card-inner border-b-2 border-border-app text-center text-2xl font-orbitron focus:outline-none focus:border-[#CF6679] transition-all"
                   onChange={(e) => {
                     const val = e.target.value;
                     if (val) {
                        setOtp(prev => {
                          const newOtp = prev.split('');
                          while (newOtp.length < 6) newOtp.push(' ');
                          newOtp[i] = val;
                          return newOtp.join('');
                        });
                        // Auto-focus next
                        const next = e.target.nextElementSibling as HTMLInputElement;
                        if (next) next.focus();
                     }
                   }}
                 />
              ))}
            </div>
          ) : (
            <input 
              type="text"
              placeholder="ENTER 6-DIGIT CODE"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full bg-card-inner border-b-2 border-border-app p-4 text-center text-2xl font-orbitron focus:outline-none focus:border-[#CF6679] tracking-[0.5em] transition-all"
            />
          )}

          <button 
            disabled={status === 'verifying' || otp.length < (entryMode === 'manual' ? 6 : 1)}
            onClick={handleVerify}
            className="w-full bg-[#CF6679] text-black font-black py-4 rounded-xl uppercase tracking-widest hover:shadow-lg hover:shadow-[#CF667940] transition-all disabled:opacity-50 text-xs"
          >
            {status === 'verifying' ? 'AUTHENTICATING...' : 'Authorize Exit'}
          </button>

          <div className="pt-4 border-t border-border-app">
            <button 
              onClick={() => setShowFreePassModal(true)}
              className="text-[10px] font-black uppercase text-[#CF6679] opacity-60 hover:opacity-100 hover:underline transition-all tracking-widest"
            >
              Emergency / Free Pass Override
            </button>
          </div>

          {status === 'error' && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-fade-in">
               <p className="text-red-500 font-black uppercase tracking-widest text-sm">Auth Failure</p>
               <p className="text-xs opacity-60 mt-1">Invalid OTP Signature. Code Mismatch.</p>
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-md p-4 bg-[#CF6679]/5 rounded-2xl border border-[#CF6679]/20 flex items-center gap-4">
        <i className="fas fa-info-circle text-[#CF6679]"></i>
        <p className="text-[10px] opacity-60 leading-relaxed font-bold uppercase tracking-tighter">
          All gate activities are recorded. Manual overrides require Warden escalation and photographic evidence.
        </p>
      </div>

      {/* Free Pass Modal */}
      {showFreePassModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md cyber-card p-10 rounded-3xl bg-app-main border border-[#CF6679]/40 relative">
            <button onClick={() => setShowFreePassModal(false)} className="absolute top-8 right-8 text-[#CF6679] opacity-50 hover:opacity-100">
              <i className="fas fa-times"></i>
            </button>
            <h3 className="text-xl font-orbitron font-black text-[#CF6679] uppercase tracking-widest mb-6 text-center">Free Pass <span className="text-white">Request</span></h3>
            <p className="text-xs opacity-60 mb-6 text-center italic">Use only if student is unable to provide OTP but has direct authorization.</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-black opacity-40 mb-2 block tracking-widest">Bypass Justification</label>
                <select 
                  value={freePassReason}
                  onChange={(e) => setFreePassReason(e.target.value)}
                  className="w-full bg-card-inner border border-border-app rounded-xl p-4 text-sm focus:border-[#CF6679] outline-none"
                >
                  <option value="">Select Reason...</option>
                  <option value="Medical Emergency">Medical Emergency</option>
                  <option value="Direct Warden Call">Direct Warden Call</option>
                  <option value="Device/Technical Failure">Device/Technical Failure</option>
                  <option value="Pre-Authorized Group Exit">Pre-Authorized Group Exit</option>
                </select>
              </div>
              
              <button 
                onClick={handleFreePass}
                disabled={!freePassReason}
                className="w-full py-4 bg-[#CF6679] text-black font-black rounded-2xl uppercase tracking-[0.2em] shadow-lg shadow-[#CF667920] hover:scale-105 transition-all disabled:opacity-30 text-xs"
              >
                Force Authorization
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAnnouncements = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-orbitron font-bold uppercase tracking-widest text-[#CF6679] text-sm">Warden <span className="text-text-main opacity-80">Directives</span></h3>
        <span className="text-[9px] font-black text-[#CF6679] uppercase tracking-[0.3em] bg-[#CF6679]/10 px-3 py-1 rounded-full animate-pulse">Live Feed Active</span>
      </div>
      <div className="grid grid-cols-1 gap-6">
        {wardenAnnouncements.map(a => (
          <div key={a.id} className="cyber-card p-8 rounded-3xl border-l-4 border-[#CF6679] hover:bg-card-inner transition-all group">
            <div className="flex justify-between items-start mb-4">
              <span className={`text-[10px] font-black px-3 py-1 rounded uppercase tracking-[0.2em] ${a.title.includes('Holiday') ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : 'bg-[#CF6679]/20 text-[#CF6679] border border-[#CF6679]/20'}`}>
                {a.title.includes('Holiday') ? 'Holiday Notice' : 'Security Protocol'}
              </span>
              <span className="text-[10px] opacity-40 font-mono">{new Date(a.createdAt).toLocaleString()}</span>
            </div>
            <h4 className="text-xl font-bold mb-3 group-hover:text-[#CF6679] transition-colors">{a.title}</h4>
            <p className="opacity-70 leading-relaxed text-sm">{a.content}</p>
            <div className="mt-6 pt-6 border-t border-border-app flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-card-inner flex items-center justify-center text-[10px] font-black text-[#CF6679]">
                  {a.author.charAt(0)}
                </div>
                <span className="text-[10px] opacity-40 uppercase font-bold italic">Authorized by {a.author}</span>
              </div>
              <div className="flex gap-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#CF6679]"></div>
                 <div className="w-1.5 h-1.5 rounded-full bg-[#CF6679] opacity-50"></div>
                 <div className="w-1.5 h-1.5 rounded-full bg-[#CF6679] opacity-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return renderHome();
      case 'gate': return renderVerification();
      case 'announcements': return renderAnnouncements();
      default: return renderHome();
    }
  };

  return (
    <div className="h-full">
      {renderContent()}
    </div>
  );
};

const StatCard: React.FC<{ title: string, value: string, sub: string, color: string, icon: string }> = ({ title, value, sub, color, icon }) => (
  <div className="cyber-card p-6 rounded-2xl relative overflow-hidden group">
    <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: color }}></div>
    <div className="flex justify-between items-start mb-4">
       <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">{title}</span>
       <i className={`${icon} opacity-20 text-xl group-hover:scale-125 transition-transform`} style={{ color }}></i>
    </div>
    <div className="text-3xl font-orbitron font-black mb-1">{value}</div>
    <div className="text-[10px] opacity-50 font-bold uppercase">{sub}</div>
  </div>
);

export default SecurityView;
