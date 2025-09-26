'use client';

import { useState, useCallback, useEffect } from 'react';
import { Tenant, TenantHierarchy, PaginationParams, MultiTenantQuery, ApiResponse } from '@/types';
import tenantService from '@/services/tenant-service';
import { useMultiTenantAuth } from '@/providers/multi-tenant-auth-provider';

interface UseTenantsReturn {
  // Estado
  tenants: Tenant[];
  hierarchy: TenantHierarchy | null;
  loading: boolean;
  error: string | null;
  selectedTenant: Tenant | null;

  // Operações CRUD
  fetchTenants: (params?: PaginationParams & MultiTenantQuery) => Promise<void>;
  fetchTenantHierarchy: (tenantId?: string, maxDepth?: number) => Promise<void>;
  createTenant: (data: CreateTenantData) => Promise<Tenant | null>;
  updateTenant: (tenantId: string, data: Partial<Tenant>) => Promise<Tenant | null>;
  deleteTenant: (tenantId: string) => Promise<boolean>;

  // Utilitários
  selectTenant: (tenant: Tenant | null) => void;
  getSubTenants: (parentTenantId: string) => Tenant[];
  getTenantPath: (tenantId: string) => Promise<Tenant[] | null>;

  // Estado de paginação
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface CreateTenantData {
  name: string;
  slug: string;
  parentTenantId?: string;
  plan: 'free' | 'pro' | 'enterprise';
  settings?: any;
  metadata?: any;
}

export const useTenants = (): UseTenantsReturn => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [hierarchy, setHierarchy] = useState<TenantHierarchy | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const { user, tenant: currentTenant } = useMultiTenantAuth();

  // Buscar lista de tenants com filtros
  const fetchTenants = useCallback(async (params?: PaginationParams & MultiTenantQuery) => {
    setLoading(true);
    setError(null);

    try {
      const response = await tenantService.getAllTenants({
        ...params,
        ...(currentTenant && { tenantId: currentTenant.id })
      });

      if (response.success && response.data !== undefined) {
        const data: any = response.data as any;
        const tenantsData = Array.isArray(data)
          ? data
          : (data?.tenants || []);

        setTenants(tenantsData);

        const paginationMeta = response.meta || (Array.isArray(data) ? undefined : data);
        if (paginationMeta) {
          setPagination({
            page: paginationMeta.page || 1,
            limit: paginationMeta.limit || 20,
            total: paginationMeta.total || 0,
            totalPages: paginationMeta.totalPages || 0,
          });
        }
      } else {
        setError(response.error || 'Erro ao carregar tenants');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [currentTenant]);


  // Buscar hierarquia completa de tenants
  const fetchTenantHierarchy = useCallback(async (tenantId?: string, maxDepth: number = 3) => {
    setLoading(true);
    setError(null);

    try {
      const response = await tenantService.getTenantHierarchy(tenantId, maxDepth);

      if (response.success && response.data) {
        setHierarchy(response.data);
      } else {
        setError(response.error || 'Erro ao carregar hierarquia');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar novo tenant
  const createTenant = useCallback(async (data: CreateTenantData): Promise<Tenant | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await tenantService.createTenant(data);

      if (response.success && response.data) {
        // Atualizar lista local
        setTenants(prev => [...prev, response.data!]);
        return response.data;
      } else {
        setError(response.error || 'Erro ao criar tenant');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Atualizar tenant existente
  const updateTenant = useCallback(async (tenantId: string, data: Partial<Tenant>): Promise<Tenant | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await tenantService.updateTenant(tenantId, data);

      if (response.success && response.data) {
        // Atualizar lista local
        setTenants(prev => prev.map(t => t.id === tenantId ? response.data! : t));

        // Se o tenant selecionado foi atualizado, atualizar também
        if (selectedTenant?.id === tenantId) {
          setSelectedTenant(response.data);
        }

        return response.data;
      } else {
        setError(response.error || 'Erro ao atualizar tenant');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return null;
    } finally {
      setLoading(false);
    }
  }, [selectedTenant]);

  // Deletar tenant
  const deleteTenant = useCallback(async (tenantId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await tenantService.deleteTenant(tenantId);

      if (response.success) {
        // Remover da lista local
        setTenants(prev => prev.filter(t => t.id !== tenantId));

        // Se o tenant selecionado foi deletado, limpar seleção
        if (selectedTenant?.id === tenantId) {
          setSelectedTenant(null);
        }

        return true;
      } else {
        setError(response.error || 'Erro ao deletar tenant');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    } finally {
      setLoading(false);
    }
  }, [selectedTenant]);

  // Selecionar tenant
  const selectTenant = useCallback((tenant: Tenant | null) => {
    setSelectedTenant(tenant);
  }, []);

  // Obter sub-tenants de um parent
  const getSubTenants = useCallback((parentTenantId: string): Tenant[] => {
    return tenants.filter(t => t.parentTenantId === parentTenantId);
  }, [tenants]);

  // Obter caminho completo do tenant (hierarquia)
  const getTenantPath = useCallback(async (tenantId: string): Promise<Tenant[] | null> => {
    try {
      const response = await tenantService.getTenantPath(tenantId);
      return response.success ? response.data || null : null;
    } catch {
      return null;
    }
  }, []);

  // Carregar tenants inicialmente
  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  return {
    // Estado
    tenants,
    hierarchy,
    loading,
    error,
    selectedTenant,
    pagination,

    // Operações
    fetchTenants,
    fetchTenantHierarchy,
    createTenant,
    updateTenant,
    deleteTenant,

    // Utilitários
    selectTenant,
    getSubTenants,
    getTenantPath,
  };
};