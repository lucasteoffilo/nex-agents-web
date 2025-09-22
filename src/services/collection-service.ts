import { ApiResponse, PaginationParams } from '@/types';
import apiService from './api';

// Tipos específicos para coleções
export interface Collection {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'processing' | 'error';
  userId: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  documentCount?: number;
  totalSize?: number;
  metadata?: {
    tags?: string[];
    category?: string;
    language?: string;
    customFields?: Record<string, any>;
  };
  settings?: {
    isPublic?: boolean;
    allowDuplicates?: boolean;
    autoIndex?: boolean;
    chunkSize?: number;
    chunkOverlap?: number;
    maxDocuments?: number;
    retentionDays?: number;
    customSettings?: Record<string, any>;
  };
  documents?: Document[];
}

export interface Document {
  id: string;
  title: string;
  filename: string;
  originalName: string;
  type: 'image' | 'html' | 'pdf' | 'doc' | 'docx' | 'txt' | 'md' | 'csv' | 'xlsx' | 'pptx' | 'xml' | 'json' | 'other';
  fileSize: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  collectionId: string;
  userId: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    extractedText?: string;
    pageCount?: number;
    language?: string;
    customFields?: Record<string, any>;
  };
  chunks?: DocumentChunk[];
}

export interface DocumentChunk {
  id: string;
  content: string;
  metadata?: Record<string, any>;
  documentId: string;
  chunkIndex: number;
  embedding?: number[];
}

export interface CreateCollectionDto {
  name: string;
  description?: string;
  type?: 'general' | 'faq' | 'documentation' | 'training' | 'custom';
  settings?: {
    isPublic?: boolean;
    allowDuplicates?: boolean;
    autoIndex?: boolean;
    chunkSize?: number;
    chunkOverlap?: number;
    maxDocuments?: number;
    retentionDays?: number;
    customSettings?: Record<string, any>;
  };
  metadata?: {
    category?: string;
    language?: string;
    source?: string;
    version?: string;
    tags?: string[];
    customFields?: Record<string, any>;
  };
  tags?: string[];
  color?: string;
  icon?: string;
}

export interface UpdateCollectionDto extends Partial<CreateCollectionDto> {
  status?: Collection['status'];
}

export interface UploadDocumentDto {
  file: File;
  metadata?: {
    tags?: string[];
    customFields?: Record<string, any>;
  };
}

export interface CollectionStats {
  id: string;
  name: string;
  description?: string;
  documentsCount: number;
  chunksCount: number;
  vectorSize: number;
  distance: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastIndexedAt?: Date;
  embeddingModel: string;
  settings: Record<string, any>;
}

class CollectionService {
  // Operações de coleções
  async getCollections(params?: PaginationParams & {
    status?: string;
    isPublic?: boolean;
    search?: string;
  }): Promise<ApiResponse<{
    collections: Collection[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>> {
    return apiService.get('/collections', { params });
  }

  async getCollection(collectionId: string): Promise<Collection> {
    const response = await apiService.get(`/collections/${collectionId}`);
    // O backend retorna {success: true, data: {...}} devido ao ResponseTransformInterceptor
    // Extrair os dados reais da estrutura envolvida
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    
    // Fallback para compatibilidade (caso a estrutura mude)
    return response.data || response;
  }

  async createCollection(data: CreateCollectionDto): Promise<ApiResponse<Collection>> {
    return apiService.post('/collections', data);
  }

  async updateCollection(collectionId: string, data: UpdateCollectionDto): Promise<ApiResponse<Collection>> {
    return apiService.put(`/collections/${collectionId}`, data);
  }

  async deleteCollection(collectionId: string): Promise<ApiResponse<void>> {
    return apiService.delete(`/collections/${collectionId}`);
  }

  async searchCollections(query: string, params?: PaginationParams): Promise<ApiResponse<{
    collections: Collection[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>> {
    return apiService.get('/collections/search', { 
      params: { q: query, ...params } 
    });
  }

  async getCollectionStats(): Promise<ApiResponse<CollectionStats>> {
    return apiService.get('/collections/stats');
  }

  // Operações de documentos
  async getDocuments(collectionId: string, params?: PaginationParams): Promise<ApiResponse<{
    documents: Document[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>> {
    return apiService.get(`/collections/${collectionId}/documents`, { params });
  }

  async getDocument(collectionId: string, documentId: string): Promise<ApiResponse<Document>> {
    return apiService.get(`/collections/${collectionId}/documents/${documentId}`);
  }

  async uploadDocument(collectionId: string, data: UploadDocumentDto): Promise<ApiResponse<Document>> {
    const formData = new FormData();
    formData.append('file', data.file);
    if (data.metadata) {
      formData.append('metadata', JSON.stringify(data.metadata));
    }

    return apiService.post(`/collections/${collectionId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async deleteDocument(collectionId: string, documentId: string): Promise<ApiResponse<void>> {
    return apiService.delete(`/collections/${collectionId}/documents/${documentId}`);
  }

  async searchDocuments(collectionId: string, query: string, params?: {
    limit?: number;
    similarity?: number;
    includeMetadata?: boolean;
  }): Promise<ApiResponse<{
    documents: Document[];
    chunks: DocumentChunk[];
    total: number;
  }>> {
    return apiService.post(`/collections/${collectionId}/search`, {
      query,
      ...params
    });
  }

  // Operações de chunks
  async getDocumentChunks(collectionId: string, documentId: string): Promise<ApiResponse<DocumentChunk[]>> {
    return apiService.get(`/collections/${collectionId}/documents/${documentId}/chunks`);
  }

  // Operações de agentes
  async linkAgentToCollection(agentId: string, collectionId: string): Promise<ApiResponse<void>> {
    return apiService.post(`/agents/${agentId}/collections/${collectionId}`);
  }

  async unlinkAgentFromCollection(agentId: string, collectionId: string): Promise<ApiResponse<void>> {
    return apiService.delete(`/agents/${agentId}/collections/${collectionId}`);
  }

  async getAgentCollections(agentId: string): Promise<ApiResponse<Collection[]>> {
    return apiService.get(`/agents/${agentId}/collections`);
  }

  // Utilitários
  async exportCollection(collectionId: string): Promise<ApiResponse<any>> {
    return apiService.get(`/collections/${collectionId}/export`);
  }

  async importCollection(data: any): Promise<ApiResponse<Collection>> {
    return apiService.post('/collections/import', data);
  }

  async duplicateCollection(collectionId: string, name: string): Promise<ApiResponse<Collection>> {
    return apiService.post(`/collections/${collectionId}/duplicate`, { name });
  }

  async getCollectionMetrics(collectionId: string): Promise<ApiResponse<{
    documentCount: number;
    totalSize: number;
    chunkCount: number;
    lastUpdated: string;
    processingStatus: string;
  }>> {
    return apiService.get(`/collections/${collectionId}/metrics`);
  }
}

const collectionService = new CollectionService();
export default collectionService;