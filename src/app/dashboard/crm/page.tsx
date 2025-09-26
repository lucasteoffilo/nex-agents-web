'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useContacts } from '@/hooks/useContacts';
import {
  Users,
  Target,
  TrendingUp,
  DollarSign,
  Phone,
  Mail,
  Calendar,
  ArrowRight,
  CheckCircle,
  Clock,
  Star,
  Building,
  Plus,
  BarChart3,
  Activity,
  UserPlus,
  FileText
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function CRMDashboard() {
  // Use the contacts hook for stats
  const { stats, loading } = useContacts({
    autoFetch: true
  });

  // Mock data for deals (will be replaced with real data later)
  const dealStats = {
    total: 24,
    totalValue: 1250000,
    avgValue: 52083,
    wonDeals: 8,
    avgProbability: 72,
    thisMonth: 5,
    thisMonthValue: 350000
  };

  const recentActivity = [
    {
      id: 1,
      type: 'contact',
      action: 'Novo lead adicionado',
      name: 'João Silva',
      company: 'Tech Solutions',
      time: '2 horas atrás',
      icon: Users
    },
    {
      id: 2,
      type: 'deal',
      action: 'Deal ganho',
      name: 'Implementação Enterprise',
      company: 'StartupX',
      value: 150000,
      time: '4 horas atrás',
      icon: CheckCircle
    },
    {
      id: 3,
      type: 'contact',
      action: 'Contato atualizado',
      name: 'Ana Costa',
      company: 'E-commerce Plus',
      time: '6 horas atrás',
      icon: Phone
    },
    {
      id: 4,
      type: 'deal',
      action: 'Nova oportunidade',
      name: 'Plano SaaS Premium',
      company: 'Consultoria BH',
      value: 75000,
      time: '1 dia atrás',
      icon: Target
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CRM Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral das suas vendas e relacionamentos com clientes
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Relatórios
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Ação Rápida
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link href="/dashboard/crm/contacts">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Gerenciar Contatos</p>
                  <p className="text-2xl font-bold">{stats?.total || 0}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/dashboard/crm/deals">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Oportunidades</p>
                  <p className="text-2xl font-bold">{dealStats.total}</p>
                </div>
                <Target className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">{formatCurrency(dealStats.totalValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Conversão</p>
                <p className="text-2xl font-bold">{Math.round((dealStats.wonDeals / dealStats.total) * 100)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contacts Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Visão Geral dos Contatos
            </CardTitle>
            <CardDescription>
              Distribuição por tipo e status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{stats?.byType?.lead || 0}</p>
                  <p className="text-sm text-muted-foreground">Leads</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{stats?.byType?.prospect || 0}</p>
                  <p className="text-sm text-muted-foreground">Prospects</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{stats?.byType?.customer || 0}</p>
                  <p className="text-sm text-muted-foreground">Clientes</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-950 rounded-lg">
                  <p className="text-2xl font-bold text-gray-600">{stats?.byType?.partner || 0}</p>
                  <p className="text-sm text-muted-foreground">Parceiros</p>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span>Score médio</span>
                  <span className="font-semibold">{stats?.avgLeadScore?.toFixed(0) || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Atribuídos</span>
                  <span className="font-semibold">{stats?.assigned || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Não atribuídos</span>
                  <span className="font-semibold">{stats?.unassigned || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deals Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Visão Geral das Oportunidades
            </CardTitle>
            <CardDescription>
              Pipeline de vendas e performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{dealStats.wonDeals}</p>
                  <p className="text-sm text-muted-foreground">Ganhos</p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{dealStats.total - dealStats.wonDeals}</p>
                  <p className="text-sm text-muted-foreground">Em andamento</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{dealStats.thisMonth}</p>
                  <p className="text-sm text-muted-foreground">Este mês</p>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{dealStats.avgProbability}%</p>
                  <p className="text-sm text-muted-foreground">Prob. média</p>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span>Valor total</span>
                  <span className="font-semibold">{formatCurrency(dealStats.totalValue)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Valor médio</span>
                  <span className="font-semibold">{formatCurrency(dealStats.avgValue)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Este mês</span>
                  <span className="font-semibold">{formatCurrency(dealStats.thisMonthValue)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Atividade Recente
          </CardTitle>
          <CardDescription>
            Últimas ações no CRM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => {
              const IconComponent = activity.icon;
              return (
                <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="p-2 bg-muted rounded-lg">
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.name} • {activity.company}
                      {activity.value && ` • ${formatCurrency(activity.value)}`}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {activity.time}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Ações Rápidas
          </CardTitle>
          <CardDescription>
            Acesse rapidamente as principais funcionalidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/dashboard/crm/contacts">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <UserPlus className="h-6 w-6" />
                <span>Adicionar Contato</span>
              </Button>
            </Link>
            
            <Link href="/dashboard/crm/deals">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Target className="h-6 w-6" />
                <span>Nova Oportunidade</span>
              </Button>
            </Link>
            
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
              <FileText className="h-6 w-6" />
              <span>Relatórios</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}