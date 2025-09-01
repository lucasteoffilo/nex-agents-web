'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, Bot, Sparkles, Settings, Brain, FolderOpen } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import useAgents from '@/hooks/use-agents';
import { CreateAgentDto } from '@/services/agent-service';
import collectionService, { Collection } from '@/services/collection-service';

interface AgentFormData {
  name: string;
  description: string;
  type: 'assistant' | 'chatbot' | 'support' | 'sales' | 'custom';
  prompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  capabilities: {
    canAccessDocuments: boolean;
    canSearchWeb: boolean;
    canGenerateImages: boolean;
    canAnalyzeFiles: boolean;
    canExecuteCode: boolean;
    canAccessAPIs: boolean;
    customCapabilities: string[];
  };
  knowledgeCollections: string[];
  tags: string[];
}

const initialFormData: AgentFormData = {
  name: '',
  description: '',
  type: 'assistant',
  prompt: '',
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 1000,
  capabilities: {
    canAccessDocuments: false,
    canSearchWeb: false,
    canGenerateImages: false,
    canAnalyzeFiles: false,
    canExecuteCode: false,
    canAccessAPIs: false,
    customCapabilities: []
  },
  knowledgeCollections: [],
  tags: []
};

const agentTypes = [
  { value: 'assistant', label: 'Assistente Geral', description: 'Agente versátil para tarefas diversas' },
  { value: 'chatbot', label: 'Chatbot', description: 'Agente para conversas e atendimento' },
  { value: 'support', label: 'Suporte', description: 'Agente especializado em suporte técnico' },
  { value: 'sales', label: 'Vendas', description: 'Agente focado em vendas e qualificação' },
  { value: 'custom', label: 'Personalizado', description: 'Agente com configuração customizada' }
];

