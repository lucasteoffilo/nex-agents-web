'use client';

import { useState, useEffect, useCallback } from 'react';
import agentService, { Agent, CreateAgentDto, UpdateAgentDto, AgentStats } from '@/services/agent-service';
import { PaginationParams } from '@/types';
import { toast } from 'sonner';

interface UseAgentsParams {
  initialPage?: number;
  initialLimit?: number;
  autoFetch?: boolean;
}

interface UseAgentsReturn {
  // Estado dos dados
  agents: Agent[];
  stats: AgentStats | null;
  loading: boolean;
  error: string | null;
  
  // Paginação
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // Filtros
  filters: {
    search: string;
    type?: string;
    isActive?: boolean;
  };
  
  // Ações
  fetchAgents: (params?: PaginationParams & { type?: string; isActive?: boolean }) => Promise<void>;
  fetchAgentStats: () => Promise<void>;
  createAgent: (data: CreateAgentDto) => Promise<Agent | null>;
  updateAgent: (agentId: string, data: UpdateAgentDto) => Promise<Agent | null>;
  deleteAgent: (agentId: string) => Promise<boolean>;
  toggleAgentStatus: (agentId: string, isActive: boolean) => Promise<boolean>;
  searchAgents: (query: string) => Promise<void>;
  
  // Controles de filtro
  setSearch: (search: string) => void;
  setTypeFilter: (type?: string) => void;
  setActiveFilter: (isActive?: boolean) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  clearFilters: () => void;
  
  // Utilitários
  refreshAgents: () => Promise<void>;
  getAgentById: (agentId: string) => Agent | undefined;
}

