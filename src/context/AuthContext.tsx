import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, EmployeeProfile, UserRole } from '../types';
import { api, setStoredToken, clearStoredToken, getStoredToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  employee: EmployeeProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchRoleDemo: (role: UserRole) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = async () => {
    try {
      const res = await api.getMe();
      if (res.success) {
        setUser(res.user);
        setEmployee(res.employee);
      } else {
        logout();
      }
    } catch (err) {
      console.warn('Authentication token invalid or expired:', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      if (res.success && res.token) {
        setStoredToken(res.token);
        setToken(res.token);
        setUser(res.user);
        setEmployee(res.employee);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearStoredToken();
    setToken(null);
    setUser(null);
    setEmployee(null);
  };

  const switchRoleDemo = async (role: UserRole) => {
    const creds: Record<UserRole, { email: string; pass: string }> = {
      hr: { email: 'hr@staffsync.com', pass: 'password123' },
      manager: { email: 'manager@staffsync.com', pass: 'password123' },
      employee: { email: 'employee@staffsync.com', pass: 'password123' },
    };
    const target = creds[role];
    if (target) {
      await login(target.email, target.pass);
    }
  };

  const refreshProfile = async () => {
    if (token) {
      await fetchProfile();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        employee,
        token,
        isLoading,
        login,
        logout,
        switchRoleDemo,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
