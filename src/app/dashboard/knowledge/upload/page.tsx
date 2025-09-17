'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import {
  Upload,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  X,
  Check,
  AlertCircle,
  Loader2,
  Plus,
  Settings,
  Tag,
  Globe,
  Eye,
  EyeOff,
  Users,
  Lock
} from 'lucide-react';
import { formatBytes } from '@/lib/utils';

interface UploadFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  metadata?: {
    title?: string;
    description?: string;
    categoryId?: string;
    tags?: string[];
    language?: string;
    visibility?: 'public' | 'internal' | 'private';
  };
}

interface UploadSettings {
  defaultCategory?: string;
  defaultLanguage: string;
  defaultVisibility: 'public' | 'internal' | 'private';
  autoProcess: boolean;
  extractText: boolean;
  generateSummary: boolean;
  detectLanguage: boolean;
  enableOCR: boolean;
}

const categories = [
  { id: '1', name: 'Documentação Técnica', color: 'blue' },
  { id: '2', name: 'Atendimento', color: 'green' },
  { id: '3', name: 'Vendas', color: '#0072b9' },
  { id: '4', name: 'Jurídico', color: 'red' },
  { id: '5', name: 'RH', color: 'orange' },
  { id: '6', name: 'Marketing', color: 'pink' }
];

const languages = [
  { id: 'pt', name: 'Português' },
  { id: 'en', name: 'Inglês' },
  { id: 'es', name: 'Espanhol' },
  { id: 'fr', name: 'Francês' }
];

const visibilityOptions = [
  { id: 'public', name: 'Público', description: 'Visível para todos', icon: Globe },
  { id: 'internal', name: 'Interno', description: 'Visível para a organização', icon: Users },
  { id: 'private', name: 'Privado', description: 'Visível apenas para você', icon: Lock }
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
    case 'uploading': case 'processing': return 'warning';
    case 'error': return 'destructive';
    default: return 'secondary';
  }
};