const modelOptions = [
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: 'Rápido e eficiente' },
  { value: 'gpt-4', label: 'GPT-4', description: 'Mais avançado e preciso' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', description: 'Versão otimizada do GPT-4' },
  { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet', description: 'Modelo da Anthropic' },
  { value: 'claude-3-opus', label: 'Claude 3 Opus', description: 'Modelo mais avançado da Anthropic' }
];

export default function CriarAgentePage() {
  const router = useRouter();
  const { createAgent } = useAgents();
  const [formData, setFormData] = useState<AgentFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(true);

  useEffect(() => {
    const loadCollections = async () => {
      try {
        const collectionsData = await collectionService.getCollections();
        setCollections(collectionsData.data.collections);
      } catch (error) {
        console.error('Erro ao carregar coleções:', error);
        toast.error('Erro ao carregar coleções de conhecimento');
      } finally {
        setLoadingCollections(false);
      }
    };

    loadCollections();
  }, []);

  const handleInputChange = (field: keyof AgentFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCapabilityChange = (capability: keyof AgentFormData['capabilities'], value: boolean) => {
    setFormData(prev => ({
      ...prev,
      capabilities: {
        ...prev.capabilities,
        [capability]: value
      }
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleCollectionToggle = (collectionId: string) => {
    setFormData(prev => ({
      ...prev,
      knowledgeCollections: prev.knowledgeCollections.includes(collectionId)
        ? prev.knowledgeCollections.filter(id => id !== collectionId)
        : [...prev.knowledgeCollections, collectionId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Nome do agente é obrigatório');
      return;
    }
    
    if (!formData.prompt.trim()) {
      toast.error('Prompt do agente é obrigatório');
      return;
    }

    setIsSubmitting(true);

    try {
      const createData: CreateAgentDto = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        prompt: formData.prompt,
        model: formData.model,
        temperature: formData.temperature,
        maxTokens: formData.maxTokens,
        capabilities: formData.capabilities,
        knowledgeBase: formData.knowledgeCollections.length > 0 ? {
          collections: formData.knowledgeCollections,
          searchSettings: {
            similarity: 0.8,
            maxResults: 5,
            includeMetadata: true
          }
        } : undefined,
        tags: formData.tags
      };

      const newAgent = await createAgent(createData);
      
      if (newAgent) {
        toast.success('Agente criado com sucesso!');
        router.push('/dashboard/agentes');
      }
    } catch (error) {
      console.error('Erro ao criar agente:', error);
      toast.error('Erro ao criar agente. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/agentes">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Criar Novo Agente</h1>
            <p className="text-muted-foreground">
              Configure seu agente de IA personalizado
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
            <CardDescription>
              Configure as informações fundamentais do seu agente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nome do Agente
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ex: Assistente de Vendas"
                  maxLength={100}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">
                  Tipo do Agente
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {agentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm text-muted-foreground">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descreva o propósito e funcionalidades do agente..."
                maxLength={500}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuração do Modelo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Configuração do Modelo
            </CardTitle>
            <CardDescription>
              Configure o modelo de IA e seus parâmetros
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="model">Modelo de IA</Label>
              <Select value={formData.model} onValueChange={(value) => handleInputChange('model', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {modelOptions.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      <div>
                        <div className="font-medium">{model.label}</div>
                        <div className="text-sm text-muted-foreground">{model.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperatura ({formData.temperature})</Label>
                <input
                  type="range"
                  id="temperature"
                  min="0"
                  max="2"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Conservador</span>
                  <span>Criativo</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxTokens">Máximo de Tokens</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  value={formData.maxTokens}
                  onChange={(e) => handleInputChange('maxTokens', parseInt(e.target.value))}
                  min={100}
                  max={4000}
                  step={100}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prompt do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Prompt do Sistema
            </CardTitle>
            <CardDescription>
              Defina as instruções e personalidade do agente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="prompt">
                Instruções do Agente
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Textarea
                id="prompt"
                value={formData.prompt}
                onChange={(e) => handleInputChange('prompt', e.target.value)}
                placeholder="Você é um assistente especializado em... Sempre seja educado e profissional..."
                maxLength={2000}
                rows={6}
                required
              />
              <div className="text-xs text-muted-foreground">
                {formData.prompt.length}/2000 caracteres
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Capacidades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Capacidades
            </CardTitle>
            <CardDescription>
              Configure as funcionalidades disponíveis para o agente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Acessar Documentos</Label>
                  <p className="text-sm text-muted-foreground">Permitir acesso à base de conhecimento</p>
                </div>
                <Switch
                  checked={formData.capabilities.canAccessDocuments}
                  onCheckedChange={(checked) => handleCapabilityChange('canAccessDocuments', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Buscar na Web</Label>
                  <p className="text-sm text-muted-foreground">Permitir pesquisas na internet</p>
                </div>
                <Switch
                  checked={formData.capabilities.canSearchWeb}
                  onCheckedChange={(checked) => handleCapabilityChange('canSearchWeb', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Gerar Imagens</Label>
                  <p className="text-sm text-muted-foreground">Permitir geração de imagens</p>
                </div>
                <Switch
                  checked={formData.capabilities.canGenerateImages}
                  onCheckedChange={(checked) => handleCapabilityChange('canGenerateImages', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Analisar Arquivos</Label>
                  <p className="text-sm text-muted-foreground">Permitir análise de documentos</p>
                </div>
                <Switch
                  checked={formData.capabilities.canAnalyzeFiles}
                  onCheckedChange={(checked) => handleCapabilityChange('canAnalyzeFiles', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Executar Código</Label>
                  <p className="text-sm text-muted-foreground">Permitir execução de código</p>
                </div>
                <Switch
                  checked={formData.capabilities.canExecuteCode}
                  onCheckedChange={(checked) => handleCapabilityChange('canExecuteCode', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Acessar APIs</Label>
                  <p className="text-sm text-muted-foreground">Permitir integração com APIs externas</p>
                </div>
                <Switch
                  checked={formData.capabilities.canAccessAPIs}
                  onCheckedChange={(checked) => handleCapabilityChange('canAccessAPIs', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coleções de Conhecimento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Coleções de Conhecimento
            </CardTitle>
            <CardDescription>
              Selecione as coleções de conhecimento que o agente pode acessar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingCollections ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                <span className="ml-2 text-sm text-muted-foreground">Carregando coleções...</span>
              </div>
            ) : collections.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-2">Nenhuma coleção encontrada</p>
                <Link href="/dashboard/knowledge/collections/criar">
                  <Button variant="outline" size="sm">
                    Criar primeira coleção
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {collections.map((collection) => (
                  <div key={collection.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <Checkbox
                      id={`collection-${collection.id}`}
                      checked={formData.knowledgeCollections.includes(collection.id)}
                      onCheckedChange={() => handleCollectionToggle(collection.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <Label
                        htmlFor={`collection-${collection.id}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {collection.name}
                      </Label>
                      {collection.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {collection.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {collection.documentCount || 0} documentos
                        </Badge>
                        {collection.settings?.isPublic && (
                          <Badge variant="secondary" className="text-xs">
                            Público
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {formData.knowledgeCollections.length > 0 && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">
                  Coleções selecionadas ({formData.knowledgeCollections.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {formData.knowledgeCollections.map((collectionId) => {
                    const collection = collections.find(c => c.id === collectionId);
                    return collection ? (
                      <Badge key={collectionId} variant="default" className="text-xs">
                        {collection.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
            <CardDescription>
              Adicione tags para categorizar e organizar seus agentes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Digite uma tag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline">
                Adicionar
              </Button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag} ×
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-4">
          <Link href="/dashboard/agentes">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Criando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Criar Agente
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}