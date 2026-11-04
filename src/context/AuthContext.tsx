import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { storageService } from '../services/storage';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (usernameOrReg: string, pass: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updated: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  register: async () => false,
  logout: async () => {},
  updateUser: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await storageService.getItem('auth_token');
      const userJson = await storageService.getItem('current_user');
      if (token && userJson) {
        setUser(JSON.parse(userJson));
      }
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (usernameOrReg: string, pass: string): Promise<boolean> => {
    try {
      const res = await api.login(usernameOrReg, pass);
      setUser(res.user);
      return true;
    } catch (e) {
      return false;
    }
  };

  const register = async (data: any): Promise<boolean> => {
    try {
      const res = await api.register(data);
      setUser(res.user);
      return true;
    } catch (e) {
      return false;
    }
  };

  const logout = async () => {
    try {
      await storageService.removeItem('auth_token');
      await storageService.removeItem('current_user');
      setUser(null);
    } catch (e) {}
  };

  const updateUser = (updated: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...updated };
      storageService.setItem('current_user', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
