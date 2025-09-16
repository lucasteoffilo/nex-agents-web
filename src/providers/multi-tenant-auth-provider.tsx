'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext, User, Tenant, Permission, UserRole } from '@/types';
import apiService from '@/services/api';
import tenantService from '@/services/tenant-service';
import permissionService from '@/services/permission-service';
import { redirectToDashboard } from '@/utils/navigation';

interface MultiTenantAuthContextType extends AuthContext {
  // Estados de loading
  isLoading: boolean;
  isInitialized: boolean;
  
  // Métodos de autenticação
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    tenantName?: string;
  }) => Promise<void>;
  
  // Gerenciamento de tenant
  refreshTenantData: () => Promise<void>;
  getTenantHierarchy: () => Promise<void>;
  
  // Estados de erro
  error: string | null;
  clearError: () => void;
}

const MultiTenantAuthContext = createContext<MultiTenantAuthContextType | undefined>(undefined);

export function MultiTenantAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  
  // Estados principais
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([]);
  const [currentTenantPath, setCurrentTenantPath] = useState<string[]>([]);
  
  // Estados de controle
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para verificar se pode acessar um tenant
  const canAccessTenant = useCallback((tenantId: string): boolean => {
    if (!user || !tenant) return false;
    
    // Admin de sistema pode acessar qualquer tenant
    if (user.role.level === 'system') return true;
    
    // Verificar se o tenant está na lista de tenants disponíveis
    return availableTenants.some(t => t.id === tenantId);
  }, [user, tenant, availableTenants]);

  // Função para verificar permissões
  const hasPermission = useCallback((resource: string, action: string, scope?: string): boolean => {
    if (!permissions.length) return false;
    
    // Admin de sistema tem todas as permissões
    if (user?.role.level === 'system') return true;
    
    // Verificar permissões específicas
    return permissions.some(permission => {
      const resourceMatch = permission.resource === resource || permission.resource === '*';
      const actionMatch = permission.action === action || permission.action === '*';
      const scopeMatch = !scope || permission.scope === scope || permission.scope === 'all';
      
      return resourceMatch && actionMatch && scopeMatch;
    });
  }, [permissions, user]);

  // Função para trocar de tenant
  const switchTenant = useCallback(async (tenantId: string): Promise<void> => {
    if (!canAccessTenant(tenantId)) {
      throw new Error('Acesso negado ao tenant solicitado');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await tenantService.switchTenant(tenantId);
      
      if (response.success && response.data) {
        // Atualizar token
        localStorage.setItem('nex_token', response.data.token);
        document.cookie = `current_tenant=${tenantId}; path=/`;
        
        // Atualizar estados
        setTenant(response.data.tenant);
        // Converter permissões se necessário
        const permissions = Array.isArray(response.data.permissions) 
          ? response.data.permissions.map((perm: any) => 
              typeof perm === 'string' 
                ? { id: perm, slug: perm, name: perm, resource: '*', action: '*', scope: 'all' as const }
                : perm
            )
          : [];
        setPermissions(permissions);
        
        // Atualizar caminho do tenant
        const pathResponse = await tenantService.getTenantPath(tenantId);
        if (pathResponse.success && pathResponse.data) {
          setCurrentTenantPath(pathResponse.data.map(t => t.id));
        }
        
        // Redirecionar para dashboard
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao trocar de tenant');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [canAccessTenant, router]);

  // Função de login
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.login(email, password);
      
      // Debug: log da resposta completa
      console.log('Resposta completa da API:', response);
      console.log('Tipo da resposta:', typeof response);
      console.log('AccessToken presente:', !!response?.accessToken);
      
      // Verificar se a resposta tem a estrutura esperada
      if (!response || !response.accessToken) {
        console.error('Estrutura da resposta inválida:', response);
        throw new Error('Resposta inválida do servidor');
      }
      
      // A resposta já vem diretamente do apiService.login
      localStorage.setItem('nex_token', response.accessToken);
      if (response.refreshToken) {
        localStorage.setItem('nex_refresh_token', response.refreshToken);
      }
      
      // Definir dados do usuário diretamente da resposta
      console.log('Definindo estado do usuário...');
      setUser(response.user);
      if (response.tenant) {
        setTenant(response.tenant);
        // Salvar tenant ID no localStorage para uso nos headers das requisições
        localStorage.setItem('current_tenant_id', response.tenant.id);
      }
      if (response.permissions) {
        // Se as permissões vêm como array de strings (slugs), converter para objetos Permission
        const permissions = Array.isArray(response.permissions) 
          ? response.permissions.map((perm: any) => 
              typeof perm === 'string' 
                ? { id: perm, slug: perm, name: perm, resource: '*', action: '*', scope: 'all' as const }
                : perm
            )
          : [];
        setPermissions(permissions);
      }
      if (response.availableTenants) {
        setAvailableTenants(response.availableTenants);
      }
      
      // Forçar atualização do estado
      console.log('Estado definido, aguardando atualização...');
      
      // Salvar token nos cookies para o middleware com configuração mais robusta
      const cookieOptions = [
        `nex_token=${response.accessToken}`,
        'path=/',
        `max-age=${7 * 24 * 60 * 60}`,
        'samesite=lax',
        process.env.NODE_ENV === 'production' ? 'secure' : ''
      ].filter(Boolean).join('; ');
      
      document.cookie = cookieOptions;
      console.log('Token salvo nos cookies:', response.accessToken.substring(0, 20) + '...');
      
      // Salvar tenant ID nos cookies se disponível
      if (response.tenant) {
        const tenantCookieOptions = [
          `current_tenant=${response.tenant.id}`,
          'path=/',
          `max-age=${7 * 24 * 60 * 60}`,
          'samesite=lax',
          process.env.NODE_ENV === 'production' ? 'secure' : ''
        ].filter(Boolean).join('; ');
        
        document.cookie = tenantCookieOptions;
      }
      
      console.log('Login bem-sucedido, redirecionando para dashboard...');
      console.log('Dados do usuário:', response.user);
      console.log('Dados do tenant:', response.tenant);
      console.log('Permissões:', response.permissions);
      
      // Verificar se estamos em uma página de debug
      const isDebugPage = window.location.pathname.includes('login-debug') || window.location.pathname.includes('debug-auth');
      
      if (isDebugPage) {
        console.log('🔍 MODO DEBUG: Redirecionamento automático desabilitado');
        console.log('=== DADOS DO LOGIN ===');
        console.log('URL atual:', window.location.href);
        console.log('Cookies atuais:', document.cookie);
        console.log('LocalStorage:', {
          nex_token: localStorage.getItem('nex_token')?.substring(0, 20) + '...',
          current_tenant_id: localStorage.getItem('current_tenant_id')
        });
        console.log('=== FIM DOS DADOS ===');
        return; // Não redirecionar em modo debug
      }
      
      // Aguardar mais tempo para debug e garantir que os cookies sejam definidos
      setTimeout(() => {
        console.log('=== INICIANDO REDIRECIONAMENTO ===');
        console.log('URL atual:', window.location.href);
        console.log('Cookies atuais:', document.cookie);
        console.log('LocalStorage:', {
          nex_token: localStorage.getItem('nex_token')?.substring(0, 20) + '...',
          current_tenant_id: localStorage.getItem('current_tenant_id')
        });
        
        // Usar função de redirecionamento segura
        console.log('Redirecionando para /dashboard...');
        redirectToDashboard(router);
      }, 1000); // Aumentei para 1 segundo para dar tempo de ver os logs
    } catch (err: any) {
      console.error('Erro detalhado no login:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Erro ao fazer login';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Função de logout
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      await apiService.logout();
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    } finally {
      // Limpar dados locais e cookies
      localStorage.removeItem('nex_token');
      localStorage.removeItem('nex_refresh_token');
      localStorage.removeItem('current_tenant_id');
      document.cookie = 'nex_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      document.cookie = 'current_tenant=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      
      // Resetar estados
      setUser(null);
      setTenant(null);
      setPermissions([]);
      setAvailableTenants([]);
      setCurrentTenantPath([]);
      setIsLoading(false);
      
      router.push('/login');
    }
  }, [router]);

  // Função de registro
  const register = useCallback(async (data: {
    name: string;
    email: string;
    password: string;
    tenantName?: string;
  }): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = data.tenantName 
        ? await apiService.registerAdmin({
            name: data.name,
            email: data.email,
            password: data.password,
            tenantName: data.tenantName
          })
        : await apiService.register(data);
      
      if (response.success) {
        // Auto-login após registro
        await login(data.email, data.password);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar conta');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  // Função para carregar dados do usuário
  const loadUserData = useCallback(async (): Promise<void> => {
    try {
      const [profileResponse, tenantsResponse] = await Promise.all([
        apiService.getProfile(),
        tenantService.getAvailableTenants()
      ]);
      
      if (profileResponse.success && profileResponse.data) {
        setUser(profileResponse.data.user);
        setTenant(profileResponse.data.tenant);
        
        // Carregar permissões do usuário apenas se temos user e tenant
        if (profileResponse.data.user && profileResponse.data.tenant) {
          const permissionsResponse = await permissionService.getUserPermissions(
            profileResponse.data.user.id,
            profileResponse.data.tenant.id
          );
          
          if (permissionsResponse.success && permissionsResponse.data) {
            setPermissions(permissionsResponse.data.permissions);
          }
          
          // Carregar caminho do tenant
          const pathResponse = await tenantService.getTenantPath(profileResponse.data.tenant.id);
          if (pathResponse.success && pathResponse.data) {
            setCurrentTenantPath(pathResponse.data.map(t => t.id));
          }
        }
      }
      
      if (tenantsResponse.success && tenantsResponse.data) {
        setAvailableTenants(tenantsResponse.data);
      }
    } catch (err: any) {
      console.error('Erro ao carregar dados do usuário:', err);
      // Se houver erro de autenticação, fazer logout
      if (err.response?.status === 401) {
        await logout();
      }
    }
  }, [logout]);

  // Função para atualizar dados do tenant
  const refreshTenantData = useCallback(async (): Promise<void> => {
    if (!tenant) return;
    
    try {
      const response = await tenantService.getTenant(tenant.id);
      if (response.success && response.data) {
        setTenant(response.data);
      }
    } catch (err) {
      console.error('Erro ao atualizar dados do tenant:', err);
    }
  }, [tenant]);

  // Função para carregar hierarquia do tenant
  const getTenantHierarchy = useCallback(async (): Promise<void> => {
    if (!tenant) return;
    
    try {
      const response = await tenantService.getTenantHierarchy(tenant.id);
      if (response.success && response.data) {
        // Processar hierarquia se necessário
        console.log('Hierarquia do tenant:', response.data);
      }
    } catch (err) {
      console.error('Erro ao carregar hierarquia do tenant:', err);
    }
  }, [tenant]);

  // Função para limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Inicialização
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('nex_token');
      
      if (token) {
        try {
          await loadUserData();
        } catch (err) {
          console.log('Erro na inicialização, removendo token inválido');
          localStorage.removeItem('nex_token');
          localStorage.removeItem('nex_refresh_token');
          localStorage.removeItem('current_tenant_id');
          document.cookie = 'nex_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          document.cookie = 'current_tenant=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
      }
      
      setIsInitialized(true);
    };
    
    initializeAuth();
  }, [loadUserData]);

  // Valor do contexto
  const contextValue: MultiTenantAuthContextType = {
    // Estados principais
    user,
    tenant,
    permissions,
    availableTenants,
    currentTenantPath,
    
    // Funções de verificação
    canAccessTenant,
    hasPermission,
    switchTenant,
    
    // Funções de autenticação
    login,
    logout,
    register,
    
    // Funções de gerenciamento
    refreshTenantData,
    getTenantHierarchy,
    
    // Estados de controle
    isLoading,
    isInitialized,
    error,
    clearError,
  };

  return (
    <MultiTenantAuthContext.Provider value={contextValue}>
      {children}
    </MultiTenantAuthContext.Provider>
  );
}

// Hook para usar o contexto
export function useMultiTenantAuth() {
  const context = useContext(MultiTenantAuthContext);
  if (context === undefined) {
    throw new Error('useMultiTenantAuth deve ser usado dentro de um MultiTenantAuthProvider');
  }
  return context;
}

// Hook para verificar permissões
export function usePermissions() {
  const { hasPermission, permissions, user } = useMultiTenantAuth();
  
  return {
    hasPermission,
    permissions,
    isSystemAdmin: user?.role.level === 'system',
    isTenantAdmin: user?.role.level === 'tenant',
    isUser: user?.role.level === 'user',
  };
}

// Hook para gerenciamento de tenant
export function useTenant() {
  const {
    tenant,
    availableTenants,
    currentTenantPath,
    canAccessTenant,
    switchTenant,
    refreshTenantData,
    getTenantHierarchy,
  } = useMultiTenantAuth();
  
  return {
    tenant,
    availableTenants,
    currentTenantPath,
    canAccessTenant,
    switchTenant,
    refreshTenantData,
    getTenantHierarchy,
  };
}