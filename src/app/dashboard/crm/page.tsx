'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Filter,
  Plus,
  Users,
  Building,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  TrendingUp,
  Target,
  Clock,
  User,
  MapPin,
  Star,
  Edit,
  Eye,
  MoreHorizontal,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Pause,
  X
} from 'lucide-react';
import { formatDate, formatCurrency, formatRelativeTime } from '@/lib/utils';
import Link from 'next/link';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  location: string;
  source: string;
  status: 'lead' | 'prospect' | 'customer' | 'inactive';
  score: number;
  createdAt: string;
  lastContact: string;
  assignedTo: string;
  tags: string[];
  notes: string;
}

interface Deal {
  id: string;
  title: string;
  contact: string;
  company: string;
  value: number;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number;
  expectedCloseDate: string;
  createdAt: string;
  assignedTo: string;
  source: string;
  lastActivity: string;
}

const mockContacts: Contact[] = [
  {
    id: 'contact-001',
    name: 'João Silva',
    email: 'joao.silva@empresa.com',
    phone: '+55 11 99999-9999',
    company: 'Tech Solutions Ltda',
    position: 'CTO',
    location: 'São Paulo, SP',
    source: 'Website',
    status: 'prospect',
    score: 85,
    createdAt: '2024-01-10T10:00:00Z',
    lastContact: '2024-01-15T14:30:00Z',
    assignedTo: 'Maria Santos',
    tags: ['enterprise', 'tech', 'hot-lead'],
    notes: 'Interessado em solução enterprise. Orçamento aprovado.'
  },
  {
    id: 'contact-002',
    name: 'Ana Costa',
    email: 'ana@startup.com',
    phone: '+55 21 88888-8888',
    company: 'StartupX',
    position: 'CEO',
    location: 'Rio de Janeiro, RJ',
    source: 'LinkedIn',
    status: 'lead',
    score: 72,
    createdAt: '2024-01-12T15:20:00Z',
    lastContact: '2024-01-14T09:45:00Z',
    assignedTo: 'Pedro Lima',
    tags: ['startup', 'saas', 'warm-lead'],
    notes: 'Precisa de mais informações sobre pricing.'
  },
  {
    id: 'contact-003',
    name: 'Carlos Oliveira',
    email: 'carlos@loja.com',
    phone: '+55 11 77777-7777',
    company: 'E-commerce Plus',
    position: 'Diretor de TI',
    location: 'São Paulo, SP',
    source: 'Indicação',
    status: 'customer',
    score: 95,
    createdAt: '2024-01-05T08:30:00Z',
    lastContact: '2024-01-15T11:20:00Z',
    assignedTo: 'Ana Silva',
    tags: ['customer', 'e-commerce', 'vip'],
    notes: 'Cliente desde 2023. Muito satisfeito com o serviço.'
  },
  {
    id: 'contact-004',
    name: 'Mariana Santos',
    email: 'mariana@consultoria.com',
    phone: '+55 31 66666-6666',
    company: 'Consultoria BH',
    position: 'Sócia',
    location: 'Belo Horizonte, MG',
    source: 'Google Ads',
    status: 'inactive',
    score: 45,
    createdAt: '2024-01-08T12:15:00Z',
    lastContact: '2024-01-10T16:30:00Z',
    assignedTo: 'João Costa',
    tags: ['consultoria', 'cold-lead'],
    notes: 'Não demonstrou interesse. Tentar contato em 3 meses.'
  }
];

