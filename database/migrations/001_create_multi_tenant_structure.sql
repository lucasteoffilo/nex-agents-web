-- Migração para criar estrutura multi-tenant
-- Arquivo: 001_create_multi_tenant_structure.sql

-- ============================================================================
-- TABELAS PRINCIPAIS
-- ============================================================================

-- Tabela de tenants (clientes e sub-clientes)
CREATE TABLE IF NOT EXISTS tenants (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  parent_tenant_id VARCHAR(36),
  tenant_path VARCHAR(1000) NOT NULL, -- Caminho hierárquico: /tenant1/tenant2/tenant3
  level INT NOT NULL DEFAULT 0, -- Nível na hierarquia (0 = principal, 1 = cliente, 2+ = sub-clientes)
  max_sub_tenants INT DEFAULT NULL, -- Limite de sub-tenants (NULL = ilimitado)
  current_sub_tenants INT DEFAULT 0, -- Contador atual de sub-tenants
  is_active BOOLEAN DEFAULT TRUE,
  settings JSON, -- Configurações específicas do tenant
  metadata JSON, -- Metadados adicionais (indústria, tamanho, etc.)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Índices
  INDEX idx_tenant_parent (parent_tenant_id),
  INDEX idx_tenant_path (tenant_path),
  INDEX idx_tenant_level (level),
  INDEX idx_tenant_active (is_active),
  
  -- Constraints
  FOREIGN KEY (parent_tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT chk_tenant_level CHECK (level >= 0),
  CONSTRAINT chk_max_sub_tenants CHECK (max_sub_tenants IS NULL OR max_sub_tenants >= 0)
);

-- Tabela de roles/papéis
CREATE TABLE IF NOT EXISTS roles (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  level ENUM('system', 'tenant', 'user') NOT NULL DEFAULT 'user',
  permissions JSON, -- Array de permissões
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_role_slug (slug),
  INDEX idx_role_level (level)
);

-- Tabela de permissões
CREATE TABLE IF NOT EXISTS permissions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  resource VARCHAR(100) NOT NULL, -- Ex: 'user', 'tenant', 'chat', etc.
  action VARCHAR(50) NOT NULL, -- Ex: 'create', 'read', 'update', 'delete'
  scope VARCHAR(50) DEFAULT 'own', -- 'own', 'tenant', 'all'
  conditions JSON, -- Condições adicionais
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_permission_slug (slug),
  INDEX idx_permission_resource (resource),
  INDEX idx_permission_action (action),
  INDEX idx_permission_scope (scope)
);

-- Tabela de usuários (atualizada para multi-tenant)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  email_verified_at TIMESTAMP NULL,
  last_login_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_user_email (email),
  INDEX idx_user_active (is_active)
);

-- Tabela de relacionamento usuário-tenant (muitos para muitos)
CREATE TABLE IF NOT EXISTS user_tenants (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  tenant_id VARCHAR(36) NOT NULL,
  role_id VARCHAR(36) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  invited_by VARCHAR(36), -- Usuário que fez o convite
  invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  joined_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Índices
  INDEX idx_user_tenant_user (user_id),
  INDEX idx_user_tenant_tenant (tenant_id),
  INDEX idx_user_tenant_role (role_id),
  INDEX idx_user_tenant_active (is_active),
  
  -- Constraints
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
  FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE SET NULL,
  
  -- Garantir que um usuário não tenha múltiplos roles no mesmo tenant
  UNIQUE KEY unique_user_tenant (user_id, tenant_id)
);

