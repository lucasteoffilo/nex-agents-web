/**
 * Redis Multi-Tenant Cache Service
 * Implementa cache otimizado para sistema multi-tenant com isolamento de dados
 */

import Redis from 'ioredis';
import { TenantHierarchy, MultiTenantQuery } from '@/types';

export interface CacheConfig {
  defaultTTL: number;
  maxRetries: number;
  retryDelayOnFailover: number;
  enableReadyCheck: boolean;
  maxRetriesPerRequest: number;
}

export interface TenantCacheKey {
  tenantId: string;
  resource: string;
  identifier?: string;
  params?: Record<string, any>;
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
}

export class RedisMultiTenantCache {
  private redis: Redis;
  private config: CacheConfig;
  private stats: Map<string, CacheStats> = new Map();
  private readonly TENANT_PREFIX = 'tenant';
  private readonly HIERARCHY_PREFIX = 'hierarchy';
  private readonly PERMISSIONS_PREFIX = 'permissions';
  private readonly QUERY_PREFIX = 'query';

  constructor(redisUrl?: string, config?: Partial<CacheConfig>) {
    this.config = {
      defaultTTL: 3600, // 1 hora
      maxRetries: 3,
      retryDelayOnFailover: 100,
      enableReadyCheck: true,
      maxRetriesPerRequest: 3,
      ...config
    };

    this.redis = new Redis(redisUrl || process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: this.config.maxRetriesPerRequest,
      retryDelayOnFailover: this.config.retryDelayOnFailover,
      enableReadyCheck: this.config.enableReadyCheck,
      lazyConnect: true,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.redis.on('error', (error) => {
      console.error('Redis connection error:', error);
      this.incrementStat('global', 'errors');
    });

    this.redis.on('connect', () => {
      console.log('Redis connected successfully');
    });

    this.redis.on('ready', () => {
      console.log('Redis ready for operations');
    });
  }

  /**
   * Gera chave de cache específica para tenant
   */
  private generateTenantKey(cacheKey: TenantCacheKey): string {
    const { tenantId, resource, identifier, params } = cacheKey;
    let key = `${this.TENANT_PREFIX}:${tenantId}:${resource}`;
    
    if (identifier) {
      key += `:${identifier}`;
    }
    
    if (params && Object.keys(params).length > 0) {
      const sortedParams = Object.keys(params)
        .sort()
        .map(k => `${k}=${params[k]}`)
        .join('&');
      key += `:${Buffer.from(sortedParams).toString('base64')}`;
    }
    
    return key;
  }

  /**
   * Gera chave para hierarquia de tenants
   */
  private generateHierarchyKey(tenantId: string): string {
    return `${this.HIERARCHY_PREFIX}:${tenantId}`;
  }

  /**
   * Gera chave para permissões de usuário
   */
  private generatePermissionsKey(userId: string, tenantId: string): string {
    return `${this.PERMISSIONS_PREFIX}:${userId}:${tenantId}`;
  }

  /**
   * Gera chave para consultas multi-tenant
   */
  private generateQueryKey(query: MultiTenantQuery): string {
    const queryHash = Buffer.from(JSON.stringify(query)).toString('base64');
    return `${this.QUERY_PREFIX}:${query.tenantId}:${queryHash}`;
  }

  /**
   * Incrementa estatística de cache
   */
  private incrementStat(tenantId: string, stat: keyof CacheStats): void {
    if (!this.stats.has(tenantId)) {
      this.stats.set(tenantId, {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0,
        errors: 0
      });
    }
    
    const stats = this.stats.get(tenantId)!;
    stats[stat]++;
  }

  /**
   * Cache de dados específicos do tenant
   */
  async setTenantData<T>(
    cacheKey: TenantCacheKey, 
    data: T, 
    ttl?: number
  ): Promise<boolean> {
    try {
      const key = this.generateTenantKey(cacheKey);
      const serializedData = JSON.stringify(data);
      const result = await this.redis.setex(
        key, 
        ttl || this.config.defaultTTL, 
        serializedData
      );
      
      this.incrementStat(cacheKey.tenantId, 'sets');
      return result === 'OK';
    } catch (error) {
      console.error('Error setting tenant cache:', error);
      this.incrementStat(cacheKey.tenantId, 'errors');
      return false;
    }
  }

  /**
   * Recupera dados do cache do tenant
   */
  async getTenantData<T>(cacheKey: TenantCacheKey): Promise<T | null> {
    try {
      const key = this.generateTenantKey(cacheKey);
      const data = await this.redis.get(key);
      
      if (data) {
        this.incrementStat(cacheKey.tenantId, 'hits');
        return JSON.parse(data) as T;
      } else {
        this.incrementStat(cacheKey.tenantId, 'misses');
        return null;
      }
    } catch (error) {
      console.error('Error getting tenant cache:', error);
      this.incrementStat(cacheKey.tenantId, 'errors');
      return null;
    }
  }

  /**
   * Cache de hierarquia de tenants
   */
  async setTenantHierarchy(
    tenantId: string, 
    hierarchy: TenantHierarchy, 
    ttl?: number
  ): Promise<boolean> {
    try {
      const key = this.generateHierarchyKey(tenantId);
      const result = await this.redis.setex(
        key, 
        ttl || this.config.defaultTTL, 
        JSON.stringify(hierarchy)
      );
      
      this.incrementStat(tenantId, 'sets');
      return result === 'OK';
    } catch (error) {
      console.error('Error setting tenant hierarchy cache:', error);
      this.incrementStat(tenantId, 'errors');
      return false;
    }
  }

  /**
   * Recupera hierarquia do tenant do cache
   */
  async getTenantHierarchy(tenantId: string): Promise<TenantHierarchy | null> {
    try {
      const key = this.generateHierarchyKey(tenantId);
      const data = await this.redis.get(key);
      
      if (data) {
        this.incrementStat(tenantId, 'hits');
        return JSON.parse(data) as TenantHierarchy;
      } else {
        this.incrementStat(tenantId, 'misses');
        return null;
      }
    } catch (error) {
      console.error('Error getting tenant hierarchy cache:', error);
      this.incrementStat(tenantId, 'errors');
      return null;
    }
  }

  /**
   * Cache de permissões de usuário
   */
  async setUserPermissions(
    userId: string, 
    tenantId: string, 
    permissions: string[], 
    ttl?: number
  ): Promise<boolean> {
    try {
      const key = this.generatePermissionsKey(userId, tenantId);
      const result = await this.redis.setex(
        key, 
        ttl || this.config.defaultTTL, 
        JSON.stringify(permissions)
      );
      
      this.incrementStat(tenantId, 'sets');
      return result === 'OK';
    } catch (error) {
      console.error('Error setting user permissions cache:', error);
      this.incrementStat(tenantId, 'errors');
      return false;
    }
  }

  /**
   * Recupera permissões do usuário do cache
   */
  async getUserPermissions(userId: string, tenantId: string): Promise<string[] | null> {
    try {
      const key = this.generatePermissionsKey(userId, tenantId);
      const data = await this.redis.get(key);
      
      if (data) {
        this.incrementStat(tenantId, 'hits');
        return JSON.parse(data) as string[];
      } else {
        this.incrementStat(tenantId, 'misses');
        return null;
      }
    } catch (error) {
      console.error('Error getting user permissions cache:', error);
      this.incrementStat(tenantId, 'errors');
      return null;
    }
  }

  /**
   * Cache de consultas multi-tenant
   */
  async setQueryResult<T>(
    query: MultiTenantQuery, 
    result: T, 
    ttl?: number
  ): Promise<boolean> {
    try {
      const key = this.generateQueryKey(query);
      const serializedResult = JSON.stringify(result);
      const setResult = await this.redis.setex(
        key, 
        ttl || this.config.defaultTTL, 
        serializedResult
      );
      
      this.incrementStat(query.tenantId, 'sets');
      return setResult === 'OK';
    } catch (error) {
      console.error('Error setting query cache:', error);
      this.incrementStat(query.tenantId, 'errors');
      return false;
    }
  }

  /**
   * Recupera resultado de consulta do cache
   */
  async getQueryResult<T>(query: MultiTenantQuery): Promise<T | null> {
    try {
      const key = this.generateQueryKey(query);
      const data = await this.redis.get(key);
      
      if (data) {
        this.incrementStat(query.tenantId, 'hits');
        return JSON.parse(data) as T;
      } else {
        this.incrementStat(query.tenantId, 'misses');
        return null;
      }
    } catch (error) {
      console.error('Error getting query cache:', error);
      this.incrementStat(query.tenantId, 'errors');
      return null;
    }
  }

  /**
   * Invalida cache específico do tenant
   */
  async invalidateTenantCache(
    tenantId: string, 
    resource?: string
  ): Promise<number> {
    try {
      let pattern = `${this.TENANT_PREFIX}:${tenantId}`;
      if (resource) {
        pattern += `:${resource}*`;
      } else {
        pattern += ':*';
      }
      
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        const result = await this.redis.del(...keys);
        this.incrementStat(tenantId, 'deletes');
        return result;
      }
      return 0;
    } catch (error) {
      console.error('Error invalidating tenant cache:', error);
      this.incrementStat(tenantId, 'errors');
      return 0;
    }
  }

