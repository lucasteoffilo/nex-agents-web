import { ApiResponse, PaginationParams } from '@/types';
import apiService from './api';

// Tipos específicos para documentos
export interface Document {
  id: string;
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
}

export interface UploadDocumentDto {
  collectionId: string;
  file: File;
  name?: string;
  description?: string;
  metadata?: {
    tags?: string[];
    category?: string;
    language?: string;
    customFields?: Record<string, any>;
  };
}

export interface DocumentStats {
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  totalSize: number;
  averageSize: number;
  processingQueue: number;
}

class DocumentService {
  // Listar documentos com paginação e filtros
  async getDocuments(params?: PaginationParams & {
    collectionId?: string;
    type?: string;
    status?: string;
    search?: string;
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
  async uploadDocument(data: UploadDocumentDto): Promise<ApiResponse<Document>> {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('collectionId', data.collectionId);
    
    if (data.name) {
      formData.append('name', data.name);
    }
    
    if (data.description) {
      formData.append('description', data.description);
    }
    
    if (data.metadata) {
      formData.append('metadata', JSON.stringify(data.metadata));
    }

    return apiService.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Atualizar documento
  async updateDocument(documentId: string, data: {
    name?: string;
    description?: string;
    metadata?: Document['metadata'];
  }): Promise<ApiResponse<Document>> {
    return apiService.patch(`/documents/${documentId}`, data);
  }

  // Deletar documento
  async deleteDocument(documentId: string): Promise<ApiResponse<void>> {
    return apiService.delete(`/documents/${documentId}`);
  }

  // Buscar documentos
  async searchDocuments(query: string, params?: PaginationParams & {
    collectionId?: string;
    type?: string;
    similarity?: number;
  }): Promise<ApiResponse<{
    documents: Document[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>> {
    return apiService.get('/documents/search', { q: query, ...params });
  }

  // Reprocessar documento
  async reprocessDocument(documentId: string): Promise<ApiResponse<Document>> {
    return apiService.post(`/documents/${documentId}/reprocess`);
  }

  // Obter chunks de um documento
  async getDocumentChunks(documentId: string): Promise<ApiResponse<DocumentChunk[]>> {
    return apiService.get(`/documents/${documentId}/chunks`);
  }

  // Atualizar chunk específico
  async updateDocumentChunk(documentId: string, chunkId: string, data: {
    content?: string;
    metadata?: Record<string, any>;
  }): Promise<ApiResponse<DocumentChunk>> {
    return apiService.patch(`/documents/${documentId}/chunks/${chunkId}`, data);
  }

  // Deletar chunk específico
  async deleteDocumentChunk(documentId: string, chunkId: string): Promise<ApiResponse<void>> {
    return apiService.delete(`/documents/${documentId}/chunks/${chunkId}`);
  }

  // Obter estatísticas de documentos
  async getDocumentStats(collectionId?: string): Promise<ApiResponse<DocumentStats>> {
    const params = collectionId ? { collectionId } : {};
    return apiService.get('/documents/stats', params);
  }

  // Download de documento
  async downloadDocument(documentId: string): Promise<ApiResponse<{ downloadUrl: string }>> {
    return apiService.get(`/documents/${documentId}/download`);
  }

  // Obter preview de documento
  async getDocumentPreview(documentId: string): Promise<ApiResponse<{
    content: string;
    type: 'text' | 'html' | 'image';
    metadata?: Record<string, any>;
  }>> {
    return apiService.get(`/documents/${documentId}/preview`);
  }

  // Operações em lote
  async bulkDeleteDocuments(documentIds: string[]): Promise<ApiResponse<{
    deleted: string[];
    failed: { id: string; error: string }[];
  }>> {
    return apiService.post('/documents/bulk-delete', { documentIds });
  }

  async bulkUpdateDocuments(updates: {
    documentId: string;
    data: {
      name?: string;
      description?: string;
      metadata?: Document['metadata'];
    };
  }[]): Promise<ApiResponse<{
    updated: Document[];
    failed: { id: string; error: string }[];
  }>> {
    return apiService.post('/documents/bulk-update', { updates });
  }

  // Mover documentos entre coleções
  async moveDocuments(documentIds: string[], targetCollectionId: string): Promise<ApiResponse<{
    moved: string[];
    failed: { id: string; error: string }[];
  }>> {
    return apiService.post('/documents/move', {
      documentIds,
      targetCollectionId
    });
  }

  // Duplicar documento
  async duplicateDocument(documentId: string, targetCollectionId?: string): Promise<ApiResponse<Document>> {
    const data = targetCollectionId ? { targetCollectionId } : {};
    return apiService.post(`/documents/${documentId}/duplicate`, data);
  }

  // Verificar status de processamento
  async getProcessingStatus(documentId: string): Promise<ApiResponse<{
    status: 'pending' | 'processing' | 'completed' | 'error';
    progress: number;
    message?: string;
    estimatedTimeRemaining?: number;
  }>> {
    return apiService.get(`/documents/${documentId}/processing-status`);
  }
}

// Instância singleton
const documentService = new DocumentService();
export default documentService;
export { DocumentService };