'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Cookies from 'js-cookie';

// Types
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'agent' | 'user';
  permissions: string[];
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshToken: () => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  tenantId?: string;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook para usar o contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Provider
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Verificar token ao carregar a aplicação
  useEffect(() => {
    checkAuth();
  }, []);

  // Verificar autenticação
  const checkAuth = async () => {
    try {
      // Verificar se estamos no cliente
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }
      
      const token = localStorage.getItem('nex_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Verificar se o token é válido
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Token inválido, remover
        if (typeof window !== 'undefined') {
          localStorage.removeItem('nex_token');
          localStorage.removeItem('nex_refresh_token');
          Cookies.remove('nex_token');
          Cookies.remove('nex_refresh_token');
        }
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('nex_token');
        localStorage.removeItem('nex_refresh_token');
        Cookies.remove('nex_token');
        Cookies.remove('nex_refresh_token');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Login
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const authResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!authResponse.ok) {
        const error = await authResponse.json();
        throw new Error(error.message || 'Erro ao fazer login');
      }

      const { user: userData, accessToken, refreshToken } = await authResponse.json();
      
      // Salvar tokens no localStorage e cookies
      if (typeof window !== 'undefined') {
        localStorage.setItem('nex_token', accessToken);
        localStorage.setItem('nex_refresh_token', refreshToken);
        
        // Salvar também em cookies para o middleware
        Cookies.set('nex_token', accessToken, { expires: 7, secure: process.env.NODE_ENV === 'production' });
        Cookies.set('nex_refresh_token', refreshToken, { expires: 30, secure: process.env.NODE_ENV === 'production' });
      }
      
      setUser(userData);
      toast.success('Login realizado com sucesso!');
      
      // Redirecionar para dashboard
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer login');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Chamar endpoint de logout
      const token = typeof window !== 'undefined' ? localStorage.getItem('nex_token') : null;
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'API-Version': 'v1',
          },
        });
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      // Limpar dados locais e cookies
      if (typeof window !== 'undefined') {
        localStorage.removeItem('nex_token');
        localStorage.removeItem('nex_refresh_token');
        Cookies.remove('nex_token');
        Cookies.remove('nex_refresh_token');
      }
      setUser(null);
      setIsLoading(false);
      
      toast.success('Logout realizado com sucesso!');
      router.push('/login');
    }
  };

  // Registro
  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar conta');
      }

      const { user: userData, accessToken, refreshToken } = await response.json();
      
      // Salvar tokens
      if (typeof window !== 'undefined') {
        localStorage.setItem('nex_token', accessToken);
        localStorage.setItem('nex_refresh_token', refreshToken);
      }
      
      setUser(userData);
      toast.success('Conta criada com sucesso!');
      
      // Redirecionar para dashboard
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar conta');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar perfil
  const updateProfile = async (data: Partial<User>) => {
    try {
      setIsLoading(true);
      
      const token = localStorage.getItem('nex_token');
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao atualizar perfil');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar perfil');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh token
  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem('nex_refresh_token');
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const { accessToken, refreshToken: newRefreshToken } = await response.json();
      
      localStorage.setItem('nex_token', accessToken);
      localStorage.setItem('nex_refresh_token', newRefreshToken);
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      // Se falhar, fazer logout
      logout();
    }
  };

  // Interceptar requisições para renovar token automaticamente
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      
      // Se receber 401, tentar renovar token
      if (response.status === 401 && isAuthenticated) {
        try {
          await refreshToken();
          // Tentar novamente a requisição original
          const token = localStorage.getItem('nex_token');
          if (token && args[1]) {
            args[1].headers = {
              ...args[1].headers,
              Authorization: `Bearer ${token}`,
            };
            return originalFetch(...args);
          }
        } catch (error) {
          // Se falhar, fazer logout
          logout();
        }
      }
      
      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [isAuthenticated]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    register,
    updateProfile,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}