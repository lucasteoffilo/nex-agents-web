'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  MessageSquare,
  Clock,
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
  Pause,
  Archive,
  Star,
  Phone,
  Mail,
  MessageCircle,
  Plus,
  X,
  Tag,
  Edit,
  Save,
  Send,
  Paperclip,
  MoreHorizontal,
  History,
  Users
} from 'lucide-react';
import { formatDate, formatRelativeTime } from '@/lib/utils';

interface Ticket {
  id: string;
  subject: string;
  description: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  tags: string[];
  assignedTo?: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  rating?: number;
  channel: 'chat' | 'email' | 'phone' | 'whatsapp';
}

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    type: 'customer' | 'agent' | 'system';
    avatar?: string;
  };
  timestamp: string;
  type: 'text' | 'system' | 'note';
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
}

interface Activity {
  id: string;
  type: 'status_change' | 'priority_change' | 'assignment' | 'tag_added' | 'tag_removed' | 'note_added';
  description: string;
  user: {
    id: string;
    name: string;
  };
  timestamp: string;
  details?: any;
}

// Mock data
const mockTicket: Ticket = {
  id: 'TK-001',
  subject: 'Problema com login na plataforma',
  description: 'Cliente relatou dificuldades para acessar a conta. Erro aparece após inserir credenciais corretas.',
  customer: {
    id: 'cust-001',
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '+55 11 99999-9999'
  },
  status: 'open',
  priority: 'high',
  category: 'Técnico',
  tags: ['login', 'urgente', 'bug'],
  assignedTo: {
    id: 'agent-001',
    name: 'Ana Costa'
  },
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-15T11:45:00Z',
  messageCount: 5,
  channel: 'chat'
};

const mockMessages: Message[] = [
  {
    id: 'msg-001',
    content: 'Olá! Estou com problemas para fazer login na plataforma. Já tentei várias vezes mas não consigo acessar.',
    sender: {
      id: 'cust-001',
      name: 'João Silva',
      type: 'customer'
    },
    timestamp: '2024-01-15T10:30:00Z',
    type: 'text'
  },
  {
    id: 'msg-002',
    content: 'Ticket criado automaticamente',
    sender: {
      id: 'system',
      name: 'Sistema',
      type: 'system'
    },
    timestamp: '2024-01-15T10:30:05Z',
    type: 'system'
  },
  {
    id: 'msg-003',
    content: 'Olá João! Obrigada por entrar em contato. Vou ajudá-lo com o problema de login. Pode me informar qual mensagem de erro aparece?',
    sender: {
      id: 'agent-001',
      name: 'Ana Costa',
      type: 'agent'
    },
    timestamp: '2024-01-15T10:35:00Z',
    type: 'text'
  },
  {
    id: 'msg-004',
    content: 'A mensagem que aparece é "Credenciais inválidas", mas tenho certeza que estou usando a senha correta.',
    sender: {
      id: 'cust-001',
      name: 'João Silva',
      type: 'customer'
    },
    timestamp: '2024-01-15T10:40:00Z',
    type: 'text'
  },
  {
    id: 'msg-005',
    content: 'Vou verificar sua conta no sistema. Pode aguardar um momento?',
    sender: {
      id: 'agent-001',
      name: 'Ana Costa',
      type: 'agent'
    },
    timestamp: '2024-01-15T10:42:00Z',
    type: 'text'
  }
];

const mockActivities: Activity[] = [
  {
    id: 'act-001',
    type: 'tag_added',
    description: 'Tags adicionadas: login, urgente',
    user: {
      id: 'agent-001',
      name: 'Ana Costa'
    },
    timestamp: '2024-01-15T10:35:00Z'
  },
  {
    id: 'act-002',
    type: 'assignment',
    description: 'Ticket atribuído para Ana Costa',
    user: {
      id: 'system',
      name: 'Sistema'
    },
    timestamp: '2024-01-15T10:32:00Z'
  },
  {
    id: 'act-003',
    type: 'tag_added',
    description: 'Tag adicionada: bug',
    user: {
      id: 'agent-001',
      name: 'Ana Costa'
    },
    timestamp: '2024-01-15T11:00:00Z'
  }
];

