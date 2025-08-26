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
  Users,
  Building,
  Phone,
  Mail,
  MapPin,
  Star,
  Edit,
  Eye,
  MoreHorizontal,
  UserPlus,
  Download,
  Upload
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
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
    name: 'Carlos Mendes',
    email: 'carlos@corporacao.com.br',
    phone: '+55 11 77777-7777',
    company: 'Corporação ABC',
    position: 'Diretor de TI',
    location: 'São Paulo, SP',
    source: 'Indicação',
    status: 'customer',
    score: 95,
    createdAt: '2024-01-05T08:15:00Z',
    lastContact: '2024-01-16T11:20:00Z',
    assignedTo: 'Maria Santos',
    tags: ['enterprise', 'vip', 'customer'],
    notes: 'Cliente há 2 anos. Renovação em março.'
  },
  {
    id: 'contact-004',
    name: 'Fernanda Oliveira',
    email: 'fernanda@consultoria.com',
    phone: '+55 85 66666-6666',
    company: 'Consultoria Digital',
    position: 'Sócia',
    location: 'Fortaleza, CE',
    source: 'Evento',
    status: 'lead',
    score: 60,
    createdAt: '2024-01-14T16:45:00Z',
    lastContact: '2024-01-14T16:45:00Z',
    assignedTo: 'Pedro Lima',
    tags: ['consultoria', 'cold-lead'],
    notes: 'Conheceu no evento Tech Summit. Aguardando follow-up.'
  }
];

function getStatusColor(status: Contact['status']) {
  switch (status) {
    case 'lead':
      return 'default';
    case 'prospect':
      return 'warning';
    case 'customer':
      return 'success';
    case 'inactive':
      return 'secondary';
    default:
      return 'secondary';
  }
}

function getStatusLabel(status: Contact['status']) {
  switch (status) {
    case 'lead':
      return 'Lead';
    case 'prospect':
      return 'Prospect';
    case 'customer':
      return 'Cliente';
    case 'inactive':
      return 'Inativo';
    default:
      return status;
  }
}

function getScoreColor(score: number) {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

export default function ContactsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  const filteredContacts = mockContacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || contact.source === sourceFilter;
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  const stats = {
    total: mockContacts.length,
    leads: mockContacts.filter(c => c.status === 'lead').length,
    prospects: mockContacts.filter(c => c.status === 'prospect').length,
    customers: mockContacts.filter(c => c.status === 'customer').length,
    avgScore: Math.round(mockContacts.reduce((acc, c) => acc + c.score, 0) / mockContacts.length)
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contatos</h1>
          <p className="text-muted-foreground">
            Gerencie seus leads, prospects e clientes
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
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Contato
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Leads</p>
                <p className="text-2xl font-bold">{stats.leads}</p>
              </div>
              <UserPlus className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Prospects</p>
                <p className="text-2xl font-bold">{stats.prospects}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clientes</p>
                <p className="text-2xl font-bold">{stats.customers}</p>
              </div>
              <Building className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Score Médio</p>
                <p className="text-2xl font-bold">{stats.avgScore}</p>
              </div>
              <Star className="h-8 w-8 text-purple-600" />
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
                  placeholder="Buscar contatos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="prospect">Prospect</SelectItem>
                <SelectItem value="customer">Cliente</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Origem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Origens</SelectItem>
                <SelectItem value="Website">Website</SelectItem>
                <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                <SelectItem value="Indicação">Indicação</SelectItem>
                <SelectItem value="Evento">Evento</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Contatos */}
      <Card>
        <CardHeader>
          <CardTitle>Contatos ({filteredContacts.length})</CardTitle>
          <CardDescription>
            Lista de todos os contatos cadastrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredContacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{contact.name}</h3>
                      <Badge variant={getStatusColor(contact.status) as any}>
                        {getStatusLabel(contact.status)}
                      </Badge>
                      <span className={`text-sm font-medium ${getScoreColor(contact.score)}`}>
                        {contact.score}%
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {contact.company}
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {contact.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {contact.phone}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {contact.location}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {contact.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/crm/contacts/${contact.id}`}>
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