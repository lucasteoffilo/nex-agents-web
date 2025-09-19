import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse, PaginationParams } from '../types';
import { TenantService } from './tenant-service';
import { PermissionService } from './permission-service';
import { AppError, ErrorCodes, ErrorResponse, isRetryableError, getFriendlyErrorMessage } from '../types/error';
import { toast } from 'sonner';

// Função auxiliar para tratar erros da API
function handleApiError(error: AxiosError): AppError {
  const response = error.response;
  const status = response?.status || 0;
  const data = response?.data as ErrorResponse;

  // Determinar o código de erro
  let errorCode: ErrorCodes;
  switch (status) {
    case 400:
      errorCode = ErrorCodes.VALIDATION_ERROR;
      break;
    case 401:
      errorCode = ErrorCodes.UNAUTHORIZED;
      break;
    case 403:
      errorCode = ErrorCodes.FORBIDDEN;
      break;
    case 404:
      errorCode = ErrorCodes.NOT_FOUND;
      break;
    case 409:
      errorCode = ErrorCodes.CONFLICT;
      break;
    case 429:
      errorCode = ErrorCodes.RATE_LIMIT_EXCEEDED;
      break;
    case 500:
      errorCode = ErrorCodes.INTERNAL_ERROR;
      break;
    case 503:
      errorCode = ErrorCodes.SERVICE_UNAVAILABLE;
      break;
    default:
      if (error.code === 'ECONNABORTED' || error.code === 'NETWORK_ERROR') {
        errorCode = ErrorCodes.NETWORK_ERROR;
      } else {
        errorCode = ErrorCodes.UNKNOWN_ERROR;
      }
  }

  const appError = new AppError(
    data?.error?.message || error.message || 'Erro desconhecido',
    errorCode,
    status,
    data?.error?.details,
    data?.validationErrors?.[0]?.field
  );

  // Exibir toast de erro (exceto para 401 que redireciona)
  if (status !== 401) {
    const friendlyMessage = getFriendlyErrorMessage(appError);
    toast.error(friendlyMessage);
  }

  return appError;
}

// Configuração base da API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const WORKER_BASE_URL = process.env.NEXT_PUBLIC_WORKER_URL || 'http://localhost:3002';

// Instância principal da API
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'API-Version': 'v1',
  },
});

// Instância para o Worker
const workerApi: AxiosInstance = axios.create({
  baseURL: WORKER_BASE_URL,
  timeout: 60000, // Timeout maior para processamento de documentos
  headers: {
    'Content-Type': 'application/json',
    'API-Version': 'v1',
  },
});

