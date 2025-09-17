'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Filter,
  Plus,
  FolderOpen,
  FileText,
  Users,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Settings,
  Archive,
  Download,
  Upload,
  Tag,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Loader2,
  Pause,
  Play,
  EyeOff,
  Globe,
  Lock,
  Building,
  RefreshCw
} from 'lucide-react';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import Link from 'next/link';
import collectionService, { Collection } from '@/services/collection-service';
import { toast } from 'sonner';

// Usando a interface Collection do serviço


function getStatusIcon(status: string) {
  switch (status) {
    case 'synced':
      return CheckCircle;
    case 'syncing':
      return Loader2;
    case 'error':
      return AlertCircle;
    case 'pending':
      return Clock;
    default:
      return Clock;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'synced':
      return 'text-green-600';
    case 'syncing':
      return 'text-blue-600';
    case 'error':
      return 'text-red-600';
    case 'pending':
      return 'text-yellow-600';
    default:
      return 'text-gray-600';
  }
}

function getVisibilityBadge(visibility: string) {
  switch (visibility) {
    case 'public':
      return <Badge variant="outline" className="text-green-600 border-green-600">Público</Badge>;
    case 'private':
      return <Badge variant="outline" className="text-red-600 border-red-600">Privado</Badge>;
    case 'internal':
      return <Badge variant="outline" className="text-blue-600 border-blue-600">Interno</Badge>;
    default:
      return <Badge variant="outline">Desconhecido</Badge>;
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedVisibility, setSelectedVisibility] = useState('all');
  const [collectionStats, setCollectionStats] = useState({
    totalCollections: 0,
    activeCollections: 0,
    totalDocuments: 0,
    totalSize: 0,
    collectionsByStatus: {},
  });

  // Carregar coleções e estatísticas da API
  useEffect(() => {
    loadCollections();
    loadCollectionStats();
  }, []);

  const loadCollectionStats = async () => {
    try {
      const response = await collectionService.getCollectionStats();
      if (response.success && response.data) {
        setCollectionStats(response.data as any);
      } else {
        toast.error('Erro ao carregar estatísticas das coleções');
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas das coleções:', error);
      toast.error('Erro ao carregar estatísticas das coleções');
    }
  };

  const loadCollections = async () => {
    try {
      setLoading(true);
      const response = await collectionService.getCollections();
      if (response.success && response.data) {
        setCollections(response.data.collections.map(collection => ({
          ...collection,
          slug: collection.name.toLowerCase().replace(/\s+/g, '-'),
          agentCount: (collection as any).agentCount || 0,
          documentCount: collection.documentCount || 0,
          totalSize: (collection as any).totalSize || 0,
          syncStatus: collection.status === 'active' ? 'synced' : 'pending' as any,
          lastSyncAt: collection.updatedAt,
          visibility: collection.settings?.isPublic ? 'public' : 'internal' as any,
          tags: collection.metadata?.tags || [],
          createdBy: {
            id: collection.userId,
            name: 'Usuário'
          },
          updatedBy: {
            id: collection.userId,
            name: 'Usuário'
          }
        })));
      } else {
        toast.error('Erro ao carregar coleções');
      }
    } catch (error) {
      console.error('Erro ao carregar coleções:', error);
      toast.error('Erro ao carregar coleções');
    } finally {
      setLoading(false);
    }
  };

  const filteredCollections = collections.filter(collection => {
    const matchesSearch = collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (collection.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         ((collection as any).tags || []).some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'active' && collection.status === 'active') ||
                         (selectedStatus === 'inactive' && collection.status === 'inactive') ||
                         ((collection as any).syncStatus === selectedStatus);
    const matchesVisibility = selectedVisibility === 'all' || 
                             (selectedVisibility === 'public' && collection.settings?.isPublic) ||
        (selectedVisibility === 'internal' && !collection.settings?.isPublic);
    return matchesSearch && matchesStatus && matchesVisibility;
  });

  const stats = {
    total: collectionStats.totalCollections,
    active: collectionStats.activeCollections,
    totalDocuments: collectionStats.totalDocuments,
    totalAgents: collections.reduce((acc, c) => acc + ((c as any).agentCount || 0), 0), // agentCount ainda não vem da API de stats
    totalSize: collectionStats.totalSize
  };



  const handleToggleStatus = async (collectionId: string) => {
    try {
      const collection = collections.find(c => c.id === collectionId);
      if (!collection) return;

      const newStatus = collection.status === 'active' ? 'inactive' : 'active';
      const response = await collectionService.updateCollection(collectionId, {
        status: newStatus
      });

      if (response.success) {
        toast.success(`Coleção ${newStatus === 'active' ? 'ativada' : 'desativada'} com sucesso!`);
        loadCollections(); // Recarregar a lista
      } else {
        toast.error('Erro ao alterar status da coleção');
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status da coleção');
    }
  };

  const handleDelete = async (collectionId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta coleção? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const response = await collectionService.deleteCollection(collectionId);
      if (response.success) {
        toast.success('Coleção excluída com sucesso!');
        loadCollections(); // Recarregar a lista
      } else {
        toast.error('Erro ao excluir coleção');
      }
    } catch (error) {
      console.error('Erro ao excluir coleção:', error);
      toast.error('Erro ao excluir coleção');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coleção de Conhecimento</h1>
          <p className="text-muted-foreground">
            Organize e gerencie suas bases de conhecimento em coleções temáticas
          </p>
        </div>
        <Link href="/dashboard/knowledge/collections/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Coleção
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coleção</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} ativas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold">{collectionStats.totalDocuments}</div>
              <p className="text-xs text-muted-foreground">
                Distribuídos nas coleções
              </p>
            </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agentes Vinculados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold">{collections.reduce((acc, c) => acc + ((c as any).agentCount || 0), 0)}</div>
              <p className="text-xs text-muted-foreground">
                Usando as coleções
              </p>
            </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tamanho Total</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold">{formatBytes(collectionStats.totalSize)}</div>
              <p className="text-xs text-muted-foreground">
                Espaço utilizado
              </p>
            </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Atualização</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Hoje</div>
            <p className="text-xs text-muted-foreground">
              Coleções sincronizadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar coleções..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="flex h-10 w-full sm:w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="all">Todos os status</option>
          <option value="active">Ativas</option>
          <option value="inactive">Inativas</option>
          <option value="synced">Sincronizadas</option>
          <option value="syncing">Sincronizando</option>
          <option value="error">Com erro</option>
          <option value="pending">Pendentes</option>
        </select>
        <select
          value={selectedVisibility}
          onChange={(e) => setSelectedVisibility(e.target.value)}
          className="flex h-10 w-full sm:w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="all">Todas visibilidades</option>
          <option value="public">Públicas</option>
          <option value="internal">Internas</option>
          <option value="private">Privadas</option>
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando coleções...</span>
        </div>
      )}

      {/* Collections Grid */}
      {!loading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCollections.map((collection) => {
          const StatusIcon = getStatusIcon((collection as any).syncStatus);
          return (
            <Card key={collection.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{collection.name}</CardTitle>
                      {collection.status !== 'active' && (
                        <Badge variant="secondary">Inativa</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getVisibilityBadge(collection.settings?.isPublic ? 'public' : 'internal')}
                      <div className={`flex items-center gap-1 text-xs ${getStatusColor((collection as any).syncStatus || 'synced')}`}>
                        <StatusIcon className={`h-3 w-3 ${((collection as any).syncStatus || 'synced') === 'syncing' ? 'animate-spin' : ''}`} />
                        {((collection as any).syncStatus || 'synced') === 'synced' && 'Sincronizada'}
                        {((collection as any).syncStatus || 'synced') === 'syncing' && 'Sincronizando'}
                        {((collection as any).syncStatus || 'synced') === 'error' && 'Erro'}
                        {((collection as any).syncStatus || 'synced') === 'pending' && 'Pendente'}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/knowledge/collections/${collection.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/knowledge/collections/edit/${collection.id}`}>
                          <div className="flex items-center">
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="h-4 w-4 mr-2" />
                        Configurações
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleToggleStatus(collection.id)}>
                        {collection.status === 'active' ? (
                          <>
                            <Pause className="h-4 w-4 mr-2" />
                            Desativar
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Ativar
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDelete(collection.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription className="line-clamp-2">
                  {collection.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{collection.documentCount || 0}</span>
                      <span className="text-muted-foreground">docs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{(collection as any).agentCount || 0}</span>
                      <span className="text-muted-foreground">agentes</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {((collection as any).tags || []).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {((collection as any).tags || []).slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {((collection as any).tags || []).length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{((collection as any).tags || []).length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Tamanho:</span>
                      <span>{formatBytes(collection.totalSize || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Atualizada:</span>
                      <span>{formatRelativeTime(collection.updatedAt)}</span>
                    </div>
                    {(collection as any).lastSyncAt && (
                      <div className="flex justify-between">
                        <span>Última sync:</span>
                        <span>{formatRelativeTime((collection as any).lastSyncAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        </div>
      )}

      {/* Empty State */}
      {filteredCollections.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma coleção encontrada</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedStatus !== 'all' || selectedVisibility !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando sua primeira coleção de conhecimento'
              }
            </p>
            {!searchTerm && selectedStatus === 'all' && selectedVisibility === 'all' && (
              <Link href="/dashboard/knowledge/collections/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Coleção
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}