/**
 * Qdrant Multi-Tenant Vector Search Service
 * Implementa busca vetorial isolada por tenant usando Qdrant
 */

import { QdrantClient } from '@qdrant/js-client-rest';
import { Document, DocumentChunk } from '@/types';

export interface QdrantConfig {
  url: string;
  apiKey?: string;
  timeout?: number;
  retries?: number;
}

export interface VectorSearchQuery {
  tenantId: string;
  query: string;
  vector?: number[];
  limit?: number;
  offset?: number;
  filter?: Record<string, any>;
  threshold?: number;
}

export interface VectorSearchResult {
  id: string;
  score: number;
  payload: {
    tenantId: string;
    documentId: string;
    chunkId: string;
    content: string;
    metadata: Record<string, any>;
  };
}

export interface TenantCollection {
  tenantId: string;
  collectionName: string;
  vectorSize: number;
  distance: 'Cosine' | 'Euclid' | 'Dot';
  documentsCount: number;
  chunksCount: number;
}

export interface VectorStats {
  totalVectors: number;
  totalCollections: number;
  tenantCollections: TenantCollection[];
  storageSize: number;
}

export class QdrantMultiTenantService {
  private client: QdrantClient;
  private config: QdrantConfig;
  private readonly COLLECTION_PREFIX = 'tenant';
  private readonly DEFAULT_VECTOR_SIZE = 1536; // OpenAI embeddings
  private readonly DEFAULT_DISTANCE = 'Cosine';

  constructor(config: QdrantConfig) {
    this.config = {
      timeout: 30000,
      retries: 3,
      ...config
    };

    this.client = new QdrantClient({
      url: this.config.url,
      apiKey: this.config.apiKey,
      timeout: this.config.timeout,
    });
  }

  /**
   * Gera nome da coleção para o tenant
   */
  private getTenantCollectionName(tenantId: string): string {
    return `${this.COLLECTION_PREFIX}_${tenantId.replace(/-/g, '_')}`;
  }

  /**
   * Verifica se uma coleção existe
   */
  async collectionExists(tenantId: string): Promise<boolean> {
    try {
      const collectionName = this.getTenantCollectionName(tenantId);
      const collections = await this.client.getCollections();
      return collections.collections.some(c => c.name === collectionName);
    } catch (error) {
      console.error('Error checking collection existence:', error);
      return false;
    }
  }

  /**
   * Cria coleção para o tenant
   */
  async createTenantCollection(
    tenantId: string,
    vectorSize: number = this.DEFAULT_VECTOR_SIZE,
    distance: 'Cosine' | 'Euclid' | 'Dot' = this.DEFAULT_DISTANCE
  ): Promise<boolean> {
    try {
      const collectionName = this.getTenantCollectionName(tenantId);
      
      // Verifica se já existe
      if (await this.collectionExists(tenantId)) {
        console.log(`Collection ${collectionName} already exists`);
        return true;
      }

      await this.client.createCollection(collectionName, {
        vectors: {
          size: vectorSize,
          distance: distance,
        },
        optimizers_config: {
          default_segment_number: 2,
        },
        replication_factor: 1,
      });

      // Criar índice para filtros de tenant
      await this.client.createPayloadIndex(collectionName, {
        field_name: 'tenantId',
        field_schema: 'keyword',
      });

      await this.client.createPayloadIndex(collectionName, {
        field_name: 'documentId',
        field_schema: 'keyword',
      });

      await this.client.createPayloadIndex(collectionName, {
        field_name: 'chunkId',
        field_schema: 'keyword',
      });

      console.log(`Created collection ${collectionName} for tenant ${tenantId}`);
      return true;
    } catch (error) {
      console.error('Error creating tenant collection:', error);
      return false;
    }
  }

  /**
   * Deleta coleção do tenant
   */
  async deleteTenantCollection(tenantId: string): Promise<boolean> {
    try {
      const collectionName = this.getTenantCollectionName(tenantId);
      
      if (!(await this.collectionExists(tenantId))) {
        console.log(`Collection ${collectionName} does not exist`);
        return true;
      }

      await this.client.deleteCollection(collectionName);
      console.log(`Deleted collection ${collectionName} for tenant ${tenantId}`);
      return true;
    } catch (error) {
      console.error('Error deleting tenant collection:', error);
      return false;
    }
  }