const mockDeals: Deal[] = [
  {
    id: 'deal-001',
    title: 'Implementação Enterprise - Tech Solutions',
    contact: 'João Silva',
    company: 'Tech Solutions Ltda',
    value: 150000,
    stage: 'negotiation',
    probability: 80,
    expectedCloseDate: '2024-02-15T00:00:00Z',
    createdAt: '2024-01-10T10:00:00Z',
    assignedTo: 'Maria Santos',
    source: 'Website',
    lastActivity: '2024-01-15T14:30:00Z'
  },
  {
    id: 'deal-002',
    title: 'Plano SaaS - StartupX',
    contact: 'Ana Costa',
    company: 'StartupX',
    value: 25000,
    stage: 'qualification',
    probability: 60,
    expectedCloseDate: '2024-02-28T00:00:00Z',
    createdAt: '2024-01-12T15:20:00Z',
    assignedTo: 'Pedro Lima',
    source: 'LinkedIn',
    lastActivity: '2024-01-14T09:45:00Z'
  },
  {
    id: 'deal-003',
    title: 'Upgrade Premium - E-commerce Plus',
    contact: 'Carlos Oliveira',
    company: 'E-commerce Plus',
    value: 75000,
    stage: 'proposal',
    probability: 90,
    expectedCloseDate: '2024-01-30T00:00:00Z',
    createdAt: '2024-01-05T08:30:00Z',
    assignedTo: 'Ana Silva',
    source: 'Indicação',
    lastActivity: '2024-01-15T11:20:00Z'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'lead': return 'secondary';
    case 'prospect': return 'warning';
    case 'customer': return 'success';
    case 'inactive': return 'default';
    default: return 'default';
  }
};

