'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Edit,
  Phone,
  Mail,
  MapPin,
  Building,
  Calendar,
  User,
  MessageSquare,
  FileText,
  DollarSign,
  Activity,
  Star,
  Save,
  X
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
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
  avatar?: string;
}

interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'deal';
  title: string;
  description: string;
  date: string;
  user: string;
}

interface Deal {
  id: string;
  title: string;
  value: number;
  stage: string;
  probability: number;
  expectedCloseDate: string;
}

// Mock data - em um app real, isso viria de uma API
const mockContact: Contact = {
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
  notes: 'Interessado em solução enterprise. Orçamento aprovado. Cliente muito engajado e com potencial para grandes projetos.'
};

const mockActivities: Activity[] = [
  {
    id: 'act-001',
    type: 'call',
    title: 'Ligação de Follow-up',
    description: 'Discussão sobre requisitos técnicos e cronograma do projeto.',
    date: '2024-01-16T14:30:00Z',
    user: 'Maria Santos'
  },
  {
    id: 'act-002',
    type: 'email',
    title: 'Proposta Enviada',
    description: 'Enviada proposta comercial detalhada com escopo completo.',
    date: '2024-01-15T10:15:00Z',
    user: 'Maria Santos'
  },
  {
    id: 'act-003',
    type: 'meeting',
    title: 'Reunião de Descoberta',
    description: 'Reunião inicial para entender necessidades e dores do cliente.',
    date: '2024-01-12T16:00:00Z',
    user: 'Maria Santos'
  },
  {
    id: 'act-004',
    type: 'note',
    title: 'Anotação',
    description: 'Cliente demonstrou interesse em expandir para outras filiais.',
    date: '2024-01-11T09:30:00Z',
    user: 'Pedro Lima'
  }
];

const mockDeals: Deal[] = [
  {
    id: 'deal-001',
    title: 'Implementação Sistema ERP',
    value: 150000,
    stage: 'Proposta',
    probability: 75,
    expectedCloseDate: '2024-02-15T00:00:00Z'
  },
  {
    id: 'deal-002',
    title: 'Consultoria Técnica',
    value: 25000,
    stage: 'Qualificação',
    probability: 60,
    expectedCloseDate: '2024-03-01T00:00:00Z'
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

function getActivityIcon(type: Activity['type']) {
  switch (type) {
    case 'call':
      return <Phone className="h-4 w-4" />;
    case 'email':
      return <Mail className="h-4 w-4" />;
    case 'meeting':
      return <Calendar className="h-4 w-4" />;
    case 'note':
      return <FileText className="h-4 w-4" />;
    case 'deal':
      return <DollarSign className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
}

function getActivityColor(type: Activity['type']) {
  switch (type) {
    case 'call':
      return 'bg-blue-100 text-blue-600';
    case 'email':
      return 'bg-green-100 text-green-600';
    case 'meeting':
      return 'bg-purple-100 text-purple-600';
    case 'note':
      return 'bg-gray-100 text-gray-600';
    case 'deal':
      return 'bg-yellow-100 text-yellow-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

export default function ContactDetailPage({ params }: { params: { id: string } }) {
  const [isEditing, setIsEditing] = useState(false);
  const [contact, setContact] = useState(mockContact);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/crm/contacts">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{contact.name}</h1>
            <p className="text-muted-foreground">
              {contact.position} na {contact.company}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={() => setIsEditing(false)}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" value={contact.name} onChange={(e) => setContact({...contact, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={contact.email} onChange={(e) => setContact({...contact, email: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" value={contact.phone} onChange={(e) => setContact({...contact, phone: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Empresa</Label>
                    <Input id="company" value={contact.company} onChange={(e) => setContact({...contact, company: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Cargo</Label>
                    <Input id="position" value={contact.position} onChange={(e) => setContact({...contact, position: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Localização</Label>
                    <Input id="location" value={contact.location} onChange={(e) => setContact({...contact, location: e.target.value})} />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea id="notes" value={contact.notes} onChange={(e) => setContact({...contact, notes: e.target.value})} rows={3} />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{contact.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{contact.company}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{contact.position}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{contact.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Criado em {formatDate(contact.createdAt)}</span>
                  </div>
                  {contact.notes && (
                    <div className="md:col-span-2">
                      <h4 className="font-medium mb-2">Observações</h4>
                      <p className="text-sm text-muted-foreground">{contact.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Abas de Conteúdo */}
          <Tabs defaultValue="activities" className="w-full">
            <TabsList>
              <TabsTrigger value="activities">Atividades</TabsTrigger>
              <TabsTrigger value="deals">Deals</TabsTrigger>
            </TabsList>
            
            <TabsContent value="activities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Atividades</CardTitle>
                  <CardDescription>
                    Todas as interações com este contato
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{activity.title}</h4>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(activity.date)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {activity.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Por {activity.user}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="deals" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Deals Relacionados</CardTitle>
                  <CardDescription>
                    Oportunidades de vendas com este contato
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockDeals.map((deal) => (
                      <div key={deal.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{deal.title}</h4>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span>{formatCurrency(deal.value)}</span>
                            <span>•</span>
                            <span>{deal.stage}</span>
                            <span>•</span>
                            <span>{deal.probability}% probabilidade</span>
                            <span>•</span>
                            <span>Fecha em {formatDate(deal.expectedCloseDate)}</span>
                          </div>
                        </div>
                        <Link href={`/dashboard/crm/deals/${deal.id}`}>
                          <Button variant="ghost" size="sm">
                            Ver Deal
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status e Score */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Status</p>
                  <Badge variant={getStatusColor(contact.status) as any}>
                    {getStatusLabel(contact.status)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Score</p>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">{contact.score}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Responsável</p>
                  <p className="text-sm">{contact.assignedTo}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Origem</p>
                  <p className="text-sm">{contact.source}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Último Contato</p>
                  <p className="text-sm">{formatDate(contact.lastContact)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {contact.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                <Phone className="h-4 w-4 mr-2" />
                Ligar
              </Button>
              <Button className="w-full" variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Enviar Email
              </Button>
              <Button className="w-full" variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Adicionar Nota
              </Button>
              <Button className="w-full" variant="outline">
                <DollarSign className="h-4 w-4 mr-2" />
                Criar Deal
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}