  /**
   * Adiciona documento vetorizado à coleção do tenant
   */
  async addDocumentVectors(
    tenantId: string,
    document: Document,
    chunks: DocumentChunk[],
    vectors: number[][]
  ): Promise<boolean> {
    try {
      const collectionName = this.getTenantCollectionName(tenantId);
      
      // Garantir que a coleção existe
      if (!(await this.collectionExists(tenantId))) {
        await this.createTenantCollection(tenantId);
      }

      if (chunks.length !== vectors.length) {
        throw new Error('Number of chunks must match number of vectors');
      }

      const points = chunks.map((chunk, index) => ({
        id: chunk.id,
        vector: vectors[index],
        payload: {
          tenantId: tenantId,
          documentId: document.id,
          chunkId: chunk.id,
          content: chunk.content,
          metadata: {
            documentTitle: document.title,
            documentType: document.type,
            chunkIndex: chunk.chunkIndex,
            tokens: chunk.tokens,
            createdAt: chunk.createdAt,
            ...chunk.metadata
          }
        }
      }));

      await this.client.upsert(collectionName, {
        wait: true,
        points: points
      });

      console.log(`Added ${points.length} vectors for document ${document.id} in tenant ${tenantId}`);
      return true;
    } catch (error) {
      console.error('Error adding document vectors:', error);
      return false;
    }
  }

  /**
   * Remove vetores de um documento
   */
  async removeDocumentVectors(
    tenantId: string,
    documentId: string
  ): Promise<boolean> {
    try {
      const collectionName = this.getTenantCollectionName(tenantId);
      
      if (!(await this.collectionExists(tenantId))) {
        console.log(`Collection for tenant ${tenantId} does not exist`);
        return true;
      }

      await this.client.delete(collectionName, {
        filter: {
          must: [
            {
              key: 'tenantId',
              match: { value: tenantId }
            },
            {
              key: 'documentId',
              match: { value: documentId }
            }
          ]
        }
      });

      console.log(`Removed vectors for document ${documentId} in tenant ${tenantId}`);
      return true;
    } catch (error) {
      console.error('Error removing document vectors:', error);
      return false;
    }
  }

  /**
   * Busca vetorial isolada por tenant
   */
  async searchVectors(
    query: VectorSearchQuery
  ): Promise<VectorSearchResult[]> {
    try {
      const collectionName = this.getTenantCollectionName(query.tenantId);
      
      if (!(await this.collectionExists(query.tenantId))) {
        console.log(`Collection for tenant ${query.tenantId} does not exist`);
        return [];
      }

      if (!query.vector) {
        throw new Error('Vector is required for search');
      }

      // Filtro base para isolamento de tenant
      const baseFilter = {
        must: [
          {
            key: 'tenantId',
            match: { value: query.tenantId }
          }
        ]
      };

      // Adicionar filtros adicionais se fornecidos
      if (query.filter) {
        Object.entries(query.filter).forEach(([key, value]) => {
          baseFilter.must.push({
            key: key,
            match: { value: value }
          });
        });
      }

      const searchResult = await this.client.search(collectionName, {
        vector: query.vector,
        filter: baseFilter,
        limit: query.limit || 10,
        offset: query.offset || 0,
        score_threshold: query.threshold || 0.7,
        with_payload: true,
        with_vector: false
      });

      return searchResult.map(result => ({
        id: result.id.toString(),
        score: result.score,
        payload: result.payload as VectorSearchResult['payload']
      }));
    } catch (error) {
      console.error('Error searching vectors:', error);
      return [];
    }
  }

  /**
   * Busca híbrida (texto + vetorial)
   */
  async hybridSearch(
    tenantId: string,
    textQuery: string,
    vector: number[],
    options?: {
      limit?: number;
      textWeight?: number;
      vectorWeight?: number;
      filter?: Record<string, any>;
    }
  ): Promise<VectorSearchResult[]> {
    try {
      const vectorResults = await this.searchVectors({
        tenantId,
        query: textQuery,
        vector,
        limit: options?.limit || 20,
        filter: options?.filter
      });

      // Implementar busca textual simples no payload
      const textResults = vectorResults.filter(result => 
        result.payload.content.toLowerCase().includes(textQuery.toLowerCase())
      );

      // Combinar scores (implementação simples)
      const textWeight = options?.textWeight || 0.3;
      const vectorWeight = options?.vectorWeight || 0.7;

      const hybridResults = vectorResults.map(result => {
        const isTextMatch = textResults.some(tr => tr.id === result.id);
        const textScore = isTextMatch ? 1.0 : 0.0;
        const hybridScore = (vectorWeight * result.score) + (textWeight * textScore);
        
        return {
          ...result,
          score: hybridScore
        };
      });

      // Ordenar por score híbrido
      return hybridResults
        .sort((a, b) => b.score - a.score)
        .slice(0, options?.limit || 10);
    } catch (error) {
      console.error('Error in hybrid search:', error);
      return [];
    }
  }