export function useAgents({
  initialPage = 1,
  initialLimit = 10,
  autoFetch = true
}: UseAgentsParams = {}): UseAgentsReturn {
  // Estados principais
  const [agents, setAgents] = useState<Agent[]>([]);
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de paginação
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0
  });
  
  // Estados de filtros
  const [filters, setFilters] = useState({
    search: '',
    type: undefined as string | undefined,
    isActive: undefined as boolean | undefined
  });
  
  // Função para buscar agentes
  const fetchAgents = useCallback(async (params?: PaginationParams & { type?: string; isActive?: boolean }) => {
    try {
      setLoading(true);
      setError(null);
      
      const requestParams = {
        page: params?.page || pagination.page,
        limit: params?.limit || pagination.limit,
        search: params?.search || filters.search,
        type: params?.type || filters.type,
        isActive: params?.isActive !== undefined ? params.isActive : filters.isActive,
        ...params
      };
      
      const response = await agentService.getAgents(requestParams);
      
      if (response.success && response.data) {
        setAgents(response.data.agents);
        setPagination({
          page: response.data.page,
          limit: response.data.limit,
          total: response.data.total,
          totalPages: response.data.totalPages
        });
      } else {
        throw new Error(response.error || 'Erro ao carregar agentes');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast.error('Erro ao carregar agentes', {
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);
  
  // Função para buscar estatísticas
  const fetchAgentStats = useCallback(async () => {
    try {
      const response = await agentService.getAgentStats();
      
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        throw new Error(response.error || 'Erro ao carregar estatísticas');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('Erro ao carregar estatísticas:', errorMessage);
    }
  }, []);
  
  // Função para criar agente
  const createAgent = useCallback(async (data: CreateAgentDto): Promise<Agent | null> => {
    try {
      setLoading(true);
      
      const response = await agentService.createAgent(data);
      
      if (response.success && response.data) {
        toast.success('Agente criado com sucesso!');
        await refreshAgents();
        return response.data;
      } else {
        throw new Error(response.error || 'Erro ao criar agente');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error('Erro ao criar agente', {
        description: errorMessage
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Função para atualizar agente
  const updateAgent = useCallback(async (agentId: string, data: UpdateAgentDto): Promise<Agent | null> => {
    try {
      setLoading(true);
      
      const response = await agentService.updateAgent(agentId, data);
      
      if (response.success && response.data) {
        // Atualizar o agente na lista local
        setAgents(prev => prev.map(agent => 
          agent.id === agentId ? response.data! : agent
        ));
        
        toast.success('Agente atualizado com sucesso!');
        return response.data;
      } else {
        throw new Error(response.error || 'Erro ao atualizar agente');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error('Erro ao atualizar agente', {
        description: errorMessage
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Função para deletar agente
  const deleteAgent = useCallback(async (agentId: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const response = await agentService.deleteAgent(agentId);
      
      if (response.success) {
        // Remover o agente da lista local
        setAgents(prev => prev.filter(agent => agent.id !== agentId));
        
        toast.success('Agente deletado com sucesso!');
        await fetchAgentStats(); // Atualizar estatísticas
        return true;
      } else {
        throw new Error(response.error || 'Erro ao deletar agente');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error('Erro ao deletar agente', {
        description: errorMessage
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchAgentStats]);
  
  // Função para alternar status do agente
  const toggleAgentStatus = useCallback(async (agentId: string, isActive: boolean): Promise<boolean> => {
    try {
      const response = await agentService.toggleAgentStatus(agentId, isActive);
      
      if (response.success && response.data) {
        // Atualizar o agente na lista local
        setAgents(prev => prev.map(agent => 
          agent.id === agentId ? response.data! : agent
        ));
        
        toast.success(`Agente ${isActive ? 'ativado' : 'desativado'} com sucesso!`);
        await fetchAgentStats(); // Atualizar estatísticas
        return true;
      } else {
        throw new Error(response.error || 'Erro ao alterar status do agente');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error('Erro ao alterar status do agente', {
        description: errorMessage
      });
      return false;
    }
  }, [fetchAgentStats]);
  
  // Função para buscar agentes
  const searchAgents = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await agentService.searchAgents(query, {
        page: 1,
        limit: pagination.limit
      });
      
      if (response.success && response.data) {
        setAgents(response.data.agents);
        setPagination({
          page: response.data.page,
          limit: response.data.limit,
          total: response.data.total,
          totalPages: response.data.totalPages
        });
      } else {
        throw new Error(response.error || 'Erro ao buscar agentes');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast.error('Erro ao buscar agentes', {
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);
  
  // Controles de filtro
  const setSearch = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search }));
  }, []);
  
  const setTypeFilter = useCallback((type?: string) => {
    setFilters(prev => ({ ...prev, type }));
  }, []);
  
  const setActiveFilter = useCallback((isActive?: boolean) => {
    setFilters(prev => ({ ...prev, isActive }));
  }, []);
  
  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);
  
  const setLimit = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 })); // Reset para primeira página
  }, []);
  
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      type: undefined,
      isActive: undefined
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);
  
  // Função para atualizar dados
  const refreshAgents = useCallback(async () => {
    await Promise.all([
      fetchAgents(),
      fetchAgentStats()
    ]);
  }, [fetchAgents, fetchAgentStats]);
  
  // Utilitário para encontrar agente por ID
  const getAgentById = useCallback((agentId: string): Agent | undefined => {
    return agents.find(agent => agent.id === agentId);
  }, [agents]);
  
  // Efeito para buscar dados iniciais
  useEffect(() => {
    if (autoFetch) {
      refreshAgents();
    }
  }, [autoFetch, refreshAgents]);
  
  // Efeito para buscar dados quando filtros ou paginação mudam
  useEffect(() => {
    if (autoFetch) {
      fetchAgents();
    }
  }, [filters, pagination.page, pagination.limit]);
  
  return {
    // Estado dos dados
    agents,
    stats,
    loading,
    error,
    
    // Paginação
    pagination,
    
    // Filtros
    filters,
    
    // Ações
    fetchAgents,
    fetchAgentStats,
    createAgent,
    updateAgent,
    deleteAgent,
    toggleAgentStatus,
    searchAgents,
    
    // Controles de filtro
    setSearch,
    setTypeFilter,
    setActiveFilter,
    setPage,
    setLimit,
    clearFilters,
    
    // Utilitários
    refreshAgents,
    getAgentById
  };
}

export default useAgents;