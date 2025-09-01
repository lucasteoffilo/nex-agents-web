import { ApiResponse, PaginationParams } from '@/types';
import apiService from './api';

// Tipos específicos para chat
export interface Message {
  id: string;
  chatId: string;
  content: string;
  type: 'user' | 'assistant' | 'system';
  timestamp: string;
  metadata?: {
    tokens?: number;
    model?: string;
    responseTime?: number;
    confidence?: number;
    sources?: string[];
    attachments?: {
      id: string;
      name: string;
      type: string;
      url: string;
      size?: number;
    }[];
    customData?: Record<string, any>;
  };
  isEdited?: boolean;
  editedAt?: string;
  parentMessageId?: string;
  reactions?: {
    type: 'like' | 'dislike' | 'helpful' | 'not_helpful';
    userId: string;
    timestamp: string;
  }[];
}

export interface Chat {
  id: string;
  title: string;
  userId: string;
  agentId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastMessageAt?: string;
  messageCount?: number;
  agent?: {
    id: string;
    name: string;
    type: string;
    avatar?: string;
  };
  user?: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
  };
  metadata?: {
    source?: 'web' | 'whatsapp' | 'telegram' | 'api' | 'widget';
    sessionId?: string;
    userAgent?: string;
    ipAddress?: string;
    location?: {
      country?: string;
      city?: string;
      timezone?: string;
    };
    tags?: string[];
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    category?: string;
    language?: string;
    customFields?: Record<string, any>;
  };
  status?: 'active' | 'closed' | 'archived' | 'transferred';
  assignedTo?: {
    id: string;
    name: string;
    type: 'agent' | 'human';
  };
  satisfaction?: {
    rating: number;
    feedback?: string;
    timestamp: string;
  };
  summary?: string;
  totalTokens?: number;
  totalCost?: number;
}

export interface CreateChatDto {
  title?: string;
  agentId: string;
  metadata?: Chat['metadata'];
}

export interface UpdateChatDto {
  title?: string;
  isActive?: boolean;
  status?: Chat['status'];
  assignedTo?: Chat['assignedTo'];
  metadata?: Chat['metadata'];
  summary?: string;
}

export interface SendMessageDto {
  content: string;
  type?: 'user' | 'system';
  parentMessageId?: string;
  metadata?: Message['metadata'];
}

export interface ChatStats {
  totalChats: number;
  activeChats: number;
  closedChats: number;
  averageMessagesPerChat: number;
  averageResponseTime: number;
  satisfactionScore: number;
  chatsBySource: Record<string, number>;
  chatsByAgent: Record<string, number>;
}

