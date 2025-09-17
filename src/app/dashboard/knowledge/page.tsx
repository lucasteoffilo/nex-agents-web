'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Upload,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  Plus,
  FolderOpen,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Loader2,
  GitBranch,
  RefreshCw
} from 'lucide-react';
import { formatBytes, formatDate } from '@/lib/utils';
import { VersioningStats } from '@/components/knowledge/versioning-stats';
import documentService, { Document } from '@/services/document-service';
import collectionService, { Collection } from '@/services/collection-service';
import { useToast } from '@/hooks/use-toast';

interface DocumentStats {
  total: number;
  completed: number;
  processing: number;
  failed: number;
  totalSize: number;
}

const getFileIcon = (type: string) => {
  if (type.includes('pdf') || type.includes('document')) return FileText;
  if (type.includes('image')) return Image;
  if (type.includes('video')) return Video;
  if (type.includes('audio')) return Music;
  if (type.includes('zip') || type.includes('rar')) return Archive;
  return FileText;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'success';
    case 'processing': return 'warning';
    case 'failed': return 'error';
    default: return 'default';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return CheckCircle;
    case 'processing': return Loader2;
    case 'failed': return AlertCircle;
    default: return Clock;
  }
};

export default function KnowledgePage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [stats, setStats] = useState<DocumentStats>({
    total: 0,
    completed: 0,
    processing: 0,
    failed: 0,
    totalSize: 0
  });
  const { toast } = useToast();

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [documentsResponse, collectionsResponse, statsResponse] = await Promise.all([
        documentService.getDocuments({ limit: 100 }),
        collectionService.getCollections({ limit: 100 }),
        documentService.getDocumentStats()
      ]);

      if (documentsResponse.success && documentsResponse.data) {
        setDocuments(documentsResponse.data.documents);
      }

      if (collectionsResponse.success && collectionsResponse.data) {
        setCollections(collectionsResponse.data.collections);
      }

      if (statsResponse.success && statsResponse.data) {
        const apiStats = statsResponse.data as any;
        setStats({
          total: apiStats.total,
          completed: apiStats.byStatus?.completed || 0,
          processing: apiStats.byStatus?.processing || 0,
          failed: apiStats.byStatus?.error || 0,
          totalSize: apiStats.totalSize
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados da base de conhecimento.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.originalName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCollection = selectedCollection === 'all' || doc.collectionId === selectedCollection;
    const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus;
    return matchesSearch && matchesCollection && matchesStatus;
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Verificar se há coleções disponíveis
    if (collections.length === 0) {
      toast({
        title: 'Erro',
        description: 'É necessário criar uma coleção antes de fazer upload de documentos.',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Usar a primeira coleção disponível como padrão
        const defaultCollectionId = collections[0].id;
        
        const uploadData = {
          collectionId: defaultCollectionId,
          file,
          name: file.name,
          metadata: {
            tags: ['upload-manual'],
            category: 'Documentação'
          }
        };

        return documentService.uploadDocument(uploadData);
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(result => result.success);
      const failedUploads = results.filter(result => !result.success);

      if (successfulUploads.length > 0) {
        toast({
          title: 'Sucesso',
          description: `${successfulUploads.length} documento(s) enviado(s) com sucesso.`,
        });
        
        // Recarregar dados
        await loadInitialData();
      }

      if (failedUploads.length > 0) {
        toast({
          title: 'Aviso',
          description: `${failedUploads.length} documento(s) falharam no upload.`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao fazer upload dos documentos.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
      // Limpar o input
      event.target.value = '';
    }
  };

  const handleDelete = async (documentId: string) => {
    try {
      const result = await documentService.deleteDocument(documentId);
      
      if (result.success) {
        toast({
          title: 'Sucesso',
          description: 'Documento deletado com sucesso.',
        });
        
        // Remover da lista local
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        
        // Atualizar estatísticas
        await loadInitialData();
      } else {
        throw new Error('Falha ao deletar documento');
      }
    } catch (error) {
      console.error('Erro ao deletar documento:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível deletar o documento.',
        variant: 'destructive'
      });
    }
  };

  const handleReprocess = async (documentId: string) => {
    try {
      const result = await documentService.reprocessDocument(documentId);
      
      if (result.success) {
        toast({
          title: 'Sucesso',
          description: 'Documento será reprocessado.',
        });
        
        // Recarregar dados para mostrar status atualizado
        await loadInitialData();
      } else {
        throw new Error('Falha ao reprocessar documento');
      }
    } catch (error) {
      console.error('Erro ao reprocessar documento:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível reprocessar o documento.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Conhecimento</h1>
          <p className="text-muted-foreground">
            Gerencie documentos, artigos e base de conhecimento
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button disabled={isUploading} className="cursor-pointer">
              {isUploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              {isUploading ? 'Enviando...' : 'Adicionar Documentos'}
            </Button>
          </label>
        </div>
      </div>

      {/* Abas principais */}
      <Tabs defaultValue="documents" className="space-y-6">
        <TabsList>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documentos
          </TabsTrigger>
          <TabsTrigger value="versioning" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Versionamento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-6">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Documentos</p>
                <p className="text-2xl font-bold">{isLoading ? '-' : stats.total}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processados</p>
                <p className="text-2xl font-bold text-green-600">
                  {isLoading ? '-' : stats.completed}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processando</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {isLoading ? '-' : stats.processing}
                </p>
              </div>
              <Loader2 className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tamanho Total</p>
                <p className="text-2xl font-bold">
                  {isLoading ? '-' : formatBytes(stats.totalSize)}
                </p>
              </div>
              <Upload className="h-8 w-8 text-[#0072b9]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar documentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">Todas as coleções</option>
            {collections.map(collection => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">Todos os status</option>
            <option value="completed">Processados</option>
            <option value="processing">Processando</option>
            <option value="pending">Pendentes</option>
            <option value="error">Com erro</option>
          </select>
        </div>
        
        <Button
          variant="outline"
          onClick={loadInitialData}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Documents Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredDocuments.map((document) => {
            const FileIcon = getFileIcon((document as any).mimeType || 'application/octet-stream');
            const StatusIcon = getStatusIcon(document.status);
            const collection = collections.find(c => c.id === document.collectionId);
            
            return (
              <Card key={document.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <FileIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-medium truncate" title={document.originalName}>
                          {document.originalName || document.filename}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {formatBytes((document as any).size)}
                        </CardDescription>
                      </div>
                    </div>
                    
                    <Badge variant={getStatusColor(document.status) as any} className="text-xs">
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {document.status === 'completed' && 'Processado'}
                      {document.status === 'processing' && 'Processando'}
                      {document.status === 'error' && 'Erro'}
                      {document.status === 'pending' && 'Pendente'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(document.createdAt)}</span>
                    </div>
                    
                    {collection && (
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">
                          <FolderOpen className="h-3 w-3 mr-1" />
                          {collection.name}
                        </Badge>
                      </div>
                    )}
                    
                    {(document as any).chunkCount && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <FileText className="h-3 w-3" />
                        <span>{(document as any).chunkCount} chunks</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        Visualizar
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3" />
                      </Button>
                      {document.status === 'error' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleReprocess(document.id)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Reprocessar documento"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDelete(document.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum documento encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedCollection !== 'all' || selectedStatus !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece adicionando seus primeiros documentos'
              }
            </p>
            {!searchTerm && selectedCollection === 'all' && selectedStatus === 'all' && (
              <label htmlFor="file-upload">
                <Button className="cursor-pointer">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Documentos
                </Button>
              </label>
            )}
          </CardContent>
        </Card>
      )}
        </TabsContent>

        <TabsContent value="versioning" className="space-y-6">
          <VersioningStats />
        </TabsContent>
      </Tabs>
    </div>
  );
}