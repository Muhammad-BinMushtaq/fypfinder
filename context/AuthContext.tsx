'use client';
import { verifyAccessToken } from '@/lib/auth';
import User from '@/models/User';
import { IUser } from '@/types/user';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';


interface AuthContextType {
    user: IUser | null;
    accessToken: string | null;
    loading: boolean;
    setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
    setAccessToken: React.Dispatch<React.SetStateAction<string | null>>;
}

// -----------------------
// Create Context
// -----------------------
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// -----------------------
// Provider Component
// -----------------------
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<IUser | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Try refreshing token on app load
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const res = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });

                if (res.ok) {
                    const data = await res.json();
                    setAccessToken(data.accessToken);
                    setUser(data.user);
                } else {
                    setAccessToken(null);
                    setUser(null);
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, accessToken, loading, setUser, setAccessToken }}>
            {children}
        </AuthContext.Provider>
    );
};


//Custom hook for easy user of AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
