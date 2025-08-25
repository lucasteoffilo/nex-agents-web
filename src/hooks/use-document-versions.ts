'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Interfaces para os dados de versão
export interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  title: string;
  description?: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  size: number;
  changes?: string;
  isCurrentVersion: boolean;
}

export interface VersionComparison {
  oldVersion: DocumentVersion;
  newVersion: DocumentVersion;
  differences: {
    linesAdded: number;
    linesRemoved: number;
    linesModified: number;
    charactersAdded: number;
    charactersRemoved: number;
    charactersModified: number;
  };
  contentDiff: string; // HTML ou texto com as diferenças marcadas
}

export interface CreateVersionData {
  title: string;
  description?: string;
  changes?: string;
}

interface CompareVersionsData {
  versionAId: string;
  versionBId: string;
}

interface Version {
  id: string;
  version: number;
  title: string;
  description: string;
  content: string;
  author: {
    id: string;
    name: string;
  };
  createdAt: string;
  changes: string[];
  size: number;
  contentHash: string;
}

interface VersioningStats {
  totalDocuments: number;
  totalVersions: number;
  averageVersionsPerDocument: number;
  mostVersionedDocument: {
    id: string;
    title: string;
    versionCount: number;
  };
  versioningActivity: Array<{
    date: string;
    count: number;
  }>;
  topAuthors: Array<{
    authorId: string;
    authorName: string;
    versionCount: number;
  }>;
}

interface VersionHistoryQuery {
  page?: number;
  limit?: number;
  authorId?: string;
  startDate?: string;
  endDate?: string;
}

import apiService from '@/services/api';

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  // Usar apiService em vez de fetch direto
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body as string) : undefined;
  
  try {
    let response;
    switch (method) {
      case 'POST':
        response = await apiService.post(endpoint, body);
        break;
      case 'PUT':
        response = await apiService.put(endpoint, body);
        break;
      case 'DELETE':
        response = await apiService.delete(endpoint);
        break;
      default:
        response = await apiService.get(endpoint);
    }
    return {
      ok: response.success,
      json: async () => response.data,
      status: response.success ? 200 : 400
    };
  } catch (error) {
    return {
      ok: false,
      json: async () => ({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      status: 500
    };
  }
};

// Função auxiliar para manter compatibilidade com o código existente
const legacyApiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

export function useDocumentVersions(documentId: string) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar histórico de versões
  const {
    data: versions,
    isLoading: versionsLoading,
    error: versionsError,
    refetch: refetchVersions
  } = useQuery({
    queryKey: ['document-versions', documentId],
    queryFn: () => apiRequest(`/api/knowledge-hub/documents/${documentId}/versions`),
    enabled: !!documentId,
  });

  // Buscar estatísticas de versionamento
  const {
    data: versioningStats,
    isLoading: statsLoading,
    error: statsError
  } = useQuery({
    queryKey: ['versioning-stats'],
    queryFn: () => apiRequest('/api/knowledge-hub/documents/versioning/stats'),
  });

  // Criar nova versão
  const createVersionMutation = useMutation({
    mutationFn: (data: CreateVersionData) =>
      apiRequest(`/api/knowledge-hub/documents/${documentId}/versions`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-versions', documentId] });
      queryClient.invalidateQueries({ queryKey: ['versioning-stats'] });
    },
  });

  // Comparar versões
  const compareVersionsMutation = useMutation({
    mutationFn: (data: CompareVersionsData) =>
      apiRequest(`/api/knowledge-hub/documents/${documentId}/versions/compare`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  });

  // Restaurar versão
  const restoreVersionMutation = useMutation({
    mutationFn: (versionId: string) =>
      apiRequest(`/api/knowledge-hub/documents/${documentId}/versions/${versionId}/restore`, {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-versions', documentId] });
      queryClient.invalidateQueries({ queryKey: ['document', documentId] });
    },
  });

  // Buscar histórico com filtros
  const getVersionHistory = useCallback(
    async (query: VersionHistoryQuery = {}) => {
      setIsLoading(true);
      setError(null);
      
      try {
        const queryParams = new URLSearchParams();
        if (query.page) queryParams.append('page', query.page.toString());
        if (query.limit) queryParams.append('limit', query.limit.toString());
        if (query.authorId) queryParams.append('authorId', query.authorId);
        if (query.startDate) queryParams.append('startDate', query.startDate);
        if (query.endDate) queryParams.append('endDate', query.endDate);

        const endpoint = `/api/knowledge-hub/documents/${documentId}/versions?${queryParams.toString()}`;
        const result = await apiRequest(endpoint);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar histórico de versões';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [documentId]
  );

  // Criar nova versão
  const createVersion = useCallback(
    async (data: CreateVersionData) => {
      try {
        const result = await createVersionMutation.mutateAsync(data);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao criar nova versão';
        setError(errorMessage);
        throw err;
      }
    },
    [createVersionMutation]
  );

  // Comparar duas versões
  const compareVersions = useCallback(
    async (versionAId: string, versionBId: string): Promise<VersionComparison> => {
      try {
        const result = await compareVersionsMutation.mutateAsync({
          versionAId,
          versionBId,
        });
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao comparar versões';
        setError(errorMessage);
        throw err;
      }
    },
    [compareVersionsMutation]
  );

  // Restaurar versão específica
  const restoreVersion = useCallback(
    async (versionId: string) => {
      try {
        const result = await restoreVersionMutation.mutateAsync(versionId);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao restaurar versão';
        setError(errorMessage);
        throw err;
      }
    },
    [restoreVersionMutation]
  );

  // Limpar erros
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Dados
    versions: versions?.data || [],
    versioningStats: versioningStats?.data,
    
    // Estados de carregamento
    isLoading: isLoading || versionsLoading || statsLoading,
    isCreatingVersion: createVersionMutation.isPending,
    isComparingVersions: compareVersionsMutation.isPending,
    isRestoringVersion: restoreVersionMutation.isPending,
    
    // Erros
    error: error || versionsError?.message || statsError?.message,
    
    // Ações
    getVersionHistory,
    createVersion,
    compareVersions,
    restoreVersion,
    refetchVersions,
    clearError,
    
    // Utilitários
    hasVersions: versions?.data?.length > 0,
    latestVersion: versions?.data?.[0],
    versionCount: versions?.data?.length || 0,
  };
}

// Hook para comparação de versões específicas
export function useVersionComparison(documentId: string, versionAId?: string, versionBId?: string) {
  const {
    data: comparison,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['version-comparison', documentId, versionAId, versionBId],
    queryFn: () => 
      apiRequest(`/api/knowledge-hub/documents/${documentId}/versions/compare`, {
        method: 'POST',
        body: JSON.stringify({ versionAId, versionBId }),
      }),
    enabled: !!(documentId && versionAId && versionBId),
  });

  return {
    comparison: comparison?.data as VersionComparison | undefined,
    isLoading,
    error: error?.message,
    refetch,
  };
}

// Hook para buscar estatísticas de versionamento
export function useVersioningStats() {
  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['versioning-stats'],
    queryFn: async (): Promise<VersioningStats> => {
      const response = await fetch('/api/knowledge-hub/versioning/stats');
      if (!response.ok) {
        throw new Error('Falha ao buscar estatísticas de versionamento');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false
  });

  return {
    stats,
    isLoading,
    error: error?.message,
    refetch
  };
}