'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Importação dinâmica do componente de botão de chat
const DynamicChatButton = dynamic(
  () => import('@/components/chat-button').then(mod => mod.ChatButton),
  {
    ssr: false,
    loading: () => import('@/components/chat-button').then(mod => mod.StaticChatButton())
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
  type: 'chatbot' | 'voice' | 'email' | 'whatsapp';
  category: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  conversations: number;
  successRate: number;
  avgResponseTime: number;
  knowledgeBaseCollectionIds: string[];
  flows: number;
  lastTrained?: string;
  version: string;
}



// Funções auxiliares removidas - agora usando dados da API diretamente

export default function AgentesPage() {
  const router = useRouter();
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
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const statuses = ['all', 'active', 'inactive', 'training', 'error'];
  const types = ['all', 'chatbot', 'voice', 'email', 'whatsapp'];

  const filteredAgents = agents;

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
    setSearch(value);
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    if (status === 'all') {
      setActiveFilter(undefined);
    } else {
      setActiveFilter(status === 'active');
    }
  };

  const handleTypeFilter = (type: string) => {
    setSelectedType(type);
    setTypeFilter(type === 'all' ? undefined : type);
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
        
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Criar Agente
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Agentes</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
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
                <p className="text-2xl font-bold text-green-600">{stats?.active || 0}</p>
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
                <p className="text-2xl font-bold text-yellow-600">{stats?.training || 0}</p>
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
                <p className="text-2xl font-bold">{stats?.totalConversations?.toLocaleString() || 0}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Sucesso</p>
                <p className="text-2xl font-bold">{stats?.avgSuccessRate?.toFixed(1) || 0}%</p>
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
                {type === 'all' ? 'Todos os tipos' :
                 type === 'chatbot' ? 'Chatbot' :
                 type === 'voice' ? 'Voz' :
                 type === 'email' ? 'Email' :
                 type === 'whatsapp' ? 'WhatsApp' : type}
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
                  {agent.description}
                </p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">
                      {agent.category}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground">
                    {agent.flows} flows
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
                    <p className="font-semibold">{agent.metrics?.avgResponseTime?.toFixed(1) || 0}s</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Última Atualização</p>
                    <p className="font-semibold">{formatRelativeTime(agent.updatedAt)}</p>
                  </div>
                </div>
                
                {agent.lastTrained && (
                  <div className="text-xs text-muted-foreground">
                    Último treinamento: {formatDate(agent.lastTrained)}
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
                  {agent.isActive ? (
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
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Agente
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}