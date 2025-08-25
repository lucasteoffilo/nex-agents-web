'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Filter,
  Plus,
  MessageSquare,
  Clock,
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
  Pause,
  ArrowRight,
  Star,
  Phone,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Eye,
  Edit,
  Archive
} from 'lucide-react';
import { formatDate, formatRelativeTime } from '@/lib/utils';

interface Ticket {
  id: string;
  subject: string;
  customer: {
    name: string;
    email: string;
    avatar?: string;
  };
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  lastMessage: string;
  messageCount: number;
  rating?: number;
  channel: 'chat' | 'email' | 'phone' | 'whatsapp';
}

const mockTickets: Ticket[] = [
  {
    id: 'TK-001',
    subject: 'Problema com login na plataforma',
    customer: {
      name: 'João Silva',
      email: 'joao.silva@email.com'
    },
    status: 'open',
    priority: 'high',
    category: 'Técnico',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T11:45:00Z',
    lastMessage: 'Não consigo acessar minha conta há 2 dias',
    messageCount: 3,
    channel: 'chat'
  },
  {
    id: 'TK-002',
    subject: 'Dúvida sobre faturamento',
    customer: {
      name: 'Maria Santos',
      email: 'maria.santos@empresa.com'
    },
    status: 'in_progress',
    priority: 'medium',
    category: 'Financeiro',
    assignedTo: 'Ana Costa',
    createdAt: '2024-01-14T15:20:00Z',
    updatedAt: '2024-01-15T09:15:00Z',
    lastMessage: 'Obrigada pela explicação, vou verificar',
    messageCount: 7,
    channel: 'email'
  },
  {
    id: 'TK-003',
    subject: 'Solicitação de nova funcionalidade',
    customer: {
      name: 'Pedro Costa',
      email: 'pedro@startup.com'
    },
    status: 'resolved',
    priority: 'low',
    category: 'Feature Request',
    assignedTo: 'Carlos Lima',
    createdAt: '2024-01-13T08:45:00Z',
    updatedAt: '2024-01-14T16:30:00Z',
    lastMessage: 'Perfeito! Muito obrigado pelo suporte',
    messageCount: 12,
    rating: 5,
    channel: 'whatsapp'
  },
  {
    id: 'TK-004',
    subject: 'Erro ao processar pagamento',
    customer: {
      name: 'Ana Oliveira',
      email: 'ana.oliveira@loja.com'
    },
    status: 'open',
    priority: 'urgent',
    category: 'Pagamento',
    createdAt: '2024-01-15T14:10:00Z',
    updatedAt: '2024-01-15T14:10:00Z',
    lastMessage: 'URGENTE: Pagamento não está sendo processado',
    messageCount: 1,
    channel: 'phone'
  },
  {
    id: 'TK-005',
    subject: 'Como integrar com nossa API',
    customer: {
      name: 'Roberto Silva',
      email: 'roberto@tech.com'
    },
    status: 'closed',
    priority: 'medium',
    category: 'Integração',
    assignedTo: 'Maria Santos',
    createdAt: '2024-01-10T11:00:00Z',
    updatedAt: '2024-01-12T17:45:00Z',
    lastMessage: 'Documentação muito clara, obrigado!',
    messageCount: 15,
    rating: 4,
    channel: 'chat'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open': return 'error';
    case 'in_progress': return 'warning';
    case 'resolved': return 'success';
    case 'closed': return 'default';
    default: return 'default';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent': return 'error';
    case 'high': return 'warning';
    case 'medium': return 'default';
    case 'low': return 'secondary';
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

export default function AtendimentoPage() {
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  const statuses = ['all', 'open', 'in_progress', 'resolved', 'closed'];
  const priorities = ['all', 'urgent', 'high', 'medium', 'low'];

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || ticket.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || ticket.priority === selectedPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    avgRating: tickets.filter(t => t.rating).reduce((acc, t) => acc + (t.rating || 0), 0) / tickets.filter(t => t.rating).length || 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Atendimento</h1>
          <p className="text-muted-foreground">
            Gerencie tickets e acompanhe o histórico de conversas
          </p>
        </div>
        
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Ticket
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Abertos</p>
                <p className="text-2xl font-bold text-red-600">{stats.open}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
              </div>
              <Pause className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolvidos</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avaliação Média</p>
                <p className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'Todos os status' : 
                 status === 'open' ? 'Aberto' :
                 status === 'in_progress' ? 'Em andamento' :
                 status === 'resolved' ? 'Resolvido' :
                 status === 'closed' ? 'Fechado' : status}
              </option>
            ))}
          </select>
          
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {priorities.map(priority => (
              <option key={priority} value={priority}>
                {priority === 'all' ? 'Todas as prioridades' :
                 priority === 'urgent' ? 'Urgente' :
                 priority === 'high' ? 'Alta' :
                 priority === 'medium' ? 'Média' :
                 priority === 'low' ? 'Baixa' : priority}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.map((ticket) => {
          const ChannelIcon = getChannelIcon(ticket.channel);
          const StatusIcon = getStatusIcon(ticket.status);
          
          return (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = `/dashboard/atendimento/${ticket.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-2 bg-muted rounded-lg">
                      <ChannelIcon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg truncate hover:text-primary">{ticket.subject}</h3>
                        <Badge variant="outline" className="text-xs">
                          {ticket.id}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{ticket.customer.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatRelativeTime(ticket.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{ticket.messageCount} mensagens</span>
                        </div>
                        {ticket.assignedTo && (
                          <div className="flex items-center gap-1">
                            <span>Atribuído a {ticket.assignedTo}</span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {ticket.lastMessage}
                      </p>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(ticket.status) as any} className="text-xs">
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {ticket.status === 'open' && 'Aberto'}
                          {ticket.status === 'in_progress' && 'Em andamento'}
                          {ticket.status === 'resolved' && 'Resolvido'}
                          {ticket.status === 'closed' && 'Fechado'}
                        </Badge>
                        
                        <Badge variant={getPriorityColor(ticket.priority) as any} className="text-xs">
                          {ticket.priority === 'urgent' && 'Urgente'}
                          {ticket.priority === 'high' && 'Alta'}
                          {ticket.priority === 'medium' && 'Média'}
                          {ticket.priority === 'low' && 'Baixa'}
                        </Badge>
                        
                        <Badge variant="outline" className="text-xs">
                          {ticket.category}
                        </Badge>
                        
                        {ticket.rating && (
                          <div className="flex items-center gap-1 ml-auto">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{ticket.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button size="sm" variant="outline">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTickets.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum ticket encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedStatus !== 'all' || selectedPriority !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Ainda não há tickets de atendimento'
              }
            </p>
            {!searchTerm && selectedStatus === 'all' && selectedPriority === 'all' && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Ticket
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}