'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import collectionService from '@/services/collection-service';
import agentService from '@/services/agent-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  Search,
  Filter,
  Plus,
  FileText,
  Users,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Settings,
  Download,
  Upload,
  Tag,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Loader2,
  Bot,
  Activity,
  BarChart3,
  RefreshCw,
  Archive,
  FolderOpen,
  Link as LinkIcon,
  Unlink
} from 'lucide-react';
import { formatDate, formatRelativeTime, formatBytes } from '@/lib/utils';
import Link from 'next/link';
import { DocumentUpload } from '@/components/knowledge/document-upload';
import { CollectionSettings } from '@/components/knowledge/collection-settings';
import { LinkAgentDialog } from '@/components/knowledge/link-agent-dialog';

/* ---------- Tipos locais ---------- */
interface Document {
  id: string;
  title: string;
  description: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  language: string;
  category: string;
  tags: string[];
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  version: number;
  status: 'draft' | 'published' | 'archived';
  viewCount: number;
  downloadCount: number;
}

interface Agent {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'training';
  conversations: number;
  successRate: number;
  lastUsed: string;
  knowledgeBase?: {
    selectedCollections?: string[];
    // outros campos
  };
}

interface CollectionDetails {
  id: string;
  name: string;
  description: string;
  slug: string;
  documentCount: number;
  agentCount: number;
  tags: string[];
  isActive: boolean;
  visibility: 'public' | 'private' | 'restricted';
  createdBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  updatedBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  lastSyncAt?: string;
  syncStatus: 'synced' | 'syncing' | 'error' | 'pending';
  metadata: {
    totalSize: number;
    avgDocumentSize: number;
    languages: string[];
    categories: string[];
  };
  documents: Document[];
  agents: Agent[];
}

/* ---------- Funções de transformação (deixe acima do componente) ---------- */
function transformServiceDocument(doc: any): Document {
  return {
    id: doc.id,
    title: doc.title || 'Sem título',
    description: doc.description || '',
    fileName: doc.fileName || 'arquivo',
    fileSize: doc.fileSize || 0,
    mimeType: doc.mimeType || 'application/octet-stream',
    language: doc.language || 'pt',
    category: doc.category || 'geral',
    tags: doc.tags || [],
    author: {
      id: doc.author?.id || 'unknown',
      name: doc.author?.name || 'Desconhecido',
      avatar: doc.author?.avatar || undefined,
    },
    createdAt: doc.createdAt || new Date().toISOString(),
    updatedAt: doc.updatedAt || new Date().toISOString(),
    version: doc.version || 1,
    status: doc.status || 'draft',
    viewCount: doc.viewCount || 0,
    downloadCount: doc.downloadCount || 0,
  };
}

function transformServiceAgent(agent: any): Agent {
  return {
    id: agent.id,
    name: agent.name || 'Agente sem nome',
    type: agent.type || 'assistant',
    status: agent.status || 'inactive',
    conversations: agent.conversations || 0,
    successRate: agent.successRate || 0,
    lastUsed: agent.lastUsed || new Date().toISOString(),
    knowledgeBase: agent.knowledgeBase || {},
  };
}

/* ---------- Helpers UI ---------- */
const getVisibilityBadge = (visibility: string) => {
  switch (visibility) {
    case 'public':
      return <Badge variant="secondary">Público</Badge>;
    case 'private':
      return <Badge variant="outline">Privado</Badge>;
    case 'restricted':
      return <Badge variant="destructive">Restrito</Badge>;
    default:
      return null;
  }
};

const getStatusColor = (status: string) => {
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
};

const StatusIcon = ({ className }: { className?: string }) => {
  return <CheckCircle className={className} />;
};

const getFileIcon = (mimeType: string) => {
  if ((mimeType || '').includes('pdf')) return '📄';
  if ((mimeType || '').includes('image')) return '🖼️';
  if ((mimeType || '').includes('video')) return '🎥';
  if ((mimeType || '').includes('audio')) return '🎵';
  if ((mimeType || '').includes('text')) return '📝';
  if ((mimeType || '').includes('spreadsheet') || (mimeType || '').includes('excel')) return '📊';
  if ((mimeType || '').includes('presentation')) return '📽️';
  return '📄';
};