// Interceptor para adicionar token de autenticação e tenant
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nex_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Adicionar tenant ID se disponível
    if (typeof window !== 'undefined') {
      const cookies = document.cookie.split(';');
      const tenantCookie = cookies.find(cookie => cookie.trim().startsWith('current_tenant='));
      if (tenantCookie) {
        config.headers['X-Tenant-ID'] = tenantCookie.split('=')[1];
      } else {
        const currentTenant = localStorage.getItem('current_tenant_id');
        if (currentTenant) {
          config.headers['X-Tenant-ID'] = currentTenant;
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

workerApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nex_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Adicionar tenant ID se disponível
    if (typeof window !== 'undefined') {
      const cookies = document.cookie.split(';');
      const tenantCookie = cookies.find(cookie => cookie.trim().startsWith('current_tenant='));
      if (tenantCookie) {
        config.headers['X-Tenant-ID'] = tenantCookie.split('=')[1];
      } else {
        const currentTenant = localStorage.getItem('current_tenant_id');
        if (currentTenant) {
          config.headers['X-Tenant-ID'] = currentTenant;
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de respostas
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    const appError = handleApiError(error);
    
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('nex_token');
      localStorage.removeItem('nex_refresh_token');
      window.location.href = '/login';
    }
    
    return Promise.reject(appError);
  }
);

workerApi.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    const appError = handleApiError(error);
    
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    
    return Promise.reject(appError);
  }
);

// Classe principal do serviço de API
class ApiService {
  public tenant: TenantService;
  public permission: PermissionService;

  constructor() {
    // Inicializar serviços especializados
    this.tenant = new TenantService();
    this.permission = new PermissionService();
  }

  // Método para obter tenant atual
  private getCurrentTenantId(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Tentar obter do cookie primeiro
    const cookies = document.cookie.split(';');
    const tenantCookie = cookies.find(cookie => cookie.trim().startsWith('current_tenant='));
    if (tenantCookie) {
      return tenantCookie.split('=')[1];
    }
    
    // Fallback para localStorage
    return localStorage.getItem('current_tenant_id');
  }
  // Métodos genéricos
  async get<T = any>(
    endpoint: string,
    params?: Record<string, any>,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await api.get(endpoint, { params, ...config });
    return response.data;
  }

  async post<T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await api.post(endpoint, data, config);
    return response.data;
  }

  async put<T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await api.put(endpoint, data, config);
    return response.data;
  }

  async postRaw(url: string, data: any, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    const response = await api.post(url, data, config);
    return response;
  }

  async patch<T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await api.patch(endpoint, data, config);
    return response.data;
  }

  async delete<T = any>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await api.delete(endpoint, config);
    return response.data;
  }

  // Métodos para Worker API
  async workerGet<T = any>(
    endpoint: string,
    params?: Record<string, any>,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await workerApi.get(endpoint, { params, ...config });
    return response.data;
  }

  async workerPost<T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await workerApi.post(endpoint, data, config);
    return response.data;
  }

  // Métodos de autenticação
  async login(email: string, password: string, tenantId?: string) {
    const response = await api.post('/auth/login', { 
      email, 
      password, 
      tenantId 
    });
    
    // O backend retorna {success: true, data: {...}} devido ao ResponseTransformInterceptor
    // Extrair os dados reais da estrutura envolvida
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    
    // Fallback para compatibilidade (caso a estrutura mude)
    return response.data;
  }

  async register(data: {
    name: string;
    email: string;
    password: string;
    tenantName?: string;
  }) {
    const response = await this.post('/auth/register', data);
    return response.data;
  }

  async registerAdmin(data: {
    name: string;
    email: string;
    password: string;
    tenantName: string;
  }) {
    return this.post('/auth/register-admin', data);
  }

  async logout() {
    return this.post('/auth/logout');
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('nex_refresh_token');
    return this.post('/auth/refresh', { refreshToken });
  }

  async forgotPassword(email: string) {
    return this.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, password: string) {
    return this.post('/auth/reset-password', { token, password });
  }

  async verifyEmail(token: string) {
    return this.post('/auth/verify-email', { token });
  }

  // Métodos de usuário
  async getProfile() {
    return this.get('/users/profile');
  }

  async updateProfile(data: any) {
    return this.put('/users/profile', data);
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.post('/users/change-password', {
      currentPassword,
      newPassword,
    });
  }

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return this.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Métodos de chat
  async getChats(params?: PaginationParams) {
    return this.get('/chats', params);
  }

  async getChat(chatId: string) {
    return this.get(`/chats/${chatId}`);
  }

  async createChat(data: any) {
    return this.post('/chats', data);
  }

  async updateChat(chatId: string, data: any) {
    return this.put(`/chats/${chatId}`, data);
  }

  async deleteChat(chatId: string) {
    return this.delete(`/chats/${chatId}`);
  }

  async getChatMessages(chatId: string, params?: PaginationParams) {
    return this.get(`/chats/${chatId}/messages`, params);
  }

  async sendMessage(chatId: string, data: any) {
    return this.post(`/chats/${chatId}/messages`, data);
  }

  async markMessageAsRead(chatId: string, messageId: string) {
    return this.patch(`/chats/${chatId}/messages/${messageId}/read`);
  }

  // Métodos de documentos
  async getDocuments(params?: PaginationParams) {
    return this.get('/documents', params);
  }

  async getDocument(documentId: string) {
    return this.get(`/documents/${documentId}`);
  }

  async uploadDocument(file: File, metadata?: any) {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }
    return this.workerPost('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async processDocument(documentId: string) {
    return this.workerPost(`/documents/${documentId}/process`);
  }

  async deleteDocument(documentId: string) {
    return this.delete(`/documents/${documentId}`);
  }

  async searchDocuments(query: string, params?: any) {
    return this.get('/documents/search', { query, ...params });
  }

  // Métodos de agentes
  async getAgents(params?: PaginationParams) {
    return this.get('/agents', params);
  }

  async getAgent(agentId: string) {
    return this.get(`/agents/${agentId}`);
  }

  async createAgent(data: any) {
    return this.post('/agents', data);
  }

  async updateAgent(agentId: string, data: any) {
    return this.patch(`/agents/${agentId}`, data);
  }

  async deleteAgent(agentId: string) {
    return this.delete(`/agents/${agentId}`);
  }

  async trainAgent(agentId: string) {
    return this.workerPost(`/agents/${agentId}/train`);
  }

  async testAgent(agentId: string, message: string) {
    return this.post(`/agents/${agentId}/test`, { message });
  }

  // Métodos de tickets
  async getTickets(params?: PaginationParams) {
    return this.get('/tickets', params);
  }

  async getTicket(ticketId: string) {
    return this.get(`/tickets/${ticketId}`);
  }

  async createTicket(data: any) {
    return this.post('/tickets', data);
  }

  async updateTicket(ticketId: string, data: any) {
    return this.put(`/tickets/${ticketId}`, data);
  }

  async assignTicket(ticketId: string, agentId: string) {
    return this.patch(`/tickets/${ticketId}/assign`, { agentId });
  }

  async closeTicket(ticketId: string, reason?: string) {
    return this.patch(`/tickets/${ticketId}/close`, { reason });
  }

  // Métodos de contatos (CRM)
  async getContacts(params?: PaginationParams) {
    return this.get('/contacts', params);
  }

  async getContact(contactId: string) {
    return this.get(`/contacts/${contactId}`);
  }

  async createContact(data: any) {
    return this.post('/contacts', data);
  }

  async updateContact(contactId: string, data: any) {
    return this.put(`/contacts/${contactId}`, data);
  }

  async deleteContact(contactId: string) {
    return this.delete(`/contacts/${contactId}`);
  }

  // Métodos de deals (CRM)
  async getDeals(params?: PaginationParams) {
    return this.get('/deals', params);
  }

  async getDeal(dealId: string) {
    return this.get(`/deals/${dealId}`);
  }

  async createDeal(data: any) {
    return this.post('/deals', data);
  }

  async updateDeal(dealId: string, data: any) {
    return this.put(`/deals/${dealId}`, data);
  }

  async deleteDeal(dealId: string) {
    return this.delete(`/deals/${dealId}`);
  }

  // Métodos de analytics
  async getAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    metrics?: string[];
  }) {
    return this.get('/analytics', params);
  }

  async getChatAnalytics(params?: any) {
    return this.get('/analytics/chats', params);
  }

  async getAgentAnalytics(agentId?: string, params?: any) {
    const endpoint = agentId ? `/analytics/agents/${agentId}` : '/analytics/agents';
    return this.get(endpoint, params);
  }

  async getDocumentAnalytics(params?: any) {
    return this.get('/analytics/documents', params);
  }

  // Métodos de notificações
  async getNotifications(params?: PaginationParams) {
    return this.get('/notifications', params);
  }

  async markNotificationAsRead(notificationId: string) {
    return this.patch(`/notifications/${notificationId}/read`);
  }

  async markAllNotificationsAsRead() {
    return this.patch('/notifications/read-all');
  }

  async deleteNotification(notificationId: string) {
    return this.delete(`/notifications/${notificationId}`);
  }

  // Métodos de configurações
  async getSettings() {
    return this.get('/settings');
  }

  async updateSettings(data: any) {
    return this.put('/settings', data);
  }

  async getTenantSettings() {
    return this.get('/settings/tenant');
  }

  async updateTenantSettings(data: any) {
    return this.put('/settings/tenant', data);
  }

  // Métodos de health check
  async healthCheck() {
    return this.get('/health');
  }

  async workerHealthCheck() {
    return this.workerGet('/health');
  }
}

// Instância singleton do serviço
const apiService = new ApiService();

export default apiService;
export { api, workerApi };