'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  Filter,
  Plus,
  DollarSign,
  TrendingUp,
  Calendar,
  User,
  Building,
  Target,
  Edit,
  Eye,
  MoreHorizontal,
  Download,
  Upload
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import Link from 'next/link';

interface Deal {
  id: string;
  title: string;
  company: string;
  contact: string;
  value: number;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  probability: number;
  expectedCloseDate: string;
  createdAt: string;
  lastActivity: string;
  assignedTo: string;
  source: string;
  tags: string[];
  notes: string;
  activities: number;
}

const mockDeals: Deal[] = [
  {
    id: 'deal-001',
    title: 'Implementação Sistema ERP',
    company: 'Tech Solutions Ltda',
    contact: 'João Silva',
    value: 150000,
    stage: 'proposal',
    probability: 75,
    expectedCloseDate: '2024-02-15T00:00:00Z',
    createdAt: '2024-01-10T10:00:00Z',
    lastActivity: '2024-01-16T14:30:00Z',
    assignedTo: 'Maria Santos',
    source: 'Website',
    tags: ['enterprise', 'erp', 'hot'],
    notes: 'Cliente interessado em solução completa. Proposta enviada.',
    activities: 12
  },
  {
    id: 'deal-002',
    title: 'Consultoria Digital',
    company: 'StartupX',
    contact: 'Ana Costa',
    value: 25000,
    stage: 'qualification',
    probability: 60,
    expectedCloseDate: '2024-02-28T00:00:00Z',
    createdAt: '2024-01-12T15:20:00Z',
    lastActivity: '2024-01-15T09:45:00Z',
    assignedTo: 'Pedro Lima',
    source: 'LinkedIn',
    tags: ['consultoria', 'startup', 'warm'],
    notes: 'Aguardando definição de escopo e orçamento.',
    activities: 8
  },
  {
    id: 'deal-003',
    title: 'Renovação Licenças',
    company: 'Corporação ABC',
    contact: 'Carlos Mendes',
    value: 80000,
    stage: 'negotiation',
    probability: 90,
    expectedCloseDate: '2024-03-01T00:00:00Z',
    createdAt: '2024-01-05T08:15:00Z',
    lastActivity: '2024-01-16T11:20:00Z',
    assignedTo: 'Maria Santos',
    source: 'Cliente Existente',
    tags: ['renovação', 'enterprise', 'vip'],
    notes: 'Cliente há 2 anos. Negociando desconto por volume.',
    activities: 15
  },
  {
    id: 'deal-004',
    title: 'Projeto Mobile App',
    company: 'Consultoria Digital',
    contact: 'Fernanda Oliveira',
    value: 45000,
    stage: 'prospecting',
    probability: 30,
    expectedCloseDate: '2024-03-15T00:00:00Z',
    createdAt: '2024-01-14T16:45:00Z',
    lastActivity: '2024-01-14T16:45:00Z',
    assignedTo: 'Pedro Lima',
    source: 'Evento',
    tags: ['mobile', 'app', 'cold'],
    notes: 'Primeiro contato. Aguardando reunião de descoberta.',
    activities: 2
  },
  {
    id: 'deal-005',
    title: 'Migração Cloud',
    company: 'Indústria XYZ',
    contact: 'Roberto Santos',
    value: 200000,
    stage: 'closed-won',
    probability: 100,
    expectedCloseDate: '2024-01-30T00:00:00Z',
    createdAt: '2023-12-01T10:00:00Z',
    lastActivity: '2024-01-30T16:00:00Z',
    assignedTo: 'Maria Santos',
    source: 'Indicação',
    tags: ['cloud', 'migration', 'won'],
    notes: 'Deal fechado! Projeto iniciado em fevereiro.',
    activities: 25
  }
];

function getStageColor(stage: Deal['stage']) {
  switch (stage) {
    case 'prospecting':
      return 'bg-gray-100 text-gray-800';
    case 'qualification':
      return 'bg-blue-100 text-blue-800';
    case 'proposal':
      return 'bg-yellow-100 text-yellow-800';
    case 'negotiation':
      return 'bg-orange-100 text-orange-800';
    case 'closed-won':
      return 'bg-green-100 text-green-800';
    case 'closed-lost':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getStageLabel(stage: Deal['stage']) {
  switch (stage) {
    case 'prospecting':
      return 'Prospecção';
    case 'qualification':
      return 'Qualificação';
    case 'proposal':
      return 'Proposta';
    case 'negotiation':
      return 'Negociação';
    case 'closed-won':
      return 'Fechado - Ganho';
    case 'closed-lost':
      return 'Fechado - Perdido';
    default:
      return stage;
  }
}

function getProbabilityColor(probability: number) {
  if (probability >= 80) return 'text-green-600';
  if (probability >= 60) return 'text-yellow-600';
  if (probability >= 40) return 'text-orange-600';
  return 'text-red-600';
}

export default function DealsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [assignedFilter, setAssignedFilter] = useState<string>('all');

  const filteredDeals = mockDeals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.contact.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === 'all' || deal.stage === stageFilter;
    const matchesAssigned = assignedFilter === 'all' || deal.assignedTo === assignedFilter;
    
    return matchesSearch && matchesStage && matchesAssigned;
  });

  const stats = {
    total: mockDeals.length,
    totalValue: mockDeals.reduce((acc, deal) => acc + deal.value, 0),
    wonValue: mockDeals.filter(d => d.stage === 'closed-won').reduce((acc, deal) => acc + deal.value, 0),
    avgDealSize: Math.round(mockDeals.reduce((acc, deal) => acc + deal.value, 0) / mockDeals.length),
    winRate: Math.round((mockDeals.filter(d => d.stage === 'closed-won').length / mockDeals.filter(d => d.stage === 'closed-won' || d.stage === 'closed-lost').length) * 100) || 0
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deals</h1>
          <p className="text-muted-foreground">
            Gerencie suas oportunidades de vendas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Deal
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Deals</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Ganho</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.wonValue)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.avgDealSize)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-[#0072b9]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Conversão</p>
                <p className="text-2xl font-bold">{stats.winRate}%</p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar deals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Estágio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Estágios</SelectItem>
                <SelectItem value="prospecting">Prospecção</SelectItem>
                <SelectItem value="qualification">Qualificação</SelectItem>
                <SelectItem value="proposal">Proposta</SelectItem>
                <SelectItem value="negotiation">Negociação</SelectItem>
                <SelectItem value="closed-won">Fechado - Ganho</SelectItem>
                <SelectItem value="closed-lost">Fechado - Perdido</SelectItem>
              </SelectContent>
            </Select>
            <Select value={assignedFilter} onValueChange={setAssignedFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Responsável" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Maria Santos">Maria Santos</SelectItem>
                <SelectItem value="Pedro Lima">Pedro Lima</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Deals */}
      <Card>
        <CardHeader>
          <CardTitle>Deals ({filteredDeals.length})</CardTitle>
          <CardDescription>
            Lista de todas as oportunidades de vendas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredDeals.map((deal) => (
              <div key={deal.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{deal.title}</h3>
                      <Badge className={getStageColor(deal.stage)}>
                        {getStageLabel(deal.stage)}
                      </Badge>
                      <span className={`text-sm font-medium ${getProbabilityColor(deal.probability)}`}>
                        {deal.probability}%
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {deal.company}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {deal.contact}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {formatCurrency(deal.value)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(deal.expectedCloseDate)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {deal.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/crm/deals/${deal.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}