  /**
   * Invalida cache de hierarquia
   */
  async invalidateHierarchyCache(tenantId: string): Promise<boolean> {
    try {
      const key = this.generateHierarchyKey(tenantId);
      const result = await this.redis.del(key);
      this.incrementStat(tenantId, 'deletes');
      return result > 0;
    } catch (error) {
      console.error('Error invalidating hierarchy cache:', error);
      this.incrementStat(tenantId, 'errors');
      return false;
    }
  }

  /**
   * Invalida cache de permissões do usuário
   */
  async invalidateUserPermissions(userId: string, tenantId?: string): Promise<number> {
    try {
      let pattern = `${this.PERMISSIONS_PREFIX}:${userId}`;
      if (tenantId) {
        pattern += `:${tenantId}`;
      } else {
        pattern += ':*';
      }
      
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        const result = await this.redis.del(...keys);
        this.incrementStat(tenantId || 'global', 'deletes');
        return result;
      }
      return 0;
    } catch (error) {
      console.error('Error invalidating user permissions cache:', error);
      this.incrementStat(tenantId || 'global', 'errors');
      return 0;
    }
  }

  /**
   * Invalida cache de consultas
   */
  async invalidateQueryCache(tenantId: string): Promise<number> {
    try {
      const pattern = `${this.QUERY_PREFIX}:${tenantId}:*`;
      const keys = await this.redis.keys(pattern);
      
      if (keys.length > 0) {
        const result = await this.redis.del(...keys);
        this.incrementStat(tenantId, 'deletes');
        return result;
      }
      return 0;
    } catch (error) {
      console.error('Error invalidating query cache:', error);
      this.incrementStat(tenantId, 'errors');
      return 0;
    }
  }

  /**
   * Limpa todo o cache de um tenant
   */
  async clearTenantCache(tenantId: string): Promise<number> {
    try {
      const patterns = [
        `${this.TENANT_PREFIX}:${tenantId}:*`,
        `${this.HIERARCHY_PREFIX}:${tenantId}`,
        `${this.PERMISSIONS_PREFIX}:*:${tenantId}`,
        `${this.QUERY_PREFIX}:${tenantId}:*`
      ];
      
      let totalDeleted = 0;
      
      for (const pattern of patterns) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          const deleted = await this.redis.del(...keys);
          totalDeleted += deleted;
        }
      }
      
      this.incrementStat(tenantId, 'deletes');
      return totalDeleted;
    } catch (error) {
      console.error('Error clearing tenant cache:', error);
      this.incrementStat(tenantId, 'errors');
      return 0;
    }
  }

  /**
   * Obtém estatísticas de cache
   */
  getCacheStats(tenantId?: string): CacheStats | Map<string, CacheStats> {
    if (tenantId) {
      return this.stats.get(tenantId) || {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0,
        errors: 0
      };
    }
    return this.stats;
  }

  /**
   * Reseta estatísticas de cache
   */
  resetStats(tenantId?: string): void {
    if (tenantId) {
      this.stats.delete(tenantId);
    } else {
      this.stats.clear();
    }
  }

  /**
   * Verifica se o Redis está conectado
   */
  async isConnected(): Promise<boolean> {
    try {
      const result = await this.redis.ping();
      return result === 'PONG';
    } catch (error) {
      return false;
    }
  }

  /**
   * Fecha conexão com Redis
   */
  async disconnect(): Promise<void> {
    await this.redis.quit();
  }

  /**
   * Obtém informações do Redis
   */
  async getRedisInfo(): Promise<any> {
    try {
      const info = await this.redis.info();
      return info;
    } catch (error) {
      console.error('Error getting Redis info:', error);
      return null;
    }
  }
}

// Instância singleton do cache
let cacheInstance: RedisMultiTenantCache | null = null;

export function getRedisCache(): RedisMultiTenantCache {
  if (!cacheInstance) {
    cacheInstance = new RedisMultiTenantCache();
  }
  return cacheInstance;
}

export default RedisMultiTenantCache;