const availableTags = [
  'login', 'senha', 'bug', 'urgente', 'pagamento', 'integração',
  'api', 'performance', 'ui', 'mobile', 'desktop', 'feature-request',
  'documentação', 'treinamento', 'suporte', 'comercial'
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open': return 'destructive';
    case 'in_progress': return 'default';
    case 'resolved': return 'default';
    case 'closed': return 'secondary';
    default: return 'default';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent': return 'destructive';
    case 'high': return 'default';
    case 'medium': return 'secondary';
    case 'low': return 'outline';
    default: return 'default';
  }
};

const getChannelIcon = (channel: string) => {
  switch (channel) {
    case 'chat': return MessageCircle;
    case 'email': return Mail;
    case 'phone': return Phone;
    case 'whatsapp': return MessageSquare;
    default: return MessageCircle;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'open': return AlertCircle;
    case 'in_progress': return Pause;
    case 'resolved': return CheckCircle;
    case 'closed': return Archive;
    default: return AlertCircle;
  }
};

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket>(mockTicket);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [activities, setActivities] = useState<Activity[]>(mockActivities);
  const [newMessage, setNewMessage] = useState('');
  const [newTag, setNewTag] = useState('');
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [loading, setLoading] = useState(false);

  const ChannelIcon = getChannelIcon(ticket.channel);
  const StatusIcon = getStatusIcon(ticket.status);

  // Simular carregamento do ticket
  useEffect(() => {
    // Em uma aplicação real, aqui faria a requisição para a API
    // fetchTicket(params.id);
  }, [params.id]);

  const handleAddTag = async (tag: string) => {
    if (!tag.trim() || ticket.tags.includes(tag.trim())) return;

    setLoading(true);
    try {
      // Simular chamada para API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedTags = [...ticket.tags, tag.trim()];
      setTicket(prev => ({ ...prev, tags: updatedTags }));
      
      // Adicionar atividade
      const newActivity: Activity = {
        id: `act-${Date.now()}`,
        type: 'tag_added',
        description: `Tag adicionada: ${tag.trim()}`,
        user: {
          id: 'current-user',
          name: 'Usuário Atual'
        },
        timestamp: new Date().toISOString()
      };
      setActivities(prev => [newActivity, ...prev]);
      
      setNewTag('');
    } catch (error) {
      console.error('Erro ao adicionar tag:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    setLoading(true);
    try {
      // Simular chamada para API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedTags = ticket.tags.filter(tag => tag !== tagToRemove);
      setTicket(prev => ({ ...prev, tags: updatedTags }));
      
      // Adicionar atividade
      const newActivity: Activity = {
        id: `act-${Date.now()}`,
        type: 'tag_removed',
        description: `Tag removida: ${tagToRemove}`,
        user: {
          id: 'current-user',
          name: 'Usuário Atual'
        },
        timestamp: new Date().toISOString()
      };
      setActivities(prev => [newActivity, ...prev]);
    } catch (error) {
      console.error('Erro ao remover tag:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      // Simular chamada para API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const message: Message = {
        id: `msg-${Date.now()}`,
        content: newMessage.trim(),
        sender: {
          id: 'current-user',
          name: 'Usuário Atual',
          type: 'agent'
        },
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    try {
      // Simular chamada para API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setTicket(prev => ({ ...prev, status: newStatus as any }));
      
      // Adicionar atividade
      const newActivity: Activity = {
        id: `act-${Date.now()}`,
        type: 'status_change',
        description: `Status alterado para: ${newStatus}`,
        user: {
          id: 'current-user',
          name: 'Usuário Atual'
        },
        timestamp: new Date().toISOString()
      };
      setActivities(prev => [newActivity, ...prev]);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    setLoading(true);
    try {
      // Simular chamada para API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setTicket(prev => ({ ...prev, priority: newPriority as any }));
      
      // Adicionar atividade
      const newActivity: Activity = {
        id: `act-${Date.now()}`,
        type: 'priority_change',
        description: `Prioridade alterada para: ${newPriority}`,
        user: {
          id: 'current-user',
          name: 'Usuário Atual'
        },
        timestamp: new Date().toISOString()
      };
      setActivities(prev => [newActivity, ...prev]);
    } catch (error) {
      console.error('Erro ao alterar prioridade:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{ticket.subject}</h1>
              <Badge variant="outline">{ticket.id}</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <ChannelIcon className="h-4 w-4" />
                <span className="capitalize">{ticket.channel}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Criado {formatRelativeTime(ticket.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Atualizado {formatRelativeTime(ticket.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Conversation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Messages */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.sender.type === 'customer' ? 'flex-row' :
                      message.sender.type === 'system' ? 'justify-center' :
                      'flex-row-reverse'
                    }`}
                  >
                    {message.sender.type !== 'system' && (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                        {message.sender.name.charAt(0)}
                      </div>
                    )}
                    
                    <div className={`flex-1 max-w-[80%] ${
                      message.sender.type === 'system' ? 'text-center' : ''
                    }`}>
                      {message.sender.type !== 'system' && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{message.sender.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(message.timestamp)}
                          </span>
                        </div>
                      )}
                      
                      <div className={`rounded-lg p-3 ${
                        message.sender.type === 'customer' ? 'bg-muted' :
                        message.sender.type === 'system' ? 'bg-blue-50 text-blue-700 text-sm' :
                        'bg-primary text-primary-foreground'
                      }`}>
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Message Input */}
              <div className="border-t pt-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-[80px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <div className="flex flex-col gap-2">
                    <Button size="sm" variant="outline">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || loading}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ticket Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações do Ticket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status */}
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <Select value={ticket.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Aberto</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="resolved">Resolvido</SelectItem>
                    <SelectItem value="closed">Fechado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Priority */}
              <div>
                <Label className="text-sm font-medium">Prioridade</Label>
                <Select value={ticket.priority} onValueChange={handlePriorityChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Category */}
              <div>
                <Label className="text-sm font-medium">Categoria</Label>
                <div className="mt-1">
                  <Badge variant="outline">{ticket.category}</Badge>
                </div>
              </div>
              
              {/* Assigned To */}
              {ticket.assignedTo && (
                <div>
                  <Label className="text-sm font-medium">Atribuído para</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                      {ticket.assignedTo.name.charAt(0)}
                    </div>
                    <span className="text-sm">{ticket.assignedTo.name}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Nome</Label>
                <p className="text-sm mt-1">{ticket.customer.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm mt-1">{ticket.customer.email}</p>
              </div>
              {ticket.customer.phone && (
                <div>
                  <Label className="text-sm font-medium">Telefone</Label>
                  <p className="text-sm mt-1">{ticket.customer.phone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Tags
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditingTags(!isEditingTags)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Current Tags */}
              <div className="flex flex-wrap gap-2">
                {ticket.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    {isEditingTags && (
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-destructive"
                        disabled={loading}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
              
              {/* Add New Tag */}
              {isEditingTags && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nova tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag(newTag);
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={() => handleAddTag(newTag)}
                      disabled={!newTag.trim() || loading}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Suggested Tags */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Tags sugeridas:</Label>
                    <div className="flex flex-wrap gap-1">
                      {availableTags
                        .filter(tag => !ticket.tags.includes(tag))
                        .slice(0, 8)
                        .map((tag) => (
                          <Button
                            key={tag}
                            size="sm"
                            variant="outline"
                            className="h-6 text-xs"
                            onClick={() => handleAddTag(tag)}
                            disabled={loading}
                          >
                            {tag}
                          </Button>
                        ))
                      }
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm">{activity.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{activity.user.name}</span>
                        <span>•</span>
                        <span>{formatRelativeTime(activity.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}