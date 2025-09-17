'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import collectionService, { Collection as CollectionType, Document as DocumentType } from '@/services/collection-service';
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
import { formatDate, formatRelativeTime } from '@/lib/utils';
import Link from 'next/link';
import { DocumentUpload } from '@/components/knowledge/document-upload';
import { CollectionSettings } from '@/components/knowledge/collection-settings';
import { LinkAgentDialog } from '@/components/knowledge/link-agent-dialog';

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

// Mock data
const mockCollection: CollectionDetails = {
  id: 'collection-001',
  name: 'Catálogo de Produtos',
  description: 'Informações completas sobre todos os produtos da empresa, incluindo especificações técnicas, preços e disponibilidade.',
  slug: 'catalogo-produtos',
  documentCount: 45,
  agentCount: 3,
  tags: ['produtos', 'vendas', 'especificações'],
  isActive: true,
  visibility: 'private',
  createdBy: {
    id: '1',
    name: 'Ana Silva',
    avatar: '/avatars/ana.jpg'
  },
  updatedBy: {
    id: '2',
    name: 'Carlos Santos',
    avatar: '/avatars/carlos.jpg'
  },
  createdAt: '2024-01-10T09:00:00Z',
  updatedAt: '2024-01-20T14:30:00Z',
  lastSyncAt: '2024-01-20T14:30:00Z',
  syncStatus: 'synced',
  metadata: {
    totalSize: 15728640, // 15MB
    avgDocumentSize: 349525, // ~340KB
    languages: ['pt', 'en'],
    categories: ['Produtos', 'Especificações', 'Preços']
  },
  documents: [
    {
      id: 'doc-001',
      title: 'Catálogo Geral de Produtos 2024',
      description: 'Catálogo completo com todos os produtos disponíveis',
      fileName: 'catalogo-produtos-2024.pdf',
      fileSize: 2048576,
      mimeType: 'application/pdf',
      language: 'pt',
      category: 'Catálogo',
      tags: ['produtos', 'catálogo', '2024'],
      author: {
        id: '1',
        name: 'Ana Silva'
      },
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z',
      version: 2,
      status: 'published',
      viewCount: 245,
      downloadCount: 67
    },
    {
      id: 'doc-002',
      title: 'Especificações Técnicas - Linha Premium',
      description: 'Detalhes técnicos dos produtos da linha premium',
      fileName: 'specs-premium.pdf',
      fileSize: 1536000,
      mimeType: 'application/pdf',
      language: 'pt',
      category: 'Especificações',
      tags: ['premium', 'especificações', 'técnico'],
      author: {
        id: '3',
        name: 'Pedro Lima'
      },
      createdAt: '2024-01-12T14:20:00Z',
      updatedAt: '2024-01-18T16:45:00Z',
      version: 1,
      status: 'published',
      viewCount: 189,
      downloadCount: 43
    },
    {
      id: 'doc-003',
      title: 'Tabela de Preços Atualizada',
      description: 'Preços atualizados para todos os produtos',
      fileName: 'precos-2024.xlsx',
      fileSize: 512000,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      language: 'pt',
      category: 'Preços',
      tags: ['preços', 'tabela', 'atualizada'],
      author: {
        id: '2',
        name: 'Carlos Santos'
      },
      createdAt: '2024-01-18T09:30:00Z',
      updatedAt: '2024-01-19T11:15:00Z',
      version: 3,
      status: 'published',
      viewCount: 156,
      downloadCount: 89
    }
  ],
  agents: [
    {
      id: 'agent-001',
      name: 'Agente de Vendas',
      type: 'chatbot',
      status: 'active',
      conversations: 1245,
      successRate: 87.5,
      lastUsed: '2024-01-20T16:30:00Z'
    },
    {
      id: 'agent-002',
      name: 'Assistente Técnico',
      type: 'voice',
      status: 'active',
      conversations: 892,
      successRate: 92.3,
      lastUsed: '2024-01-20T15:45:00Z'
    },
    {
      id: 'agent-003',
      name: 'Suporte WhatsApp',
      type: 'chatbot',
      status: 'inactive',
      conversations: 567,
      successRate: 78.9,
      lastUsed: '2024-01-19T14:20:00Z'
    }
  ]
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

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

function getFileIcon(mimeType: string) {
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📋';
  if (mimeType.includes('image')) return '🖼️';
  return '📄';
}

export default function CollectionDetailsPage() {
  const params = useParams();
  const collectionId = params.id as string;
  
  const [collection, setCollection] = useState<CollectionDetails | null>(null);
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('documents');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDocumentDialogOpen, setIsAddDocumentDialogOpen] = useState(false);
  const [isLinkAgentDialogOpen, setIsLinkAgentDialogOpen] = useState(false);

  // Carregar dados da collection
  useEffect(() => {
    const loadCollectionData = async () => {
      try {
        setLoading(true);
        
        // Carregar dados da collection
        const collectionData = await collectionService.getCollection(collectionId);
        
        // Carregar documentos da collection
        const documentsResponse = await collectionService.getDocuments(collectionId);
        
        // Transformar dados da API para o formato esperado pelo componente
        const transformedCollection: CollectionDetails = {
          id: collectionData.id,
          name: collectionData.name,
          description: collectionData.description || '',
          slug: collectionData.name.toLowerCase().replace(/\s+/g, '-'),
          documentCount: collectionData.documentCount || documentsResponse.data?.documents?.length || 0,
          agentCount: 0, // TODO: implementar quando tiver endpoint de agentes
          tags: collectionData.metadata?.tags || [],
          isActive: collectionData.status === 'active',
          visibility: collectionData.settings?.isPublic ? 'public' : 'private',
          createdBy: {
            id: collectionData.userId,
            name: 'Usuário', // TODO: buscar dados do usuário
          },
          updatedBy: {
            id: collectionData.userId,
            name: 'Usuário', // TODO: buscar dados do usuário
          },
          createdAt: collectionData.createdAt,
          updatedAt: collectionData.updatedAt,
          lastSyncAt: collectionData.updatedAt,
          syncStatus: 'synced',
          metadata: {
            totalSize: collectionData.totalSize || 0,
            avgDocumentSize: collectionData.totalSize && collectionData.documentCount 
              ? Math.round(collectionData.totalSize / collectionData.documentCount) 
              : 0,
            languages: ['pt'], // TODO: implementar detecção de idiomas
            categories: [], // TODO: implementar categorias
          },
          documents: [], // Será preenchido separadamente
          agents: [], // TODO: implementar quando tiver endpoint de agentes
        };
        
        setCollection(transformedCollection);
        setDocuments(documentsResponse.data?.documents || []);
        
      } catch (error) {
        console.error('Erro ao carregar dados da collection:', error);
        toast.error('Erro ao carregar dados da collection');
      } finally {
        setLoading(false);
      }
    };

    if (collectionId) {
      loadCollectionData();
    }
  }, [collectionId]);

  // Mostrar loading enquanto carrega os dados
  if (loading || !collection) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando dados da collection...</span>
        </div>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(collection.syncStatus);

  // Transformar documentos da API para o formato esperado
  const transformedDocuments = documents.map(doc => ({
    id: doc.id,
    title: doc.originalName || doc.filename,
    description: doc.metadata?.extractedText?.substring(0, 100) + '...' || 'Sem descrição',
    fileName: doc.filename,
    fileSize: doc.fileSize,
    mimeType: doc.type === 'pdf' ? 'application/pdf' : 
              doc.type === 'doc' || doc.type === 'docx' ? 'application/msword' :
              doc.type === 'txt' ? 'text/plain' :
              doc.type === 'md' ? 'text/markdown' :
              'application/octet-stream',
    language: doc.metadata?.language || 'pt',
    category: 'Documento',
    tags: [],
    author: {
      id: doc.userId,
      name: 'Usuário'
    },
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    version: 1,
    status: doc.status === 'completed' ? 'published' as const : 
            doc.status === 'processing' ? 'draft' as const : 'archived' as const,
    viewCount: 0,
    downloadCount: 0
  }));

  const filteredDocuments = transformedDocuments.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAgents = collection.agents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h1 className="text-3xl font-bold tracking-tight">{collection.name}</h1>
            {!collection.isActive && (
              <Badge variant="secondary">Inativa</Badge>
            )}
            {getVisibilityBadge(collection.visibility)}
            <div className={`flex items-center gap-1 text-sm ${getStatusColor(collection.syncStatus)}`}>
              <StatusIcon className={`h-4 w-4 ${collection.syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              {collection.syncStatus === 'synced' && 'Sincronizada'}
              {collection.syncStatus === 'syncing' && 'Sincronizando'}
              {collection.syncStatus === 'error' && 'Erro na sincronização'}
              {collection.syncStatus === 'pending' && 'Sincronização pendente'}
            </div>
          </div>
          <p className="text-muted-foreground mt-1">
            {collection.description}
          </p>
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
            <div className="text-2xl font-bold">{collection.documentCount}</div>
            <p className="text-xs text-muted-foreground">
              {formatBytes(collection.metadata.totalSize)} total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agentes Vinculados</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collection.agentCount}</div>
            <p className="text-xs text-muted-foreground">
              {collection.agents.filter(a => a.status === 'active').length} ativos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Idiomas</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collection.metadata.languages.length}</div>
            <p className="text-xs text-muted-foreground">
              {collection.metadata.languages.join(', ')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Atualização</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatRelativeTime(collection.updatedAt)}</div>
            <p className="text-xs text-muted-foreground">
              por {collection.updatedBy.name}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="documents">Documentos ({documents.length})</TabsTrigger>
            <TabsTrigger value="agents">Agentes ({collection.agents.length})</TabsTrigger>
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
                      Faça upload de documentos para adicionar à coleção "{collection.name}"
                    </DialogDescription>
                  </DialogHeader>
                  <DocumentUpload 
                    collectionId={collection.id}
                    onUploadComplete={async () => {
                      // Recarregar documentos após upload
                      try {
                        const documentsResponse = await collectionService.getDocuments(collectionId);
                        setDocuments(documentsResponse.data?.documents || []);
                        toast.success('Documentos carregados com sucesso!');
                      } catch (error) {
                        console.error('Erro ao recarregar documentos:', error);
                        toast.error('Erro ao recarregar documentos');
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

        <TabsContent value="documents" className="space-y-4">
          <div className="grid gap-4">
            {filteredDocuments.map((document) => (
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
                          <span>{document.author.name}</span>
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
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAgents.map((agent) => (
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
                        <DropdownMenuItem className="text-red-600">
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
                        <p className="font-medium">{agent.conversations.toLocaleString()}</p>
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
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Uso da Collection</CardTitle>
                <CardDescription>Estatísticas de uso nos últimos 30 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Consultas por agentes</span>
                    <span className="font-medium">2,847</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Documentos mais acessados</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Taxa de acerto</span>
                    <span className="font-medium text-green-600">89.3%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tempo médio de resposta</span>
                    <span className="font-medium">1.2s</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance por Agente</CardTitle>
                <CardDescription>Uso da collection por cada agente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {collection.agents.map((agent) => (
                    <div key={agent.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-xs text-muted-foreground">{agent.conversations} consultas</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">{agent.successRate}%</p>
                        <p className="text-xs text-muted-foreground">sucesso</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <CollectionSettings 
            collection={{
              id: collection.id,
              name: collection.name,
              description: collection.description,
              slug: collection.slug,
              tags: collection.tags,
              visibility: collection.visibility,
              isActive: collection.isActive,
              settings: {
                isPublic: collection.visibility === 'public',
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
                await collectionService.updateCollection(collection.id, {
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
                await collectionService.deleteCollection(collection.id);
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

      {/* Dialog para vincular agentes */}
      <LinkAgentDialog
        open={isLinkAgentDialogOpen}
        onOpenChange={setIsLinkAgentDialogOpen}
        collectionId={collection.id}
        collectionName={collection.name}
        onAgentsLinked={(agents) => {
          console.log('Agentes vinculados:', agents);
          // TODO: Atualizar a lista de agentes da collection
        }}
      />

      {/* Dialog para upload de documentos */}
      <Dialog open={isAddDocumentDialogOpen} onOpenChange={setIsAddDocumentDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Upload de Documentos</DialogTitle>
            <DialogDescription>
              Faça upload de documentos para adicionar à coleção "{collection.name}"
            </DialogDescription>
          </DialogHeader>
          <DocumentUpload 
            collectionId={collection.id}
            onUploadComplete={async (uploadedDocuments) => {
              // Recarregar documentos após upload
              try {
                const documentsResponse = await collectionService.getDocuments(collectionId);
                setDocuments(documentsResponse.data?.documents || []);
                toast.success(`${uploadedDocuments.length} documento(s) enviado(s) com sucesso!`);
                setIsAddDocumentDialogOpen(false);
              } catch (error) {
                console.error('Erro ao recarregar documentos:', error);
                toast.error('Documentos enviados, mas erro ao recarregar a lista');
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}