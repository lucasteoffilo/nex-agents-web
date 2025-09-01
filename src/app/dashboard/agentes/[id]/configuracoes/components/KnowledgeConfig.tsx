'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database, Plus, Trash2, Search, FileText, Link, Settings, AlertCircle, FolderOpen } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Agent } from '@/services/agent-service';
import collectionService, { Collection as CollectionType } from '@/services/collection-service';

interface KnowledgeConfigProps {
  agent: Agent;
  initialConfig?: KnowledgeConfiguration;
  onConfigChange: (config: KnowledgeConfiguration) => void;
}

interface KnowledgeConfiguration {
  selectedCollections: string[];
  availableCollections: Collection[];
  searchSettings: SearchSettings;
  externalSources: ExternalSource[];
  enableWebSearch: boolean;
  webSearchSettings: WebSearchSettings;
  documentProcessing: DocumentProcessingSettings;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  documentCount: number;
  status: 'active' | 'syncing' | 'error';
  lastSync: string;
  size: number;
}

interface SearchSettings {
  similarityThreshold: number;
  maxResults: number;
  includeMetadata: boolean;
  enableSemanticSearch: boolean;
  contextWindow: number;
}

interface ExternalSource {
  id: string;
  name: string;
  type: 'api' | 'database' | 'website';
  url: string;
  enabled: boolean;
  lastSync?: string;
}

interface WebSearchSettings {
  maxResults: number;
  sources: string[];
  language: string;
  safeSearch: boolean;
}

interface DocumentProcessingSettings {
  chunkSize: number;
  chunkOverlap: number;
  enableOCR: boolean;
  supportedFormats: string[];
}

const getDefaultConfig = (agent: Agent): KnowledgeConfiguration => ({
  selectedCollections: Array.isArray(agent.knowledgeBase?.selectedCollections) ? agent.knowledgeBase.selectedCollections : [],
  availableCollections: Array.isArray(agent.knowledgeBase?.availableCollections) ? agent.knowledgeBase.availableCollections : [],
  searchSettings: {
    similarityThreshold: agent.knowledgeBase?.searchSettings?.similarityThreshold ?? 0.7,
    maxResults: agent.knowledgeBase?.searchSettings?.maxResults ?? 5,
    includeMetadata: agent.knowledgeBase?.searchSettings?.includeMetadata ?? true,
    enableSemanticSearch: agent.knowledgeBase?.searchSettings?.enableSemanticSearch ?? true,
    contextWindow: agent.knowledgeBase?.searchSettings?.contextWindow ?? 2000
  },
  externalSources: Array.isArray(agent.knowledgeBase?.externalSources) ? agent.knowledgeBase.externalSources : [],
  enableWebSearch: agent.knowledgeBase?.enableWebSearch ?? false,
  webSearchSettings: {
    maxResults: agent.knowledgeBase?.webSearchSettings?.maxResults ?? 3,
    sources: Array.isArray(agent.knowledgeBase?.webSearchSettings?.sources) ? agent.knowledgeBase.webSearchSettings.sources : ['google', 'bing'],
    language: agent.knowledgeBase?.webSearchSettings?.language ?? 'pt',
    safeSearch: agent.knowledgeBase?.webSearchSettings?.safeSearch ?? true
  },
  documentProcessing: {
    chunkSize: agent.knowledgeBase?.documentProcessing?.chunkSize ?? 1000,
    chunkOverlap: agent.knowledgeBase?.documentProcessing?.chunkOverlap ?? 200,
    enableOCR: agent.knowledgeBase?.documentProcessing?.enableOCR ?? true,
    supportedFormats: Array.isArray(agent.knowledgeBase?.documentProcessing?.supportedFormats) ? agent.knowledgeBase.documentProcessing.supportedFormats : ['pdf', 'docx', 'txt', 'md']
  }
});

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'success';
    case 'syncing': return 'warning';
    case 'error': return 'destructive';
    default: return 'secondary';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return 'Ativo';
    case 'syncing': return 'Sincronizando';
    case 'error': return 'Erro';
    default: return status;
  }
};

