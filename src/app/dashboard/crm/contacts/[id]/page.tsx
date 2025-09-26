'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useContacts } from '@/hooks/useContacts';
import { useContactActivities } from '@/hooks/useContactActivities';
import { Contact } from '@/services/contact-service';
import { ActivityForm } from '@/components/crm/activity-form';
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
  X,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import Link from 'next/link';

interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'deal' | 'task' | 'follow_up' | 'proposal' | 'demo';
  title: string;
  description: string;
  date: string;
  user: string;
}


function getStatusColor(status: string) {
  switch (status) {
    case 'active':
      return 'default';
    case 'inactive':
      return 'secondary';
    case 'blocked':
      return 'destructive';
    case 'archived':
      return 'outline';
    default:
      return 'secondary';
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'active':
      return 'Ativo';
    case 'inactive':
      return 'Inativo';
    case 'blocked':
      return 'Bloqueado';
    case 'archived':
      return 'Arquivado';
    default:
      return status;
  }
}

function getTypeColor(type: string) {
  switch (type) {
    case 'lead':
      return 'secondary';
    case 'prospect':
      return 'warning';
    case 'customer':
      return 'success';
    case 'partner':
      return 'default';
    case 'vendor':
      return 'outline';
    case 'other':
      return 'secondary';
    default:
      return 'secondary';
  }
}

