
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { User, UserRole } from '../types.ts';
import StudentView from './StudentView.tsx';
import WardenView from './WardenView.tsx';
import AdminView from './AdminView.tsx';
import SecurityView from './SecurityView.tsx';
import ProfileView from './ProfileView.tsx';
import Chatbot from '../components/Chatbot.tsx';

const Dashboard: React.FC = () => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  if (!user) return null; // Should be handled by ProtectedRoute but safety check


  const getThemeColor = () => {
    switch (user.role) {
      case UserRole.STUDENT: return '#00D4FF';
      case UserRole.WARDEN: return '#BB86FC';
      case UserRole.ADMIN: return '#03DAC6';
      case UserRole.SECURITY: return '#CF6679';
      default: return '#ffffff';
    }
  };

  const themeColor = getThemeColor();

  const renderView = () => {
    if (activeTab === 'profile') {
      return <ProfileView user={user} themeColor={themeColor} />;
    }

    switch (user.role) {
      case UserRole.STUDENT: return <StudentView user={user} activeTab={activeTab} />;
      case UserRole.WARDEN: return <WardenView user={user} activeTab={activeTab} />;
      case UserRole.ADMIN: return <AdminView user={user} activeTab={activeTab} />;
      case UserRole.SECURITY: return <SecurityView user={user} activeTab={activeTab} />;
      default: return <div className="p-20 text-center opacity-20 font-black tracking-widest">UPLINK_DENIED</div>;
    }
  };

  return (
    <div className="flex h-screen bg-app-main text-text-main overflow-hidden transition-colors duration-500">
      {/* Sidebar */}
      <aside className="w-20 md:w-72 flex flex-col border-r border-border-app bg-app-side transition-all relative z-50 shadow-2xl">
        <div className="p-10 flex items-center justify-center md:justify-start gap-5">
          <div
            style={{ backgroundColor: themeColor, boxShadow: `0 0 25px ${themeColor}60` }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-black text-2xl font-orbitron rotate-3"
          >
            X
          </div>
          <div className="hidden md:block">
            <h1 className="font-orbitron font-black text-2xl tracking-tighter uppercase leading-none">
              Hostel<span style={{ color: themeColor }}>X</span>
            </h1>
            <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.4em] mt-1">Titan Core</p>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-3 mt-8 overflow-y-auto">
          <NavItem icon="fas fa-th-large" label="System Overview" active={activeTab === 'home'} onClick={() => setActiveTab('home')} themeColor={themeColor} />

          <div className="py-4">
            <div className="h-px bg-white/5 w-full"></div>
          </div>

          {user.role === UserRole.STUDENT && (
            <>
              <NavItem icon="fas fa-bullhorn" label="Broadcasts" active={activeTab === 'announcements'} onClick={() => setActiveTab('announcements')} themeColor={themeColor} />
              <NavItem icon="fas fa-exclamation-triangle" label="Complaints" active={activeTab === 'complaints'} onClick={() => setActiveTab('complaints')} themeColor={themeColor} />
              <NavItem icon="fas fa-plane-departure" label="Gate Pass" active={activeTab === 'leave'} onClick={() => setActiveTab('leave')} themeColor={themeColor} />
              <NavItem icon="fas fa-kit-medical" label="Medical Bay" active={activeTab === 'medical'} onClick={() => setActiveTab('medical')} themeColor={themeColor} />
              <NavItem icon="fas fa-utensils" label="Mess Hub" active={activeTab === 'mess'} onClick={() => setActiveTab('mess')} themeColor={themeColor} />
              <NavItem icon="fas fa-lightbulb" label="Suggestions" active={activeTab === 'suggestions'} onClick={() => setActiveTab('suggestions')} themeColor={themeColor} />
              <NavItem icon="fas fa-history" label="Gate History" active={activeTab === 'history'} onClick={() => setActiveTab('history')} themeColor={themeColor} />
            </>
          )}

          {user.role === UserRole.WARDEN && (
            <>
              <NavItem icon="fas fa-clock" label="Pending Feed" active={activeTab === 'approvals'} onClick={() => setActiveTab('approvals')} themeColor={themeColor} />
              <NavItem icon="fas fa-history" label="Nexus History" active={activeTab === 'history'} onClick={() => setActiveTab('history')} themeColor={themeColor} />
              <NavItem icon="fas fa-broadcast-tower" label="Admin Transmissions" active={activeTab === 'announcements'} onClick={() => setActiveTab('announcements')} themeColor={themeColor} />
              <NavItem icon="fas fa-lightbulb" label="Suggestions" active={activeTab === 'suggestions'} onClick={() => setActiveTab('suggestions')} themeColor={themeColor} />
              <NavItem icon="fas fa-utensils" label="Mess Management" active={activeTab === 'mess'} onClick={() => setActiveTab('mess')} themeColor={themeColor} />
            </>
          )}

          {user.role === UserRole.ADMIN && (
            <>
              <NavItem icon="fas fa-bullhorn" label="Global Broadcast" active={activeTab === 'announcements'} onClick={() => setActiveTab('announcements')} themeColor={themeColor} />
              <NavItem icon="fas fa-chart-line" label="Realtime Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} themeColor={themeColor} />
              <NavItem icon="fas fa-lightbulb" label="Suggestions" active={activeTab === 'suggestions'} onClick={() => setActiveTab('suggestions')} themeColor={themeColor} />
              <NavItem icon="fas fa-utensils" label="Mess Control" active={activeTab === 'mess'} onClick={() => setActiveTab('mess')} themeColor={themeColor} />
            </>
          )}

          {user.role === UserRole.SECURITY && (
            <>
              <NavItem icon="fas fa-fingerprint" label="Gate Uplink" active={activeTab === 'gate'} onClick={() => setActiveTab('gate')} themeColor={themeColor} />
              <NavItem icon="fas fa-bullhorn" label="Security Directives" active={activeTab === 'announcements'} onClick={() => setActiveTab('announcements')} themeColor={themeColor} />
            </>
          )}

          <div className="pt-8 border-t border-border-app mt-8">
            <NavItem icon="fas fa-user-shield" label="Personnel File" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} themeColor={themeColor} />
          </div>
        </nav>

        <div className="p-6 mt-auto">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center md:justify-start gap-5 p-5 text-red-500 hover:bg-red-500/10 rounded-2xl transition-all group border border-transparent hover:border-red-500/20"
          >
            <i className="fas fa-power-off group-hover:rotate-180 transition-transform duration-500"></i>
            <span className="hidden md:block font-black text-[10px] uppercase tracking-[0.3em]">Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <header className="h-24 border-b border-border-app flex items-center justify-between px-12 bg-header-glass backdrop-blur-3xl z-40">
          <div className="flex items-center gap-6">
            <h2 className="text-sm font-orbitron font-black tracking-[0.4em] uppercase text-text-main">
              {activeTab === 'home' ? 'Node Overview' : activeTab.replace('-', ' ')} <span style={{ color: themeColor }} className="opacity-80">Portal</span>
            </h2>
          </div>
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-3 text-[11px] font-black uppercase tracking-widest opacity-40">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
              Synchronized
            </div>
            <button
              onClick={toggleTheme}
              className="w-12 h-12 rounded-2xl bg-card-inner flex items-center justify-center hover:bg-opacity-100 transition-all border border-border-app group shadow-xl"
            >
              <i className={`fas ${theme === 'dark' ? 'fa-sun text-yellow-400' : 'fa-moon text-blue-500'} group-hover:scale-110 transition-transform`}></i>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 bg-app-main scroll-smooth relative z-10">
          <div className="max-w-7xl mx-auto">
            {renderView()}
          </div>
        </div>
      </main>

      <Chatbot userRole={user.role} />
    </div>
  );
};

interface NavItemProps {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
  themeColor: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick, themeColor }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-center md:justify-start gap-6 p-5 rounded-3xl transition-all group relative border ${active ? 'bg-card-inner border-border-strong shadow-2xl' : 'opacity-60 hover:opacity-100 hover:bg-card-inner hover:border-border-app border-transparent text-text-secondary hover:text-text-main'}`}
  >
    <i className={`${icon} text-xl transition-all duration-300 ${active ? 'scale-110' : 'group-hover:scale-125'}`} style={{ color: active ? themeColor : '' }}></i>
    <span className="hidden md:block font-black text-[10px] uppercase tracking-[0.3em]">{label}</span>
    {active && (
      <div
        className="absolute left-0 w-1.5 h-8 rounded-r-full"
        style={{ backgroundColor: themeColor, boxShadow: `0 0 15px ${themeColor}` }}
      ></div>
    )}
  </button>
);

export default Dashboard;
