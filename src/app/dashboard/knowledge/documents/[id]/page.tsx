'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Download,
  Share2,
  Edit,
  History,
  MessageSquare,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Star,
  Clock,
  User,
  Tag,
  Globe,
  Users,
  Lock,
  Calendar,
  FileIcon,
  Send,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Info,
  Plus,
  Search,
  Filter,
  ArrowLeft,
  GitCompare,
  RotateCcw
} from 'lucide-react';
import { VersionComparison } from '@/components/knowledge/version-comparison';
import { CreateVersionDialog } from '@/components/knowledge/create-version-dialog';
import { useDocumentVersions } from '@/hooks/use-document-versions';
import { formatBytes, formatDistanceToNow } from '@/lib/utils';
import Link from 'next/link';

interface Document {
  id: string;
  title: string;
  description: string;
  content: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  category: {
    id: string;
    name: string;
    color: string;
  };
  tags: string[];
  language: string;
  visibility: 'public' | 'internal' | 'private';
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  version: number;
  status: 'draft' | 'published' | 'archived';
  stats: {
    views: number;
    downloads: number;
    likes: number;
    dislikes: number;
    comments: number;
  };
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canComment: boolean;
    canShare: boolean;
  };
}

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt?: string;
  replies?: Comment[];
  isResolved?: boolean;
  type: 'comment' | 'suggestion' | 'question';
}

interface Version {
  id: string;
  version: number;
  title: string;
  description: string;
  content: string;
  author: {
    id: string;
    name: string;
  };
  createdAt: string;
  changes: string[];
  size: number;
  contentHash: string;
}

const mockDocument: Document = {
  id: '1',
  title: 'Guia de Atendimento ao Cliente',
  description: 'Manual completo para atendimento ao cliente com melhores práticas e procedimentos padrão.',
  content: `# Guia de Atendimento ao Cliente

## Introdução

Este guia apresenta as melhores práticas para atendimento ao cliente, garantindo uma experiência excepcional e resolutiva.

## Princípios Fundamentais

### 1. Empatia
- Ouça ativamente o cliente
- Demonstre compreensão
- Valide suas preocupações

### 2. Agilidade
- Responda rapidamente
- Seja eficiente na resolução
- Mantenha o cliente informado

### 3. Profissionalismo
- Mantenha tom respeitoso
- Use linguagem clara
- Seja objetivo e direto

## Procedimentos Padrão

### Primeiro Contato
1. Cumprimente o cliente
2. Identifique-se
3. Pergunte como pode ajudar
4. Ouça atentamente

### Resolução de Problemas
1. Identifique o problema
2. Analise as opções
3. Apresente soluções
4. Implemente a solução escolhida
5. Confirme a satisfação

### Encerramento
1. Resuma o que foi feito
2. Pergunte se há mais alguma dúvida
3. Agradeça o contato
4. Registre o atendimento

## Situações Especiais

### Cliente Insatisfeito
- Mantenha a calma
- Ouça sem interromper
- Peça desculpas quando apropriado
- Foque na solução
- Escale quando necessário

### Reclamações
- Registre todos os detalhes
- Investigue completamente
- Comunique o progresso
- Implemente correções
- Faça follow-up

## Ferramentas e Recursos

- Sistema CRM
- Base de conhecimento
- Scripts de atendimento
- Escalação para supervisores
- Canais de comunicação

## Métricas de Qualidade

- Tempo de resposta
- Taxa de resolução
- Satisfação do cliente
- NPS (Net Promoter Score)
- Tempo médio de atendimento`,
  fileName: 'guia-atendimento-cliente.pdf',
  fileSize: 2048576,
  mimeType: 'application/pdf',
  category: {
    id: '2',
    name: 'Atendimento',
    color: 'green'
  },
  tags: ['atendimento', 'cliente', 'procedimentos', 'qualidade'],
  language: 'pt',
  visibility: 'internal',
  author: {
    id: '1',
    name: 'Ana Silva',
    avatar: '/avatars/ana.jpg'
  },
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-20T14:30:00Z',
  version: 3,
  status: 'published',
  stats: {
    views: 245,
    downloads: 67,
    likes: 23,
    dislikes: 2,
    comments: 8
  },
  permissions: {
    canEdit: true,
    canDelete: false,
    canComment: true,
    canShare: true
  }
};

