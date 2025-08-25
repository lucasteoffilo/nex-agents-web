import { ApiResponse, PaginationParams } from '@/types';
import apiService from './api';

// Tipos específicos para agentes
export interface Agent {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'training' | 'error';
  type: 'assistant' | 'chatbot' | 'support' | 'sales' | 'custom';
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  isActive: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    name: string;
  };
  // Configurações específicas
  modelConfig?: {
    provider?: 'openai' | 'anthropic' | 'google' | 'local';
    model?: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stopSequences?: string[];
    customParams?: Record<string, any>;
  };
  capabilities?: {
    canAccessDocuments?: boolean;
    canSearchWeb?: boolean;
    canGenerateImages?: boolean;
    canAnalyzeFiles?: boolean;
    canExecuteCode?: boolean;
    canAccessAPIs?: boolean;
    customCapabilities?: string[];
  };
  knowledgeBase?: {
    documentIds?: string[];
    collections?: string[];
    searchSettings?: {
      similarity?: number;
      maxResults?: number;
      includeMetadata?: boolean;
    };
    customSources?: {
      type: string;
      config: Record<string, any>;
    }[];
  };
  tools?: {
    enabled?: string[];
    disabled?: string[];
    custom?: {
      name: string;
      description: string;
      endpoint: string;
      method: 'GET' | 'POST' | 'PUT' | 'DELETE';
      headers?: Record<string, string>;
      parameters?: Record<string, any>;
    }[];
  };
  settings?: {
    autoResponse?: boolean;
    responseDelay?: number;
    maxConversationLength?: number;
    memoryEnabled?: boolean;
    learningEnabled?: boolean;
    analyticsEnabled?: boolean;
    customSettings?: Record<string, any>;
  };
  metrics?: {
    totalConversations?: number;
    totalMessages?: number;
    averageResponseTime?: number;
    satisfactionScore?: number;
    successRate?: number;
    lastUsed?: Date;
    popularQueries?: string[];
  };
  tags?: string[];
  metadata?: {
    version?: string;
    category?: string;
    language?: string;
    region?: string;
    industry?: string;
    useCase?: string;
    lastError?: string;
    customFields?: Record<string, any>;
  };
  trainingStatus?: 'pending' | 'in_progress' | 'completed' | 'failed';
  trainingProgress?: number;
  lastTrainedAt?: string;
  version?: number;
  isPublished?: boolean;
  isFeatured?: boolean;
  usageCount?: number;
  lastUsedAt?: string;
}

export interface CreateAgentDto {
  name: string;
  description?: string;
  type: 'assistant' | 'chatbot' | 'support' | 'sales' | 'custom';
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  capabilities?: Agent['capabilities'];
  config?: Record<string, any>;
  tags?: string[];
}

export interface UpdateAgentDto extends Partial<CreateAgentDto> {
  modelConfig?: Agent['modelConfig'];
  knowledgeBase?: Agent['knowledgeBase'];
  tools?: Agent['tools'];
  settings?: Agent['settings'];
}

export interface AgentStats {
  totalAgents: number;
  activeAgents: number;
  inactiveAgents: number;
  agentsByType: Record<string, number>;
}

class AgentService {
  // Listar agentes com paginação e filtros
  async getAgents(params?: PaginationParams & {
    type?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<{
    agents: Agent[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>> {
    return apiService.get('/agents', params);
  }

  // Obter agente específico
  async getAgent(agentId: string): Promise<ApiResponse<Agent>> {
    return apiService.get(`/agents/${agentId}`);
  }

  // Criar novo agente
  async createAgent(data: CreateAgentDto): Promise<ApiResponse<Agent>> {
    return apiService.post('/agents', data);
  }

  // Atualizar agente
  async updateAgent(agentId: string, data: UpdateAgentDto): Promise<ApiResponse<Agent>> {
    return apiService.put(`/agents/${agentId}`, data);
  }

  // Deletar agente
  async deleteAgent(agentId: string): Promise<ApiResponse<void>> {
    return apiService.delete(`/agents/${agentId}`);
  }

  // Obter agentes ativos
  async getActiveAgents(): Promise<ApiResponse<Agent[]>> {
    return apiService.get('/agents/active');
  }

  // Buscar agentes
  async searchAgents(query: string, params?: PaginationParams): Promise<ApiResponse<{
    agents: Agent[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>> {
    return apiService.get('/agents/search', { q: query, ...params });
  }

  // Obter estatísticas dos agentes
  async getAgentStats(): Promise<ApiResponse<AgentStats>> {
    return apiService.get('/agents/stats');
  }

  // Obter agentes agrupados por tipo
  async getAgentsByType(): Promise<ApiResponse<Record<string, Agent[]>>> {
    return apiService.get('/agents/by-type');
  }

  // Ativar/desativar agente
  async toggleAgentStatus(agentId: string, isActive: boolean): Promise<ApiResponse<Agent>> {
    return apiService.patch(`/agents/${agentId}`, { isActive });
  }

  // Atualizar configuração do modelo
  async updateModelConfig(agentId: string, modelConfig: Agent['modelConfig']): Promise<ApiResponse<Agent>> {
    return apiService.patch(`/agents/${agentId}`, { modelConfig });
  }

  // Atualizar base de conhecimento
  async updateKnowledgeBase(agentId: string, knowledgeBase: Agent['knowledgeBase']): Promise<ApiResponse<Agent>> {
    return apiService.patch(`/agents/${agentId}`, { knowledgeBase });
  }

  // Atualizar ferramentas
  async updateTools(agentId: string, tools: Agent['tools']): Promise<ApiResponse<Agent>> {
    return apiService.patch(`/agents/${agentId}`, { tools });
  }

  // Atualizar configurações
  async updateSettings(agentId: string, settings: Agent['settings']): Promise<ApiResponse<Agent>> {
    return apiService.patch(`/agents/${agentId}`, { settings });
  }

  // Atualizar capacidades
  async updateCapabilities(agentId: string, capabilities: Agent['capabilities']): Promise<ApiResponse<Agent>> {
    return apiService.patch(`/agents/${agentId}`, { capabilities });
  }

  // Treinar agente
  async trainAgent(agentId: string): Promise<ApiResponse<{ message: string; trainingId: string }>> {
    return apiService.post(`/agents/${agentId}/train`);
  }

  // Obter status do treinamento
  async getTrainingStatus(agentId: string): Promise<ApiResponse<{
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    progress: number;
    message?: string;
  }>> {
    return apiService.get(`/agents/${agentId}/training-status`);
  }

  // Publicar agente
  async publishAgent(agentId: string): Promise<ApiResponse<Agent>> {
    return apiService.post(`/agents/${agentId}/publish`);
  }

  // Despublicar agente
  async unpublishAgent(agentId: string): Promise<ApiResponse<Agent>> {
    return apiService.post(`/agents/${agentId}/unpublish`);
  }

  // Clonar agente
  async cloneAgent(agentId: string, name: string): Promise<ApiResponse<Agent>> {
    return apiService.post(`/agents/${agentId}/clone`, { name });
  }

  // Exportar configuração do agente
  async exportAgent(agentId: string): Promise<ApiResponse<any>> {
    return apiService.get(`/agents/${agentId}/export`);
  }

  // Importar configuração do agente
  async importAgent(data: any): Promise<ApiResponse<Agent>> {
    return apiService.post('/agents/import', data);
  }
}

// Instância singleton
const agentService = new AgentService();
export default agentService;