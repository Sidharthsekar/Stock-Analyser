import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AuthenticatedUser } from '@stock-analyser/shared';
import { apiClient, handleApiError } from '../lib/api';

interface AuthContextType {
  user: AuthenticatedUser | null;
  loading: boolean;
  authenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setSessionExpired: (message?: string) => void;
  sessionExpiredMessage: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiClient.get<any>('/api/auth/me');
        if (response.data.success && response.data.data?.user) {
          setUser(response.data.data.user);
        }
      } catch (error) {
        // Not authenticated, which is fine
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post<any>('/api/auth/login', { email, password });
      if (response.data.success && response.data.data?.user) {
        setUser(response.data.data.user);
        setSessionExpiredMessage(null);
      }
    } catch (error) {
      await handleApiError(error);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (error) {
      // Ignore errors on logout
    } finally {
      setUser(null);
      setSessionExpiredMessage(null);
    }
  };

  const setSessionExpired = (message?: string) => {
    setUser(null);
    setSessionExpiredMessage(message || 'Your session has expired. Please log in again.');
  };

  const value: AuthContextType = {
    user,
    loading,
    authenticated: user !== null,
    login,
    logout,
    setSessionExpired,
    sessionExpiredMessage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