const mockComments: Comment[] = [
  {
    id: '1',
    content: 'Excelente guia! Muito completo e bem estruturado. Seria interessante adicionar exemplos práticos de diálogos.',
    author: {
      id: '2',
      name: 'Carlos Santos',
      avatar: '/avatars/carlos.jpg'
    },
    createdAt: '2024-01-16T09:15:00Z',
    type: 'suggestion',
    replies: [
      {
        id: '2',
        content: 'Ótima sugestão! Vou incluir na próxima versão.',
        author: {
          id: '1',
          name: 'Ana Silva',
          avatar: '/avatars/ana.jpg'
        },
        createdAt: '2024-01-16T10:30:00Z',
        type: 'comment'
      }
    ]
  },
  {
    id: '3',
    content: 'Na seção de "Cliente Insatisfeito", poderia detalhar melhor quando escalar para o supervisor?',
    author: {
      id: '3',
      name: 'Maria Oliveira',
      avatar: '/avatars/maria.jpg'
    },
    createdAt: '2024-01-17T14:20:00Z',
    type: 'question'
  },
  {
    id: '4',
    content: 'Documento muito útil para treinamento de novos funcionários.',
    author: {
      id: '4',
      name: 'João Costa',
      avatar: '/avatars/joao.jpg'
    },
    createdAt: '2024-01-18T11:45:00Z',
    type: 'comment'
  }
];

const mockVersions: Version[] = [
  {
    id: '3',
    version: 3,
    title: 'Versão 3.0 - Atualização de procedimentos',
    description: 'Adicionadas seções sobre situações especiais e métricas de qualidade',
    content: 'Conteúdo da versão 3.0 com procedimentos atualizados...',
    author: {
      id: '1',
      name: 'Ana Silva'
    },
    createdAt: '2024-01-20T14:30:00Z',
    changes: [
      'Adicionada seção "Situações Especiais"',
      'Incluídas métricas de qualidade',
      'Melhorados exemplos de procedimentos',
      'Corrigidos erros de formatação'
    ],
    size: 2048576,
    contentHash: 'abc123def456'
  },
  {
    id: '2',
    version: 2,
    title: 'Versão 2.0 - Expansão de conteúdo',
    description: 'Adicionados procedimentos padrão detalhados',
    content: 'Conteúdo da versão 2.0 com procedimentos expandidos...',
    author: {
      id: '1',
      name: 'Ana Silva'
    },
    createdAt: '2024-01-18T09:15:00Z',
    changes: [
      'Expandida seção de procedimentos padrão',
      'Adicionados exemplos práticos',
      'Melhorada estrutura do documento'
    ],
    size: 1843200,
    contentHash: 'def456ghi789'
  },
  {
    id: '1',
    version: 1,
    title: 'Versão 1.0 - Versão inicial',
    description: 'Primeira versão do guia de atendimento',
    content: 'Conteúdo da versão 1.0 inicial do guia...',
    author: {
      id: '1',
      name: 'Ana Silva'
    },
    createdAt: '2024-01-15T10:00:00Z',
    changes: [
      'Criação do documento inicial',
      'Definição de princípios fundamentais',
      'Estrutura básica do guia'
    ],
    size: 1536000,
    contentHash: 'ghi789jkl012'
  }
];

const getVisibilityIcon = (visibility: string) => {
  switch (visibility) {
    case 'public': return Globe;
    case 'internal': return Users;
    case 'private': return Lock;
    default: return Globe;
  }
};

const getCommentTypeColor = (type: string) => {
  switch (type) {
    case 'suggestion': return 'blue';
    case 'question': return 'orange';
    default: return 'gray';
  }
};

