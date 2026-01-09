
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

const AuthView: React.FC = () => {

  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentColor = {
    [UserRole.STUDENT]: '#00D4FF',
    [UserRole.WARDEN]: '#BB86FC',
    [UserRole.ADMIN]: '#03DAC6',
    [UserRole.SECURITY]: '#CF6679'
  }[role];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await login(email, role);
      } else {
        await register(name, email, role);
      }
      // Success is handled by state change in App router (redirect)
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-app-main p-6 relative overflow-hidden text-text-main">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[140px] opacity-20 transition-all duration-1000" style={{ backgroundColor: currentColor }}></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[140px] opacity-10 transition-all duration-1000" style={{ backgroundColor: currentColor }}></div>
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none"></div>
      </div>

      <div className="w-full max-w-md cyber-card p-12 rounded-[3rem] animate-fade-in relative z-10 bg-app-side/40 border-t-4 shadow-2xl transition-all duration-700" style={{ borderColor: currentColor }}>
        <div className="text-center mb-12">
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute inset-0 rounded-2xl animate-rotate-x flex items-center justify-center text-black font-black text-3xl font-orbitron" style={{ backgroundColor: currentColor, boxShadow: `0 0 20px ${currentColor}60` }}>
              X
            </div>
            <div className="absolute -inset-2 rounded-2xl border-2 border-dashed opacity-20 animate-spin" style={{ borderColor: currentColor, animationDuration: '8s' }}></div>
          </div>
          <h1 className="text-5xl font-black font-orbitron tracking-tighter italic mb-3">
            HOSTEL<span style={{ color: currentColor }}>X</span>
          </h1>
          <p className="opacity-40 text-[10px] tracking-[0.6em] uppercase font-black">Titan Force Systems v4.0</p>
        </div>

        <div className="flex justify-center gap-10 mb-10 border-b border-border-app">
          <button onClick={() => { setIsLogin(true); setError(null); }} className={`pb-5 px-3 font-black transition-all text-[11px] tracking-[0.3em] uppercase ${isLogin ? 'opacity-100 border-b-2' : 'opacity-20'}`} style={{ color: isLogin ? currentColor : 'var(--text-main)', borderColor: currentColor }}>Uplink</button>
          <button onClick={() => { setIsLogin(false); setError(null); }} className={`pb-5 px-3 font-black transition-all text-[11px] tracking-[0.3em] uppercase ${!isLogin ? 'opacity-100 border-b-2' : 'opacity-20'}`} style={{ color: !isLogin ? currentColor : 'var(--text-main)', borderColor: currentColor }}>Init</button>
        </div>

        {error && (
          <div className="mb-8 p-5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest animate-fade-in flex items-center gap-3">
            <i className="fas fa-exclamation-triangle"></i>
            {error}
          </div>
        )}

        <div className="grid grid-cols-4 gap-4 mb-10">
          {Object.values(UserRole).map((r) => (
            <button
              key={r}
              onClick={() => { setRole(r); setError(null); }}
              className={`p-5 rounded-3xl border text-[10px] font-black uppercase transition-all flex flex-col items-center gap-3 group ${role === r ? 'bg-card-inner opacity-100' : 'opacity-20 hover:opacity-50'}`}
              style={{ borderColor: role === r ? currentColor : 'transparent' }}
            >
              <i className={`${r === UserRole.STUDENT ? 'fa-user-graduate' : r === UserRole.WARDEN ? 'fa-user-shield' : r === UserRole.ADMIN ? 'fa-user-cog' : 'fa-shield-halved'} fas text-xl`} style={{ color: role === r ? currentColor : 'var(--text-main)' }}></i>
              <span className="opacity-50 text-[8px]">{r.slice(0, 5)}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="group">
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Personnel Alias" className="w-full bg-card-inner border border-border-app rounded-2xl p-5 text-sm outline-none text-text-main focus:bg-white/10 transition-all placeholder:opacity-20 placeholder:text-text-muted" />
            </div>
          )}

          <div className="group">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Signature" className="w-full bg-card-inner border border-border-app rounded-2xl p-5 text-sm outline-none text-text-main focus:bg-white/10 transition-all placeholder:opacity-20 placeholder:text-text-muted" />
          </div>

          <div className="group">
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Security Passcode" className="w-full bg-card-inner border border-border-app rounded-2xl p-5 text-sm outline-none text-text-main focus:bg-white/10 transition-all placeholder:opacity-20 placeholder:text-text-muted" />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: currentColor, boxShadow: `0 10px 25px ${currentColor}30` }}
            className="w-full text-black font-black py-5 rounded-2xl mt-6 transition-all uppercase tracking-[0.5em] text-[12px] disabled:opacity-50 hover:scale-[1.02] active:scale-95"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fas fa-circle-notch animate-spin"></i>
                Syncing...
              </span>
            ) : isLogin ? `Access ${role} Unit` : `Initialize ${role} Profile`}
          </button>
        </form>

        {isLogin && role === UserRole.ADMIN && (
          <div className="mt-10 p-5 bg-card-inner rounded-3xl border border-border-app text-center animate-fade-in group hover:bg-white/10 transition-all">
            <p className="text-[9px] font-black uppercase opacity-30 mb-2 tracking-[0.2em] text-text-muted">Root Debug Uplink</p>
            <p className="text-[11px] font-bold text-[#03DAC6] tracking-widest">admin@hostelx.com</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthView;
