'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Search,
  Filter,
  Plus,
  Phone,
  Video,
  Info,
  Archive,
  Trash2,
  MessageSquare,
  Clock,
  CheckCheck,
  Bot,
  User,
  Mic, // Adicionado Mic
  Image,
  File,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { useMultiTenantAuth } from '@/providers/multi-tenant-auth-provider';
import { useSocket } from '@/providers/socket-provider';
import { useChats } from '@/hooks/use-chats';
import { AudioRecorder, useAudioRecorder } from 'react-audio-voice-recorder';

// Tipos importados de @/types

function getStatusColor(status: string) {
  switch (status) {
    case 'active':
      return 'bg-green-500';
    case 'waiting':
      return 'bg-yellow-500';
    case 'closed':
      return 'bg-gray-500';
    default:
      return 'bg-gray-500';
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'urgent':
      return 'bg-red-500';
    case 'high':
      return 'bg-orange-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'low':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
}

function getTypeLabel(type: string) {
  switch (type) {
    case 'support':
      return 'Suporte';
    case 'sales':
      return 'Vendas';
    case 'general':
      return 'Geral';
    default:
      return 'Chat';
  }
}

function getSenderIcon(type: string) {
  switch (type) {
    case 'bot':
      return <Bot className="h-4 w-4" />;
    case 'agent':
      return <User className="h-4 w-4" />;
    case 'user':
      return <User className="h-4 w-4" />;
    default:
      return <MessageSquare className="h-4 w-4" />;
  }
}

export default function ChatPage() {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false); // Novo estado para gravação
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useMultiTenantAuth();
  const { socket } = useSocket();
  
  const { startRecording, stopRecording, recordingBlob, isRecording: isRecordingHook } = useAudioRecorder();

  useEffect(() => {
    setIsRecording(isRecordingHook);
  }, [isRecordingHook]);

  const sendAudioToBackend = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');

      // Substitua '/api/audio-upload' pela sua rota de upload de áudio no backend
      const response = await fetch('/api/audio-upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erro ao enviar áudio: ${response.statusText}`);
      }

      console.log('Áudio enviado com sucesso para o backend!');
      // Processar a resposta do backend, que agora é um arquivo de áudio
      const audioBlobResponse = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlobResponse);
      const audio = new Audio(audioUrl);
      audio.play();
      console.log('Áudio de resposta do backend reproduzido!');
    } catch (error) {
      console.error('Erro ao enviar áudio para o backend:', error);
    }
  };

  useEffect(() => {
    if (recordingBlob) {
      console.log('Áudio gravado:', recordingBlob);
      sendAudioToBackend(recordingBlob);
    }
  }, [recordingBlob]);

  // Hook para gerenciar chats
  const {
    chats,
    messages,
    selectedChatId,
    currentChat,
    isLoading,
    isLoadingMessages,
    error,
    filters,
    selectChat,
    sendMessage,
    setSearch,
    createChat,
  } = useChats();

  const filteredConversations = chats;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChatId || !user) return;

    try {
      await sendMessage({
        chatId: selectedChatId,
        content: message,
        type: 'text',
        senderId: user.id,
      });
      setMessage('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Sidebar - Lista de conversas */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header da sidebar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Conversas
            </h2>
            <Button size="sm" onClick={() => createChat({ title: 'Nova Conversa', type: 'general' })}>
              <Plus className="h-4 w-4 mr-2" />
              Nova
            </Button>
          </div>
          
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar conversas..."
              value={filters.search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Lista de conversas */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">Carregando conversas...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center p-8">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <span className="ml-2 text-sm text-red-600">{error}</span>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <MessageSquare className="h-6 w-6 text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">Nenhuma conversa encontrada</span>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => selectChat(conversation.id)}
                className={cn(
                  'p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800',
                  selectedChatId === conversation.id && 'bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800'
                )}
              >
              <div className="flex items-start space-x-3">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {conversation.participant.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className={cn(
                    'absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800',
                    conversation.participant.status === 'online' ? 'bg-green-500' :
                    conversation.participant.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                  )} />
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {conversation.title}
                    </h3>
                    <div className="flex items-center space-x-1">
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        getStatusColor(conversation.status)
                      )} />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatRelativeTime(conversation.updatedAt)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {conversation.lastMessage?.content || 'Sem mensagens'}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <Badge variant="default" className="ml-2">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {getTypeLabel(conversation.type)}
                    </Badge>
                    <div className={cn(
                      'w-2 h-2 rounded-full',
                      getPriorityColor(conversation.priority)
                    )} />
                  </div>
                </div>
              </div>
            </div>
          ))
          )}
        </div>
      </div>

      {/* Área principal do chat */}
      <div className="flex-1 flex flex-col">
        {selectedChatId && currentChat ? (
          <>
            {/* Header do chat */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {currentChat.title?.charAt(0).toUpperCase() || 'C'}
                      </span>
                    </div>
                    <div className={cn(
                      'absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800',
                      currentChat.status === 'active' ? 'bg-green-500' :
                      currentChat.status === 'waiting' ? 'bg-yellow-500' : 'bg-gray-400'
                    )} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {currentChat.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {currentChat.status === 'active' ? 'Ativo' :
                       currentChat.status === 'waiting' ? 'Aguardando' : 'Fechado'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Info className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-500">Carregando mensagens...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-gray-500">
                  <MessageSquare className="w-8 h-8 mr-2" />
                  <span>Nenhuma mensagem ainda</span>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex',
                      msg.senderType === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div className={cn(
                      'flex items-start space-x-2 max-w-xs lg:max-w-md',
                      msg.senderType === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                    )}>
                      {/* Avatar */}
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium',
                        msg.senderType === 'user' ? 'bg-brand-500' :
                        msg.senderType === 'bot' ? 'bg-[#0072b9]' : 'bg-green-500'
                      )}>
                        {getSenderIcon(msg.senderType)}
                      </div>
                      
                      {/* Mensagem */}
                      <div className={cn(
                        'rounded-lg px-3 py-2 shadow-sm',
                        msg.senderType === 'user'
                          ? 'bg-brand-500 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                      )}>
                        <p className="text-sm">{msg.content}</p>
                        <div className={cn(
                          'flex items-center justify-between mt-1 text-xs',
                          msg.senderType === 'user' ? 'text-brand-100' : 'text-gray-500 dark:text-gray-400'
                        )}>
                          <span>{msg.senderName || 'Usuário'}</span>
                          <div className="flex items-center space-x-1">
                            <span>{formatRelativeTime(msg.createdAt)}</span>
                            {msg.senderType === 'user' && (
                              <CheckCheck className={cn(
                                'h-3 w-3',
                                msg.isRead ? 'text-brand-200' : 'text-brand-300'
                              )} />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input de mensagem */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <Image className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
                    isRecording && "text-red-500 animate-pulse"
                  )}
                  onClick={toggleRecording}
                >
                  <Mic className="w-4 h-4" />
                </Button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite sua mensagem..."
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 pr-12 text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                   onClick={handleSendMessage}
                   disabled={!message.trim() || isSendingMessage}
                   className="bg-brand-500 hover:bg-brand-600 text-white"
                 >
                   {isSendingMessage ? (
                     <Loader2 className="w-4 h-4 animate-spin" />
                   ) : (
                     <Send className="w-4 h-4" />
                   )}
                 </Button>
              </div>
            </div>
          </>
        ) : (
          /* Estado vazio */
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Selecione uma conversa
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Escolha uma conversa da lista para começar a conversar
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}