export default function DocumentDetailPage() {
  const params = useParams();
  const documentId = params.id as string;
  const [document, setDocument] = useState<Document>(mockDocument);
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<'comment' | 'suggestion' | 'question'>('comment');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showVersionComparison, setShowVersionComparison] = useState(false);
  
  // Hook para gerenciar versões
  const {
    versions,
    isLoading: versionsLoading,
    error: versionsError,
    restoreVersion,
    isRestoringVersion,
    refetchVersions
  } = useDocumentVersions(documentId);

  const VisibilityIcon = getVisibilityIcon(document.visibility);

  const toggleCommentExpansion = (commentId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedComments(newExpanded);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment,
      author: {
        id: 'current-user',
        name: 'Você'
      },
      createdAt: new Date().toISOString(),
      type: commentType
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
    setDocument(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        comments: prev.stats.comments + 1
      }
    }));
  };

  const handleLike = () => {
    if (isDisliked) {
      setIsDisliked(false);
      setDocument(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          dislikes: prev.stats.dislikes - 1
        }
      }));
    }
    
    setIsLiked(!isLiked);
    setDocument(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        likes: isLiked ? prev.stats.likes - 1 : prev.stats.likes + 1
      }
    }));
  };

  const handleDislike = () => {
    if (isLiked) {
      setIsLiked(false);
      setDocument(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          likes: prev.stats.likes - 1
        }
      }));
    }
    
    setIsDisliked(!isDisliked);
    setDocument(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        dislikes: isDisliked ? prev.stats.dislikes - 1 : prev.stats.dislikes + 1
      }
    }));
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

  const handleRestoreVersion = async (versionId: string) => {
    try {
      await restoreVersion(versionId);
      // Atualizar o documento local após restauração
      const restoredVersion = Array.isArray(versions) ? versions.find((v: any) => v.id === versionId) : null;
      if (restoredVersion && typeof restoredVersion === 'object' && 'version' in restoredVersion) {
        setDocument(prev => ({
          ...prev,
          version: (restoredVersion as any).version + 1, // Nova versão criada
          updatedAt: new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error('Erro ao restaurar versão:', error);
    }
  };
  
  const handleVersionCreated = () => {
    refetchVersions();
    setDocument(prev => ({
      ...prev,
      version: prev.version + 1,
      updatedAt: new Date().toISOString()
    }));
  };

  if (showVersionComparison) {
    return (
      <VersionComparison
        versions={Array.isArray(versions) ? versions : mockVersions}
        currentVersionId={document.version.toString()}
        onClose={() => setShowVersionComparison(false)}
        onRestoreVersion={handleRestoreVersion}
      />
    );
  }

  useEffect(() => {
    // Simular incremento de visualização
    setDocument(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        views: prev.stats.views + 1
      }
    }));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/knowledge">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div className="h-6 w-px bg-border" />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Knowledge Hub</span>
          <span>/</span>
          <span>{document.category.name}</span>
        </div>
      </div>

      {/* Document Header */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{document.title}</h1>
              <Badge 
                variant="secondary" 
                className={`bg-${document.category.color}-100 text-${document.category.color}-800`}
              >
                {document.category.name}
              </Badge>
            </div>
            <p className="text-lg text-muted-foreground">{document.description}</p>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{document.author.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDistanceToNow(new Date(document.createdAt))} atrás</span>
              </div>
              <div className="flex items-center gap-1">
                <VisibilityIcon className="h-4 w-4" />
                <span className="capitalize">{document.visibility}</span>
              </div>
              <div className="flex items-center gap-1">
                <FileIcon className="h-4 w-4" />
                <span>{formatBytes(document.fileSize)}</span>
              </div>
              <div className="flex items-center gap-1">
                <History className="h-4 w-4" />
                <span>v{document.version}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={isFavorited ? 'default' : 'outline'}
              size="sm"
              onClick={handleFavorite}
            >
              <Star className={`h-4 w-4 mr-2 ${isFavorited ? 'fill-current' : ''}`} />
              {isFavorited ? 'Favoritado' : 'Favoritar'}
            </Button>
            
            {document.permissions.canShare && (
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
            )}
            
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            
            <CreateVersionDialog
              documentId={documentId}
              currentVersion={document.version}
              onVersionCreated={handleVersionCreated}
              trigger={
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Versão
                </Button>
              }
            />
            
            {document.permissions.canEdit && (
              <Button size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{document.stats.views} visualizações</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            <span>{document.stats.downloads} downloads</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>{document.stats.comments} comentários</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={`h-auto p-1 ${isLiked ? 'text-green-600' : ''}`}
              onClick={handleLike}
            >
              <ThumbsUp className="h-4 w-4 mr-1" />
              <span>{document.stats.likes}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-auto p-1 ${isDisliked ? 'text-red-600' : ''}`}
              onClick={handleDislike}
            >
              <ThumbsDown className="h-4 w-4 mr-1" />
              <span>{document.stats.dislikes}</span>
            </Button>
          </div>
        </div>

        {/* Tags */}
        {document.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {document.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">Conteúdo</TabsTrigger>
          <TabsTrigger value="comments">
            Comentários ({comments.length})
          </TabsTrigger>
          <TabsTrigger value="versions">
            Versões ({Array.isArray(versions) ? versions.length : 0})
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <Card>
            <CardContent className="p-6">
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {document.content}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments">
          <div className="space-y-6">
            {/* Add Comment */}
            {document.permissions.canComment && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Adicionar Comentário</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tipo de comentário</Label>
                    <div className="flex gap-2">
                      {[
                        { value: 'comment', label: 'Comentário', icon: MessageSquare },
                        { value: 'suggestion', label: 'Sugestão', icon: Info },
                        { value: 'question', label: 'Pergunta', icon: AlertCircle }
                      ].map(type => {
                        const Icon = type.icon;
                        return (
                          <Button
                            key={type.value}
                            variant={commentType === type.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCommentType(type.value as any)}
                          >
                            <Icon className="h-4 w-4 mr-2" />
                            {type.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Comentário</Label>
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Escreva seu comentário..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Comentário
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{comment.author.name}</span>
                              <Badge 
                                variant="outline" 
                                className={`text-xs bg-${getCommentTypeColor(comment.type)}-50 text-${getCommentTypeColor(comment.type)}-700`}
                              >
                                {comment.type === 'comment' && 'Comentário'}
                                {comment.type === 'suggestion' && 'Sugestão'}
                                {comment.type === 'question' && 'Pergunta'}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.createdAt))} atrás
                            </div>
                          </div>
                        </div>
                        
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <p className="text-sm leading-relaxed">{comment.content}</p>
                      
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="space-y-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleCommentExpansion(comment.id)}
                            className="h-auto p-0 text-xs"
                          >
                            {expandedComments.has(comment.id) ? (
                              <ChevronDown className="h-3 w-3 mr-1" />
                            ) : (
                              <ChevronRight className="h-3 w-3 mr-1" />
                            )}
                            {comment.replies.length} resposta{comment.replies.length > 1 ? 's' : ''}
                          </Button>
                          
                          {expandedComments.has(comment.id) && (
                            <div className="ml-6 space-y-3 border-l-2 border-muted pl-4">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                                      <User className="h-3 w-3" />
                                    </div>
                                    <span className="text-sm font-medium">{reply.author.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {formatDistanceToNow(new Date(reply.createdAt))} atrás
                                    </span>
                                  </div>
                                  <p className="text-sm leading-relaxed ml-8">{reply.content}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 pt-2">
                        <Button variant="ghost" size="sm" className="h-auto p-1 text-xs">
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          Útil
                        </Button>
                        <Button variant="ghost" size="sm" className="h-auto p-1 text-xs">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Responder
                        </Button>
                        {comment.type === 'question' && (
                          <Button variant="ghost" size="sm" className="h-auto p-1 text-xs text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Marcar como resolvida
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="versions">
          <div className="space-y-4">
            {versionsLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="text-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground">Carregando versões...</p>
                </div>
              </div>
            )}
            
            {versionsError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Erro ao carregar versões: {versionsError}
                </p>
              </div>
            )}
            
            {(Array.isArray(versions) ? versions : mockVersions).map((version: any) => (
              <Card key={version.id}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant={version.version === document.version ? 'default' : 'secondary'}>
                            v{version.version}
                            {version.version === document.version && ' (atual)'}
                          </Badge>
                          <h3 className="font-medium">{version.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {version.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                          <span>{version.author.name}</span>
                          <span>{formatDistanceToNow(new Date(version.createdAt))} atrás</span>
                          <span>{formatBytes(version.size)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowVersionComparison(true)}
                        >
                          <GitCompare className="h-4 w-4 mr-2" />
                          Comparar
                        </Button>
                        {version.version !== document.version && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRestoreVersion(version.id)}
                            disabled={isRestoringVersion}
                          >
                            {isRestoringVersion ? (
                              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : (
                              <RotateCcw className="h-4 w-4 mr-2" />
                            )}
                            Restaurar
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">Alterações:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {version.changes.map((change: any, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-green-600 mt-1">•</span>
                            <span>{change}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{document.stats.views}</div>
                <div className="text-sm text-muted-foreground">Visualizações</div>
                <div className="text-xs text-green-600 mt-1">+12% esta semana</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{document.stats.downloads}</div>
                <div className="text-sm text-muted-foreground">Downloads</div>
                <div className="text-xs text-green-600 mt-1">+8% esta semana</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{document.stats.likes}</div>
                <div className="text-sm text-muted-foreground">Curtidas</div>
                <div className="text-xs text-green-600 mt-1">+15% esta semana</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{document.stats.comments}</div>
                <div className="text-sm text-muted-foreground">Comentários</div>
                <div className="text-xs text-green-600 mt-1">+25% esta semana</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}