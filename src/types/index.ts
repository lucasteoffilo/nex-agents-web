// Tipos de usuário e autenticação
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  tenantId: string;
  // Permissões e contexto hierárquico
  permissions: Permission[];
  tenantAccess: TenantAccess[];
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRole {
  id: string;
  name: string;
  slug: string;
  description?: string;
  level: 'system' | 'tenant' | 'user'; // system = super admin, tenant = admin do tenant, user = usuário comum
  permissions: Permission[];
  isSystemRole: boolean;
  tenantId?: string; // null para roles de sistema
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  name: string;
  slug: string;
  resource: string; // ex: 'users', 'tenants', 'agents', 'documents'
  action: string; // ex: 'create', 'read', 'update', 'delete', 'manage'
  scope: 'own' | 'tenant' | 'subtenant' | 'all'; // escopo da permissão
  conditions?: PermissionCondition[];
  description?: string;
}

export interface PermissionCondition {
  field: string;
  operator: 'eq' | 'ne' | 'in' | 'nin' | 'gt' | 'gte' | 'lt' | 'lte';
  value: any;
}

export interface TenantAccess {
  tenantId: string;
  role: UserRole;
  permissions: Permission[];
  isInherited: boolean; // se as permissões são herdadas do tenant pai
  grantedAt: Date;
  grantedBy: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  plan: 'free' | 'pro' | 'enterprise';
  settings: TenantSettings;
  isActive: boolean;
  // Hierarquia de tenants
  parentTenantId?: string; // null para tenant raiz
  tenantPath: string; // ex: "root" ou "root/client1/subclient1"
  level: number; // 0 para root, 1 para cliente, 2 para sub-cliente, etc.
  maxSubTenants: number;
  currentSubTenants: number;
  // Metadados
  metadata: TenantMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantMetadata {
  industry?: string;
  size?: 'small' | 'medium' | 'large' | 'enterprise';
  country?: string;
  timezone?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  billing?: {
    plan: string;
    billingCycle: 'monthly' | 'yearly';
    nextBillingDate?: Date;
    paymentMethod?: string;
  };
}

export interface TenantSettings {
  allowRegistration: boolean;
  maxUsers: number;
  maxAgents: number;
  maxDocuments: number;
  features: string[];
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logo?: string;
    favicon?: string;
  };
}

// Tipos de chat e conversas
export interface Chat {
  id: string;
  title: string;
  type: 'support' | 'sales' | 'general';
  status: 'active' | 'closed' | 'waiting';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  userId?: string;
  agentId?: string;
  tenantId: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt?: Date;
}

export interface Message {
  id: string;
  chatId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'video' | 'system';
  sender: {
    id: string;
    name: string;
    type: 'user' | 'agent' | 'bot' | 'system';
    avatar?: string;
  };
  metadata?: {
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    fileUrl?: string;
    isBot?: boolean;
    confidence?: number;
    intent?: string;
    entities?: any[];
  };
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de documentos e knowledge base
export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'txt' | 'md' | 'html' | 'url';
  size: number;
  url: string;
  status: 'uploading' | 'processing' | 'processed' | 'failed';
  content?: string;
  chunks?: DocumentChunk[];
  metadata: {
    pages?: number;
    language?: string;
    encoding?: string;
    extractedAt?: Date;
    processingTime?: number;
    error?: string;
  };
  tags: string[];
  tenantId: string;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  embedding?: number[];
  metadata: {
    page?: number;
    section?: string;
    startIndex: number;
    endIndex: number;
  };
  createdAt: Date;
}

