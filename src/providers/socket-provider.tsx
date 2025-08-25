'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { useMultiTenantAuth } from './multi-tenant-auth-provider';

// Types
interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback?: (data: any) => void) => void;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
}

interface SocketProviderProps {
  children: React.ReactNode;
}

// Context
const SocketContext = createContext<SocketContextType | undefined>(undefined);

// Hook para usar o contexto
export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

// Provider
export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useMultiTenantAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      initializeSocket();
    } else {
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, user]);

  const initializeSocket = () => {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('nex_token');
    if (!token) return;

    const socketUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
    
    const newSocket = io(socketUrl, {
      auth: {
        token,
        userId: user?.id,
        tenantId: user?.tenantId,
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      maxReconnectionAttempts: 5,
    });

    // Event listeners
    newSocket.on('connect', () => {
      console.log('Socket conectado:', newSocket.id);
      setIsConnected(true);
      
      // Entrar na sala do usuário
      if (user?.id) {
        newSocket.emit('join_user_room', user.id);
      }
      
      // Entrar na sala do tenant
      if (user?.tenantId) {
        newSocket.emit('join_tenant_room', user.tenantId);
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket desconectado:', reason);
      setIsConnected(false);
      
      if (reason === 'io server disconnect') {
        // Reconectar se o servidor desconectou
        newSocket.connect();
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('Erro de conexão do socket:', error);
      setIsConnected(false);
      
      if (error.message === 'Authentication error') {
        toast.error('Erro de autenticação. Faça login novamente.');
        // Aqui você pode chamar logout do MultiTenantAuthProvider
      }
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconectado após', attemptNumber, 'tentativas');
      setIsConnected(true);
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('Erro ao reconectar:', error);
    });

    newSocket.on('reconnect_failed', () => {
      console.error('Falha ao reconectar após múltiplas tentativas');
      toast.error('Conexão perdida. Verifique sua internet.');
    });

    // Eventos específicos da aplicação
    newSocket.on('notification', (data) => {
      toast.info(data.message, {
        description: data.description,
        action: data.action ? {
          label: data.action.label,
          onClick: () => {
            if (data.action.url) {
              window.location.href = data.action.url;
            }
          },
        } : undefined,
      });
    });

    newSocket.on('chat_message', (data) => {
      // Evento será tratado pelos componentes específicos
      console.log('Nova mensagem de chat:', data);
    });

    newSocket.on('document_processed', (data) => {
      toast.success(`Documento "${data.filename}" processado com sucesso!`);
    });

    newSocket.on('document_failed', (data) => {
      toast.error(`Falha ao processar documento "${data.filename}": ${data.error}`);
    });

    newSocket.on('user_status_changed', (data) => {
      // Atualizar status de usuários online
      console.log('Status do usuário alterado:', data);
    });

    newSocket.on('system_maintenance', (data) => {
      toast.warning('Manutenção do sistema agendada', {
        description: `O sistema entrará em manutenção em ${data.scheduledTime}`,
        duration: 10000,
      });
    });

    setSocket(newSocket);
  };

  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  };

  // Métodos auxiliares
  const emit = (event: string, data?: any) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    } else {
      console.warn('Socket não conectado. Evento não enviado:', event);
    }
  };

  const on = (event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  const off = (event: string, callback?: (data: any) => void) => {
    if (socket) {
      if (callback) {
        socket.off(event, callback);
      } else {
        socket.off(event);
      }
    }
  };

  const joinRoom = (room: string) => {
    emit('join_room', { room });
  };

  const leaveRoom = (room: string) => {
    emit('leave_room', { room });
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    emit,
    on,
    off,
    joinRoom,
    leaveRoom,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

// Hook personalizado para eventos específicos
export function useSocketEvent(event: string, callback: (data: any) => void) {
  const { socket } = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on(event, callback);
      
      return () => {
        socket.off(event, callback);
      };
    }
  }, [socket, event, callback]);
}

// Hook para status de usuários online
export function useOnlineUsers() {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const { socket } = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on('online_users', setOnlineUsers);
      socket.emit('get_online_users');
      
      return () => {
        socket.off('online_users', setOnlineUsers);
      };
    }
  }, [socket]);

  return onlineUsers;
}

// Hook para typing indicators
export function useTypingIndicator(chatId: string) {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const { socket, emit } = useSocket();

  useEffect(() => {
    if (socket) {
      const handleTyping = (data: { userId: string; chatId: string }) => {
        if (data.chatId === chatId) {
          setTypingUsers(prev => 
            prev.includes(data.userId) ? prev : [...prev, data.userId]
          );
        }
      };

      const handleStopTyping = (data: { userId: string; chatId: string }) => {
        if (data.chatId === chatId) {
          setTypingUsers(prev => prev.filter(id => id !== data.userId));
        }
      };

      socket.on('user_typing', handleTyping);
      socket.on('user_stop_typing', handleStopTyping);
      
      return () => {
        socket.off('user_typing', handleTyping);
        socket.off('user_stop_typing', handleStopTyping);
      };
    }
  }, [socket, chatId]);

  const startTyping = () => {
    emit('start_typing', { chatId });
  };

  const stopTyping = () => {
    emit('stop_typing', { chatId });
  };

  return {
    typingUsers,
    startTyping,
    stopTyping,
  };
}