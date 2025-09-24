import { ApiResponse, PaginationParams } from '@/types';
import apiService from './api';

// Tipos específicos para agentes
export interface Agent {
  conversations: any;
  id: string;
  avatar?: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'training' | 'error';
  type: 'assistant' | 'chatbot' | 'support' | 'sales' | 'custom';
  systemPrompt: string;
  instructions?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  isActive: boolean;
  userId: string;
  visibility: 'public' | 'private' | 'shared';
  tenantId: string;
  createdById: string;
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
    selectedCollections?: string[];
    availableCollections?: string[];
    searchSettings?: {
      similarity?: number;
      maxResults?: number;
      includeMetadata?: boolean;
      similarityThreshold?: number;
      enableSemanticSearch?: boolean;
      contextWindow?: number;
    };
    customSources?: {
      type: string;
      config: Record<string, any>;
    }[];
    externalSources?: {
      id: string;
      name: string;
      type: 'api' | 'database' | 'website';
      url: string;
      enabled: boolean;
      lastSync?: string;
    }[];
    enableWebSearch?: boolean;
    webSearchSettings?: {
      maxResults?: number;
      sources?: string[];
      language?: string;
      safeSearch?: boolean;
    };
    documentProcessing?: {
      chunkSize?: number;
      chunkOverlap?: number;
      enableOCR?: boolean;
      supportedFormats?: string[];
    };
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
    enabledTools?: {
      id: string;
      name: string;
      category: string;
      enabled: boolean;
      config: Record<string, any>;
    }[];
    availableTools?: {
      id: string;
      name: string;
      description: string;
      category: 'communication' | 'data' | 'utility' | 'integration' | 'custom';
      icon: string;
      requiresConfig: boolean;
      configSchema?: any;
    }[];
    customFunctions?: {
      id: string;
      name: string;
      description: string;
      code: string;
      parameters: {
        name: string;
        type: 'string' | 'number' | 'boolean' | 'object' | 'array';
        required: boolean;
        description: string;
        defaultValue?: any;
      }[];
      returnType: string;
      enabled: boolean;
    }[];
    apiIntegrations?: {
      id: string;
      name: string;
      baseUrl: string;
      authType: 'none' | 'bearer' | 'apikey' | 'basic';
      authConfig: Record<string, string>;
      headers: Record<string, string>;
      endpoints: {
        id: string;
        name: string;
        method: 'GET' | 'POST' | 'PUT' | 'DELETE';
        path: string;
        description: string;
        parameters: {
          name: string;
          type: 'string' | 'number' | 'boolean' | 'object' | 'array';
          required: boolean;
          description: string;
          defaultValue?: any;
        }[];
        enabled: boolean;
      }[];
      enabled: boolean;
      lastTested?: string;
      status: 'active' | 'error' | 'untested';
    }[];
    variables?: {
      id: string;
      name: string;
      value: string;
      type: 'string' | 'number' | 'boolean' | 'secret';
      description: string;
      scope: 'global' | 'agent';
    }[];
    webhooks?: {
      id: string;
      name: string;
      url: string;
      method: 'POST' | 'PUT';
      headers: Record<string, string>;
      events: string[];
      enabled: boolean;
      lastTriggered?: string;
    }[];
  };
  environments?: {
    whatsapp?: {
      enabled?: boolean;
      phoneNumber?: string;
      businessAccountId?: string;
      accessToken?: string;
      webhookUrl?: string;
      verifyToken?: string;
      status?: 'pending' | 'connected' | 'disconnected';
      lastSync?: string;
      features?: {
        mediaMessages?: boolean;
        voiceMessages?: boolean;
        documentMessages?: boolean;
        locationMessages?: boolean;
        contactMessages?: boolean;
        templateMessages?: boolean;
        interactiveMessages?: boolean;
        businessProfile?: boolean;
      };
      businessProfile?: {
        name?: string;
        description?: string;
        email?: string;
        website?: string;
        address?: string;
        category?: string;
        profilePictureUrl?: string;
      };
    };
    telegram?: {
      enabled?: boolean;
      botToken?: string;
      webhookUrl?: string;
    };
    webChat?: {
      enabled?: boolean;
      widgetId?: string;
      theme?: {
        primaryColor?: string;
        secondaryColor?: string;
        fontFamily?: string;
        borderRadius?: string;
        position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
      };
      behavior?: {
        welcomeMessage?: string;
        placeholder?: string;
        showAvatar?: boolean;
        showTimestamp?: boolean;
        allowFileUpload?: boolean;
        maxFileSize?: number;
        allowedFileTypes?: string[];
      };
      branding?: {
        showPoweredBy?: boolean;
        customLogo?: string;
        customTitle?: string;
        customSubtitle?: string;
      };
    };
    api?: {
      enabled?: boolean;
      endpoint?: string;
      apiKey?: string;
      webhookUrl?: string;
      rateLimiting?: {
        enabled?: boolean;
        maxRequests?: number;
        windowMs?: number;
      };
      authentication?: {
        type?: 'none' | 'bearer' | 'apikey' | 'basic';
        credentials?: Record<string, string>;
      };
    };
    website?: {
      enabled?: boolean;
      domain?: string;
      subdomain?: string;
      customDomain?: string;
      sslEnabled?: boolean;
      status?: 'active' | 'inactive' | 'deploying';
      theme?: {
        template?: string;
        primaryColor?: string;
        secondaryColor?: string;
        backgroundColor?: string;
        textColor?: string;
        fontFamily?: string;
        logoUrl?: string;
        layout?: 'centered' | 'sidebar' | 'fullwidth';
      };
      seo?: {
        title?: string;
        description?: string;
        keywords?: string[];
        favicon?: string;
        ogImage?: string;
        googleAnalyticsId?: string;
        facebookPixelId?: string;
        hotjarId?: string;
        googleAnalytics?: string;
        facebookPixel?: string;
        customScripts?: string;
      };
      features?: {
        contactForm?: boolean;
        livechat?: boolean;
        blog?: boolean;
        testimonials?: boolean;
        pricing?: boolean;
        faq?: boolean;
      };
    };
    mobile?: {
      enabled?: boolean;
      appName?: string;
      bundleId?: string;
      version?: string;
      buildNumber?: number;
      status?: 'development' | 'review' | 'published';
      platform?: 'ios' | 'android' | 'both';
      storeUrl?: string;
      deepLinking?: boolean;
      pushNotifications?: boolean;
      offlineMode?: boolean;
      platforms?: {
        ios?: {
          enabled?: boolean;
          bundleId?: string;
          version?: string;
          buildNumber?: number;
          storeUrl?: string;
          appStoreId?: string;
          certificateId?: string;
          certificates?: {
            development?: string;
            distribution?: string;
          };
        };
        android?: {
          enabled?: boolean;
          packageName?: string;
          version?: string;
          versionCode?: number;
          storeUrl?: string;
          playStoreId?: string;
          keystore?: string;
        };
      };
      features?: {
        pushNotifications?: boolean;
        offlineMode?: boolean;
        deepLinking?: boolean;
        analytics?: boolean;
        crashReporting?: boolean;
      };
    };
  };
  personality?: {
      tone?: 'formal' | 'casual' | 'friendly' | 'professional' | 'humorous';
      style?: 'concise' | 'detailed' | 'conversational' | 'technical';
      traits?: string[];
      customization?: Record<string, any>;
    };
     settings?: {
       autoResponse?: boolean;
       responseDelay?: number;
       maxConversationLength?: number;
       memoryEnabled?: boolean;
       learningEnabled?: boolean;
       analyticsEnabled?: boolean;
       welcomeMessage?: string;
       fallbackMessage?: string;
       errorMessage?: string;
       endConversationMessage?: string;
       escalationPrompt?: string;
       contextualPrompts?: {
         id: string;
         name: string;
         trigger: string;
         prompt: string;
         active: boolean;
         priority?: number;
       }[];
       responseTemplates?: {
         id: string;
         name: string;
         category: string;
         template: string;
         variables: string[];
       }[];
       enablePersonalization?: boolean;
       language?: string;
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
  systemPrompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  capabilities?: Agent['capabilities'];
  knowledgeBase?: Agent['knowledgeBase'];
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

export class AgentService {
  // Listar agentes com paginação e filtros
  async getAgents(params?: PaginationParams & {
    type?: string;
    isActive?: boolean;
    collectionId?: string; // Adicionado para filtrar agentes por coleção
    avatar?: string;  // ← Corrigido: agora é opcional
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
    return apiService.patch(`/agents/${agentId}`, data);
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
}

const agentService = new AgentService();
export default agentService;