/**
 * Configuração de isolamento de dados por tenant usando MySQL
 * Implementa Row-Level Security (RLS) e políticas de acesso
 */

import mysql from 'mysql2/promise';
import { Tenant } from '@/types';

// Interface para configuração de conexão com tenant
interface TenantConnection {
  tenantId: string;
  connection: mysql.Connection;
  lastUsed: Date;
}

// Cache de conexões por tenant
const tenantConnections = new Map<string, TenantConnection>();
const CONNECTION_TIMEOUT = 30 * 60 * 1000; // 30 minutos

// Configuração base do banco
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nex_web',
  charset: 'utf8mb4',
  timezone: '+00:00',
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
};

/**
 * Classe para gerenciar isolamento de dados por tenant
 */
export class MySQLTenantIsolation {
  private static instance: MySQLTenantIsolation;
  private pool: mysql.Pool;

  private constructor() {
    this.pool = mysql.createPool({
      ...dbConfig,
      connectionLimit: 20,
      queueLimit: 0,
    });
  }

  public static getInstance(): MySQLTenantIsolation {
    if (!MySQLTenantIsolation.instance) {
      MySQLTenantIsolation.instance = new MySQLTenantIsolation();
    }
    return MySQLTenantIsolation.instance;
  }

  /**
   * Obter conexão isolada por tenant
   */
  async getTenantConnection(tenantId: string): Promise<mysql.Connection> {
    // Verificar se já existe uma conexão ativa para o tenant
    const existingConnection = tenantConnections.get(tenantId);
    
    if (existingConnection && this.isConnectionValid(existingConnection)) {
      existingConnection.lastUsed = new Date();
      return existingConnection.connection;
    }

    // Criar nova conexão
    const connection = await this.pool.getConnection();
    
    // Configurar contexto do tenant na sessão
    await this.setTenantContext(connection, tenantId);
    
    // Armazenar no cache
    tenantConnections.set(tenantId, {
      tenantId,
      connection,
      lastUsed: new Date(),
    });

    return connection;
  }

  /**
   * Configurar contexto do tenant na sessão MySQL
   */
  private async setTenantContext(connection: mysql.Connection, tenantId: string): Promise<void> {
    // Definir variáveis de sessão para o tenant
    await connection.execute('SET @current_tenant_id = ?', [tenantId]);
    
    // Obter informações do tenant e definir contexto adicional
    const [tenantRows] = await connection.execute(
      'SELECT id, parent_tenant_id, tenant_path, level FROM tenants WHERE id = ? AND is_active = 1',
      [tenantId]
    ) as [any[], any];

    if (tenantRows.length === 0) {
      throw new Error(`Tenant ${tenantId} não encontrado ou inativo`);
    }

    const tenant = tenantRows[0];
    
    // Definir variáveis de contexto do tenant
    await connection.execute('SET @current_tenant_path = ?', [tenant.tenant_path]);
    await connection.execute('SET @current_tenant_level = ?', [tenant.level]);
    await connection.execute('SET @parent_tenant_id = ?', [tenant.parent_tenant_id]);
  }

  /**
   * Verificar se a conexão ainda é válida
   */
  private isConnectionValid(tenantConnection: TenantConnection): boolean {
    const now = new Date();
    const timeDiff = now.getTime() - tenantConnection.lastUsed.getTime();
    return timeDiff < CONNECTION_TIMEOUT;
  }

  /**
   * Executar query com isolamento de tenant
   */
  async executeQuery(
    tenantId: string,
    query: string,
    params: any[] = []
  ): Promise<[any[], mysql.FieldPacket[]]> {
    const connection = await this.getTenantConnection(tenantId);
    
    try {
      return await connection.execute(query, params) as [any[], mysql.FieldPacket[]];
    } catch (error) {
      console.error('Erro ao executar query:', error);
      throw error;
    }
  }