// Tipos de agentes e bots
export interface Agent {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  type: 'chatbot' | 'voice' | 'hybrid';
  status: 'active' | 'inactive' | 'training';
  config: AgentConfig;
  metrics: AgentMetrics;
  tenantId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  fallbackMessage: string;
  enabledFeatures: string[];
  integrations: {
    whatsapp?: boolean;
    telegram?: boolean;
    webchat?: boolean;
    api?: boolean;
  knowledgeBase: {
      collectionIds: string[];
      searchThreshold: number;
      maxResults: number;
    };
  workflows: Flow[];
}

export interface AgentMetrics {
  totalConversations: number;
  totalMessages: number;
  averageResponseTime: number;
  satisfactionScore: number;
  resolutionRate: number;
  lastActive?: Date;
}

// Tipos de fluxos e automação
export interface Flow {
  id: string;
  name: string;
  description: string;
  trigger: FlowTrigger;
  nodes: FlowNode[];
  connections: FlowConnection[];
  isActive: boolean;
  tenantId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FlowTrigger {
  type: 'message' | 'intent' | 'keyword' | 'time' | 'event';
  conditions: Record<string, any>;
}

export interface FlowNode {
  id: string;
  type: 'message' | 'condition' | 'action' | 'input' | 'api' | 'delay';
  position: { x: number; y: number };
  data: Record<string, any>;
}

export interface FlowConnection {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  conditions?: Record<string, any>;
}

// Tipos de tickets e atendimento
export interface Ticket {
  id: string;
  number: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  tags: string[];
  customerId?: string;
  assignedTo?: string;
  chatId?: string;
  metadata: Record<string, any>;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
}

// Tipos de CRM
export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  company?: string;
  position?: string;
  tags: string[];
  customFields: Record<string, any>;
  lastInteraction?: Date;
  source: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Deal {
  id: string;
  title: string;
  description?: string;
  value: number;
  currency: string;
  stage: string;
  probability: number;
  expectedCloseDate?: Date;
  contactId: string;
  assignedTo?: string;
  tags: string[];
  activities: Activity[];
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
}

export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task';
  title: string;
  description?: string;
  date: Date;
  duration?: number;
  contactId?: string;
  dealId?: string;
  userId: string;
  tenantId: string;
  createdAt: Date;
}

// Tipos de analytics
export interface Analytics {
  conversations: {
    total: number;
    active: number;
    resolved: number;
    averageResponseTime: number;
    satisfactionScore: number;
  };
  agents: {
    total: number;
    active: number;
    averageHandleTime: number;
    resolutionRate: number;
  };
  documents: {
    total: number;
    processed: number;
    totalSize: number;
    averageProcessingTime: number;
  };
  period: {
    start: Date;
    end: Date;
  };
}

// Tipos de API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

// Tipos de notificações
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  userId: string;
  tenantId: string;
  createdAt: Date;
  expiresAt?: Date;
}

// Tipos de configurações
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
    sound: boolean;
  };
  privacy: {
    showOnlineStatus: boolean;
    allowAnalytics: boolean;
  };
}

// Tipos de upload
export interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

// Tipos de socket events
export interface SocketEvents {
  // Eventos de conexão
  connect: () => void;
  disconnect: (reason: string) => void;
  connect_error: (error: Error) => void;
  
  // Eventos de chat
  message: (message: Message) => void;
  typing: (data: { chatId: string; userId: string; isTyping: boolean }) => void;
  user_joined: (data: { chatId: string; user: User }) => void;
  user_left: (data: { chatId: string; userId: string }) => void;
  
  // Eventos de notificação
  notification: (notification: Notification) => void;
  
  // Eventos de documento
  document_processed: (document: Document) => void;
  document_failed: (data: { documentId: string; error: string }) => void;
  
  // Eventos de sistema
  user_status_changed: (data: { userId: string; status: 'online' | 'offline' | 'away' }) => void;
  system_maintenance: (data: { message: string; scheduledAt: Date }) => void;
}

// Tipos de formulários
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'file';
  placeholder?: string;
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  options?: { label: string; value: string }[];
}

// Tipos de dashboard
export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'list';
  title: string;
  size: 'sm' | 'md' | 'lg' | 'xl';
  position: { x: number; y: number; w: number; h: number };
  config: Record<string, any>;
  data?: any;
}

export interface DashboardLayout {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  isDefault: boolean;
  userId: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos específicos para sistema multi-tenant hierárquico
export interface TenantHierarchy {
  tenant: Tenant;
  children: TenantHierarchy[];
  parent?: Tenant;
  depth: number;
  path: string[];
}

export interface TenantInvitation {
  id: string;
  email: string;
  tenantId: string;
  roleId: string;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  expiresAt: Date;
  acceptedAt?: Date;
  createdAt: Date;
}

export interface TenantUsage {
  tenantId: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    users: number;
    agents: number;
    documents: number;
    conversations: number;
    storage: number; // em bytes
    apiCalls: number;
  };
  limits: {
    maxUsers: number;
    maxAgents: number;
    maxDocuments: number;
    maxStorage: number;
    maxApiCalls: number;
  };
  billing: {
    amount: number;
    currency: string;
    status: 'pending' | 'paid' | 'overdue';
  };
}

export interface AuthContext {
  user: User | null;
  tenant: Tenant | null;
  permissions: Permission[];
  availableTenants: Tenant[];
  currentTenantPath: string[];
  canAccessTenant: (tenantId: string) => boolean;
  hasPermission: (resource: string, action: string, scope?: string) => boolean;
  switchTenant: (tenantId: string) => Promise<void>;
}

export interface TenantSwitchRequest {
  targetTenantId: string;
  reason?: string;
}

export interface MultiTenantQuery {
  tenantId?: string;
  includeSubTenants?: boolean;
  tenantPath?: string;
  maxDepth?: number;
}