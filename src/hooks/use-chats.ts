'use client';

import { useState, useEffect, useCallback } from 'react';
import { chatService } from '@/services/chat-service';
import { Chat, Message, CreateChatDto, SendMessageDto, ChatStats } from '@/types';
import { toast } from 'sonner';

interface UseChatsReturn {
  // Estado
  chats: Chat[];
  messages: Message[];
  selectedChatId: string | null;
  currentChat: Chat | null;
  stats: ChatStats | null;
  isLoading: boolean;
  isLoadingMessages: boolean;
  isLoadingStats: boolean;
  error: string | null;
  
  // Paginação
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // Filtros
  filters: {
    search: string;
    status: string;
    type: string;
    priority: string;
  };
  
  // Ações de chat
  loadChats: () => Promise<void>;
  createChat: (data: CreateChatDto) => Promise<Chat | null>;
  updateChat: (id: string, data: Partial<Chat>) => Promise<void>;
  deleteChat: (id: string) => Promise<void>;
  selectChat: (chatId: string | null) => void;
  closeChat: (id: string) => Promise<void>;
  reopenChat: (id: string) => Promise<void>;
  archiveChat: (id: string) => Promise<void>;
  transferChat: (id: string, agentId: string) => Promise<void>;
  
  // Ações de mensagem
  loadMessages: (chatId: string) => Promise<void>;
  sendMessage: (data: SendMessageDto) => Promise<void>;
  updateMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  addReaction: (messageId: string, reaction: string) => Promise<void>;
  
  // Filtros e busca
  setSearch: (search: string) => void;
  setStatusFilter: (status: string) => void;
  setTypeFilter: (type: string) => void;
  setPriorityFilter: (priority: string) => void;
  
  // Paginação
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  
  // Estatísticas
  loadStats: () => Promise<void>;
  
  // Utilitários
  refreshChats: () => Promise<void>;
  clearError: () => void;
}

