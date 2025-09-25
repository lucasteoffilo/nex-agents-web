'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions?: Array<{
    resource: string;
    action: string;
    scope: string;
  }>;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  plan: string;
}

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, tenant: Tenant, token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tenant: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      
      setAuth: (user, tenant, token) => set({
        user,
        tenant,
        token,
        isAuthenticated: true,
        isLoading: false,
      }),
      
      clearAuth: () => set({
        user: null,
        tenant: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      }),
      
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      skipHydration: true,
    }
  )
);