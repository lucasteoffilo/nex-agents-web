'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  Target,
  DollarSign,
  Clock,
  Star,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

// Mock data for charts
const conversationData = [
  { month: 'Jan', conversations: 1200, resolved: 980, satisfaction: 4.2 },
  { month: 'Fev', conversations: 1350, resolved: 1100, satisfaction: 4.3 },
  { month: 'Mar', conversations: 1180, resolved: 950, satisfaction: 4.1 },
  { month: 'Abr', conversations: 1420, resolved: 1200, satisfaction: 4.4 },
  { month: 'Mai', conversations: 1580, resolved: 1350, satisfaction: 4.5 },
  { month: 'Jun', conversations: 1650, resolved: 1420, satisfaction: 4.6 }
];

const revenueData = [
  { month: 'Jan', revenue: 45000, deals: 12, avgDeal: 3750 },
  { month: 'Fev', revenue: 52000, deals: 15, avgDeal: 3467 },
  { month: 'Mar', revenue: 48000, deals: 11, avgDeal: 4364 },
  { month: 'Abr', revenue: 61000, deals: 18, avgDeal: 3389 },
  { month: 'Mai', revenue: 73000, deals: 22, avgDeal: 3318 },
  { month: 'Jun', revenue: 85000, deals: 25, avgDeal: 3400 }
];

const channelData = [
  { name: 'Chat', value: 45, color: '#3b82f6' },
  { name: 'WhatsApp', value: 30, color: '#10b981' },
  { name: 'Email', value: 15, color: '#f59e0b' },
  { name: 'Telefone', value: 10, color: '#ef4444' }
];

const agentPerformanceData = [
  { agent: 'Maria Santos', conversations: 245, satisfaction: 4.8, responseTime: 1.2 },
  { agent: 'João Silva', conversations: 220, satisfaction: 4.6, responseTime: 1.5 },
  { agent: 'Ana Costa', conversations: 198, satisfaction: 4.7, responseTime: 1.1 },
  { agent: 'Pedro Lima', conversations: 185, satisfaction: 4.5, responseTime: 1.8 },
  { agent: 'Carlos Oliveira', conversations: 167, satisfaction: 4.4, responseTime: 2.1 }
];

const hourlyData = [
  { hour: '00h', conversations: 12 },
  { hour: '02h', conversations: 8 },
  { hour: '04h', conversations: 5 },
  { hour: '06h', conversations: 15 },
  { hour: '08h', conversations: 45 },
  { hour: '10h', conversations: 78 },
  { hour: '12h', conversations: 95 },
  { hour: '14h', conversations: 120 },
  { hour: '16h', conversations: 110 },
  { hour: '18h', conversations: 85 },
  { hour: '20h', conversations: 65 },
  { hour: '22h', conversations: 35 }
];

const topicsData = [
  { topic: 'Suporte Técnico', count: 145, trend: 'up' },
  { topic: 'Faturamento', count: 98, trend: 'down' },
  { topic: 'Produto', count: 87, trend: 'up' },
  { topic: 'Cancelamento', count: 65, trend: 'stable' },
  { topic: 'Integração', count: 54, trend: 'up' }
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('6m');
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const totalConversations = conversationData.reduce((acc, item) => acc + item.conversations, 0);
  const totalRevenue = revenueData.reduce((acc, item) => acc + item.revenue, 0);
  const avgSatisfaction = conversationData.reduce((acc, item) => acc + item.satisfaction, 0) / conversationData.length;
  const totalDeals = revenueData.reduce((acc, item) => acc + item.deals, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Acompanhe métricas e performance em tempo real
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="3m">Últimos 3 meses</option>
            <option value="6m">Últimos 6 meses</option>
            <option value="1y">Último ano</option>
          </select>
          
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Conversas</p>
                <p className="text-2xl font-bold">{formatNumber(totalConversations)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">+12.5%</span>
                </div>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">+18.2%</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Satisfação Média</p>
                <p className="text-2xl font-bold">{avgSatisfaction.toFixed(1)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">+0.3</span>
                </div>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Deals Fechados</p>
                <p className="text-2xl font-bold">{totalDeals}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">+25.0%</span>
                </div>
              </div>
              <Target className="h-8 w-8 text-[#0072b9]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversations Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Conversas ao Longo do Tempo
            </CardTitle>
            <CardDescription>
              Volume de conversas e taxa de resolução
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={conversationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="conversations" 
                  stackId="1" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.6}
                  name="Conversas"
                />
                <Area 
                  type="monotone" 
                  dataKey="resolved" 
                  stackId="2" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.6}
                  name="Resolvidas"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Receita e Deals
            </CardTitle>
            <CardDescription>
              Performance de vendas mensal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => {
                  if (name === 'revenue') return [formatCurrency(value as number), 'Receita'];
                  return [value, name === 'deals' ? 'Deals' : 'Ticket Médio'];
                }} />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" name="Receita" />
                <Bar dataKey="deals" fill="#3b82f6" name="Deals" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Channel Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Distribuição por Canal
            </CardTitle>
            <CardDescription>
              Volume de conversas por canal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Porcentagem']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Hourly Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Atividade por Hora
            </CardTitle>
            <CardDescription>
              Picos de conversas durante o dia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="conversations" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Principais Tópicos
            </CardTitle>
            <CardDescription>
              Assuntos mais discutidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topicsData.map((topic, index) => (
                <div key={topic.topic} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{topic.topic}</p>
                      <p className="text-sm text-muted-foreground">{topic.count} conversas</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {topic.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                    {topic.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                    {topic.trend === 'stable' && <div className="w-4 h-4" />}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Performance dos Agentes
          </CardTitle>
          <CardDescription>
            Métricas individuais de performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agentPerformanceData.map((agent, index) => (
              <div key={agent.agent} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                    {agent.agent.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium">{agent.agent}</p>
                    <p className="text-sm text-muted-foreground">
                      {agent.conversations} conversas
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Satisfação</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">{agent.satisfaction}</span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Tempo Resposta</p>
                    <p className="font-medium">{agent.responseTime}s</p>
                  </div>
                  
                  <Badge variant={index < 2 ? 'success' : index < 4 ? 'warning' : 'secondary'}>
                    #{index + 1}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}