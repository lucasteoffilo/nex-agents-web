import { ApiResponse, PaginationParams } from '@/types';
import apiService from './api';

// Tipos específicos para configurações
export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'txt' | 'md' | 'html' | 'csv' | 'json' | 'xml' | 'other';
  size: number;
  url?: string;
  content?: string;
  metadata?: {
    title?: string;
    author?: string;
    createdAt?: string;
    modifiedAt?: string;
    language?: string;
    encoding?: string;
    mimeType?: string;
    tags?: string[];
    category?: string;
    source?: string;
    version?: string;
    customFields?: Record<string, any>;
  };
  status: 'processing' | 'ready' | 'error' | 'archived';
  processingProgress?: number;
  errorMessage?: string;
  chunks?: {
    id: string;
    content: string;
    embedding?: number[];
    metadata?: Record<string, any>;
  }[];
  userId: string;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt?: string;
  accessCount?: number;
  isPublic?: boolean;
  collections?: string[];
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  documentIds: string[];
  userId: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    category?: string;
    tags?: string[];
    language?: string;
    domain?: string;
    customFields?: Record<string, any>;
  };
  settings?: {
    embeddingModel?: string;
    chunkSize?: number;
    chunkOverlap?: number;
    searchSettings?: {
      similarity?: number;
      maxResults?: number;
      includeMetadata?: boolean;
    };
  };
  stats?: {
    documentCount: number;
    totalSize: number;
    lastUpdated: string;
    usageCount: number;
  };
}

export interface EnvironmentConfig {
  id: string;
  name: string;
  type: 'whatsapp' | 'webchat' | 'telegram' | 'slack' | 'discord' | 'api' | 'custom';
  isActive: boolean;
  settings: {
    // WhatsApp específico
    phoneNumber?: string;
    accessToken?: string;
    webhookUrl?: string;
    verifyToken?: string;
    businessAccountId?: string;
    
    // WebChat específico
    widgetId?: string;
    theme?: {
      primaryColor?: string;
      secondaryColor?: string;
      fontFamily?: string;
      borderRadius?: string;
      position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    };
    welcomeMessage?: string;
    placeholder?: string;
    showAvatar?: boolean;
    showTimestamp?: boolean;
    allowFileUpload?: boolean;
    maxFileSize?: number;
    allowedFileTypes?: string[];
    
    // Configurações gerais
    autoResponse?: boolean;
    responseDelay?: number;
    maxMessageLength?: number;
    rateLimiting?: {
      enabled: boolean;
      maxRequests: number;
      windowMs: number;
    };
    customHeaders?: Record<string, string>;
    customParams?: Record<string, any>;
  };
  agentId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;
  usageCount?: number;
  metadata?: {
    version?: string;
    description?: string;
    tags?: string[];
    customFields?: Record<string, any>;
  };
}

export interface ModelConfig {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'local' | 'custom';
  model: string;
  settings: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stopSequences?: string[];
    systemPrompt?: string;
    customParams?: Record<string, any>;
  };
  apiConfig?: {
    baseUrl?: string;
    apiKey?: string;
    headers?: Record<string, string>;
    timeout?: number;
    retries?: number;
  };
  isDefault: boolean;
  isActive: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;
  usageCount?: number;
  performance?: {
    averageResponseTime?: number;
    successRate?: number;
    errorRate?: number;
    totalRequests?: number;
    lastError?: string;
  };
}

export interface ToolConfig {
  id: string;
  name: string;
  type: 'api' | 'function' | 'webhook' | 'database' | 'custom';
  description?: string;
  isActive: boolean;
  settings: {
    // API Tool
    endpoint?: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    authentication?: {
      type: 'none' | 'bearer' | 'basic' | 'api_key' | 'oauth';
      credentials?: Record<string, string>;
    };
    parameters?: {
      name: string;
      type: 'string' | 'number' | 'boolean' | 'object' | 'array';
      required: boolean;
      description?: string;
      defaultValue?: any;
    }[];
    
    // Function Tool
    code?: string;
    runtime?: 'javascript' | 'python' | 'nodejs';
    dependencies?: string[];
    
    // Webhook Tool
    webhookUrl?: string;
    secret?: string;
    
    // Database Tool
    connectionString?: string;
    query?: string;
    
    // Configurações gerais
    timeout?: number;
    retries?: number;
    rateLimit?: {
      requests: number;
      window: number;
    };
    customConfig?: Record<string, any>;
  };
  userId: string;
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;
  usageCount?: number;
  performance?: {
    averageExecutionTime?: number;
    successRate?: number;
    errorRate?: number;
    totalExecutions?: number;
    lastError?: string;
  };
}

class ConfigService {
  // === DOCUMENTOS ===
  
