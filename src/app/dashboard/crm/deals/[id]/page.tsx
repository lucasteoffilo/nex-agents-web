'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft,
  Edit,
  DollarSign,
  Calendar,
  User,
  Building,
  Target,
  TrendingUp,
  Clock,
  FileText,
  Phone,
  Mail,
  MessageSquare,
  Save,
  X,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import Link from 'next/link';

interface Deal {
  id: string;
  title: string;
  company: string;
  contact: string;
  contactEmail: string;
  contactPhone: string;
  value: number;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  probability: number;
  expectedCloseDate: string;
  createdAt: string;
  lastActivity: string;
  assignedTo: string;
  source: string;
  tags: string[];
  description: string;
  notes: string;
}

interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'proposal' | 'contract';
  title: string;
  description: string;
  date: string;
  user: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  assignedTo: string;
}

// Mock data - em um app real, isso viria de uma API
const mockDeal: Deal = {
  id: 'deal-001',
  title: 'Implementação Sistema ERP',
  company: 'Tech Solutions Ltda',
  contact: 'João Silva',
  contactEmail: 'joao.silva@empresa.com',
  contactPhone: '+55 11 99999-9999',
  value: 150000,
  stage: 'proposal',
  probability: 75,
  expectedCloseDate: '2024-02-15T00:00:00Z',
  createdAt: '2024-01-10T10:00:00Z',
  lastActivity: '2024-01-16T14:30:00Z',
  assignedTo: 'Maria Santos',
  source: 'Website',
  tags: ['enterprise', 'erp', 'hot'],
  description: 'Implementação completa de sistema ERP para gestão empresarial, incluindo módulos financeiro, estoque, vendas e RH.',
  notes: 'Cliente muito interessado. Proposta enviada com desconto especial. Aguardando aprovação da diretoria.'
};

const mockActivities: Activity[] = [
  {
    id: 'act-001',
    type: 'proposal',
    title: 'Proposta Enviada',
    description: 'Proposta comercial detalhada enviada com desconto de 15% para fechamento até final do mês.',
    date: '2024-01-16T14:30:00Z',
    user: 'Maria Santos'
  },
  {
    id: 'act-002',
    type: 'meeting',
    title: 'Reunião de Apresentação',
    description: 'Apresentação da solução ERP para equipe técnica e diretoria.',
    date: '2024-01-15T10:00:00Z',
    user: 'Maria Santos'
  },
  {
    id: 'act-003',
    type: 'call',
    title: 'Ligação de Follow-up',
    description: 'Discussão sobre cronograma de implementação e treinamento da equipe.',
    date: '2024-01-14T16:30:00Z',
    user: 'Pedro Lima'
  },
  {
    id: 'act-004',
    type: 'email',
    title: 'Documentação Técnica',
    description: 'Enviada documentação técnica detalhada e casos de uso.',
    date: '2024-01-12T09:15:00Z',
    user: 'Maria Santos'
  }
];

