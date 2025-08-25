'use client';

import { useState } from 'react';
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
  GitBranch
} from 'lucide-react';
import { formatBytes, formatDate } from '@/lib/utils';
import { VersioningStats } from '@/components/knowledge/versioning-stats';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  status: 'processing' | 'completed' | 'failed';
  category: string;
  tags: string[];
  url?: string;
}

const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Manual do Produto.pdf',
    type: 'application/pdf',
    size: 2048576,
    uploadedAt: '2024-01-15T10:30:00Z',
    uploadedBy: 'João Silva',
    status: 'completed',
    category: 'Documentação',
    tags: ['manual', 'produto', 'guia']
  },
  {
    id: '2',
    name: 'Apresentação Vendas Q1.pptx',
    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    size: 5242880,
    uploadedAt: '2024-01-14T15:45:00Z',
    uploadedBy: 'Maria Santos',
    status: 'completed',
    category: 'Apresentações',
    tags: ['vendas', 'q1', 'apresentação']
  },
  {
    id: '3',
    name: 'FAQ Atendimento.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 1024000,
    uploadedAt: '2024-01-13T09:15:00Z',
    uploadedBy: 'Pedro Costa',
    status: 'processing',
    category: 'FAQ',
    tags: ['faq', 'atendimento', 'suporte']
  },
  {
    id: '4',
    name: 'Política de Privacidade.pdf',
    type: 'application/pdf',
    size: 512000,
    uploadedAt: '2024-01-12T14:20:00Z',
    uploadedBy: 'Ana Oliveira',
    status: 'failed',
    category: 'Jurídico',
    tags: ['política', 'privacidade', 'lgpd']
  },
  {
    id: '5',
    name: 'Catálogo de Produtos 2024.pdf',
    type: 'application/pdf',
    size: 8388608,
    uploadedAt: '2024-01-11T11:00:00Z',
    uploadedBy: 'Carlos Lima',
    status: 'completed',
    category: 'Catálogo',
    tags: ['catálogo', 'produtos', '2024']
  }
];

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
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isUploading, setIsUploading] = useState(false);

  const categories = ['all', 'Documentação', 'Apresentações', 'FAQ', 'Jurídico', 'Catálogo'];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploading(true);
    
    // Simular upload
    setTimeout(() => {
      Array.from(files).forEach((file, index) => {
        const newDoc: Document = {
          id: Date.now().toString() + index,
          name: file.name,
          type: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'Usuário Atual',
          status: 'processing',
          category: 'Documentação',
          tags: ['novo']
        };
        setDocuments(prev => [newDoc, ...prev]);
      });
      setIsUploading(false);
    }, 2000);
  };

  const handleDelete = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
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
                <p className="text-2xl font-bold">{documents.length}</p>
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
                  {documents.filter(d => d.status === 'completed').length}
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
                  {documents.filter(d => d.status === 'processing').length}
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
                  {formatBytes(documents.reduce((acc, doc) => acc + doc.size, 0))}
                </p>
              </div>
              <Upload className="h-8 w-8 text-purple-500" />
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
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'Todas as categorias' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredDocuments.map((document) => {
          const FileIcon = getFileIcon(document.type);
          const StatusIcon = getStatusIcon(document.status);
          
          return (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <FileIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm font-medium truncate">
                        {document.name}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {formatBytes(document.size)}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <Badge variant={getStatusColor(document.status) as any} className="text-xs">
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {document.status === 'completed' && 'Processado'}
                    {document.status === 'processing' && 'Processando'}
                    {document.status === 'failed' && 'Falhou'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>{document.uploadedBy}</span>
                    <Clock className="h-3 w-3 ml-2" />
                    <span>{formatDate(document.uploadedAt)}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">
                      {document.category}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {document.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      Visualizar
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3" />
                    </Button>
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

      {filteredDocuments.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum documento encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Tente ajustar os filtros de busca'
                : 'Comece adicionando seus primeiros documentos'
              }
            </p>
            {!searchTerm && selectedCategory === 'all' && (
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