
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthView from './views/AuthView';
import Dashboard from './views/Dashboard';
import { UserRole } from './types';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactElement, allowedRoles?: UserRole[] }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-app-main p-6 text-center text-text-main">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 border-4 border-[#00D4FF]/10 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-[#00D4FF] border-t-transparent rounded-full animate-spin"></div>
      </div>
      <h2 className="font-orbitron text-[10px] tracking-[0.8em] uppercase text-[#00D4FF] animate-pulse">Authenticating Uplink</h2>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />; // Or back to their dashboard
  }

  return children;
};

const AppContent = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <AuthView /> : <Navigate to="/dashboard" replace />} />

      {/* 
         In this architecture, 'Dashboard' acts as the layout shell. 
         Ideally we'd have sub-routes like /dashboard/complaints, 
         but to preserve existing structure while improving it, 
         we keep Dashboard as the main entry for authenticated users.
      */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-app-main text-text-main transition-colors duration-500">
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