class ChatService {
  // Listar chats com paginação e filtros
  async getChats(params?: PaginationParams & {
    agentId?: string;
    userId?: string;
    isActive?: boolean;
    status?: string;
    source?: string;
  }): Promise<ApiResponse<{
    chats: Chat[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>> {
    return apiService.get('/chats', params);
  }

  // Obter chat específico
  async getChat(chatId: string): Promise<ApiResponse<Chat>> {
    return apiService.get(`/chats/${chatId}`);
  }

  // Criar novo chat
  async createChat(data: CreateChatDto): Promise<ApiResponse<Chat>> {
    return apiService.post('/chats', data);
  }

  // Atualizar chat
  async updateChat(chatId: string, data: UpdateChatDto): Promise<ApiResponse<Chat>> {
    return apiService.put(`/chats/${chatId}`, data);
  }

  // Deletar chat
  async deleteChat(chatId: string): Promise<ApiResponse<void>> {
    return apiService.delete(`/chats/${chatId}`);
  }

  // Obter chats ativos
  async getActiveChats(params?: PaginationParams): Promise<ApiResponse<{
    chats: Chat[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>> {
    return apiService.get('/chats/active', params);
  }

  // Buscar chats
  async searchChats(query: string, params?: PaginationParams): Promise<ApiResponse<{
    chats: Chat[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>> {
    return apiService.get('/chats/search', { q: query, ...params });
  }

  // Obter mensagens de um chat
  async getChatMessages(chatId: string, params?: PaginationParams): Promise<ApiResponse<{
    messages: Message[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>> {
    return apiService.get(`/chats/${chatId}/messages`, params);
  }

  // Enviar mensagem
  async sendMessage(chatId: string, data: SendMessageDto): Promise<ApiResponse<Message>> {
    return apiService.post(`/chats/${chatId}/messages`, data);
  }

  async sendAudioMessage(chatId: string, audioFile: FormData): Promise<ApiResponse<Message>> {
    return apiService.post<Message>(`/chats/${chatId}/audio-message`, audioFile, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Atualizar mensagem
  async updateMessage(chatId: string, messageId: string, data: { content: string }): Promise<ApiResponse<Message>> {
    return apiService.put(`/chats/${chatId}/messages/${messageId}`, data);
  }

  // Deletar mensagem
  async deleteMessage(chatId: string, messageId: string): Promise<ApiResponse<void>> {
    return apiService.delete(`/chats/${chatId}/messages/${messageId}`);
  }

  // Reagir a uma mensagem
  async reactToMessage(chatId: string, messageId: string, reaction: {
    type: 'like' | 'dislike' | 'helpful' | 'not_helpful';
  }): Promise<ApiResponse<Message>> {
    return apiService.post(`/chats/${chatId}/messages/${messageId}/reactions`, reaction);
  }

  // Remover reação de uma mensagem
  async removeReaction(chatId: string, messageId: string, reactionType: string): Promise<ApiResponse<Message>> {
    return apiService.delete(`/chats/${chatId}/messages/${messageId}/reactions/${reactionType}`);
  }

  // Fechar chat
  async closeChat(chatId: string, summary?: string): Promise<ApiResponse<Chat>> {
    return apiService.post(`/chats/${chatId}/close`, { summary });
  }

  // Reabrir chat
  async reopenChat(chatId: string): Promise<ApiResponse<Chat>> {
    return apiService.post(`/chats/${chatId}/reopen`);
  }

  // Arquivar chat
  async archiveChat(chatId: string): Promise<ApiResponse<Chat>> {
    return apiService.post(`/chats/${chatId}/archive`);
  }

  // Transferir chat
  async transferChat(chatId: string, assignedTo: {
    id: string;
    type: 'agent' | 'human';
  }): Promise<ApiResponse<Chat>> {
    return apiService.post(`/chats/${chatId}/transfer`, { assignedTo });
  }

  // Avaliar chat
  async rateChat(chatId: string, satisfaction: {
    rating: number;
    feedback?: string;
  }): Promise<ApiResponse<Chat>> {
    return apiService.post(`/chats/${chatId}/rate`, satisfaction);
  }

  // Obter estatísticas dos chats
  async getChatStats(params?: {
    agentId?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<ChatStats>> {
    return apiService.get('/chats/stats', params);
  }

  // Obter chats por agente
  async getChatsByAgent(agentId: string, params?: PaginationParams): Promise<ApiResponse<{
    chats: Chat[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>> {
    return apiService.get(`/chats/by-agent/${agentId}`, params);
  }

  // Obter chats por usuário
  async getChatsByUser(userId: string, params?: PaginationParams): Promise<ApiResponse<{
    chats: Chat[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>> {
    return apiService.get(`/chats/by-user/${userId}`, params);
  }

  // Exportar chat
  async exportChat(chatId: string, format: 'json' | 'csv' | 'pdf' = 'json'): Promise<ApiResponse<any>> {
    return apiService.get(`/chats/${chatId}/export`, { format });
  }

  // Obter resumo do chat
  async getChatSummary(chatId: string): Promise<ApiResponse<{ summary: string }>> {
    return apiService.get(`/chats/${chatId}/summary`);
  }

  // Gerar resumo automático do chat
  async generateChatSummary(chatId: string): Promise<ApiResponse<{ summary: string }>> {
    return apiService.post(`/chats/${chatId}/generate-summary`);
  }

  // Obter métricas em tempo real
  async getRealTimeMetrics(): Promise<ApiResponse<{
    activeChats: number;
    waitingChats: number;
    averageWaitTime: number;
    onlineAgents: number;
    responseTime: number;
  }>> {
    return apiService.get('/chats/real-time-metrics');
  }
}

// Instância singleton
const chatService = new ChatService();
export default chatService;
export { chatService };