  // Listar documentos
  async getDocuments(params?: PaginationParams & {
    type?: string;
    status?: string;
    collectionId?: string;
  }): Promise<ApiResponse<{
    documents: Document[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>> {
    return apiService.get('/documents', params);
  }

  // Obter documento específico
  async getDocument(documentId: string): Promise<ApiResponse<Document>> {
    return apiService.get(`/documents/${documentId}`);
  }

  // Upload de documento
  async uploadDocument(file: File, metadata?: Partial<Document['metadata']>): Promise<ApiResponse<Document>> {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }
    return apiService.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  // Deletar documento
  async deleteDocument(documentId: string): Promise<ApiResponse<void>> {
    return apiService.delete(`/documents/${documentId}`);
  }

  // Buscar documentos
  async searchDocuments(query: string, params?: PaginationParams): Promise<ApiResponse<{
    documents: Document[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>> {
    return apiService.get('/documents/search', { q: query, ...params });
  }

  // === COLEÇÕES ===
  
  // Listar coleções
  async getCollections(params?: PaginationParams): Promise<ApiResponse<{
    collections: Collection[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>> {
    return apiService.get('/collections', params);
  }

  // Obter coleção específica
  async getCollection(collectionId: string): Promise<ApiResponse<Collection>> {
    return apiService.get(`/collections/${collectionId}`);
  }

  // Criar coleção
  async createCollection(data: {
    name: string;
    description?: string;
    documentIds?: string[];
    isPublic?: boolean;
    metadata?: Collection['metadata'];
    settings?: Collection['settings'];
  }): Promise<ApiResponse<Collection>> {
    return apiService.post('/collections', data);
  }

  // Atualizar coleção
  async updateCollection(collectionId: string, data: Partial<Collection>): Promise<ApiResponse<Collection>> {
    return apiService.put(`/collections/${collectionId}`, data);
  }

  // Deletar coleção
  async deleteCollection(collectionId: string): Promise<ApiResponse<void>> {
    return apiService.delete(`/collections/${collectionId}`);
  }

  // Adicionar documento à coleção
  async addDocumentToCollection(collectionId: string, documentId: string): Promise<ApiResponse<Collection>> {
    return apiService.post(`/collections/${collectionId}/documents`, { documentId });
  }

  // Remover documento da coleção
  async removeDocumentFromCollection(collectionId: string, documentId: string): Promise<ApiResponse<Collection>> {
    return apiService.delete(`/collections/${collectionId}/documents/${documentId}`);
  }

  // === CONFIGURAÇÕES DE AMBIENTE ===
  
  // Listar configurações de ambiente
  async getEnvironmentConfigs(params?: PaginationParams & {
    type?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<{
    configs: EnvironmentConfig[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>> {
    return apiService.get('/environment-configs', params);
  }

  // Obter configuração de ambiente específica
  async getEnvironmentConfig(configId: string): Promise<ApiResponse<EnvironmentConfig>> {
    return apiService.get(`/environment-configs/${configId}`);
  }

  // Criar configuração de ambiente
  async createEnvironmentConfig(data: Omit<EnvironmentConfig, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<EnvironmentConfig>> {
    return apiService.post('/environment-configs', data);
  }

  // Atualizar configuração de ambiente
  async updateEnvironmentConfig(configId: string, data: Partial<EnvironmentConfig>): Promise<ApiResponse<EnvironmentConfig>> {
    return apiService.put(`/environment-configs/${configId}`, data);
  }

  // Deletar configuração de ambiente
  async deleteEnvironmentConfig(configId: string): Promise<ApiResponse<void>> {
    return apiService.delete(`/environment-configs/${configId}`);
  }

  // === CONFIGURAÇÕES DE MODELO ===
  
  // Listar configurações de modelo
  async getModelConfigs(params?: PaginationParams & {
    provider?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<{
    configs: ModelConfig[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>> {
    return apiService.get('/model-configs', params);
  }

  // Obter configuração de modelo específica
  async getModelConfig(configId: string): Promise<ApiResponse<ModelConfig>> {
    return apiService.get(`/model-configs/${configId}`);
  }

  // Criar configuração de modelo
  async createModelConfig(data: Omit<ModelConfig, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<ModelConfig>> {
    return apiService.post('/model-configs', data);
  }

  // Atualizar configuração de modelo
  async updateModelConfig(configId: string, data: Partial<ModelConfig>): Promise<ApiResponse<ModelConfig>> {
    return apiService.put(`/model-configs/${configId}`, data);
  }

  // Deletar configuração de modelo
  async deleteModelConfig(configId: string): Promise<ApiResponse<void>> {
    return apiService.delete(`/model-configs/${configId}`);
  }

  // Testar configuração de modelo
  async testModelConfig(configId: string, testMessage: string): Promise<ApiResponse<{
    success: boolean;
    response?: string;
    error?: string;
    responseTime: number;
  }>> {
    return apiService.post(`/model-configs/${configId}/test`, { message: testMessage });
  }

  // === CONFIGURAÇÕES DE FERRAMENTAS ===
  
  // Listar configurações de ferramentas
  async getToolConfigs(params?: PaginationParams & {
    type?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<{
    configs: ToolConfig[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>> {
    return apiService.get('/tool-configs', params);
  }

  // Obter configuração de ferramenta específica
  async getToolConfig(configId: string): Promise<ApiResponse<ToolConfig>> {
    return apiService.get(`/tool-configs/${configId}`);
  }

  // Criar configuração de ferramenta
  async createToolConfig(data: Omit<ToolConfig, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<ToolConfig>> {
    return apiService.post('/tool-configs', data);
  }

  // Atualizar configuração de ferramenta
  async updateToolConfig(configId: string, data: Partial<ToolConfig>): Promise<ApiResponse<ToolConfig>> {
    return apiService.put(`/tool-configs/${configId}`, data);
  }

  // Deletar configuração de ferramenta
  async deleteToolConfig(configId: string): Promise<ApiResponse<void>> {
    return apiService.delete(`/tool-configs/${configId}`);
  }

  // Testar configuração de ferramenta
  async testToolConfig(configId: string, testParams?: Record<string, any>): Promise<ApiResponse<{
    success: boolean;
    result?: any;
    error?: string;
    executionTime: number;
  }>> {
    return apiService.post(`/tool-configs/${configId}/test`, { params: testParams });
  }
}

// Instância singleton
const configService = new ConfigService();
export default configService;