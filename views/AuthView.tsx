
import React, { useState } from 'react';
import { UserRole, User } from '../types';

interface AuthViewProps {
  onLogin: (user: User) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const getRoleColor = (r: UserRole) => {
    switch (r) {
      case UserRole.STUDENT: return '#00D4FF';
      case UserRole.WARDEN: return '#BB86FC';
      case UserRole.ADMIN: return '#03DAC6';
      case UserRole.SECURITY: return '#CF6679';
      default: return '#ffffff';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: name || (role === UserRole.STUDENT ? 'Vissampalli Karthik' : role.charAt(0) + role.slice(1).toLowerCase()),
      email,
      role,
      idNumber: 'HX' + Math.floor(Math.random() * 100000).toString(),
      room: role === UserRole.STUDENT ? '402-B' : undefined
    };
    onLogin(mockUser);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-app-main p-4 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#00D4FF10] rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#BB86FC10] rounded-full blur-[100px]"></div>

      <div className="w-full max-w-md cyber-card p-8 rounded-2xl animate-fade-in relative z-10 bg-app-side">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black font-orbitron tracking-tighter italic mb-2">
            HOSTEL<span className="text-[#00D4FF]">X</span>
          </h1>
          <p className="opacity-50 text-xs tracking-widest uppercase">TechSprint 2025 | TITAN FORCE</p>
        </div>

        <div className="flex justify-center gap-4 mb-6">
          <button 
            onClick={() => setIsLogin(true)}
            className={`pb-1 px-4 font-black transition-all text-xs tracking-widest ${isLogin ? 'text-[#00D4FF] border-b-2 border-[#00D4FF]' : 'opacity-40 hover:opacity-100'}`}
          >
            LOGIN
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className={`pb-1 px-4 font-black transition-all text-xs tracking-widest ${!isLogin ? 'text-[#00D4FF] border-b-2 border-[#00D4FF]' : 'opacity-40 hover:opacity-100'}`}
          >
            SIGNUP
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-[10px] uppercase tracking-widest opacity-50 mb-1 font-black">Full Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-card-inner border border-border-app rounded-xl p-3 focus:outline-none focus:border-[#00D4FF] transition-all"
                placeholder="Enter your name"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] uppercase tracking-widest opacity-50 mb-1 font-black">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-card-inner border border-border-app rounded-xl p-3 focus:outline-none focus:border-[#00D4FF] transition-all"
              placeholder="name@university.edu"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest opacity-50 mb-1 font-black">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-card-inner border border-border-app rounded-xl p-3 focus:outline-none focus:border-[#00D4FF] transition-all"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest opacity-50 mb-2 font-black">Select Access Role</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(UserRole).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  style={{ borderColor: role === r ? getRoleColor(r) : '' }}
                  className={`border-2 p-3 rounded-xl text-[9px] font-black uppercase transition-all flex items-center justify-center gap-2 ${role === r ? 'bg-card-inner' : 'bg-card-inner opacity-40 hover:opacity-80 border-transparent'}`}
                >
                  <span style={{ backgroundColor: getRoleColor(r) }} className="w-2 h-2 rounded-full"></span>
                  {r}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-[#00D4FF] hover:bg-[#00b8e6] text-black font-black py-4 rounded-xl mt-4 transition-all uppercase tracking-[0.2em] shadow-lg shadow-[#00D4FF20] text-xs"
          >
            {isLogin ? 'Establish Uplink' : 'Initialize Account'}
          </button>
        </form>

        <p className="text-center text-[9px] opacity-40 mt-8 uppercase tracking-[0.4em] font-bold">
          TITAN FORCE SECURITY PROTOCOL
        </p>
      </div>
    </div>
  );
};

export default AuthView;
