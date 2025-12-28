
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import StudentView from './StudentView';
import WardenView from './WardenView';
import AdminView from './AdminView';
import SecurityView from './SecurityView';
import Chatbot from '../components/Chatbot';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, theme, toggleTheme }) => {
  const [activeTab, setActiveTab] = useState('home');

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
    switch (user.role) {
      case UserRole.STUDENT: return <StudentView user={user} activeTab={activeTab} />;
      case UserRole.WARDEN: return <WardenView user={user} activeTab={activeTab} />;
      case UserRole.ADMIN: return <AdminView user={user} activeTab={activeTab} />;
      case UserRole.SECURITY: return <SecurityView user={user} activeTab={activeTab} />;
      default: return <div>Unauthorized Access</div>;
    }
  };

  return (
    <div className="flex h-screen bg-app-main text-text-main overflow-hidden transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-20 md:w-64 flex flex-col border-r border-border-app bg-app-side transition-all">
        <div className="p-6 flex items-center justify-center md:justify-start gap-3">
          <div 
            style={{ backgroundColor: themeColor }}
            className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-black text-lg"
          >
            H
          </div>
          <span className="hidden md:block font-orbitron font-bold text-lg tracking-tighter">
            HOSTEL<span style={{ color: themeColor }}>X</span>
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          <NavItem icon="fas fa-th-large" label="Overview" active={activeTab === 'home'} onClick={() => setActiveTab('home')} themeColor={themeColor} />
          
          {user.role === UserRole.STUDENT && (
            <>
              <NavItem icon="fas fa-bullhorn" label="Announcements" active={activeTab === 'announcements'} onClick={() => setActiveTab('announcements')} themeColor={themeColor} />
              <NavItem icon="fas fa-exclamation-triangle" label="Complaints" active={activeTab === 'complaints'} onClick={() => setActiveTab('complaints')} themeColor={themeColor} />
              <NavItem icon="fas fa-plane-departure" label="Leave Requests" active={activeTab === 'leave'} onClick={() => setActiveTab('leave')} themeColor={themeColor} />
              <NavItem icon="fas fa-utensils" label="Mess Management" active={activeTab === 'mess'} onClick={() => setActiveTab('mess')} themeColor={themeColor} />
            </>
          )}

          {user.role === UserRole.WARDEN && (
            <>
              <NavItem icon="fas fa-clock" label="Pending Approvals" active={activeTab === 'approvals'} onClick={() => setActiveTab('approvals')} themeColor={themeColor} />
              <NavItem icon="fas fa-history" label="Action History" active={activeTab === 'history'} onClick={() => setActiveTab('history')} themeColor={themeColor} />
              <NavItem icon="fas fa-broadcast-tower" label="Admin Broadcasts" active={activeTab === 'announcements'} onClick={() => setActiveTab('announcements')} themeColor={themeColor} />
              <NavItem icon="fas fa-chart-pie" label="AI Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} themeColor={themeColor} />
            </>
          )}

          {user.role === UserRole.ADMIN && (
            <>
              <NavItem icon="fas fa-bullhorn" label="Broadcast Center" active={activeTab === 'announcements'} onClick={() => setActiveTab('announcements')} themeColor={themeColor} />
              <NavItem icon="fas fa-check-circle" label="Warden Approvals" active={activeTab === 'approvals'} onClick={() => setActiveTab('approvals')} themeColor={themeColor} />
              <NavItem icon="fas fa-chart-line" label="System Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} themeColor={themeColor} />
            </>
          )}

          {user.role === UserRole.SECURITY && (
            <>
              <NavItem icon="fas fa-id-card" label="Gate Verification" active={activeTab === 'gate'} onClick={() => setActiveTab('gate')} themeColor={themeColor} />
              <NavItem icon="fas fa-bullhorn" label="Announcements" active={activeTab === 'announcements'} onClick={() => setActiveTab('announcements')} themeColor={themeColor} />
            </>
          )}
        </nav>

        <div className="p-4 mt-auto">
          <div className="cyber-card p-3 rounded-xl mb-4 hidden md:block">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-card-inner flex items-center justify-center overflow-hidden">
                <img src={`https://picsum.photos/seed/${user.id}/40/40`} alt="User" />
              </div>
              <div className="flex-1 truncate">
                <p className="text-sm font-bold truncate">{user.name}</p>
                <p className="text-[10px] opacity-50 uppercase">{user.role}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center md:justify-start gap-3 p-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
          >
            <i className="fas fa-sign-out-alt"></i>
            <span className="hidden md:block font-bold text-sm">Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-border-app flex items-center justify-between px-8 bg-header-glass backdrop-blur-md transition-colors duration-300">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-orbitron font-bold tracking-tight uppercase">
              {activeTab === 'home' ? 'Dashboard' : activeTab.replace('-', ' ')} <span style={{ color: themeColor }}>Portal</span>
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="w-10 h-10 rounded-lg bg-card-inner flex items-center justify-center hover:bg-opacity-80 transition-all border border-border-app"
              title="Toggle Theme"
            >
              <i className={`fas ${theme === 'dark' ? 'fa-sun text-yellow-400' : 'fa-moon text-blue-500'}`}></i>
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs opacity-50 font-mono">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              CORE_ACTIVE
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-app-main transition-colors duration-300">
          {renderView()}
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
    className={`w-full flex items-center justify-center md:justify-start gap-4 p-3 rounded-xl transition-all group relative ${active ? 'bg-card-inner' : 'opacity-50 hover:opacity-100 hover:bg-card-inner'}`}
  >
    <i className={`${icon} ${active ? '' : 'group-hover:scale-110'} transition-transform`} style={{ color: active ? themeColor : '' }}></i>
    <span className="hidden md:block font-bold text-sm text-left">{label}</span>
    {active && <div className="absolute left-0 w-1 h-8 rounded-r-full" style={{ backgroundColor: themeColor }}></div>}
  </button>
);

export default Dashboard;
