
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '../types.ts';
import { AuthService } from '../services/authService.ts';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, role: string) => Promise<void>;
    logout: () => void;
    register: (name: string, email: string, role: UserRole) => Promise<void>;
    theme: 'dark' | 'light';
    toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        return (localStorage.getItem('hostelx_theme') as 'dark' | 'light') || 'dark';
    });

    useEffect(() => {

        // Initial Session Check
        AuthService.getCurrentUser()
            .then((u: User | null) => setUser(u))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        localStorage.setItem('hostelx_theme', theme);
        if (theme === 'light') document.body.classList.add('light-mode');
        else document.body.classList.remove('light-mode');
    }, [theme]);

    const login = async (email: string, role: string) => {
        const loggedInUser = await AuthService.login(email, role);
        setUser(loggedInUser);
    };

    const register = async (name: string, email: string, role: UserRole) => {
        const newUser = await AuthService.register(name, email, role);
        setUser(newUser);
    };

    const logout = () => {
        AuthService.logout();
        setUser(null);
    };

    const toggleTheme = () => setTheme((prev: 'dark' | 'light') => prev === 'dark' ? 'light' : 'dark');

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, register, theme, toggleTheme }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};