  /**
   * Obtém estatísticas da coleção do tenant
   */
  async getTenantCollectionStats(tenantId: string): Promise<TenantCollection | null> {
    try {
      const collectionName = this.getTenantCollectionName(tenantId);
      
      if (!(await this.collectionExists(tenantId))) {
        return null;
      }

      const info = await this.client.getCollection(collectionName);
      
      // Contar documentos únicos
      const scrollResult = await this.client.scroll(collectionName, {
        filter: {
          must: [{
            key: 'tenantId',
            match: { value: tenantId }
          }]
        },
        limit: 10000,
        with_payload: ['documentId'],
        with_vector: false
      });

      const uniqueDocuments = new Set(
        scrollResult.points.map(p => p.payload?.documentId)
      ).size;

      return {
        tenantId,
        collectionName,
        vectorSize: info.config.params.vectors.size,
        distance: info.config.params.vectors.distance,
        documentsCount: uniqueDocuments,
        chunksCount: info.points_count || 0
      };
    } catch (error) {
      console.error('Error getting tenant collection stats:', error);
      return null;
    }
  }

  /**
   * Obtém estatísticas gerais do Qdrant
   */
  async getVectorStats(): Promise<VectorStats> {
    try {
      const collections = await this.client.getCollections();
      const tenantCollections: TenantCollection[] = [];
      let totalVectors = 0;
      let totalCollections = 0;

      for (const collection of collections.collections) {
        if (collection.name.startsWith(this.COLLECTION_PREFIX)) {
          totalCollections++;
          const tenantId = collection.name.replace(`${this.COLLECTION_PREFIX}_`, '').replace(/_/g, '-');
          const stats = await this.getTenantCollectionStats(tenantId);
          
          if (stats) {
            tenantCollections.push(stats);
            totalVectors += stats.chunksCount;
          }
        }
      }

      return {
        totalVectors,
        totalCollections,
        tenantCollections,
        storageSize: 0 // Qdrant não fornece essa informação facilmente
      };
    } catch (error) {
      console.error('Error getting vector stats:', error);
      return {
        totalVectors: 0,
        totalCollections: 0,
        tenantCollections: [],
        storageSize: 0
      };
    }
  }

  /**
   * Limpa todos os dados de um tenant
   */
  async clearTenantData(tenantId: string): Promise<boolean> {
    try {
      return await this.deleteTenantCollection(tenantId);
    } catch (error) {
      console.error('Error clearing tenant data:', error);
      return false;
    }
  }

  /**
   * Migra dados de um tenant para outro
   */
  async migrateTenantData(
    sourceTenantId: string,
    targetTenantId: string
  ): Promise<boolean> {
    try {
      const sourceCollection = this.getTenantCollectionName(sourceTenantId);
      const targetCollection = this.getTenantCollectionName(targetTenantId);
      
      if (!(await this.collectionExists(sourceTenantId))) {
        console.log(`Source collection for tenant ${sourceTenantId} does not exist`);
        return false;
      }

      // Garantir que a coleção de destino existe
      if (!(await this.collectionExists(targetTenantId))) {
        await this.createTenantCollection(targetTenantId);
      }

      // Buscar todos os pontos do tenant de origem
      const scrollResult = await this.client.scroll(sourceCollection, {
        filter: {
          must: [{
            key: 'tenantId',
            match: { value: sourceTenantId }
          }]
        },
        limit: 10000,
        with_payload: true,
        with_vector: true
      });

      if (scrollResult.points.length === 0) {
        console.log(`No data found for tenant ${sourceTenantId}`);
        return true;
      }

      // Atualizar tenantId nos payloads e inserir na coleção de destino
      const migratedPoints = scrollResult.points.map(point => ({
        id: point.id,
        vector: point.vector,
        payload: {
          ...point.payload,
          tenantId: targetTenantId
        }
      }));

      await this.client.upsert(targetCollection, {
        wait: true,
        points: migratedPoints
      });

      console.log(`Migrated ${migratedPoints.length} vectors from ${sourceTenantId} to ${targetTenantId}`);
      return true;
    } catch (error) {
      console.error('Error migrating tenant data:', error);
      return false;
    }
  }

  /**
   * Verifica saúde da conexão com Qdrant
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.getCollections();
      return true;
    } catch (error) {
      console.error('Qdrant health check failed:', error);
      return false;
    }
  }

  /**
   * Obtém informações do cluster Qdrant
   */
  async getClusterInfo(): Promise<any> {
    try {
      return await this.client.getCollections();
    } catch (error) {
      console.error('Error getting cluster info:', error);
      return null;
    }
  }
}

// Instância singleton do serviço
let qdrantInstance: QdrantMultiTenantService | null = null;

export function getQdrantService(): QdrantMultiTenantService {
  if (!qdrantInstance) {
    const config: QdrantConfig = {
      url: process.env.QDRANT_URL || 'http://localhost:6333',
      apiKey: process.env.QDRANT_API_KEY,
    };
    qdrantInstance = new QdrantMultiTenantService(config);
  }
  return qdrantInstance;
}

export default QdrantMultiTenantService;