-- Tabela de convites para tenants
CREATE TABLE IF NOT EXISTS tenant_invitations (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  tenant_id VARCHAR(36) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role_id VARCHAR(36) NOT NULL,
  invited_by VARCHAR(36) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  accepted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_invitation_token (token),
  INDEX idx_invitation_email (email),
  INDEX idx_invitation_tenant (tenant_id),
  INDEX idx_invitation_expires (expires_at),
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- ATUALIZAR TABELAS EXISTENTES PARA SUPORTE MULTI-TENANT
-- ============================================================================

-- Adicionar tenant_id às tabelas existentes
ALTER TABLE chats ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) NOT NULL;
ALTER TABLE chats ADD INDEX IF NOT EXISTS idx_chat_tenant (tenant_id);
ALTER TABLE chats ADD CONSTRAINT IF NOT EXISTS fk_chat_tenant 
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE messages ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) NOT NULL;
ALTER TABLE messages ADD INDEX IF NOT EXISTS idx_message_tenant (tenant_id);
ALTER TABLE messages ADD CONSTRAINT IF NOT EXISTS fk_message_tenant 
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE documents ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) NOT NULL;
ALTER TABLE documents ADD INDEX IF NOT EXISTS idx_document_tenant (tenant_id);
ALTER TABLE documents ADD CONSTRAINT IF NOT EXISTS fk_document_tenant 
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) NOT NULL;
ALTER TABLE document_chunks ADD INDEX IF NOT EXISTS idx_chunk_tenant (tenant_id);
ALTER TABLE document_chunks ADD CONSTRAINT IF NOT EXISTS fk_chunk_tenant 
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE agents ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) NOT NULL;
ALTER TABLE agents ADD INDEX IF NOT EXISTS idx_agent_tenant (tenant_id);
ALTER TABLE agents ADD CONSTRAINT IF NOT EXISTS fk_agent_tenant 
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE tickets ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) NOT NULL;
ALTER TABLE tickets ADD INDEX IF NOT EXISTS idx_ticket_tenant (tenant_id);
ALTER TABLE tickets ADD CONSTRAINT IF NOT EXISTS fk_ticket_tenant 
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE contacts ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) NOT NULL;
ALTER TABLE contacts ADD INDEX IF NOT EXISTS idx_contact_tenant (tenant_id);
ALTER TABLE contacts ADD CONSTRAINT IF NOT EXISTS fk_contact_tenant 
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE deals ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) NOT NULL;
ALTER TABLE deals ADD INDEX IF NOT EXISTS idx_deal_tenant (tenant_id);
ALTER TABLE deals ADD CONSTRAINT IF NOT EXISTS fk_deal_tenant 
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- ============================================================================
-- DADOS INICIAIS
-- ============================================================================

-- Inserir roles padrão
INSERT IGNORE INTO roles (id, name, slug, description, level, permissions) VALUES
('role-system-admin', 'Administrador do Sistema', 'system-admin', 'Acesso total ao sistema', 'system', JSON_ARRAY('*')),
('role-tenant-admin', 'Administrador do Tenant', 'tenant-admin', 'Administrador de um tenant específico', 'tenant', JSON_ARRAY(
  'tenant.read', 'tenant.update', 'tenant.create-sub', 'tenant.manage-users',
  'user.create', 'user.read', 'user.update', 'user.delete',
  'chat.create', 'chat.read', 'chat.update', 'chat.delete',
  'document.create', 'document.read', 'document.update', 'document.delete',
  'agent.create', 'agent.read', 'agent.update', 'agent.delete',
  'ticket.create', 'ticket.read', 'ticket.update', 'ticket.delete',
  'contact.create', 'contact.read', 'contact.update', 'contact.delete',
  'deal.create', 'deal.read', 'deal.update', 'deal.delete'
)),
('role-tenant-user', 'Usuário do Tenant', 'tenant-user', 'Usuário padrão de um tenant', 'user', JSON_ARRAY(
  'chat.create', 'chat.read', 'chat.update-own', 'chat.delete-own',
  'document.create', 'document.read', 'document.update-own', 'document.delete-own',
  'ticket.create', 'ticket.read-own', 'ticket.update-own',
  'contact.read', 'deal.read'
)),
('role-agent', 'Agente', 'agent', 'Agente de atendimento', 'user', JSON_ARRAY(
  'chat.create', 'chat.read', 'chat.update', 'chat.delete-own',
  'document.read', 'ticket.read', 'ticket.update', 'ticket.create',
  'contact.read', 'contact.update', 'deal.read', 'deal.update'
));

