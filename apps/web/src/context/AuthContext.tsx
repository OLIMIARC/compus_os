'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';

interface User {
    id: string;
    full_name: string;
    email?: string;
    phone?: string;
    username?: string;
    campus_id: string;
    roles: string;
    reputation_score: number;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        try {
            const profile = await api.getProfile();
            setUser(profile);
        } catch (error) {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }

    async function login(email: string, password: string) {
        const { user: userData } = await api.login(email, password);
        setUser(userData);
    }

    async function register(userData: any) {
        const { user: newUser } = await api.register(userData);
        setUser(newUser);
    }

    function logout() {
        api.logout();
        setUser(null);
    }

    async function refreshUser() {
        const profile = await api.getProfile();
        setUser(profile);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