const getStageColor = (stage: string) => {
  switch (stage) {
    case 'prospecting': return 'secondary';
    case 'qualification': return 'warning';
    case 'proposal': return 'default';
    case 'negotiation': return 'warning';
    case 'closed_won': return 'success';
    case 'closed_lost': return 'error';
    default: return 'default';
  }
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

export default function CRMPage() {
  const [activeTab, setActiveTab] = useState<'contacts' | 'deals'>('contacts');
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [deals, setDeals] = useState<Deal[]>(mockDeals);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedStage, setSelectedStage] = useState('all');

  const contactStatuses = ['all', 'lead', 'prospect', 'customer', 'inactive'];
  const dealStages = ['all', 'prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || contact.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = selectedStage === 'all' || deal.stage === selectedStage;
    return matchesSearch && matchesStage;
  });

  const contactStats = {
    total: contacts.length,
    leads: contacts.filter(c => c.status === 'lead').length,
    prospects: contacts.filter(c => c.status === 'prospect').length,
    customers: contacts.filter(c => c.status === 'customer').length,
    avgScore: contacts.reduce((acc, c) => acc + c.score, 0) / contacts.length || 0
  };

  const dealStats = {
    total: deals.length,
    totalValue: deals.reduce((acc, d) => acc + d.value, 0),
    avgValue: deals.reduce((acc, d) => acc + d.value, 0) / deals.length || 0,
    wonDeals: deals.filter(d => d.stage === 'closed_won').length,
    avgProbability: deals.filter(d => !d.stage.includes('closed')).reduce((acc, d) => acc + d.probability, 0) / deals.filter(d => !d.stage.includes('closed')).length || 0
  };

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
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Lead
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('contacts')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'contacts'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="h-4 w-4 mr-2 inline" />
          Contatos
        </button>
        <button
          onClick={() => setActiveTab('deals')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'deals'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Target className="h-4 w-4 mr-2 inline" />
          Oportunidades
        </button>
      </div>

      {/* Stats Cards */}
      {activeTab === 'contacts' ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Contatos</p>
                  <p className="text-2xl font-bold">{contactStats.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Leads</p>
                  <p className="text-2xl font-bold text-gray-600">{contactStats.leads}</p>
                </div>
                <Target className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Prospects</p>
                  <p className="text-2xl font-bold text-yellow-600">{contactStats.prospects}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Clientes</p>
                  <p className="text-2xl font-bold text-green-600">{contactStats.customers}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Score Médio</p>
                  <p className="text-2xl font-bold">{contactStats.avgScore.toFixed(0)}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Deals</p>
                  <p className="text-2xl font-bold">{dealStats.total}</p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                  <p className="text-2xl font-bold">{formatCurrency(dealStats.totalValue)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Valor Médio</p>
                  <p className="text-2xl font-bold">{formatCurrency(dealStats.avgValue)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-[#0072b9]" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Deals Ganhos</p>
                  <p className="text-2xl font-bold text-green-600">{dealStats.wonDeals}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Prob. Média</p>
                  <p className="text-2xl font-bold">{dealStats.avgProbability.toFixed(0)}%</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={activeTab === 'contacts' ? 'Buscar contatos...' : 'Buscar oportunidades...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {activeTab === 'contacts' ? (
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {contactStatuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'Todos os status' :
                   status === 'lead' ? 'Lead' :
                   status === 'prospect' ? 'Prospect' :
                   status === 'customer' ? 'Cliente' :
                   status === 'inactive' ? 'Inativo' : status}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {dealStages.map(stage => (
                <option key={stage} value={stage}>
                  {stage === 'all' ? 'Todos os estágios' :
                   stage === 'prospecting' ? 'Prospecção' :
                   stage === 'qualification' ? 'Qualificação' :
                   stage === 'proposal' ? 'Proposta' :
                   stage === 'negotiation' ? 'Negociação' :
                   stage === 'closed_won' ? 'Ganho' :
                   stage === 'closed_lost' ? 'Perdido' : stage}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'contacts' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredContacts.map((contact) => (
            <Card key={contact.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold truncate">
                        {contact.name}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {contact.position} • {contact.company}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(contact.status) as any} className="text-xs">
                      {contact.status === 'lead' && 'Lead'}
                      {contact.status === 'prospect' && 'Prospect'}
                      {contact.status === 'customer' && 'Cliente'}
                      {contact.status === 'inactive' && 'Inativo'}
                    </Badge>
                    <div className={`text-sm font-semibold ${getScoreColor(contact.score)}`}>
                      {contact.score}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{contact.location}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {contact.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="text-xs text-muted-foreground">
                  <p>Último contato: {formatRelativeTime(contact.lastContact)}</p>
                  <p>Responsável: {contact.assignedTo}</p>
                </div>
                
                <div className="flex items-center gap-2 pt-2">
                  <Link href={`/dashboard/crm/contacts/${contact.id}`} className="flex-1">
                    <Button size="sm" variant="outline" className="w-full">
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                  </Link>
                  <Button size="sm" variant="outline">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDeals.map((deal) => (
            <Card key={deal.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-2 bg-muted rounded-lg">
                      <Target className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg truncate">{deal.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {deal.id}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{deal.contact}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          <span>{deal.company}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(deal.expectedCloseDate)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>Responsável: {deal.assignedTo}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-3">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(deal.value)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {deal.probability}% de probabilidade
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={getStageColor(deal.stage) as any} className="text-xs">
                          {deal.stage === 'prospecting' && 'Prospecção'}
                          {deal.stage === 'qualification' && 'Qualificação'}
                          {deal.stage === 'proposal' && 'Proposta'}
                          {deal.stage === 'negotiation' && 'Negociação'}
                          {deal.stage === 'closed_won' && 'Ganho'}
                          {deal.stage === 'closed_lost' && 'Perdido'}
                        </Badge>
                        
                        <Badge variant="outline" className="text-xs">
                          {deal.source}
                        </Badge>
                        
                        <div className="text-xs text-muted-foreground ml-auto">
                          Última atividade: {formatRelativeTime(deal.lastActivity)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Link href={`/dashboard/crm/deals/${deal.id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                    </Link>
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
          ))}
        </div>
      )}

      {/* Empty State */}
      {((activeTab === 'contacts' && filteredContacts.length === 0) || 
        (activeTab === 'deals' && filteredDeals.length === 0)) && (
        <Card>
          <CardContent className="p-12 text-center">
            {activeTab === 'contacts' ? (
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            ) : (
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            )}
            <h3 className="text-lg font-medium mb-2">
              {activeTab === 'contacts' ? 'Nenhum contato encontrado' : 'Nenhuma oportunidade encontrada'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || (activeTab === 'contacts' ? selectedStatus !== 'all' : selectedStage !== 'all')
                ? 'Tente ajustar os filtros de busca'
                : activeTab === 'contacts' 
                  ? 'Comece adicionando seus primeiros contatos'
                  : 'Comece criando suas primeiras oportunidades'
              }
            </p>
            {!searchTerm && 
             (activeTab === 'contacts' ? selectedStatus === 'all' : selectedStage === 'all') && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {activeTab === 'contacts' ? 'Adicionar Contato' : 'Criar Oportunidade'}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}