'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
  Settings,
  Save,
  Trash2,
  TestTube,
  Database,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { DocumentUpload } from './document-upload';

interface Collection {
  id: string;
  name: string;
  description: string;
  slug: string;
  tags: string[];
  visibility: 'public' | 'private' | 'restricted';
  isActive: boolean;
  settings: {
    isPublic: boolean;
    allowDuplicates: boolean;
    autoIndex: boolean;
    chunkSize: number;
    chunkOverlap: number;
    maxDocuments: number;
    retentionDays: number;
  };
  embeddingConfig: {
    model: string;
    dimensions: number;
    distance: 'Cosine' | 'Euclidean' | 'Dot';
    provider: 'openai' | 'huggingface' | 'local';
  };
}

interface TestResult {
  step: string;
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

interface CollectionSettingsProps {
  collection: Collection;
  onUpdate?: (collection: Collection) => void;
  onDelete?: () => void;
}

export function CollectionSettings({ collection, onUpdate, onDelete }: CollectionSettingsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [showTestDialog, setShowTestDialog] = useState(false);
  
  const [formData, setFormData] = useState<Collection>(collection);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implementar chamada para API de atualização
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay
      
      if (onUpdate) {
        onUpdate(formData);
      }
      
      setIsEditing(false);
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // TODO: Implementar chamada para API de exclusão
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay
      
      if (onDelete) {
        onDelete();
      }
      
      toast.success('Collection excluída com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir collection');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTestQdrant = async () => {
    setIsTesting(true);
    setTestResults([]);
    setShowTestDialog(true);
    
    try {
      // Simular teste de integração com Qdrant
      const tests = [
        { step: 'connection', message: 'Testando conexão com Qdrant...' },
        { step: 'collection_info', message: 'Verificando informações da collection...' },
        { step: 'vector_operations', message: 'Testando operações de vetor...' },
        { step: 'search_test', message: 'Testando busca vetorial...' },
      ];
      
      for (const test of tests) {
        setTestResults(prev => [...prev, { ...test, success: false }]);
        
        // Simular delay do teste
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simular resultado (90% de chance de sucesso)
        const success = Math.random() > 0.1;
        
        setTestResults(prev => 
          prev.map(r => 
            r.step === test.step 
              ? { 
                  ...r, 
                  success, 
                  message: success 
                    ? `${test.message} ✓` 
                    : `${test.message} ✗`,
                  error: success ? undefined : 'Erro simulado para demonstração'
                }
              : r
          )
        );
      }
      
      const allSuccess = testResults.every(r => r.success);
      toast.success(
        allSuccess 
          ? 'Todos os testes passaram!' 
          : 'Alguns testes falharam. Verifique os detalhes.'
      );
      
    } catch (error) {
      toast.error('Erro ao executar testes');
    } finally {
      setIsTesting(false);
    }
  };

  const getVisibilityBadge = (visibility: string) => {
    const variants = {
      public: 'default',
      private: 'secondary',
      restricted: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[visibility as keyof typeof variants] || 'outline'}>
        {visibility === 'public' ? 'Público' : 
         visibility === 'private' ? 'Privado' : 'Restrito'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações da Collection
              </CardTitle>
              <CardDescription>
                Gerencie as configurações e permissões desta collection
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={handleTestQdrant} disabled={isTesting}>
                    {isTesting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <TestTube className="h-4 w-4 mr-2" />
                    )}
                    Testar Qdrant
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Teste de Integração Qdrant</DialogTitle>
                    <DialogDescription>
                      Verificando a integração com o banco de dados vetorial
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {testResults.map((result, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="mt-0.5">
                          {isTesting && index === testResults.length - 1 ? (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                          ) : result.success ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{result.message}</p>
                          {result.error && (
                            <p className="text-sm text-red-600 mt-1">{result.error}</p>
                          )}
                          {result.data && (
                            <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-x-auto">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    ))}
                    {testResults.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Database className="h-12 w-12 mx-auto mb-4" />
                        <p>Clique em "Testar Qdrant" para iniciar os testes</p>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowTestDialog(false)}
                      disabled={isTesting}
                    >
                      Fechar
                    </Button>
                    <Button 
                      onClick={handleTestQdrant} 
                      disabled={isTesting}
                    >
                      {isTesting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Testando...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Executar Novamente
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(collection);
                    }}
                    disabled={isSaving}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Salvar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Nome da Collection</Label>
              {isEditing ? (
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              ) : (
                <Input value={collection.name} readOnly />
              )}
            </div>
            
            <div className="grid gap-2">
              <Label>Descrição</Label>
              {isEditing ? (
                <Textarea 
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              ) : (
                <Textarea value={collection.description} readOnly rows={3} />
              )}
            </div>
            
            <div className="grid gap-2">
              <Label>Slug</Label>
              <Input value={collection.slug} readOnly />
            </div>
            
            <div className="grid gap-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-1">
                {collection.tags.map((tag) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Visibilidade</Label>
              {isEditing ? (
                <Select 
                  value={formData.visibility}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, visibility: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Público</SelectItem>
                    <SelectItem value="private">Privado</SelectItem>
                    <SelectItem value="restricted">Restrito</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div>{getVisibilityBadge(collection.visibility)}</div>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label>Status</Label>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <Switch 
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                ) : (
                  <Badge variant={collection.isActive ? 'default' : 'secondary'}>
                    {collection.isActive ? 'Ativa' : 'Inativa'}
                  </Badge>
                )}
                {isEditing && (
                  <span className="text-sm text-muted-foreground">
                    {formData.isActive ? 'Ativa' : 'Inativa'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações Avançadas */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações Avançadas</CardTitle>
          <CardDescription>
            Configurações de processamento e embedding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Tamanho do Chunk</Label>
              {isEditing ? (
                <Input 
                  type="number"
                  value={formData.settings.chunkSize}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, chunkSize: parseInt(e.target.value) }
                  }))}
                />
              ) : (
                <Input value={collection.settings.chunkSize} readOnly />
              )}
            </div>
            
            <div className="grid gap-2">
              <Label>Sobreposição do Chunk</Label>
              {isEditing ? (
                <Input 
                  type="number"
                  value={formData.settings.chunkOverlap}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, chunkOverlap: parseInt(e.target.value) }
                  }))}
                />
              ) : (
                <Input value={collection.settings.chunkOverlap} readOnly />
              )}
            </div>
            
            <div className="grid gap-2">
              <Label>Máximo de Documentos</Label>
              {isEditing ? (
                <Input 
                  type="number"
                  value={formData.settings.maxDocuments}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, maxDocuments: parseInt(e.target.value) }
                  }))}
                />
              ) : (
                <Input value={collection.settings.maxDocuments} readOnly />
              )}
            </div>
            
            <div className="grid gap-2">
              <Label>Retenção (dias)</Label>
              {isEditing ? (
                <Input 
                  type="number"
                  value={formData.settings.retentionDays}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, retentionDays: parseInt(e.target.value) }
                  }))}
                />
              ) : (
                <Input value={collection.settings.retentionDays} readOnly />
              )}
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h4 className="font-medium">Configurações de Embedding</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Modelo</Label>
                {isEditing ? (
                  <Select 
                    value={formData.embeddingConfig.model}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      embeddingConfig: { ...prev.embeddingConfig, model: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text-embedding-ada-002">text-embedding-ada-002</SelectItem>
                      <SelectItem value="text-embedding-3-small">text-embedding-3-small</SelectItem>
                      <SelectItem value="text-embedding-3-large">text-embedding-3-large</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input value={collection.embeddingConfig.model} readOnly />
                )}
              </div>
              
              <div className="grid gap-2">
                <Label>Dimensões</Label>
                <Input value={collection.embeddingConfig.dimensions} readOnly />
              </div>
              
              <div className="grid gap-2">
                <Label>Distância</Label>
                {isEditing ? (
                  <Select 
                    value={formData.embeddingConfig.distance}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      embeddingConfig: { ...prev.embeddingConfig, distance: value as any }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cosine">Cosine</SelectItem>
                      <SelectItem value="Euclidean">Euclidean</SelectItem>
                      <SelectItem value="Dot">Dot Product</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input value={collection.embeddingConfig.distance} readOnly />
                )}
              </div>
              
              <div className="grid gap-2">
                <Label>Provedor</Label>
                <Input value={collection.embeddingConfig.provider} readOnly />
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h4 className="font-medium">Opções</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Permitir Duplicatas</Label>
                  <p className="text-sm text-muted-foreground">Permite documentos duplicados na collection</p>
                </div>
                {isEditing ? (
                  <Switch 
                    checked={formData.settings.allowDuplicates}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, allowDuplicates: checked }
                    }))}
                  />
                ) : (
                  <Badge variant={collection.settings.allowDuplicates ? 'default' : 'secondary'}>
                    {collection.settings.allowDuplicates ? 'Sim' : 'Não'}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Indexação Automática</Label>
                  <p className="text-sm text-muted-foreground">Indexa automaticamente novos documentos</p>
                </div>
                {isEditing ? (
                  <Switch 
                    checked={formData.settings.autoIndex}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, autoIndex: checked }
                    }))}
                  />
                ) : (
                  <Badge variant={collection.settings.autoIndex ? 'default' : 'secondary'}>
                    {collection.settings.autoIndex ? 'Sim' : 'Não'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload de Documentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload de Documentos
          </CardTitle>
          <CardDescription>
            Adicione documentos à esta coleção para expandir a base de conhecimento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentUpload 
            collectionId={collection.id}
            onUploadComplete={(documents) => {
              toast.success(`${documents.length} documento(s) enviado(s) com sucesso!`);
              // Aqui você pode atualizar a lista de documentos ou recarregar dados
            }}
          />
        </CardContent>
      </Card>

      {/* Zona de Perigo */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Zona de Perigo
          </CardTitle>
          <CardDescription>
            Ações irreversíveis que afetam permanentemente esta collection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Excluir Collection
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso excluirá permanentemente a collection
                  "{collection.name}" e todos os seus documentos, incluindo os dados no Qdrant.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Excluir Permanentemente
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}