export default function KnowledgeUploadPage() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<UploadSettings>({
    defaultLanguage: 'pt',
    defaultVisibility: 'internal',
    autoProcess: true,
    extractText: true,
    generateSummary: true,
    detectLanguage: true,
    enableOCR: false
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    const uploadFiles: UploadFile[] = newFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'pending',
      progress: 0,
      metadata: {
        title: file.name.replace(/\.[^/.]+$/, ''),
        categoryId: settings.defaultCategory,
        language: settings.defaultLanguage,
        visibility: settings.defaultVisibility,
        tags: []
      }
    }));
    
    setFiles(prev => [...prev, ...uploadFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const updateFileMetadata = (id: string, metadata: Partial<UploadFile['metadata']>) => {
    setFiles(prev => prev.map(f => 
      f.id === id 
        ? { ...f, metadata: { ...f.metadata, ...metadata } }
        : f
    ));
  };

  const addTag = (fileId: string, tag: string) => {
    if (!tag.trim()) return;
    
    setFiles(prev => prev.map(f => {
      if (f.id === fileId) {
        const currentTags = f.metadata?.tags || [];
        if (!currentTags.includes(tag)) {
          return {
            ...f,
            metadata: {
              ...f.metadata,
              tags: [...currentTags, tag]
            }
          };
        }
      }
      return f;
    }));
  };

  const removeTag = (fileId: string, tag: string) => {
    setFiles(prev => prev.map(f => {
      if (f.id === fileId) {
        return {
          ...f,
          metadata: {
            ...f.metadata,
            tags: f.metadata?.tags?.filter(t => t !== tag) || []
          }
        };
      }
      return f;
    }));
  };

  const simulateUpload = async (file: UploadFile) => {
    // Simular upload
    setFiles(prev => prev.map(f => 
      f.id === file.id ? { ...f, status: 'uploading' } : f
    ));

    // Simular progresso
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, progress } : f
      ));
    }

    // Simular processamento
    setFiles(prev => prev.map(f => 
      f.id === file.id ? { ...f, status: 'processing', progress: 0 } : f
    ));

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Completar
    setFiles(prev => prev.map(f => 
      f.id === file.id ? { ...f, status: 'completed', progress: 100 } : f
    ));
  };

  const uploadFile = (file: UploadFile) => {
    simulateUpload(file);
  };

  const uploadAllFiles = () => {
    files.filter(f => f.status === 'pending').forEach(uploadFile);
  };

  const clearCompleted = () => {
    setFiles(prev => prev.filter(f => f.status !== 'completed'));
  };

  const pendingFiles = files.filter(f => f.status === 'pending');
  const uploadingFiles = files.filter(f => ['uploading', 'processing'].includes(f.status));
  const completedFiles = files.filter(f => f.status === 'completed');
  const errorFiles = files.filter(f => f.status === 'error');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload de Documentos</h1>
          <p className="text-muted-foreground">
            Faça upload de documentos para a base de conhecimento
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
          {pendingFiles.length > 0 && (
            <Button onClick={uploadAllFiles}>
              <Upload className="h-4 w-4 mr-2" />
              Enviar Todos ({pendingFiles.length})
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{pendingFiles.length}</div>
            <div className="text-sm text-muted-foreground">Pendentes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{uploadingFiles.length}</div>
            <div className="text-sm text-muted-foreground">Processando</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{completedFiles.length}</div>
            <div className="text-sm text-muted-foreground">Concluídos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{errorFiles.length}</div>
            <div className="text-sm text-muted-foreground">Erros</div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Settings */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle>Configurações de Upload</CardTitle>
            <CardDescription>
              Configure as opções padrão para novos uploads
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria Padrão</Label>
                <Select
                  value={settings.defaultCategory || ''}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, defaultCategory: value }))}
                >
                  <option value="">Selecionar categoria...</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Idioma Padrão</Label>
                <Select
                  value={settings.defaultLanguage}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, defaultLanguage: value }))}
                >
                  {languages.map(language => (
                    <option key={language.id} value={language.id}>
                      {language.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Visibilidade Padrão</Label>
              <div className="grid grid-cols-3 gap-2">
                {visibilityOptions.map(option => {
                  const Icon = option.icon;
                  return (
                    <Button
                      key={option.id}
                      variant={settings.defaultVisibility === option.id ? 'default' : 'outline'}
                      className="h-auto p-3 flex flex-col items-center gap-2"
                      onClick={() => setSettings(prev => ({ ...prev, defaultVisibility: option.id as any }))}
                    >
                      <Icon className="h-4 w-4" />
                      <div className="text-center">
                        <div className="text-sm font-medium">{option.name}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { key: 'autoProcess', label: 'Processar automaticamente' },
                { key: 'extractText', label: 'Extrair texto' },
                { key: 'generateSummary', label: 'Gerar resumo' },
                { key: 'detectLanguage', label: 'Detectar idioma' },
                { key: 'enableOCR', label: 'Habilitar OCR' }
              ].map(option => (
                <label key={option.key} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[option.key as keyof UploadSettings] as boolean}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      [option.key]: e.target.checked 
                    }))}
                    className="rounded"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Drop Zone */}
      <Card 
        className={`border-2 border-dashed transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-12 text-center">
          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            Arraste arquivos aqui ou clique para selecionar
          </h3>
          <p className="text-muted-foreground mb-4">
            Suporte para PDF, Word, PowerPoint, Excel, imagens e mais
          </p>
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,.html,.rtf,.odt,.jpg,.jpeg,.png,.gif,.bmp,.tiff"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button className="cursor-pointer">
              <Plus className="h-4 w-4 mr-2" />
              Selecionar Arquivos
            </Button>
          </label>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Arquivos ({files.length})
            </h2>
            {completedFiles.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearCompleted}>
                Limpar Concluídos
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {files.map((uploadFile) => {
              const FileIcon = getFileIcon(uploadFile.file.type);
              
              return (
                <Card key={uploadFile.id} className="p-4">
                  <div className="space-y-4">
                    {/* File Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-muted rounded-lg">
                          <FileIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {uploadFile.metadata?.title || uploadFile.file.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatBytes(uploadFile.file.size)} • {uploadFile.file.type}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(uploadFile.status) as any}>
                          {uploadFile.status === 'pending' && 'Pendente'}
                          {uploadFile.status === 'uploading' && (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Enviando
                            </>
                          )}
                          {uploadFile.status === 'processing' && (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Processando
                            </>
                          )}
                          {uploadFile.status === 'completed' && (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Concluído
                            </>
                          )}
                          {uploadFile.status === 'error' && (
                            <>
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Erro
                            </>
                          )}
                        </Badge>
                        
                        {uploadFile.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(uploadFile.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {['uploading', 'processing'].includes(uploadFile.status) && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>
                            {uploadFile.status === 'uploading' ? 'Enviando...' : 'Processando...'}
                          </span>
                          <span>{uploadFile.progress}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadFile.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Metadata Form */}
                    {uploadFile.status === 'pending' && (
                      <div className="space-y-4 border-t pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Título</Label>
                            <Input
                              value={uploadFile.metadata?.title || ''}
                              onChange={(e) => updateFileMetadata(uploadFile.id, { title: e.target.value })}
                              placeholder="Título do documento"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Categoria</Label>
                            <Select
                              value={uploadFile.metadata?.categoryId || ''}
                              onValueChange={(value) => updateFileMetadata(uploadFile.id, { categoryId: value })}
                            >
                              <option value="">Selecionar categoria...</option>
                              {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))}
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Descrição</Label>
                          <Textarea
                            value={uploadFile.metadata?.description || ''}
                            onChange={(e) => updateFileMetadata(uploadFile.id, { description: e.target.value })}
                            placeholder="Descrição do documento"
                            rows={2}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Idioma</Label>
                            <Select
                              value={uploadFile.metadata?.language || settings.defaultLanguage}
                              onValueChange={(value) => updateFileMetadata(uploadFile.id, { language: value })}
                            >
                              {languages.map(language => (
                                <option key={language.id} value={language.id}>
                                  {language.name}
                                </option>
                              ))}
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Visibilidade</Label>
                            <Select
                              value={uploadFile.metadata?.visibility || settings.defaultVisibility}
                              onValueChange={(value) => updateFileMetadata(uploadFile.id, { visibility: value as any })}
                            >
                              {visibilityOptions.map(option => (
                                <option key={option.id} value={option.id}>
                                  {option.name}
                                </option>
                              ))}
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Tags</Label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {uploadFile.metadata?.tags?.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                #{tag}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="ml-1 h-3 w-3 p-0"
                                  onClick={() => removeTag(uploadFile.id, tag)}
                                >
                                  <X className="h-2 w-2" />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                          <Input
                            placeholder="Adicionar tag..."
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const target = e.target as HTMLInputElement;
                                if (target.value.trim()) {
                                  addTag(uploadFile.id, target.value.trim());
                                  target.value = '';
                                }
                              }
                            }}
                          />
                        </div>

                        <div className="flex justify-end">
                          <Button onClick={() => simulateUpload(uploadFile)}>
                            <Upload className="h-4 w-4 mr-2" />
                            Enviar Arquivo
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {uploadFile.status === 'error' && uploadFile.error && (
                      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-destructive">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">Erro no upload</span>
                        </div>
                        <p className="text-sm text-destructive/80 mt-1">
                          {uploadFile.error}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}