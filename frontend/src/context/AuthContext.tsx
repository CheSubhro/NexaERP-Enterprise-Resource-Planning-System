import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { getCurrentUser, login as loginApi, logout as logoutApi } from '../lib/api/auth';

import type { LoginRequest, User } from '../types/auth';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (credentials: LoginRequest) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const isAuthenticated = !!user;

    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('nexaerp_token');

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const currentUser = await getCurrentUser();
                setUser(currentUser);
            } catch {
                localStorage.removeItem('nexaerp_token');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = async (credentials: LoginRequest) => {
        const response = await loginApi(credentials);

        localStorage.setItem('nexaerp_token', response.token);
        setUser(response.user);
    };

    const logout = async () => {
        try {
            await logoutApi();
        } finally {
            localStorage.removeItem('nexaerp_token');
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider');
    }

    return context;
}