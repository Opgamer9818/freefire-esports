import { createContext, useContext, useState, ReactNode } from 'react';
import { api, setToken, clearToken } from '../api/client';

interface Admin {
  id: string;
  username: string;
  role: string;
}

interface AuthContextValue {
  admin: Admin | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(() => {
    const raw = localStorage.getItem('admin_info');
    return raw ? JSON.parse(raw) : null;
  });

  async function login(username: string, password: string) {
    const result = await api.post<{ token: string; admin: Admin }>('/admin/auth/login', { username, password });
    setToken(result.token);
    localStorage.setItem('admin_info', JSON.stringify(result.admin));
    setAdmin(result.admin);
  }

  function logout() {
    clearToken();
    localStorage.removeItem('admin_info');
    setAdmin(null);
  }

  return <AuthContext.Provider value={{ admin, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
