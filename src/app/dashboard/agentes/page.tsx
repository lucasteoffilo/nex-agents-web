'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Importação dinâmica do componente de botão de chat
const DynamicChatButton = dynamic(
  () => import('@/components/chat-button').then(mod => mod.ChatButton),
  {
    ssr: false,
    loading: () => (
      <Button size="sm" variant="outline" disabled>
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        Carregando...
      </Button>
    )
  }
);
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Filter,
  Plus,
  Bot,
  Settings,
  Play,
  Pause,
  Edit,
  Copy,
  Trash2,
  MoreHorizontal,
  Brain,
  MessageSquare,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  Target,
  BarChart3,
  Eye,
  Phone,
  Mail,
  Loader2
} from 'lucide-react';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { useAgents } from '@/hooks/use-agents';

// Componente de botão de chat
const ChatButton = ({ agentId }: { agentId: string }) => {
  const router = useRouter();
  
  const handleClick = () => {
    router.push(`/dashboard/chat/${agentId}`);
  };
  
  return (
    <Button 
      size="sm" 
      variant="default" 
      className="bg-brand-500 hover:bg-brand-600"
      onClick={handleClick}
    >
      <MessageSquare className="h-3 w-3 mr-1" />
      Conversar
    </Button>
  );
};

// Versão do componente que só renderiza no cliente
const ClientOnlyChatButton = dynamic(() => Promise.resolve(ChatButton), { 
  ssr: false,
  loading: () => (
    <Button 
      size="sm" 
      variant="default" 
      className="bg-brand-500 hover:bg-brand-600"
    >
      <MessageSquare className="h-3 w-3 mr-1" />
      Conversar
    </Button>
  )
});

interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'training' | 'error';
  type: 'assistant' | 'chatbot' | 'support' | 'sales' | 'custom';
  category: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  conversations: number;
  successRate: number;
  avgResponseTime: number;
  knowledgeBase?: {
    collections?: string[];
  };
  metrics?: {
    totalConversations?: number;
    successRate?: number;
    averageResponseTime?: number;
  };
  flows: number;
  lastTrained?: string;
  lastTrainedAt?: string;
  version: string;
}

// Funções auxiliares para ícones
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'assistant':
      return Bot;
    case 'chatbot':
      return MessageSquare;
    case 'support':
      return Users;
    case 'sales':
      return Target;
    case 'custom':
      return Settings;
    default:
      return Bot;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
      return CheckCircle;
    case 'inactive':
      return Pause;
    case 'training':
      return Loader2;
    case 'error':
      return AlertCircle;
    default:
      return Clock;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'success';
    case 'inactive':
      return 'secondary';
    case 'training':
      return 'warning';
    case 'error':
      return 'destructive';
    default:
      return 'secondary';
  }
};

const getTypeName = (type: string) => {
  switch (type) {
    case 'assistant':
      return 'Assistente';
    case 'chatbot':
      return 'Chatbot';
    case 'support':
      return 'Suporte';
    case 'sales':
      return 'Vendas';
    case 'custom':
      return 'Personalizado';
    default:
      return 'Desconhecido';
  }
};

