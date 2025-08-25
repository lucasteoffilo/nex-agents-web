'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database, Plus, Trash2, Search, FileText, Link, Settings, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface KnowledgeConfigProps {
  agentId: string;
  onConfigChange: () => void;
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

const mockConfig: KnowledgeConfiguration = {
  selectedCollections: ['collection-001', 'collection-002'],
  availableCollections: [
    {
      id: 'collection-001',
      name: 'Base de Conhecimento - Vendas',
      description: 'Documentos relacionados a processos de vendas e produtos',
      documentCount: 45,
      status: 'active',
      lastSync: '2024-01-20T10:30:00Z',
      size: 8388608
    },
    {
      id: 'collection-002',
      name: 'FAQ - Suporte Técnico',
      description: 'Perguntas frequentes e soluções técnicas',
      documentCount: 128,
      status: 'active',
      lastSync: '2024-01-20T09:15:00Z',
      size: 4194304
    },
    {
      id: 'collection-003',
      name: 'Manual do Produto',
      description: 'Documentação técnica completa dos produtos',
      documentCount: 67,
      status: 'syncing',
      lastSync: '2024-01-19T16:45:00Z',
      size: 12582912
    },
    {
      id: 'collection-004',
      name: 'Políticas Internas',
      description: 'Políticas e procedimentos da empresa',
      documentCount: 23,
      status: 'error',
      lastSync: '2024-01-18T14:20:00Z',
      size: 2097152
    }
  ],
  searchSettings: {
    similarityThreshold: 0.7,
    maxResults: 5,
    includeMetadata: true,
    enableSemanticSearch: true,
    contextWindow: 2000
  },
  externalSources: [
    {
      id: 'source-001',
      name: 'API de Produtos',
      type: 'api',
      url: 'https://api.empresa.com/produtos',
      enabled: true,
      lastSync: '2024-01-20T08:00:00Z'
    },
    {
      id: 'source-002',
      name: 'Site Corporativo',
      type: 'website',
      url: 'https://www.empresa.com',
      enabled: false
    }
  ],
  enableWebSearch: false,
  webSearchSettings: {
    maxResults: 3,
    sources: ['google', 'bing'],
    language: 'pt',
    safeSearch: true
  },
  documentProcessing: {
    chunkSize: 1000,
    chunkOverlap: 200,
    enableOCR: true,
    supportedFormats: ['pdf', 'docx', 'txt', 'md']
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'syncing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
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

export default function KnowledgeConfig({ agentId, onConfigChange }: KnowledgeConfigProps) {
  const [config, setConfig] = useState<KnowledgeConfiguration>(mockConfig);

  const handleConfigUpdate = (key: keyof KnowledgeConfiguration, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    onConfigChange();
  };

  const handleCollectionToggle = (collectionId: string, checked: boolean) => {
    const updated = checked 
      ? [...config.selectedCollections, collectionId]
      : config.selectedCollections.filter(id => id !== collectionId);
    handleConfigUpdate('selectedCollections', updated);
  };

  const handleSearchSettingUpdate = (key: keyof SearchSettings, value: any) => {
    const updated = { ...config.searchSettings, [key]: value };
    handleConfigUpdate('searchSettings', updated);
  };

  const handleWebSearchSettingUpdate = (key: keyof WebSearchSettings, value: any) => {
    const updated = { ...config.webSearchSettings, [key]: value };
    handleConfigUpdate('webSearchSettings', updated);
  };

  const handleDocumentProcessingUpdate = (key: keyof DocumentProcessingSettings, value: any) => {
    const updated = { ...config.documentProcessing, [key]: value };
    handleConfigUpdate('documentProcessing', updated);
  };

  const toggleExternalSource = (sourceId: string) => {
    const updated = config.externalSources.map(source => 
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
    handleConfigUpdate('externalSources', [...config.externalSources, newSource]);
  };

  const removeExternalSource = (sourceId: string) => {
    const filtered = config.externalSources.filter(source => source.id !== sourceId);
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
          {config.availableCollections.map((collection) => (
            <div key={collection.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={config.selectedCollections.includes(collection.id)}
                  onCheckedChange={(checked) => handleCollectionToggle(collection.id, checked as boolean)}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{collection.name}</h4>
                    <Badge className={getStatusColor(collection.status)}>
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
              <Badge variant="outline">{config.searchSettings.similarityThreshold}</Badge>
            </div>
            <Slider
              value={[config.searchSettings.similarityThreshold]}
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
              <Badge variant="outline">{config.searchSettings.maxResults}</Badge>
            </div>
            <Slider
              value={[config.searchSettings.maxResults]}
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
              <Badge variant="outline">{config.searchSettings.contextWindow} chars</Badge>
            </div>
            <Slider
              value={[config.searchSettings.contextWindow]}
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
                checked={config.searchSettings.enableSemanticSearch}
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
                checked={config.searchSettings.includeMetadata}
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
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {config.externalSources.map((source) => (
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
                  <Badge variant="outline">{config.webSearchSettings.maxResults}</Badge>
                </div>
                <Slider
                  value={[config.webSearchSettings.maxResults]}
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
                    value={config.webSearchSettings.language} 
                    onValueChange={(value) => handleWebSearchSettingUpdate('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                    checked={config.webSearchSettings.safeSearch}
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
                <Badge variant="outline">{config.documentProcessing.chunkSize} chars</Badge>
              </div>
              <Slider
                value={[config.documentProcessing.chunkSize]}
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
                <Badge variant="outline">{config.documentProcessing.chunkOverlap} chars</Badge>
              </div>
              <Slider
                value={[config.documentProcessing.chunkOverlap]}
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
              checked={config.documentProcessing.enableOCR}
              onCheckedChange={(checked) => handleDocumentProcessingUpdate('enableOCR', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Formatos Suportados</Label>
            <div className="flex flex-wrap gap-2">
              {config.documentProcessing.supportedFormats.map((format) => (
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