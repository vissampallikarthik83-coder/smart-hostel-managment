
import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import AuthView from './views/AuthView';
import Dashboard from './views/Dashboard';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('hostelx_theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('hostelx_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
    localStorage.setItem('hostelx_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('hostelx_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('hostelx_user');
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-app-main">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00D4FF] border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="font-orbitron text-xl tracking-widest uppercase">Initializing Core...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-main transition-colors duration-300">
      {!user ? (
        <AuthView onLogin={handleLogin} />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />
      )}
    </div>
  );
};

export default App;