export function useChats(): UseChatsReturn {
  // Estado principal
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [stats, setStats] = useState<ChatStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Paginação
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  
  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
    priority: '',
  });
  
  // Chat atual
  const currentChat = chats.find(chat => chat.id === selectedChatId) || null;
  
  // Carregar chats
  const loadChats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        status: filters.status || undefined,
        type: filters.type || undefined,
        priority: filters.priority || undefined,
      };
      
      const response = await chatService.getChats(params);
      
      setChats(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.total,
        totalPages: response.totalPages,
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar chats';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);
  
  // Carregar mensagens
  const loadMessages = useCallback(async (chatId: string) => {
    try {
      setIsLoadingMessages(true);
      setError(null);
      
      const response = await chatService.getMessages(chatId);
      setMessages(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar mensagens';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);
  
  // Criar chat
  const createChat = useCallback(async (data: CreateChatDto): Promise<Chat | null> => {
    try {
      setError(null);
      const newChat = await chatService.createChat(data);
      setChats(prev => [newChat, ...prev]);
      toast.success('Chat criado com sucesso!');
      return newChat;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar chat';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  }, []);
  
  // Atualizar chat
  const updateChat = useCallback(async (id: string, data: Partial<Chat>) => {
    try {
      setError(null);
      const updatedChat = await chatService.updateChat(id, data);
      setChats(prev => prev.map(chat => chat.id === id ? updatedChat : chat));
      toast.success('Chat atualizado com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar chat';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, []);
  
  // Excluir chat
  const deleteChat = useCallback(async (id: string) => {
    try {
      setError(null);
      await chatService.deleteChat(id);
      setChats(prev => prev.filter(chat => chat.id !== id));
      if (selectedChatId === id) {
        setSelectedChatId(null);
        setMessages([]);
      }
      toast.success('Chat excluído com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir chat';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, [selectedChatId]);
  
  // Selecionar chat
  const selectChat = useCallback((chatId: string | null) => {
    setSelectedChatId(chatId);
    if (chatId) {
      loadMessages(chatId);
    } else {
      setMessages([]);
    }
  }, [loadMessages]);
  
  // Fechar chat
  const closeChat = useCallback(async (id: string) => {
    try {
      setError(null);
      await chatService.closeChat(id);
      setChats(prev => prev.map(chat => 
        chat.id === id ? { ...chat, status: 'closed' } : chat
      ));
      toast.success('Chat fechado com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fechar chat';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, []);
  
  // Reabrir chat
  const reopenChat = useCallback(async (id: string) => {
    try {
      setError(null);
      await chatService.reopenChat(id);
      setChats(prev => prev.map(chat => 
        chat.id === id ? { ...chat, status: 'active' } : chat
      ));
      toast.success('Chat reaberto com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao reabrir chat';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, []);
  
  // Arquivar chat
  const archiveChat = useCallback(async (id: string) => {
    try {
      setError(null);
      await chatService.archiveChat(id);
      setChats(prev => prev.map(chat => 
        chat.id === id ? { ...chat, isArchived: true } : chat
      ));
      toast.success('Chat arquivado com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao arquivar chat';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, []);
  
  // Transferir chat
  const transferChat = useCallback(async (id: string, agentId: string) => {
    try {
      setError(null);
      await chatService.transferChat(id, agentId);
      toast.success('Chat transferido com sucesso!');
      await loadChats(); // Recarregar para obter dados atualizados
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao transferir chat';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, [loadChats]);
  
  // Enviar mensagem
  const sendMessage = useCallback(async (data: SendMessageDto) => {
    try {
      setError(null);
      const newMessage = await chatService.sendMessage(data);
      setMessages(prev => [...prev, newMessage]);
      
      // Atualizar última mensagem do chat
      setChats(prev => prev.map(chat => 
        chat.id === data.chatId 
          ? { ...chat, lastMessage: newMessage, updatedAt: new Date() }
          : chat
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar mensagem';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, []);
  
  // Atualizar mensagem
  const updateMessage = useCallback(async (messageId: string, content: string) => {
    try {
      setError(null);
      const updatedMessage = await chatService.updateMessage(messageId, { content });
      setMessages(prev => prev.map(msg => msg.id === messageId ? updatedMessage : msg));
      toast.success('Mensagem atualizada com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar mensagem';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, []);
  
  // Excluir mensagem
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      setError(null);
      await chatService.deleteMessage(messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      toast.success('Mensagem excluída com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir mensagem';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, []);
  
  // Marcar como lida
  const markAsRead = useCallback(async (messageId: string) => {
    try {
      setError(null);
      await chatService.markAsRead(messageId);
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, isRead: true } : msg
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao marcar mensagem como lida';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, []);
  
  // Adicionar reação
  const addReaction = useCallback(async (messageId: string, reaction: string) => {
    try {
      setError(null);
      await chatService.addReaction(messageId, reaction);
      toast.success('Reação adicionada!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar reação';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, []);
  
  // Carregar estatísticas
  const loadStats = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      setError(null);
      const statsData = await chatService.getStats();
      setStats(statsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar estatísticas';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);
  
  // Filtros
  const setSearch = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);
  
  const setStatusFilter = useCallback((status: string) => {
    setFilters(prev => ({ ...prev, status }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);
  
  const setTypeFilter = useCallback((type: string) => {
    setFilters(prev => ({ ...prev, type }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);
  
  const setPriorityFilter = useCallback((priority: string) => {
    setFilters(prev => ({ ...prev, priority }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);
  
  // Paginação
  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);
  
  const setLimit = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  }, []);
  
  // Utilitários
  const refreshChats = useCallback(async () => {
    await loadChats();
  }, [loadChats]);
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Carregar dados iniciais
  useEffect(() => {
    loadChats();
    loadStats();
  }, [loadChats, loadStats]);
  
  return {
    // Estado
    chats,
    messages,
    selectedChatId,
    currentChat,
    stats,
    isLoading,
    isLoadingMessages,
    isLoadingStats,
    error,
    
    // Paginação
    pagination,
    
    // Filtros
    filters,
    
    // Ações de chat
    loadChats,
    createChat,
    updateChat,
    deleteChat,
    selectChat,
    closeChat,
    reopenChat,
    archiveChat,
    transferChat,
    
    // Ações de mensagem
    loadMessages,
    sendMessage,
    updateMessage,
    deleteMessage,
    markAsRead,
    addReaction,
    
    // Filtros e busca
    setSearch,
    setStatusFilter,
    setTypeFilter,
    setPriorityFilter,
    
    // Paginação
    setPage,
    setLimit,
    
    // Estatísticas
    loadStats,
    
    // Utilitários
    refreshChats,
    clearError,
  };
}