const mockTasks: Task[] = [
  {
    id: 'task-001',
    title: 'Agendar reunião com diretoria',
    description: 'Marcar apresentação final para aprovação do projeto',
    dueDate: '2024-01-20T00:00:00Z',
    completed: false,
    assignedTo: 'Maria Santos'
  },
  {
    id: 'task-002',
    title: 'Preparar contrato',
    description: 'Elaborar minuta do contrato com termos negociados',
    dueDate: '2024-01-22T00:00:00Z',
    completed: false,
    assignedTo: 'Jurídico'
  },
  {
    id: 'task-003',
    title: 'Follow-up proposta',
    description: 'Ligar para verificar status da análise da proposta',
    dueDate: '2024-01-18T00:00:00Z',
    completed: true,
    assignedTo: 'Maria Santos'
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
    case 'proposal':
      return <FileText className="h-4 w-4" />;
    case 'contract':
      return <FileText className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
}

function getActivityColor(type: Activity['type']) {
  switch (type) {
    case 'call':
      return 'bg-blue-100 text-blue-600';
    case 'email':
      return 'bg-green-100 text-green-600';
    case 'meeting':
      return 'bg-[#e6f2f9] text-[#0072b9]';
    case 'note':
      return 'bg-gray-100 text-gray-600';
    case 'proposal':
      return 'bg-yellow-100 text-yellow-600';
    case 'contract':
      return 'bg-orange-100 text-orange-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

function getProbabilityColor(probability: number) {
  if (probability >= 80) return 'text-green-600';
  if (probability >= 60) return 'text-yellow-600';
  if (probability >= 40) return 'text-orange-600';
  return 'text-red-600';
}

export default function DealDetailPage({ params }: { params: { id: string } }) {
  const [isEditing, setIsEditing] = useState(false);
  const [deal, setDeal] = useState(mockDeal);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/crm/deals">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{deal.title}</h1>
            <p className="text-muted-foreground">
              {deal.company} • {formatCurrency(deal.value)}
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
            <>
              <Button variant="outline">
                <XCircle className="h-4 w-4 mr-2" />
                Marcar como Perdido
              </Button>
              <Button variant="outline">
                <CheckCircle className="h-4 w-4 mr-2" />
                Marcar como Ganho
              </Button>
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações do Deal */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Deal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input id="title" value={deal.title} onChange={(e) => setDeal({...deal, title: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="value">Valor</Label>
                    <Input id="value" type="number" value={deal.value} onChange={(e) => setDeal({...deal, value: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stage">Estágio</Label>
                    <Select value={deal.stage} onValueChange={(value) => setDeal({...deal, stage: value as Deal['stage']})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prospecting">Prospecção</SelectItem>
                        <SelectItem value="qualification">Qualificação</SelectItem>
                        <SelectItem value="proposal">Proposta</SelectItem>
                        <SelectItem value="negotiation">Negociação</SelectItem>
                        <SelectItem value="closed-won">Fechado - Ganho</SelectItem>
                        <SelectItem value="closed-lost">Fechado - Perdido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="probability">Probabilidade (%)</Label>
                    <Input id="probability" type="number" min="0" max="100" value={deal.probability} onChange={(e) => setDeal({...deal, probability: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expectedCloseDate">Data Prevista de Fechamento</Label>
                    <Input id="expectedCloseDate" type="date" value={deal.expectedCloseDate.split('T')[0]} onChange={(e) => setDeal({...deal, expectedCloseDate: e.target.value + 'T00:00:00Z'})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assignedTo">Responsável</Label>
                    <Input id="assignedTo" value={deal.assignedTo} onChange={(e) => setDeal({...deal, assignedTo: e.target.value})} />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea id="description" value={deal.description} onChange={(e) => setDeal({...deal, description: e.target.value})} rows={3} />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea id="notes" value={deal.notes} onChange={(e) => setDeal({...deal, notes: e.target.value})} rows={3} />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{formatCurrency(deal.value)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className={`font-medium ${getProbabilityColor(deal.probability)}`}>
                        {deal.probability}% probabilidade
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Fecha em {formatDate(deal.expectedCloseDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{deal.assignedTo}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span>{deal.company}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Criado em {formatDate(deal.createdAt)}</span>
                    </div>
                  </div>
                  
                  {deal.description && (
                    <div>
                      <h4 className="font-medium mb-2">Descrição</h4>
                      <p className="text-sm text-muted-foreground">{deal.description}</p>
                    </div>
                  )}
                  
                  {deal.notes && (
                    <div>
                      <h4 className="font-medium mb-2">Observações</h4>
                      <p className="text-sm text-muted-foreground">{deal.notes}</p>
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
              <TabsTrigger value="tasks">Tarefas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="activities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Atividades</CardTitle>
                  <CardDescription>
                    Todas as atividades relacionadas a este deal
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
            
            <TabsContent value="tasks" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tarefas</CardTitle>
                  <CardDescription>
                    Tarefas pendentes e concluídas para este deal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockTasks.map((task) => (
                      <div key={task.id} className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className={`p-2 rounded-full ${task.completed ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                          {task.completed ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {task.title}
                            </h4>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(task.dueDate)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {task.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Responsável: {task.assignedTo}
                          </p>
                        </div>
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
          {/* Status e Informações */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Estágio</p>
                  <Badge className={getStageColor(deal.stage)}>
                    {getStageLabel(deal.stage)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Contato Principal</p>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{deal.contact}</p>
                    <p className="text-xs text-muted-foreground">{deal.contactEmail}</p>
                    <p className="text-xs text-muted-foreground">{deal.contactPhone}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Origem</p>
                  <p className="text-sm">{deal.source}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Última Atividade</p>
                  <p className="text-sm">{formatDate(deal.lastActivity)}</p>
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
                {deal.tags.map((tag) => (
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
                Ligar para Contato
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
                <Calendar className="h-4 w-4 mr-2" />
                Agendar Reunião
              </Button>
              <Button className="w-full" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Gerar Proposta
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}