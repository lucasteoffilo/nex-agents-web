'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useContacts } from '@/hooks/useContacts';
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
  Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import Link from 'next/link';

// Helper functions
const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'default';
    case 'inactive': return 'secondary';
    case 'blocked': return 'destructive';
    case 'archived': return 'outline';
    default: return 'default';
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'lead': return 'secondary';
    case 'prospect': return 'warning';
    case 'customer': return 'success';
    case 'partner': return 'default';
    case 'vendor': return 'default';
    case 'other': return 'default';
    default: return 'default';
  }
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

export default function ContactsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // Use the contacts hook
  const {
    contacts,
    total,
    page,
    limit,
    totalPages,
    loading,
    error,
    stats,
    setFilters,
    setSearchTerm: setSearchTermHook,
    setPage,
    refresh
  } = useContacts({
    initialFilters: {
      status: selectedStatus === 'all' ? undefined : selectedStatus as any,
      type: selectedType === 'all' ? undefined : selectedType as any
    }
  });

  const contactStatuses = ['all', 'active', 'inactive', 'blocked', 'archived'];
  const contactTypes = ['all', 'lead', 'prospect', 'customer', 'partner', 'vendor', 'other'];

  // Filter contacts based on search term (client-side filtering for display)
  const filteredContacts = contacts.filter(contact => {
    const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
    const company = contact.company?.toLowerCase() || '';
    const email = contact.email.toLowerCase();
    
    return fullName.includes(searchTerm.toLowerCase()) ||
           company.includes(searchTerm.toLowerCase()) ||
           email.includes(searchTerm.toLowerCase());
  });

  // Pagination logic
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  // Handle filter changes
  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setFilters({
      status: status === 'all' ? undefined : status as any
    });
    setPage(1); // Reset to first page
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setFilters({
      type: type === 'all' ? undefined : type as any
    });
    setPage(1); // Reset to first page
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setSearchTermHook(term);
    setPage(1); // Reset to first page
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contatos</h1>
          <p className="text-muted-foreground">
            Gerencie seus leads, prospects e clientes
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Link href="/dashboard/crm/contacts/novo">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Contato
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Contatos</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
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
                <p className="text-2xl font-bold text-gray-600">{stats?.byType?.lead || 0}</p>
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
                <p className="text-2xl font-bold text-yellow-600">{stats?.byType?.prospect || 0}</p>
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
                <p className="text-2xl font-bold text-green-600">{stats?.byType?.customer || 0}</p>
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
                <p className="text-2xl font-bold">{stats?.avgLeadScore?.toFixed(0) || 0}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar contatos..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {contactStatuses.map(status => (
                <SelectItem key={status} value={status}>
                  {status === 'all' ? 'Todos os status' :
                   status === 'active' ? 'Ativo' :
                   status === 'inactive' ? 'Inativo' :
                   status === 'blocked' ? 'Bloqueado' :
                   status === 'archived' ? 'Arquivado' : status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedType} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              {contactTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type === 'all' ? 'Todos os tipos' :
                   type === 'lead' ? 'Lead' :
                   type === 'prospect' ? 'Prospect' :
                   type === 'customer' ? 'Cliente' :
                   type === 'partner' ? 'Parceiro' :
                   type === 'vendor' ? 'Fornecedor' :
                   type === 'other' ? 'Outro' : type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Carregando contatos...</span>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Erro ao carregar contatos</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={refresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </div>
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum contato encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Tente ajustar os filtros de busca' : 'Comece adicionando seu primeiro contato'}
            </p>
            <Link href="/dashboard/crm/contacts/novo">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Contato
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Contatos ({filteredContacts.length})</CardTitle>
              <CardDescription>
                Lista de todos os contatos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredContacts.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{contact.firstName} {contact.lastName}</h3>
                          <Badge variant={getTypeColor(contact.type) as any}>
                            {contact.type === 'lead' && 'Lead'}
                            {contact.type === 'prospect' && 'Prospect'}
                            {contact.type === 'customer' && 'Cliente'}
                            {contact.type === 'partner' && 'Parceiro'}
                            {contact.type === 'vendor' && 'Fornecedor'}
                            {contact.type === 'other' && 'Outro'}
                          </Badge>
                          {contact.leadScore && (
                            <span className={`text-sm font-medium ${getScoreColor(contact.leadScore)}`}>
                              {contact.leadScore}
                            </span>
                          )}
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
                          {contact.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              Tel: {contact.phone}
                            </div>
                          )}
                          {contact.mobile && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              Cel: {contact.mobile}
                            </div>
                          )}
                          {contact.address && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {contact.address.city}, {contact.address.state}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {contact.tags && contact.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {contact.tags && contact.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{contact.tags.length - 3}
                            </Badge>
                          )}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredContacts.length)} de {filteredContacts.length} contatos
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(page - 1, 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(page + 1, totalPages))}
                  disabled={page === totalPages}
                >
                  Próximo
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}