// Componente principal que usa useSearchParams
function AgentesContent() {
  const router = useRouter();
  const { useSearchParams } = require('next/navigation');
  const searchParams = useSearchParams();
  const collectionId = searchParams.get('collectionId');
  const {
    agents,
    stats,
    loading,
    error,
    updateAgent,
    deleteAgent,
    toggleAgentStatus,
    filters,
    setSearch,
    setTypeFilter,
    setActiveFilter,
    clearFilters
  } = useAgents();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // Debounce para o termo de busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms de delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Remover o useEffect que chamava setSearch para evitar chamadas desnecessárias à API

  const statuses = ['all', 'active', 'inactive', 'training', 'error'];
  const types = ['all', 'assistant', 'chatbot', 'support', 'sales', 'custom'];

  // Filtrar agentes localmente
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = debouncedSearchTerm === '' || 
      agent.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      (agent.description && agent.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
    
    const matchesStatus = selectedStatus === 'all' || agent.status === selectedStatus;
    
    const matchesType = selectedType === 'all' || agent.type === selectedType;

    const matchesCollection = !collectionId ||
      (agent.knowledgeBase &&
        agent.knowledgeBase.collections &&
        agent.knowledgeBase.collections.includes(collectionId));
    
    return matchesSearch && matchesStatus && matchesType && matchesCollection;
  });

  // Calcular estatísticas a partir dos dados dos agentes filtrados
  const calculateStats = () => {
    const total = filteredAgents.length;
    const active = filteredAgents.filter(agent => agent.status === 'active').length;
    const training = filteredAgents.filter(agent => agent.status === 'training').length;
    const totalConversations = filteredAgents.reduce((sum, agent) => sum + (agent.metrics?.totalConversations || 0), 0);
    const avgSuccessRate = filteredAgents.length > 0 
      ? filteredAgents.reduce((sum, agent) => sum + (agent.metrics?.successRate || 0), 0) / filteredAgents.length
      : 0;
    
    return {
      total,
      active,
      training,
      totalConversations,
      avgSuccessRate
    };
  };

  const calculatedStats = calculateStats();

  const handleStatusChange = async (agentId: string, newStatus: 'active' | 'inactive') => {
    try {
      const isActive = newStatus === 'active';
      await toggleAgentStatus(agentId, isActive);
    } catch (error) {
      console.error('Erro ao atualizar status do agente:', error);
    }
  };

  const handleDelete = async (agentId: string) => {
    try {
      await deleteAgent(agentId);
    } catch (error) {
      console.error('Erro ao deletar agente:', error);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    // O setSearch será chamado pelo useEffect com debounce
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    // Remover chamadas para setActiveFilter para usar filtro local
  };

  const handleTypeFilter = (type: string) => {
    setSelectedType(type);
    // Remover chamadas para setTypeFilter para usar filtro local
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando agentes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">Erro ao carregar agentes: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agentes IA</h1>
          <p className="text-muted-foreground">
            Crie, treine e gerencie seus agentes de inteligência artificial
          </p>
        </div>
        
        <Link href="/dashboard/agentes/criar">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Criar Agente
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Agentes</p>
                <p className="text-2xl font-bold">{calculatedStats.total}</p>
              </div>
              <Bot className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold text-green-600">{calculatedStats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Treinando</p>
                <p className="text-2xl font-bold text-yellow-600">{calculatedStats.training}</p>
              </div>
              <Brain className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversas</p>
                <p className="text-2xl font-bold">{calculatedStats.totalConversations.toLocaleString()}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-[#0072b9]" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Sucesso</p>
                <p className="text-2xl font-bold">{calculatedStats.avgSuccessRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
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
            placeholder="Buscar agentes..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={selectedStatus}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'Todos os status' :
                 status === 'active' ? 'Ativo' :
                 status === 'inactive' ? 'Inativo' :
                 status === 'training' ? 'Treinando' :
                 status === 'error' ? 'Erro' : status}
              </option>
            ))}
          </select>
          
          <select
            value={selectedType}
            onChange={(e) => handleTypeFilter(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {types.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'Todos os tipos' : getTypeName(type)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAgents.map((agent) => {
          const TypeIcon = getTypeIcon(agent.type);
          const StatusIcon = getStatusIcon(agent.status);
          
          return (
            <Card key={agent.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <TypeIcon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold truncate">
                        {agent.name}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        v{agent.version}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <Badge variant={getStatusColor(agent.status) as any} className="text-xs">
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {agent.status === 'active' && 'Ativo'}
                    {agent.status === 'inactive' && 'Inativo'}
                    {agent.status === 'training' && 'Treinando'}
                    {agent.status === 'error' && 'Erro'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {agent.description || 'Sem descrição'}
                </p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    {/* <Badge variant="outline" className="text-xs">
                      {agent.category}
                    </Badge> */}
                    <Badge variant="secondary" className="text-xs">
                      {getTypeName(agent.type)}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground">
                    0 flows
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Conversas</p>
                    <p className="font-semibold">{agent.metrics?.totalConversations?.toLocaleString() || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Taxa de Sucesso</p>
                    <p className="font-semibold text-green-600">{agent.metrics?.successRate?.toFixed(1) || 0}%</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Tempo de Resposta</p>
                    <p className="font-semibold">{agent.metrics?.averageResponseTime ? (agent.metrics.averageResponseTime / 1000).toFixed(1) : 0}s</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Última Atualização</p>
                    <p className="font-semibold">{formatRelativeTime(agent.updatedAt)}</p>
                  </div>
                </div>
                
                {agent.lastTrainedAt && (
                  <div className="text-xs text-muted-foreground">
                    Último treinamento: {formatDate(agent.lastTrainedAt)}
                  </div>
                )}
                
                <div className="flex items-center gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="h-3 w-3 mr-1" />
                    Ver
                  </Button>
                  <DynamicChatButton agentId={agent.id} />
                  <Button size="sm" variant="outline">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => router.push(`/dashboard/agentes/${agent.id}/configuracoes`)}
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                  {agent.status === 'active' ? (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleStatusChange(agent.id, 'inactive')}
                    >
                      <Pause className="h-3 w-3" />
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleStatusChange(agent.id, 'active')}
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDelete(agent.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredAgents.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum agente encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedStatus !== 'all' || selectedType !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando seu primeiro agente de IA'
              }
            </p>
            {!searchTerm && selectedStatus === 'all' && selectedType === 'all' && (
              <Link href="/dashboard/agentes/criar">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Agente
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Componente principal com suspense boundary
export default function AgentesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando...</span>
      </div>
    }>
      <AgentesContent />
    </Suspense>
  );
}