-- Inserir permissões padrão
INSERT IGNORE INTO permissions (name, slug, resource, action, scope, description) VALUES
-- Permissões de tenant
('Ler Tenant', 'tenant.read', 'tenant', 'read', 'own', 'Visualizar informações do tenant'),
('Atualizar Tenant', 'tenant.update', 'tenant', 'update', 'own', 'Atualizar informações do tenant'),
('Criar Sub-tenant', 'tenant.create-sub', 'tenant', 'create', 'tenant', 'Criar sub-tenants'),
('Gerenciar Usuários do Tenant', 'tenant.manage-users', 'tenant', 'manage-users', 'tenant', 'Gerenciar usuários do tenant'),

-- Permissões de usuário
('Criar Usuário', 'user.create', 'user', 'create', 'tenant', 'Criar novos usuários'),
('Ler Usuário', 'user.read', 'user', 'read', 'tenant', 'Visualizar usuários'),
('Atualizar Usuário', 'user.update', 'user', 'update', 'tenant', 'Atualizar usuários'),
('Deletar Usuário', 'user.delete', 'user', 'delete', 'tenant', 'Deletar usuários'),

-- Permissões de chat
('Criar Chat', 'chat.create', 'chat', 'create', 'tenant', 'Criar novos chats'),
('Ler Chat', 'chat.read', 'chat', 'read', 'tenant', 'Visualizar chats'),
('Atualizar Chat', 'chat.update', 'chat', 'update', 'tenant', 'Atualizar chats'),
('Atualizar Chat Próprio', 'chat.update-own', 'chat', 'update', 'own', 'Atualizar próprios chats'),
('Deletar Chat', 'chat.delete', 'chat', 'delete', 'tenant', 'Deletar chats'),
('Deletar Chat Próprio', 'chat.delete-own', 'chat', 'delete', 'own', 'Deletar próprios chats'),

-- Permissões de documento
('Criar Documento', 'document.create', 'document', 'create', 'tenant', 'Criar novos documentos'),
('Ler Documento', 'document.read', 'document', 'read', 'tenant', 'Visualizar documentos'),
('Atualizar Documento', 'document.update', 'document', 'update', 'tenant', 'Atualizar documentos'),
('Atualizar Documento Próprio', 'document.update-own', 'document', 'update', 'own', 'Atualizar próprios documentos'),
('Deletar Documento', 'document.delete', 'document', 'delete', 'tenant', 'Deletar documentos'),
('Deletar Documento Próprio', 'document.delete-own', 'document', 'delete', 'own', 'Deletar próprios documentos'),

-- Permissões de agente
('Criar Agente', 'agent.create', 'agent', 'create', 'tenant', 'Criar novos agentes'),
('Ler Agente', 'agent.read', 'agent', 'read', 'tenant', 'Visualizar agentes'),
('Atualizar Agente', 'agent.update', 'agent', 'update', 'tenant', 'Atualizar agentes'),
('Deletar Agente', 'agent.delete', 'agent', 'delete', 'tenant', 'Deletar agentes'),

-- Permissões de ticket
('Criar Ticket', 'ticket.create', 'ticket', 'create', 'tenant', 'Criar novos tickets'),
('Ler Ticket', 'ticket.read', 'ticket', 'read', 'tenant', 'Visualizar tickets'),
('Ler Ticket Próprio', 'ticket.read-own', 'ticket', 'read', 'own', 'Visualizar próprios tickets'),
('Atualizar Ticket', 'ticket.update', 'ticket', 'update', 'tenant', 'Atualizar tickets'),
('Atualizar Ticket Próprio', 'ticket.update-own', 'ticket', 'update', 'own', 'Atualizar próprios tickets'),
('Deletar Ticket', 'ticket.delete', 'ticket', 'delete', 'tenant', 'Deletar tickets'),

