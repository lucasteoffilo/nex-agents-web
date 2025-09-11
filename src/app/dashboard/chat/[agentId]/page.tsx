'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Share2, User, Bot, Loader2, Mic } from 'lucide-react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import agentService, { Agent } from '@/services/agent-service';
import { chatService, Chat, Message, CreateChatDto, SendMessageDto } from '@/services/chat-service';

export default function AgentChatPage() {
  const params = useParams();
  const agentId = params.agentId as string;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      setIsRecording(true);
      setAudioChunks([]);

      recorder.ondataavailable = (event) => {
        setAudioChunks((prev) => [...prev, event.data]);
      };

      recorder.start();
      toast.info('Gravação iniciada', { description: 'Comece a falar.' });
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      toast.error('Erro', { description: 'Não foi possível acessar o microfone.' });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      toast.info('Gravação finalizada', { description: 'Processando áudio...' });

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        // Aqui você enviaria o audioBlob para o backend
        console.log('Audio gravado:', audioBlob);
        handleSendAudio(audioBlob);
        setAudioChunks([]);
      };
    }
  };

  // Carregar dados do agente e criar/obter chat
  useEffect(() => {
    const initializeChat = async () => {
      setIsLoading(true);
      try {
        // Carregar dados do agente
        const agentResponse = await agentService.getAgent(agentId);
        setAgent(agentResponse.data);

        // Criar ou obter chat existente
        const createChatDto: CreateChatDto = {
          agentId,
          title: `Chat com ${agentResponse.data.name}`
        };
        
        const chatResponse = await chatService.createChat(createChatDto);
        setChat(chatResponse.data);

        // Carregar mensagens existentes se houver
        if (chatResponse.data.id) {
          const messagesResponse = await chatService.getChatMessages(chatResponse.data.id, { page: 1, limit: 50 });
          if (messagesResponse.data && messagesResponse.data.messages) {
            const messagesWithFixedDates = messagesResponse.data.messages.map(msg => {
              const date = new Date(msg.timestamp);
              if (isNaN(date.getTime())) {
                console.warn('Invalid timestamp received from server:', msg.timestamp);
                return { ...msg, timestamp: new Date().toISOString() };
              }
              return msg;
            });

            setMessages(messagesWithFixedDates);
          } else {
            setMessages([]);
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar chat:', error);
        toast.error('Erro', {
          description: 'Não foi possível carregar o agente ou criar o chat.'
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (agentId) {
      initializeChat();
    }
  }, [agentId, toast]);

  const handleSendAudio = async (audioBlob: Blob) => {
    if (!chat || isSending) return;

    setIsSending(true);
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      chatId: chat.id,
      content: 'Enviando áudio...', // Placeholder
      type: 'user',
      timestamp: new Date().toISOString(),
      audioUrl: URL.createObjectURL(audioBlob), // Para pré-visualização
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');

      const token = localStorage.getItem('nex_token');
      const response = await fetch(`/api/chats/${chat.id}/audio-messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to send audio');
      }
      const responseAudio = await response.blob();
      const audioUrl = URL.createObjectURL(responseAudio);

      const tempAssistantMessage: Message = {
        id: `temp-assistant-${Date.now()}` ,
        chatId: chat.id,
        content: 'Resposta em áudio',
        type: 'assistant',
        timestamp: new Date().toISOString(),
        audioUrl: audioUrl,
      };
      setMessages((prev) => [...prev, tempAssistantMessage]);

      // Reproduzir áudio automaticamente
      const audioElement = new Audio(audioUrl);
      audioElement.play().catch(error => console.error('Erro ao reproduzir áudio:', error));

      const messagesResponse = await chatService.getChatMessages(chat.id, { page: 1, limit: 50 });
      if (messagesResponse.data && messagesResponse.data.messages) {
        const messagesWithFixedDates = messagesResponse.data.messages.map((msg) => {
          const date = new Date(msg.timestamp);
          if (isNaN(date.getTime())) {
            console.warn('Invalid timestamp received from server (after audio send):', msg.timestamp);
            return { ...msg, timestamp: new Date().toISOString() };
          }
          return msg;
        });
        setMessages(messagesWithFixedDates);
      }
    } catch (error) {
      console.error('Erro ao enviar áudio:', error);
      toast.error('Erro', { description: 'Não foi possível enviar o áudio. Tente novamente.' });
      setMessages((prev) => prev.filter((msg) => !msg.id.startsWith('temp-')));
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !chat || isSending) return;
    
    setIsSending(true);
    const userMessage = message;
    setMessage('');
    
    try {
      // Criar mensagem do usuário
      const sendMessageDto: SendMessageDto = {
        content: userMessage,
        type: 'user'
      };
      
      // Adicionar mensagem do usuário à interface imediatamente
      const tempUserMessage: Message = {
        id: `temp-${Date.now()}`,
        chatId: chat.id,
        content: userMessage,
        type: 'user',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, tempUserMessage]);
      
      await chatService.sendMessage(chat.id, sendMessageDto);
      
      // Após o envio, recarrega as mensagens para obter a versão final
      // da mensagem do usuário e a nova mensagem do assistente.
      const messagesResponse = await chatService.getChatMessages(chat.id, { page: 1, limit: 50 });
      if (messagesResponse.data && messagesResponse.data.messages) {
        const messagesWithFixedDates = messagesResponse.data.messages.map(msg => {
          const date = new Date(msg.timestamp);
          if (isNaN(date.getTime())) {
            console.warn('Invalid timestamp received from server (after send):', msg.timestamp);
            return { ...msg, timestamp: new Date().toISOString() };
          }
          return msg;
        });
        setMessages(messagesWithFixedDates);

      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro', {
        description: 'Não foi possível enviar a mensagem. Tente novamente.'
      });
      // Remover mensagem temporária em caso de erro
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-[calc(100vh-100px)] border rounded-lg shadow-sm">
      {/* Cabeçalho do chat */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-brand-500 flex items-center justify-center text-white">
            {agent?.avatar ? (
              <img src={agent.avatar} alt={agent.name} className="h-10 w-10 rounded-full" />
            ) : (
              <Bot className="h-5 w-5" />
            )}
          </div>
          <div>
            <h2 className="font-semibold text-base">
              {isLoading ? 'Carregando...' : agent?.name || 'Agente'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {agent?.type ? `Agente ${agent.type}` : 'Assistente Virtual'}
              {agent?.status && (
                <span className={`ml-2 inline-block w-2 h-2 rounded-full ${
                  agent.status === 'active' ? 'bg-green-500' : 
                  agent.status === 'training' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
              )}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="text-sm h-10 px-4">
          <Share2 className="h-4 w-4 mr-2" />
          Compartilhar
        </Button>
      </div>

      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: "calc(100vh - 130px)" }}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-500 mb-4" />
            <p className="text-muted-foreground">Carregando chat...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="h-20 w-20 rounded-full bg-brand-500 flex items-center justify-center text-white mb-5">
              {agent?.avatar ? (
                <img src={agent.avatar} alt={agent.name} className="h-20 w-20 rounded-full" />
              ) : (
                <Bot className="h-10 w-10" />
              )}
            </div>
            <h3 className="text-xl font-semibold">{agent?.name || 'Agente'}</h3>
            <p className="text-muted-foreground text-base max-w-md mt-3">
              {agent?.description || 'Olá! Sou seu assistente virtual. Como posso ajudar você hoje?'}
            </p>
            {agent?.knowledgeBase?.collections && agent.knowledgeBase.collections.length > 0 && (
              <div className="mt-4 text-sm text-muted-foreground">
                <p>💡 Tenho acesso a {agent.knowledgeBase.collections.length} base(s) de conhecimento</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              // const isUser = message.type === 'user';
              const isUser = (message.type === 'user' || message.role === 'user');
              return (
                <div 
                  key={message.id} 
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[80%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className="flex-shrink-0">
                      {isUser ? (
                        <div className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center text-white">
                          <User className="h-4 w-4" />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-brand-500 flex items-center justify-center text-white">
                          {agent?.avatar ? (
                            <img src={agent.avatar} alt={agent.name} className="h-8 w-8 rounded-full" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </div>
                      )}
                    </div>
                    <Card 
                      className={`p-4 text-base ${
                        isUser 
                          ? 'bg-brand-500 text-white border-brand-500' 
                          : 'bg-muted'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      {message.metadata?.sources && message.metadata.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-opacity-20 text-xs opacity-75">
                          <p>📚 Fontes: {message.metadata.sources.join(', ')}</p>
                        </div>
                      )}
                      <div className="text-xs opacity-50 mt-1">
                      {(() => {
                        const date = new Date(message.timestamp);
                        if (isNaN(date.getTime())) {
                          return 'Data Inválida';
                        }
                        return `${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}`;
                      })()}
                    </div>
                    {message.audioUrl && (
                      <audio controls autoPlay={message.type === 'assistant'} src={message.audioUrl} className="mt-2 w-full"></audio>
                    )}
                    </Card>
                  </div>
                </div>
              );
            })}
          </>
        )}
        {isSending && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2 max-w-[80%]">
              <div className="h-8 w-8 rounded-full bg-brand-500 flex items-center justify-center text-white">
                <Bot className="h-4 w-4" />
              </div>
              <Card className="p-4 bg-muted">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Digitando...</span>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Área de input */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-3">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder={isLoading ? "Carregando..." : "Escreva sua mensagem..."}
            className="flex-1 h-12 text-base"
            disabled={isLoading || isSending || !chat || isRecording}
          />
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            size="icon"
            className={`h-12 w-12 rounded-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-500 hover:bg-gray-600'}`}
            disabled={isLoading || isSending || !chat}
          >
            <Mic className="h-6 w-6" />
          </Button>
          <Button 
            onClick={handleSendMessage} 
            size="icon" 
            className="h-12 w-12 rounded-full bg-brand-500 hover:bg-brand-600"
            disabled={isLoading || isSending || !chat || !message.trim() || isRecording}
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