/* ---------- Componente ---------- */
export default function CollectionDetailsPage() {
  const params = useParams();
  const collectionId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collection, setCollection] = useState<CollectionDetails | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('documents');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDocumentDialogOpen, setIsAddDocumentDialogOpen] = useState(false);
  const [isLinkAgentDialogOpen, setIsLinkAgentDialogOpen] = useState(false);

  // Filtros de busca (agora `agents` já contém só os vinculados)
  const filteredDocuments = documents.filter(doc =>
    (doc.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.tags || []).some(tag => (tag || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredAgents = agents.filter(agent =>
    (agent.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (agent.type || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Carregar dados da collection
  useEffect(() => {
    const loadCollectionData = async () => {
      if (!collectionId) return;
      try {
        setLoading(true);
        setError(null);

        const collectionData = await collectionService.getCollection(collectionId);
        const documentsResponse = await collectionService.getDocuments(collectionId);
        const agentsResponse = await agentService.getAgents({ collectionId, avatar: '' });

        // transforma documentos
        const transformedDocuments = (documentsResponse.data?.documents || []).map(transformServiceDocument);

        // filtra agentes que têm a collectionId nos selectedCollections e transforma
        const agentsForCollection = (agentsResponse.data?.agents || [])
          .filter((a: any) => a.knowledgeBase?.selectedCollections?.includes(collectionId))
          .map(transformServiceAgent);

        // calcular totalSize usando transformedDocuments
        const totalSize = transformedDocuments.reduce((acc, doc) => {
          return acc + (typeof doc.fileSize === 'string' ? parseInt(doc.fileSize, 10) : doc.fileSize || 0);
        }, 0);

        const avgDocumentSize =
          transformedDocuments.length > 0 ? Math.round(totalSize / transformedDocuments.length) : 0;



        const transformedCollection: CollectionDetails = {
          id: collectionData.id,
          name: collectionData.name,
          description: collectionData.description || '',
          slug: (collectionData.name || '').toLowerCase().replace(/\s+/g, '-'),
          documentCount: transformedDocuments.length,
          agentCount: agentsForCollection.length,
          tags: collectionData.metadata?.tags || [],
          isActive: collectionData.status === 'active',
          visibility: collectionData.settings?.isPublic ? 'public' : 'private',
          createdBy: {
            id: collectionData.userId || '',
            name: (collectionData as any).createdBy?.name || 'Usuário',
            avatar: (collectionData as any).createdBy?.avatar || undefined,
          },
          updatedBy: {
            id: (collectionData as any).updatedBy?.id || collectionData.userId || '',
            name: (collectionData as any).updatedBy?.name || 'Usuário',
            avatar: (collectionData as any).updatedBy?.avatar || undefined,
          },
          createdAt: collectionData.createdAt,
          updatedAt: collectionData.updatedAt,
          lastSyncAt: collectionData.updatedAt,
          syncStatus: 'synced',
          metadata: {
            totalSize,
            avgDocumentSize,
            languages: Array.isArray(collectionData.metadata?.language) ? collectionData.metadata.language : ['pt'],
            categories: Array.isArray(collectionData.metadata?.category) ? collectionData.metadata.category : [],
          },
          documents: transformedDocuments,
          agents: agentsForCollection,
        };

        // salva no estado
        setCollection(transformedCollection);
        setDocuments(transformedDocuments);
        setAgents(agentsForCollection);
      } catch (err) {
        console.error('Erro ao carregar dados da collection:', err);
        setError('Erro ao carregar dados da collection. Tente novamente.');
        toast.error('Erro ao carregar dados da collection');
      } finally {
        setLoading(false);
      }
    };

    loadCollectionData();
  }, [collectionId]);

  // computedCollection (baseado no estado)
  const totalSize = documents.reduce((acc, d) => acc + (d.fileSize || 0), 0);
  const avgDocumentSize = documents.length > 0 ? Math.round(totalSize / documents.length) : 0;
  const computedCollection = collection ? {
    ...collection,
    documentCount: documents.length,
    agentCount: agents.length,
    metadata: {
      ...collection.metadata,
      totalSize,
      avgDocumentSize,
      languages: collection.metadata?.languages || ['pt'],
    }
  } : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando dados da collection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Erro ao carregar</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!computedCollection) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Collection não encontrada</h3>
          <p className="text-muted-foreground mb-4">
            A collection que você está tentando acessar não existe ou você não tem permissão para visualizá-la.
          </p>
          <Link href="/dashboard/knowledge/collections">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Collections
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/knowledge/collections">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{computedCollection.name}</h1>
            {!computedCollection.isActive && <Badge variant="secondary">Inativa</Badge>}
            {getVisibilityBadge(computedCollection.visibility)}
            <div className={`flex items-center gap-1 text-sm ${getStatusColor(computedCollection.syncStatus)}`}>
              <StatusIcon
                className={`h-4 w-4 ${computedCollection.syncStatus === 'syncing' ? 'animate-spin' : ''}`}
              />
              {computedCollection.syncStatus === 'synced' && 'Sincronizada'}
              {computedCollection.syncStatus === 'syncing' && 'Sincronizando'}
              {computedCollection.syncStatus === 'error' && 'Erro na sincronização'}
              {computedCollection.syncStatus === 'pending' && 'Sincronização pendente'}
            </div>
          </div>
          <p className="text-muted-foreground mt-1">{computedCollection.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button>
            <RefreshCw className="h-4 w-4 mr-2" />
            Sincronizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{computedCollection.documentCount}</div>
            <p className="text-xs text-muted-foreground">
              {formatBytes(computedCollection.metadata.totalSize)} total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agentes Vinculados</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents.length}</div>
            <p className="text-xs text-muted-foreground">
              {agents.filter(a => a.status === 'active').length} ativos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Idiomas</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{computedCollection.metadata.languages.length}</div>
            <p className="text-xs text-muted-foreground">
              {computedCollection.metadata.languages.join(', ')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Atualização</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatRelativeTime(computedCollection.updatedAt)}</div>
            <p className="text-xs text-muted-foreground">
              por {computedCollection.updatedBy.name}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="documents">Documentos ({documents.length})</TabsTrigger>
            <TabsTrigger value="agents">Agentes ({agents.length})</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Buscar ${selectedTab === 'documents' ? 'documentos' : 'agentes'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>

            {selectedTab === 'documents' && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Documentos
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Upload de Documentos</DialogTitle>
                    <DialogDescription>
                      Faça upload de documentos para adicionar à coleção "{computedCollection.name}"
                    </DialogDescription>
                  </DialogHeader>
                  <DocumentUpload
                    collectionId={computedCollection.id}
                    onUploadComplete={async () => {
                      try {
                        setLoading(true);
                        const documentsResponse = await collectionService.getDocuments(collectionId);
                        setDocuments((documentsResponse.data?.documents || []).map(transformServiceDocument));
                        toast.success('Documentos carregados com sucesso!');
                      } catch (error) {
                        console.error('Erro ao recarregar documentos:', error);
                        toast.error('Erro ao recarregar documentos');
                      } finally {
                        setLoading(false);
                      }
                    }}
                  />
                </DialogContent>
              </Dialog>
            )}

            {selectedTab === 'agents' && (
              <Button onClick={() => setIsLinkAgentDialogOpen(true)}>
                <LinkIcon className="h-4 w-4 mr-2" />
                Vincular Agente
              </Button>
            )}
          </div>
        </div>

        {/* Documents tab */}
        <TabsContent value="documents" className="space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
              <span>Carregando documentos...</span>
            </div>
          )}

          {!loading && (
            <>
              <div className="grid gap-4">
                {filteredDocuments.map((document) => document && (
                  <Card key={document.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="text-2xl">{getFileIcon(document.mimeType)}</div>
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{document.title}</h3>
                              <Badge variant="outline">v{document.version}</Badge>
                              <Badge variant={document.status === 'published' ? 'default' : 'secondary'}>
                                {document.status === 'published' ? 'Publicado' :
                                  document.status === 'draft' ? 'Rascunho' : 'Arquivado'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{document.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{formatBytes(document.fileSize)}</span>
                              <span>•</span>
                              <span>{document.author?.name || 'Unknown'}</span>
                              <span>•</span>
                              <span>{formatRelativeTime(document.updatedAt)}</span>
                              <span>•</span>
                              <span>{document.viewCount} visualizações</span>
                              <span>•</span>
                              <span>{document.downloadCount} downloads</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {document.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
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
                              <Link href={`/dashboard/knowledge/documents/${document.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                Visualizar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remover da Collection
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredDocuments.length === 0 && (
                <Card className="text-center py-12">
                  <CardContent>
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhum documento encontrado</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm ? 'Tente ajustar o termo de busca' : 'Esta collection ainda não possui documentos'}
                    </p>
                    {!searchTerm && (
                      <Button onClick={() => setIsAddDocumentDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Primeiro Documento
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Agents tab */}
        <TabsContent value="agents" className="space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
              <span>Carregando agentes...</span>
            </div>
          )}

          {!loading && (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredAgents.map((agent) => agent && (
                  <Card key={agent.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{agent.name}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                              {agent.status === 'active' ? 'Ativo' :
                                agent.status === 'inactive' ? 'Inativo' : 'Treinando'}
                            </Badge>
                            <Badge variant="outline">{agent.type}</Badge>
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
                              <Link href={`/dashboard/agentes/${agent.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Agente
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Settings className="h-4 w-4 mr-2" />
                              Configurar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={async () => {
                                try {
                                  await collectionService.unlinkAgentFromCollection(agent.id, collectionId);
                                  // Recarregar lista de agentes
                                  const agentsResponse = await collectionService.getCollectionAgents(collectionId);
                                  setAgents(agentsResponse.data?.agents || []);
                                  toast.success('Agente desvinculado com sucesso!');
                                } catch (error) {
                                  console.error('Erro ao desvincular agente:', error);
                                  toast.error('Erro ao desvincular agente');
                                }
                              }}
                            >
                              <Unlink className="h-4 w-4 mr-2" />
                              Desvincular
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Conversas</p>
                            <p className="font-medium">{agent.conversations?.toLocaleString() ?? 0}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Taxa de Sucesso</p>
                            <p className="font-medium text-green-600">{agent.successRate}%</p>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Último uso: {formatRelativeTime(agent.lastUsed)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredAgents.length === 0 && (
                <Card className="text-center py-12">
                  <CardContent>
                    <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhum agente encontrado</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm ? 'Tente ajustar o termo de busca' : 'Esta collection ainda não possui agentes vinculados'}
                    </p>
                    {!searchTerm && (
                      <Button onClick={() => setIsLinkAgentDialogOpen(true)}>
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Vincular Primeiro Agente
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* analytics / settings (mantive como antes) */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics em Desenvolvimento</CardTitle>
              <CardDescription>
                Esta seção mostrará estatísticas detalhadas sobre o uso da collection.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Em breve...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <CollectionSettings
            collection={{
              id: computedCollection.id,
              name: computedCollection.name,
              description: computedCollection.description,
              slug: computedCollection.slug,
              tags: computedCollection.tags,
              visibility: computedCollection.visibility,
              isActive: computedCollection.isActive,
              settings: {
                isPublic: computedCollection.visibility === 'public',
                allowDuplicates: true,
                autoIndex: true,
                chunkSize: 1000,
                chunkOverlap: 200,
                maxDocuments: 10000,
                retentionDays: 365,
              },
              embeddingConfig: {
                model: 'text-embedding-ada-002',
                dimensions: 1536,
                distance: 'Cosine',
                provider: 'openai',
              },
            }}
            onUpdate={async (updatedCollection) => {
              try {
                await collectionService.updateCollection(computedCollection.id, {
                  name: updatedCollection.name,
                  description: updatedCollection.description,
                  settings: {
                    isPublic: updatedCollection.settings.isPublic,
                    allowDuplicates: updatedCollection.settings.allowDuplicates,
                    autoIndex: updatedCollection.settings.autoIndex,
                    chunkSize: updatedCollection.settings.chunkSize,
                    chunkOverlap: updatedCollection.settings.chunkOverlap,
                    maxDocuments: updatedCollection.settings.maxDocuments,
                    retentionDays: updatedCollection.settings.retentionDays,
                  },
                  metadata: {
                    tags: updatedCollection.tags,
                  },
                });

                // Atualizar estado local
                setCollection(prev => prev ? {
                  ...prev,
                  name: updatedCollection.name,
                  description: updatedCollection.description,
                  tags: updatedCollection.tags,
                  visibility: updatedCollection.settings.isPublic ? 'public' : 'private',
                } : null);

                toast.success('Collection atualizada com sucesso!');
              } catch (error) {
                console.error('Erro ao atualizar collection:', error);
                toast.error('Erro ao atualizar collection');
              }
            }}
            onDelete={async () => {
              try {
                await collectionService.deleteCollection(computedCollection.id);
                toast.success('Collection excluída com sucesso!');
                // Redirecionar para a lista de collections
                window.location.href = '/dashboard/knowledge/collections';
              } catch (error) {
                console.error('Erro ao excluir collection:', error);
                toast.error('Erro ao excluir collection');
              }
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Dialog para vincular agente */}
      <Dialog open={isLinkAgentDialogOpen} onOpenChange={setIsLinkAgentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Vincular Agente à Coleção</DialogTitle>
            <DialogDescription>
              Selecione um agente para vincular à coleção "{computedCollection.name}"
            </DialogDescription>
          </DialogHeader>
          <LinkAgentDialog
            collectionId={computedCollection.id}
            onLinkSuccess={async () => {
              try {
                setLoading(true);
                const agentsResponse = await collectionService.getCollectionAgents(collectionId);
                setAgents(agentsResponse.data?.agents || []);
                toast.success('Agente vinculado com sucesso!');
              } catch (error) {
                console.error('Erro ao recarregar agentes:', error);
                toast.error('Erro ao recarregar agentes');
              } finally {
                setLoading(false);
              }
            }}
            onClose={() => setIsLinkAgentDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}