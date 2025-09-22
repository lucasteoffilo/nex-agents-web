'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Users,
  FileText,
  Bot,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  BarChart3,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { formatNumber, formatPercentage, formatRelativeTime } from '@/lib/utils';
import { useMultiTenantAuth } from '@/providers/multi-tenant-auth-provider';

// Dados mockados para demonstração
const mockMetrics = {
  conversations: {
    total: 1247,
    active: 23,
    resolved: 1224,
    change: 12.5,
  },
  agents: {
    total: 8,
    active: 6,
    training: 1,
    offline: 1,
  },
  documents: {
    total: 156,
    processed: 142,
    processing: 8,
    failed: 6,
  },
  satisfaction: {
    score: 4.8,
    total: 892,
    change: 2.3,
  },
  responseTime: {
    average: 2.4,
    change: -8.7,
  },
  resolutionRate: {
    rate: 94.2,
    change: 1.8,
  },
};

const mockRecentActivity = [
  {
    id: '1',
    type: 'chat',
    title: 'Nova conversa iniciada',
    description: 'Cliente João Silva iniciou um chat',
    time: new Date(Date.now() - 5 * 60 * 1000),
    status: 'active',
  },
  {
    id: '2',
    type: 'document',
    title: 'Documento processado',
    description: 'Manual_Produto_v2.pdf foi processado com sucesso',
    time: new Date(Date.now() - 15 * 60 * 1000),
    status: 'success',
  },
  {
    id: '3',
    type: 'agent',
    title: 'Agente treinado',
    description: 'Agente de Vendas concluiu treinamento',
    time: new Date(Date.now() - 30 * 60 * 1000),
    status: 'success',
  },
  {
    id: '4',
    type: 'ticket',
    title: 'Ticket resolvido',
    description: 'Ticket #1234 foi marcado como resolvido',
    time: new Date(Date.now() - 45 * 60 * 1000),
    status: 'success',
  },
  {
    id: '5',
    type: 'error',
    title: 'Falha no processamento',
    description: 'Erro ao processar documento_grande.pdf',
    time: new Date(Date.now() - 60 * 60 * 1000),
    status: 'error',
  },
];

const mockTopAgents = [
  {
    id: '1',
    name: 'Agente de Vendas',
    conversations: 156,
    satisfaction: 4.9,
    responseTime: 1.8,
    status: 'active',
  },
  {
    id: '2',
    name: 'Suporte Técnico',
    conversations: 89,
    satisfaction: 4.7,
    responseTime: 2.1,
    status: 'active',
  },
  {
    id: '3',
    name: 'Atendimento Geral',
    conversations: 234,
    satisfaction: 4.6,
    responseTime: 2.8,
    status: 'training',
  },
];

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  change?: number;
  trend?: 'up' | 'down';
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'primary';
}

function MetricCard({ title, value, description, icon: Icon, change, trend, color = 'blue' }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    primary: 'bg-[#0072b9]',
  };

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${colorClasses[color]} bg-opacity-10`}>
          <Icon className={`h-4 w-4 ${colorClasses[color].replace('bg-', 'text-')}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {typeof value === 'number' ? formatNumber(value) : value}
        </div>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
        {change !== undefined && (
          <div className="flex items-center mt-2">
            {trend === 'up' ? (
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
            )}
            <span className={`text-xs font-medium ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatPercentage(Math.abs(change) / 100, 1)}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
              vs. mês anterior
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityIcon({ type }: { type: string }) {
  switch (type) {
    case 'chat':
      return <MessageSquare className="h-4 w-4" />;
    case 'document':
      return <FileText className="h-4 w-4" />;
    case 'agent':
      return <Bot className="h-4 w-4" />;
    case 'ticket':
      return <CheckCircle className="h-4 w-4" />;
    case 'error':
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'active':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'success':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'error':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'training':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
}

export default function DashboardPage() {
  const { user, tenant, permissions, isLoading: authLoading, isInitialized } = useMultiTenantAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [debugInfo, setDebugInfo] = useState({ cookies: '', localStorage: '' });

  useEffect(() => {
    // Debug: verificar dados do auth provider
    console.log('=== DADOS DO AUTH PROVIDER ===');
    console.log('User:', user);
    console.log('Tenant:', tenant);
    console.log('Auth Loading:', authLoading);
    console.log('Auth Initialized:', isInitialized);
    console.log('=============================');

    // Capturar informações de debug
    if (typeof window !== 'undefined') {
      setDebugInfo({
        cookies: document.cookie,
        localStorage: window.localStorage.getItem('nex_token') || 'Não encontrado'
      });
    }

    // Simular carregamento de dados
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // Atualizar horário a cada minuto
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => {
      clearTimeout(timer);
      clearInterval(timeInterval);
    };
  }, [user, tenant, authLoading, isInitialized]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Olá, {user?.firstName || user?.name?.split(' ')[0] || 'Usuário'}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {tenant ? `Bem-vindo ao ${tenant.name}` : 'Aqui está um resumo da sua plataforma hoje.'}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Relatórios
          </Button>
          <Link href="/dashboard/agentes/criar">
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Novo Agente
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Conversas Ativas"
          value={mockMetrics.conversations.active}
          description={`${mockMetrics.conversations.total} total`}
          icon={MessageSquare}
          change={mockMetrics.conversations.change}
          trend="up"
          color="blue"
        />
        <MetricCard
          title="Agentes Ativos"
          value={`${mockMetrics.agents.active}/${mockMetrics.agents.total}`}
          description="2 em treinamento"
          icon={Bot}
          color="green"
        />
        <MetricCard
          title="Documentos"
          value={mockMetrics.documents.processed}
          description={`${mockMetrics.documents.processing} processando`}
          icon={FileText}
          color="primary"
        />
        <MetricCard
          title="Satisfação"
          value={`${mockMetrics.satisfaction.score}/5.0`}
          description={`${mockMetrics.satisfaction.total} avaliações`}
          icon={TrendingUp}
          change={mockMetrics.satisfaction.change}
          trend="up"
          color="yellow"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <span>Tempo de Resposta</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {mockMetrics.responseTime.average}s
            </div>
            <div className="flex items-center mt-2">
              <ArrowDownRight className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs font-medium text-green-600">
                {formatPercentage(Math.abs(mockMetrics.responseTime.change) / 100, 1)}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                melhoria
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Taxa de Resolução</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatPercentage(mockMetrics.resolutionRate.rate / 100, 1)}
            </div>
            <div className="flex items-center mt-2">
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs font-medium text-green-600">
                {formatPercentage(mockMetrics.resolutionRate.change / 100, 1)}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                vs. mês anterior
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-[#0072b9]" />
              <span>Usuários Online</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              47
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              +12 desde ontem
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Top Agents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>
              Últimas atividades da sua plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${getStatusColor(activity.status)}`}>
                    <ActivityIcon type={activity.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {formatRelativeTime(activity.time)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Agents */}
        <Card>
          <CardHeader>
            <CardTitle>Melhores Agentes</CardTitle>
            <CardDescription>
              Performance dos seus agentes de IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTopAgents.map((agent, index) => (
                <div key={agent.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {agent.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {agent.conversations} conversas
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                      {agent.status === 'active' ? 'Ativo' : 'Treinando'}
                    </Badge>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {agent.satisfaction}/5.0
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {agent.responseTime}s resp.
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}