function getTypeLabel(type: string) {
  switch (type) {
    case 'lead':
      return 'Lead';
    case 'prospect':
      return 'Prospect';
    case 'customer':
      return 'Cliente';
    case 'partner':
      return 'Parceiro';
    case 'vendor':
      return 'Fornecedor';
    case 'other':
      return 'Outro';
    default:
      return type;
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
    case 'task':
      return <Activity className="h-4 w-4" />;
    case 'follow_up':
      return <RefreshCw className="h-4 w-4" />;
    case 'proposal':
      return <FileText className="h-4 w-4" />;
    case 'demo':
      return <MessageSquare className="h-4 w-4" />;
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
      return 'bg-[#e6f2f9] text-[#0072b9]';
    case 'note':
      return 'bg-gray-100 text-gray-600';
    case 'deal':
      return 'bg-yellow-100 text-yellow-600';
    case 'task':
      return 'bg-purple-100 text-purple-600';
    case 'follow_up':
      return 'bg-orange-100 text-orange-600';
    case 'proposal':
      return 'bg-indigo-100 text-indigo-600';
    case 'demo':
      return 'bg-pink-100 text-pink-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

export default function ContactDetailPage({ params }: { params: { id: string } }) {
  const [isEditing, setIsEditing] = useState(false);
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { fetchContact, updateContact } = useContacts();
  const { activities, stats: activityStats, loading: activitiesLoading, createActivity } = useContactActivities({ 
    contactId: params.id 
  });

  useEffect(() => {
    const loadContact = async () => {
      try {
        setLoading(true);
        setError(null);
        const contactData = await fetchContact(params.id);
        if (contactData) {
          setContact(contactData);
        } else {
          setError('Contato não encontrado');
        }
      } catch (err) {
        setError('Erro ao carregar contato');
        console.error('Error loading contact:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadContact();
    }
  }, [params.id, fetchContact]);

  const handleSave = async () => {
    if (!contact) return;
    
    try {
      setSaving(true);
      const updatedContact = await updateContact(contact.id, {
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone,
        mobile: contact.mobile,
        company: contact.company,
        position: contact.position,
        leadSource: contact.leadSource,
        type: contact.type,
        status: contact.status,
        leadScore: contact.leadScore,
        tags: contact.tags,
        notes: contact.notes,
        address: contact.address
      });
      
      if (updatedContact) {
        setContact(updatedContact);
        setIsEditing(false);
      }
    } catch (err) {
      setError('Erro ao salvar contato');
      console.error('Error saving contact:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Carregando contato...</span>
        </div>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erro ao carregar contato</h3>
          <p className="text-muted-foreground mb-4">{error || 'Contato não encontrado'}</p>
          <Link href="/dashboard/crm/contacts">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Contatos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold tracking-tight">
              {contact.firstName} {contact.lastName}
            </h1>
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
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar'}
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
                    <Label htmlFor="firstName">Nome</Label>
                    <Input 
                      id="firstName" 
                      value={contact.firstName} 
                      onChange={(e) => setContact({...contact, firstName: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Sobrenome</Label>
                    <Input 
                      id="lastName" 
                      value={contact.lastName} 
                      onChange={(e) => setContact({...contact, lastName: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={contact.email} 
                      onChange={(e) => setContact({...contact, email: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone Fixo</Label>
                    <Input 
                      id="phone" 
                      value={contact.phone || ''} 
                      onChange={(e) => setContact({...contact, phone: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile">Celular</Label>
                    <Input 
                      id="mobile" 
                      value={contact.mobile || ''} 
                      onChange={(e) => setContact({...contact, mobile: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Empresa</Label>
                    <Input 
                      id="company" 
                      value={contact.company || ''} 
                      onChange={(e) => setContact({...contact, company: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Cargo</Label>
                    <Input 
                      id="position" 
                      value={contact.position || ''} 
                      onChange={(e) => setContact({...contact, position: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="leadSource">Origem</Label>
                    <Input 
                      id="leadSource" 
                      value={contact.leadSource || ''} 
                      onChange={(e) => setContact({...contact, leadSource: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="leadScore">Score</Label>
                    <Input 
                      id="leadScore" 
                      type="number" 
                      value={contact.leadScore || 0} 
                      onChange={(e) => setContact({...contact, leadScore: parseInt(e.target.value) || 0})} 
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea 
                      id="notes" 
                      value={contact.notes || ''} 
                      onChange={(e) => setContact({...contact, notes: e.target.value})} 
                      rows={3} 
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{contact.email}</span>
                  </div>
                  {contact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>Tel: {contact.phone}</span>
                    </div>
                  )}
                  {contact.mobile && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>Cel: {contact.mobile}</span>
                    </div>
                  )}
                  {contact.company && (
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span>{contact.company}</span>
                    </div>
                  )}
                  {contact.position && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{contact.position}</span>
                    </div>
                  )}
                  {contact.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{contact.address.city}, {contact.address.state}</span>
                    </div>
                  )}
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

          {/* Seção de Atividades */}
          <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Histórico de Atividades</CardTitle>
                      <CardDescription>
                        Todas as interações com este contato
                      </CardDescription>
                    </div>
                    <ActivityForm
                      contactId={params.id}
                      userId="current-user" // TODO: Get from auth context
                      onCreateActivity={async (activityData) => {
                        await createActivity(activityData);
                      }}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {activitiesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin" />
                      <span className="ml-2">Carregando atividades...</span>
                    </div>
                  ) : activities.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma atividade registrada ainda.</p>
                      <p className="text-sm">Adicione uma nova atividade para começar o histórico.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activities.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg">
                          <div className={`p-2 rounded-full ${getActivityColor(activity.type as Activity['type'])}`}>
                            {getActivityIcon(activity.type as Activity['type'])}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{activity.title}</h4>
                              <span className="text-sm text-muted-foreground">
                                {formatDate(activity.activityDate)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {activity.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Por {activity.userId}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status e Score */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Tipo</p>
                  <Badge variant={getTypeColor(contact.type) as any}>
                    {getTypeLabel(contact.type)}
                  </Badge>
                </div>
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
                    <span className="font-medium">{contact.leadScore || 0}%</span>
                  </div>
                </div>
                {contact.assignedTo && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Responsável</p>
                    <p className="text-sm">
                      {contact.assignedTo.firstName} {contact.assignedTo.lastName}
                    </p>
                  </div>
                )}
                {contact.leadSource && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Origem</p>
                    <p className="text-sm">{contact.leadSource}</p>
                  </div>
                )}
                {contact.lastContactAt && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Último Contato</p>
                    <p className="text-sm">{formatDate(contact.lastContactAt)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {contact.tags && contact.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {contact.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}