  /**
   * Executar transação com isolamento de tenant
   */
  async executeTransaction(
    tenantId: string,
    operations: (connection: mysql.Connection) => Promise<any>
  ): Promise<any> {
    const connection = await this.getTenantConnection(tenantId);
    
    try {
      await connection.beginTransaction();
      const result = await operations(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  }

  /**
   * Limpar conexões expiradas
   */
  cleanupExpiredConnections(): void {
    const now = new Date();
    
    for (const [tenantId, tenantConnection] of Array.from(tenantConnections.entries())) {
      if (!this.isConnectionValid(tenantConnection)) {
        tenantConnection.connection.end();
        tenantConnections.delete(tenantId);
      }
    }
  }

  /**
   * Fechar todas as conexões
   */
  async closeAllConnections(): Promise<void> {
    for (const [tenantId, tenantConnection] of Array.from(tenantConnections.entries())) {
      tenantConnection.connection.end();
      tenantConnections.delete(tenantId);
    }
    
    await this.pool.end();
  }

  /**
   * Obter conexão do pool
   */
  async getPoolConnection(): Promise<mysql.PoolConnection> {
    return await this.pool.getConnection();
  }
}

/**
 * SQL para criar as políticas de Row-Level Security
 */
export const RLS_POLICIES = {
  // Política para tabela de usuários
  users: `
    CREATE OR REPLACE VIEW users_view AS
    SELECT u.*
    FROM users u
    INNER JOIN user_tenants ut ON u.id = ut.user_id
    WHERE ut.tenant_id = @current_tenant_id
       OR ut.tenant_id IN (
         SELECT id FROM tenants 
         WHERE tenant_path LIKE CONCAT(@current_tenant_path, '%')
           AND level >= @current_tenant_level
       )
  `,

  // Política para tabela de chats
  chats: `
    CREATE OR REPLACE VIEW chats_view AS
    SELECT c.*
    FROM chats c
    WHERE c.tenant_id = @current_tenant_id
       OR c.tenant_id IN (
         SELECT id FROM tenants 
         WHERE tenant_path LIKE CONCAT(@current_tenant_path, '%')
           AND level >= @current_tenant_level
       )
  `,

  // Política para tabela de documentos
  documents: `
    CREATE OR REPLACE VIEW documents_view AS
    SELECT d.*
    FROM documents d
    WHERE d.tenant_id = @current_tenant_id
       OR d.tenant_id IN (
         SELECT id FROM tenants 
         WHERE tenant_path LIKE CONCAT(@current_tenant_path, '%')
           AND level >= @current_tenant_level
       )
  `,

  // Política para tabela de agentes
  agents: `
    CREATE OR REPLACE VIEW agents_view AS
    SELECT a.*
    FROM agents a
    WHERE a.tenant_id = @current_tenant_id
       OR a.tenant_id IN (
         SELECT id FROM tenants 
         WHERE tenant_path LIKE CONCAT(@current_tenant_path, '%')
           AND level >= @current_tenant_level
       )
  `,

  // Política para tabela de tickets
  tickets: `
    CREATE OR REPLACE VIEW tickets_view AS
    SELECT t.*
    FROM tickets t
    WHERE t.tenant_id = @current_tenant_id
       OR t.tenant_id IN (
         SELECT id FROM tenants 
         WHERE tenant_path LIKE CONCAT(@current_tenant_path, '%')
           AND level >= @current_tenant_level
       )
  `,

  // Política para tabela de contatos
  contacts: `
    CREATE OR REPLACE VIEW contacts_view AS
    SELECT c.*
    FROM contacts c
    WHERE c.tenant_id = @current_tenant_id
       OR c.tenant_id IN (
         SELECT id FROM tenants 
         WHERE tenant_path LIKE CONCAT(@current_tenant_path, '%')
           AND level >= @current_tenant_level
       )
  `,

  // Política para tabela de deals
  deals: `
    CREATE OR REPLACE VIEW deals_view AS
    SELECT d.*
    FROM deals d
    WHERE d.tenant_id = @current_tenant_id
       OR d.tenant_id IN (
         SELECT id FROM tenants 
         WHERE tenant_path LIKE CONCAT(@current_tenant_path, '%')
           AND level >= @current_tenant_level
       )
  `,
};

/**
 * Triggers para garantir isolamento em inserções
 */
export const RLS_TRIGGERS = {
  // Trigger para inserções na tabela de chats
  chats_insert: `
    CREATE TRIGGER chats_tenant_insert
    BEFORE INSERT ON chats
    FOR EACH ROW
    BEGIN
      IF NEW.tenant_id IS NULL THEN
        SET NEW.tenant_id = @current_tenant_id;
      END IF;
      
      -- Verificar se o tenant é válido
      IF NOT EXISTS (
        SELECT 1 FROM tenants 
        WHERE id = NEW.tenant_id 
          AND (id = @current_tenant_id 
               OR tenant_path LIKE CONCAT(@current_tenant_path, '%'))
      ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Acesso negado ao tenant especificado';
      END IF;
    END
  `,

  // Trigger para inserções na tabela de documentos
  documents_insert: `
    CREATE TRIGGER documents_tenant_insert
    BEFORE INSERT ON documents
    FOR EACH ROW
    BEGIN
      IF NEW.tenant_id IS NULL THEN
        SET NEW.tenant_id = @current_tenant_id;
      END IF;
      
      IF NOT EXISTS (
        SELECT 1 FROM tenants 
        WHERE id = NEW.tenant_id 
          AND (id = @current_tenant_id 
               OR tenant_path LIKE CONCAT(@current_tenant_path, '%'))
      ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Acesso negado ao tenant especificado';
      END IF;
    END
  `,

  // Trigger para inserções na tabela de agentes
  agents_insert: `
    CREATE TRIGGER agents_tenant_insert
    BEFORE INSERT ON agents
    FOR EACH ROW
    BEGIN
      IF NEW.tenant_id IS NULL THEN
        SET NEW.tenant_id = @current_tenant_id;
      END IF;
      
      IF NOT EXISTS (
        SELECT 1 FROM tenants 
        WHERE id = NEW.tenant_id 
          AND (id = @current_tenant_id 
               OR tenant_path LIKE CONCAT(@current_tenant_path, '%'))
      ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Acesso negado ao tenant especificado';
      END IF;
    END
  `,
};

/**
 * Função para aplicar todas as políticas de RLS
 */
export async function applyRLSPolicies(): Promise<void> {
  const isolation = MySQLTenantIsolation.getInstance();
  const connection = await isolation.getPoolConnection();
  
  try {
    // Aplicar views
    for (const [table, policy] of Object.entries(RLS_POLICIES)) {
      console.log(`Aplicando política RLS para tabela: ${table}`);
      await connection.execute(policy);
    }
    
    // Aplicar triggers
    for (const [trigger, sql] of Object.entries(RLS_TRIGGERS)) {
      console.log(`Aplicando trigger: ${trigger}`);
      try {
        await connection.execute(`DROP TRIGGER IF EXISTS ${trigger}`);
        await connection.execute(sql);
      } catch (error) {
        console.warn(`Aviso ao aplicar trigger ${trigger}:`, error);
      }
    }
    
    console.log('Políticas de RLS aplicadas com sucesso!');
  } catch (error) {
    console.error('Erro ao aplicar políticas de RLS:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Função para verificar se um usuário pode acessar um tenant
 */
export async function verifyTenantAccess(
  userId: string,
  tenantId: string
): Promise<boolean> {
  const isolation = MySQLTenantIsolation.getInstance();
  
  try {
    const [rows] = await isolation.executeQuery(
      tenantId,
      `
      SELECT 1
      FROM user_tenants ut
      INNER JOIN tenants t ON ut.tenant_id = t.id
      WHERE ut.user_id = ?
        AND (ut.tenant_id = ? 
             OR t.tenant_path LIKE CONCAT(
               (SELECT tenant_path FROM tenants WHERE id = ?), '%'
             ))
        AND t.is_active = 1
      LIMIT 1
      `,
      [userId, tenantId, tenantId]
    );
    
    return rows.length > 0;
  } catch (error) {
    console.error('Erro ao verificar acesso ao tenant:', error);
    return false;
  }
}

/**
 * Função para obter tenants acessíveis por um usuário
 */
export async function getUserAccessibleTenants(
  userId: string
): Promise<Tenant[]> {
  const isolation = MySQLTenantIsolation.getInstance();
  
  try {
    const [rows] = await isolation.executeQuery(
      'system', // Usar contexto de sistema para esta consulta
      `
      SELECT DISTINCT t.*
      FROM tenants t
      INNER JOIN user_tenants ut ON t.id = ut.tenant_id
      WHERE ut.user_id = ?
        AND t.is_active = 1
      ORDER BY t.level, t.name
      `,
      [userId]
    );
    
    return rows as Tenant[];
  } catch (error) {
    console.error('Erro ao obter tenants acessíveis:', error);
    return [];
  }
}

// Inicializar limpeza automática de conexões
setInterval(() => {
  MySQLTenantIsolation.getInstance().cleanupExpiredConnections();
}, 5 * 60 * 1000); // A cada 5 minutos

// Exportar instância singleton
export const tenantIsolation = MySQLTenantIsolation.getInstance();