-- Permissões de contato
('Criar Contato', 'contact.create', 'contact', 'create', 'tenant', 'Criar novos contatos'),
('Ler Contato', 'contact.read', 'contact', 'read', 'tenant', 'Visualizar contatos'),
('Atualizar Contato', 'contact.update', 'contact', 'update', 'tenant', 'Atualizar contatos'),
('Deletar Contato', 'contact.delete', 'contact', 'delete', 'tenant', 'Deletar contatos'),

-- Permissões de deal
('Criar Deal', 'deal.create', 'deal', 'create', 'tenant', 'Criar novos deals'),
('Ler Deal', 'deal.read', 'deal', 'read', 'tenant', 'Visualizar deals'),
('Atualizar Deal', 'deal.update', 'deal', 'update', 'tenant', 'Atualizar deals'),
('Deletar Deal', 'deal.delete', 'deal', 'delete', 'tenant', 'Deletar deals');

-- Criar tenant principal (sistema)
INSERT IGNORE INTO tenants (id, name, description, parent_tenant_id, tenant_path, level, is_active, settings, metadata) VALUES
('tenant-system', 'Sistema Principal', 'Tenant raiz do sistema', NULL, '/system', 0, TRUE, 
 JSON_OBJECT('theme', 'default', 'features', JSON_ARRAY('all')),
 JSON_OBJECT('industry', 'Technology', 'size', 'enterprise', 'country', 'BR', 'timezone', 'America/Sao_Paulo'));

-- ============================================================================
-- TRIGGERS PARA MANTER INTEGRIDADE
-- ============================================================================

-- Trigger para atualizar tenant_path automaticamente
DELIMITER //
CREATE TRIGGER IF NOT EXISTS tenant_path_update
BEFORE INSERT ON tenants
FOR EACH ROW
BEGIN
  DECLARE parent_path VARCHAR(1000);
  
  IF NEW.parent_tenant_id IS NOT NULL THEN
    SELECT tenant_path INTO parent_path 
    FROM tenants 
    WHERE id = NEW.parent_tenant_id;
    
    SET NEW.tenant_path = CONCAT(parent_path, '/', NEW.id);
    SET NEW.level = (SELECT level + 1 FROM tenants WHERE id = NEW.parent_tenant_id);
  ELSE
    SET NEW.tenant_path = CONCAT('/', NEW.id);
    SET NEW.level = 0;
  END IF;
END//

-- Trigger para atualizar contador de sub-tenants
CREATE TRIGGER IF NOT EXISTS tenant_sub_count_insert
AFTER INSERT ON tenants
FOR EACH ROW
BEGIN
  IF NEW.parent_tenant_id IS NOT NULL THEN
    UPDATE tenants 
    SET current_sub_tenants = current_sub_tenants + 1
    WHERE id = NEW.parent_tenant_id;
  END IF;
END//

CREATE TRIGGER IF NOT EXISTS tenant_sub_count_delete
AFTER DELETE ON tenants
FOR EACH ROW
BEGIN
  IF OLD.parent_tenant_id IS NOT NULL THEN
    UPDATE tenants 
    SET current_sub_tenants = current_sub_tenants - 1
    WHERE id = OLD.parent_tenant_id;
  END IF;
END//

DELIMITER ;

-- ============================================================================
-- ÍNDICES ADICIONAIS PARA PERFORMANCE
-- ============================================================================

-- Índices compostos para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_user_tenant_active ON user_tenants (user_id, tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_tenant_hierarchy ON tenants (parent_tenant_id, level, is_active);
CREATE INDEX IF NOT EXISTS idx_invitation_status ON tenant_invitations (email, expires_at, accepted_at);

-- Índices para campos JSON (MySQL 5.7+)
CREATE INDEX IF NOT EXISTS idx_tenant_settings ON tenants ((CAST(settings->>'$.theme' AS CHAR(50))));
CREATE INDEX IF NOT EXISTS idx_tenant_industry ON tenants ((CAST(metadata->>'$.industry' AS CHAR(100))));

COMMIT;