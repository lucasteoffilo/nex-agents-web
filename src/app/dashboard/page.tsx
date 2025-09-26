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
import { useAgents } from '@/hooks/use-agents';
import { useTenants } from '@/hooks/use-tenants';
import { useChats } from '@/hooks/use-chats';

// Dados reais serão calculados dinamicamente

// Dados mockados removidos - agora usando dados reais dos hooks

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
  
  // Hooks para dados reais
  const { agents, stats: agentStats, loading: agentsLoading } = useAgents({ autoFetch: true });
  const { tenants, loading: tenantsLoading } = useTenants();
  const { chats, loading: chatsLoading } = useChats();
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [debugInfo, setDebugInfo] = useState({ cookies: '', localStorage: '' });

  // Calcular métricas reais
  const realMetrics = {
    conversations: {
      total: chats?.length || 0,
      active: chats?.filter(chat => chat.status === 'active').length || 0,
      resolved: chats?.filter(chat => chat.status === 'resolved').length || 0,
    },
    agents: {
      total: agents?.length || 0,
      active: agents?.filter(agent => agent.status === 'active').length || 0,
      training: agents?.filter(agent => agent.status === 'training').length || 0,
      offline: agents?.filter(agent => agent.status === 'inactive').length || 0,
    },
    customers: {
      total: tenants?.length || 0,
      active: tenants?.filter(tenant => (tenant as any).status === 'active' || tenant.isActive).length || 0,
      inactive: tenants?.filter(tenant => (tenant as any).status !== 'active' && !tenant.isActive).length || 0,
    },
    satisfaction: {
      score: agentStats?.avgSatisfaction || 0,
      total: agentStats?.totalConversations || 0,
    },
    responseTime: {
      average: agentStats?.avgResponseTime || 0,
    },
    resolutionRate: {
      rate: agentStats?.resolutionRate || 0,
    },
  };

  useEffect(() => {
    // Debug: verificar dados do auth provider
    // console.log('=== DADOS DO AUTH PROVIDER ===');
    // console.log('User:', user);
    // console.log('Tenant:', tenant);
    // console.log('Auth Loading:', authLoading);
    // console.log('Auth Initialized:', isInitialized);
    // console.log('=============================');

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
          value={realMetrics.conversations.active}
          description={`${realMetrics.conversations.total} total`}
          icon={MessageSquare}
          color="blue"
        />
        <MetricCard
          title="Agentes Ativos"
          value={`${realMetrics.agents.active}/${realMetrics.agents.total}`}
          description={`${realMetrics.agents.training} em treinamento`}
          icon={Bot}
          color="green"
        />
        <MetricCard
          title="Clientes"
          value={realMetrics.customers.active}
          description={`${realMetrics.customers.total} total`}
          icon={Users}
          color="primary"
        />
        <MetricCard
          title="Satisfação"
          value={`${realMetrics.satisfaction.score.toFixed(1)}/5.0`}
          description={`${realMetrics.satisfaction.total} conversas`}
          icon={TrendingUp}
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
              {realMetrics.responseTime.average.toFixed(1)}s
            </div>
            <div className="flex items-center mt-2">
              <ArrowDownRight className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs font-medium text-green-600">
                Tempo médio
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
              {realMetrics.resolutionRate.rate.toFixed(1)}%
            </div>
            <div className="flex items-center mt-2">
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs font-medium text-green-600">
                Taxa atual
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
              <MessageSquare className="h-5 w-5 text-green-500" />
              <span>Conversas Resolvidas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {realMetrics.conversations.resolved}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {realMetrics.conversations.total > 0 ? formatPercentage(realMetrics.conversations.resolved / realMetrics.conversations.total) : '0'}% do total
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
              {agentsLoading || tenantsLoading || chatsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Carregando atividades...</p>
                </div>
              ) : (
                <>
                  {agents?.slice(0, 3).map((agent) => (
                    <div key={agent.id} className="flex items-start space-x-3">
                      <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Agente {agent.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Status: {agent.status === 'active' ? 'Ativo' : agent.status === 'training' ? 'Treinando' : 'Inativo'}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {formatRelativeTime(agent.updatedAt)}
                        </p>
                      </div>
                      <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                        {agent.status === 'active' ? 'Ativo' : agent.status === 'training' ? 'Treinando' : 'Inativo'}
                      </Badge>
                    </div>
                  ))}
                  
                  {tenants?.slice(0, 2).map((tenant) => (
                    <div key={tenant.id} className="flex items-start space-x-3">
                      <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                        <Users className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Cliente {tenant.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {tenant.slug}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {formatRelativeTime(tenant.updatedAt)}
                        </p>
                      </div>
                      <Badge variant={(tenant as any).status === 'active' || tenant.isActive ? 'default' : 'secondary'}>
                        {(tenant as any).status === 'active' || tenant.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  ))}
                  
                  {agents?.length === 0 && tenants?.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">Nenhuma atividade recente</p>
                    </div>
                  )}
                </>
              )}
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
              {agentsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Carregando agentes...</p>
                </div>
              ) : agents && agents.length > 0 ? (
                agents.slice(0, 5).map((agent, index) => (
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
                          {agent.type} • {agent.metrics?.totalConversations || 0} conversas
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                        {agent.status === 'active' ? 'Ativo' : agent.status === 'training' ? 'Treinando' : 'Inativo'}
                      </Badge>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {agent.metrics?.avgSatisfaction?.toFixed(1) || '0.0'}/5.0
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {agent.metrics?.avgResponseTime?.toFixed(1) || '0.0'}s resp.
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">Nenhum agente encontrado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}