const formatFileSize = (bytes: number) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export default function KnowledgeConfig({ agent, initialConfig, onConfigChange }: KnowledgeConfigProps) {
  const [config, setConfig] = useState<KnowledgeConfiguration>(() => 
    initialConfig || getDefaultConfig(agent)
  );
  const [availableCollections, setAvailableCollections] = useState<CollectionType[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(true);

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    } else {
      setConfig(getDefaultConfig(agent));
    }
  }, [agent, initialConfig]);

  // Carregar coleções disponíveis
  useEffect(() => {
    const loadCollections = async () => {
      try {
        setLoadingCollections(true);
        const response = await collectionService.getCollections();
        if (response.success && response.data) {
          const collections = response.data.collections || [];
          setAvailableCollections(collections);
          
          // Atualizar config com as coleções disponíveis
          setConfig(prev => ({
            ...prev,
            availableCollections: collections.map(col => ({
              id: col.id,
              name: col.name,
              description: col.description || '',
              documentCount: col.documentCount || 0,
              status: col.status === 'active' ? 'active' : 'error',
              lastSync: col.updatedAt,
              size: col.totalSize || 0
            }))
          }));
        }
      } catch (error) {
        console.error('Erro ao carregar coleções:', error);
      } finally {
        setLoadingCollections(false);
      }
    };

    loadCollections();
  }, []);

  const handleConfigUpdate = (key: keyof KnowledgeConfiguration, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  const handleCollectionToggle = (collectionId: string, checked: boolean) => {
    const currentCollections = config.selectedCollections || [];
    const updated = checked 
      ? [...currentCollections, collectionId]
      : currentCollections.filter(id => id !== collectionId);
    handleConfigUpdate('selectedCollections', updated);
  };

  const handleSearchSettingUpdate = (key: keyof SearchSettings, value: any) => {
    const currentSettings = config.searchSettings || {
      similarityThreshold: 0.7,
      maxResults: 5,
      includeMetadata: true,
      enableSemanticSearch: true,
      contextWindow: 2000
    };
    const updated = { ...currentSettings, [key]: value };
    handleConfigUpdate('searchSettings', updated);
  };

  const handleWebSearchSettingUpdate = (key: keyof WebSearchSettings, value: any) => {
    const currentSettings = config.webSearchSettings || {
      maxResults: 3,
      sources: ['google', 'bing'],
      language: 'pt',
      safeSearch: true
    };
    const updated = { ...currentSettings, [key]: value };
    handleConfigUpdate('webSearchSettings', updated);
  };

  const handleDocumentProcessingUpdate = (key: keyof DocumentProcessingSettings, value: any) => {
    const currentSettings = config.documentProcessing || {
      chunkSize: 1000,
      chunkOverlap: 200,
      enableOCR: true,
      supportedFormats: ['pdf', 'docx', 'txt', 'md']
    };
    const updated = { ...currentSettings, [key]: value };
    handleConfigUpdate('documentProcessing', updated);
  };

  const toggleExternalSource = (sourceId: string) => {
    const currentSources = config.externalSources || [];
    const updated = currentSources.map(source => 
      source.id === sourceId ? { ...source, enabled: !source.enabled } : source
    );
    handleConfigUpdate('externalSources', updated);
  };

  const addExternalSource = () => {
    const newSource: ExternalSource = {
      id: Date.now().toString(),
      name: 'Nova Fonte',
      type: 'api',
      url: '',
      enabled: false
    };
    const currentSources = config.externalSources || [];
    handleConfigUpdate('externalSources', [...currentSources, newSource]);
  };

  const removeExternalSource = (sourceId: string) => {
    const currentSources = config.externalSources || [];
    const filtered = currentSources.filter(source => source.id !== sourceId);
    handleConfigUpdate('externalSources', filtered);
  };

  return (
    <div className="space-y-6">
      {/* Knowledge Base Collections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Coleções de Conhecimento
          </CardTitle>
          <CardDescription>
            Selecione as bases de conhecimento que o agente pode acessar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingCollections ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span>Carregando coleções...</span>
              </div>
            </div>
          ) : (config.availableCollections || []).length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma coleção encontrada</h3>
              <p className="text-muted-foreground mb-4">
                Você ainda não possui coleções de conhecimento.
              </p>
              <Button asChild>
                <a href="/dashboard/knowledge/collections" target="_blank">
                  <span className="inline-flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Criar primeira coleção
                  </span>
                </a>
              </Button>
            </div>
          ) : (
            <>
              {(config.availableCollections || []).map((collection) => (
                <div key={collection.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={(config.selectedCollections || []).includes(collection.id)}
                      onCheckedChange={(checked) => handleCollectionToggle(collection.id, checked as boolean)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{collection.name}</h4>
                        <Badge variant={getStatusColor(collection.status) as any}>
                          {getStatusText(collection.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{collection.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{collection.documentCount} documentos</span>
                        <span>{formatFileSize(collection.size)}</span>
                        <span>Última sync: {new Date(collection.lastSync).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {/* Mostrar coleções selecionadas */}
              {(config.selectedCollections || []).length > 0 && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Coleções Selecionadas ({(config.selectedCollections || []).length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {(config.selectedCollections || [])
                      .map((collectionId) => {
                        const collection = (config.availableCollections || []).find(c => c.id === collectionId);
                        return collection ? (
                          <Badge key={collectionId} variant="secondary">
                            {collection.name}
                          </Badge>
                        ) : null;
                      })
                      .filter(Boolean)}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Search Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Configurações de Busca
          </CardTitle>
          <CardDescription>
            Ajuste como o agente busca e recupera informações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Limiar de Similaridade</Label>
              <Badge variant="outline">{config.searchSettings?.similarityThreshold ?? 0.7}</Badge>
            </div>
            <Slider
              value={[config.searchSettings?.similarityThreshold ?? 0.7]}
              onValueChange={([value]) => handleSearchSettingUpdate('similarityThreshold', value)}
              max={1}
              min={0}
              step={0.1}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Quão similar o conteúdo deve ser para ser considerado relevante (0.0 - 1.0)
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Máximo de Resultados</Label>
              <Badge variant="outline">{config.searchSettings?.maxResults ?? 5}</Badge>
            </div>
            <Slider
              value={[config.searchSettings?.maxResults ?? 5]}
              onValueChange={([value]) => handleSearchSettingUpdate('maxResults', value)}
              max={20}
              min={1}
              step={1}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Número máximo de documentos retornados por busca
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Janela de Contexto</Label>
              <Badge variant="outline">{config.searchSettings?.contextWindow ?? 2000} chars</Badge>
            </div>
            <Slider
              value={[config.searchSettings?.contextWindow ?? 2000]}
              onValueChange={([value]) => handleSearchSettingUpdate('contextWindow', value)}
              max={5000}
              min={500}
              step={100}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Tamanho do contexto extraído de cada documento
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Busca Semântica</Label>
                <p className="text-sm text-muted-foreground">
                  Busca por significado, não apenas palavras-chave
                </p>
              </div>
              <Switch
                checked={config.searchSettings?.enableSemanticSearch ?? true}
                onCheckedChange={(checked) => handleSearchSettingUpdate('enableSemanticSearch', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Incluir Metadados</Label>
                <p className="text-sm text-muted-foreground">
                  Incluir informações sobre fonte e data
                </p>
              </div>
              <Switch
                checked={config.searchSettings?.includeMetadata ?? true}
                onCheckedChange={(checked) => handleSearchSettingUpdate('includeMetadata', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* External Sources */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Fontes Externas
              </CardTitle>
              <CardDescription>
                Configure APIs e fontes de dados externas
              </CardDescription>
            </div>
            <Button onClick={addExternalSource} size="sm">
              <span className="inline-flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Adicionar
              </span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {(config.externalSources || []).map((source) => (
            <div key={source.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <Switch
                  checked={source.enabled}
                  onCheckedChange={() => toggleExternalSource(source.id)}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{source.name}</h4>
                    <Badge variant="outline">{source.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{source.url}</p>
                  {source.lastSync && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Última sync: {new Date(source.lastSync).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => removeExternalSource(source.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Web Search */}
      <Card>
        <CardHeader>
          <CardTitle>Busca na Web</CardTitle>
          <CardDescription>
            Permita que o agente busque informações atualizadas na internet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Habilitar Busca na Web</Label>
              <p className="text-sm text-muted-foreground">
                Permite buscar informações em tempo real na internet
              </p>
            </div>
            <Switch
              checked={config.enableWebSearch}
              onCheckedChange={(checked) => handleConfigUpdate('enableWebSearch', checked)}
            />
          </div>

          {config.enableWebSearch && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Máximo de Resultados Web</Label>
                  <Badge variant="outline">{config.webSearchSettings?.maxResults ?? 3}</Badge>
                </div>
                <Slider
                  value={[config.webSearchSettings?.maxResults ?? 3]}
                  onValueChange={([value]) => handleWebSearchSettingUpdate('maxResults', value)}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Idioma</Label>
                  <Select 
                    value={config.webSearchSettings?.language || 'pt'} 
                    onValueChange={(value) => handleWebSearchSettingUpdate('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o idioma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt">Português</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between pt-6">
                  <Label>Busca Segura</Label>
                  <Switch
                    checked={config.webSearchSettings?.safeSearch ?? true}
                    onCheckedChange={(checked) => handleWebSearchSettingUpdate('safeSearch', checked)}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Processing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Processamento de Documentos
          </CardTitle>
          <CardDescription>
            Configure como os documentos são processados e indexados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Tamanho do Chunk</Label>
                <Badge variant="outline">{config.documentProcessing?.chunkSize ?? 1000} chars</Badge>
              </div>
              <Slider
                value={[config.documentProcessing?.chunkSize ?? 1000]}
                onValueChange={([value]) => handleDocumentProcessingUpdate('chunkSize', value)}
                max={2000}
                min={200}
                step={100}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Tamanho dos pedaços em que os documentos são divididos
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Sobreposição</Label>
                <Badge variant="outline">{config.documentProcessing?.chunkOverlap ?? 200} chars</Badge>
              </div>
              <Slider
                value={[config.documentProcessing?.chunkOverlap ?? 200]}
                onValueChange={([value]) => handleDocumentProcessingUpdate('chunkOverlap', value)}
                max={500}
                min={0}
                step={50}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Sobreposição entre chunks para manter contexto
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>OCR (Reconhecimento de Texto)</Label>
              <p className="text-sm text-muted-foreground">
                Extrair texto de imagens e PDFs escaneados
              </p>
            </div>
            <Switch
              checked={config.documentProcessing?.enableOCR ?? true}
              onCheckedChange={(checked) => handleDocumentProcessingUpdate('enableOCR', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Formatos Suportados</Label>
            <div className="flex flex-wrap gap-2">
              {(config.documentProcessing?.supportedFormats || ['pdf', 'docx', 'txt']).map((format) => (
                <Badge key={format} variant="secondary">
                  .{format}
                </Badge>
              ))}
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Chunks menores oferecem maior precisão, mas podem perder contexto. 
              Chunks maiores mantêm mais contexto, mas podem ser menos precisos.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}