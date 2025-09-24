'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save, Settings, Brain, MessageSquare, Database, Wrench, Globe, Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import agentService, { Agent } from '@/services/agent-service';

// Componentes das seções
import ModelConfig from './components/ModelConfig';
import PromptConfig from './components/PromptConfig';
import KnowledgeConfig from './components/KnowledgeConfig';
import ToolsConfig from './components/ToolsConfig';
import EnvironmentsConfig from './components/EnvironmentsConfig';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'success';
    case 'inactive': return 'secondary';
    case 'training': return 'warning';
    case 'error': return 'destructive';
    default: return 'secondary';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return 'Ativo';
    case 'inactive': return 'Inativo';
    case 'training': return 'Treinando';
    case 'error': return 'Erro';
    default: return status;
  }
};

export default function AgentConfigPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;
  const [activeTab, setActiveTab] = useState('modelo');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configChanges, setConfigChanges] = useState<any>({});
  const [initialConfigData, setInitialConfigData] = useState<any>({});
  
  // Carregar dados do agente
  useEffect(() => {
    const loadAgent = async () => {
      try {
        setLoading(true);
        const response = await agentService.getAgent(agentId);
        
        if (response.success && response.data) {
          setAgent(response.data);
          
          // Inicializar dados de configuração para preservar entre abas
          const initialData = {
            modelo: {
              provider: response.data.modelConfig?.provider || 'openai',
              model: response.data.modelConfig?.model || 'gpt-3.5-turbo',
              temperature: response.data.modelConfig?.temperature || 0.7,
              maxTokens: response.data.modelConfig?.maxTokens || 1000,
              topP: response.data.modelConfig?.topP || 0.9,
              frequencyPenalty: response.data.modelConfig?.frequencyPenalty || 0.0,
              presencePenalty: response.data.modelConfig?.presencePenalty || 0.0,
              systemPrompt: response.data.systemPrompt || 'Você é um assistente útil.',
              responseStyle: response.data.personality?.style || 'conversational'
            },
            prompt: {
              welcomeMessage: response.data.settings?.welcomeMessage || 'Olá! Como posso ajudá-lo hoje?',
              systemInstructions: response.data.instructions || response.data.systemPrompt || 'Você é um assistente útil.',
              fallbackMessage: response.data.settings?.fallbackMessage || 'Desculpe, não entendi completamente sua solicitação. Poderia reformular?',
              errorMessage: response.data.settings?.errorMessage || 'Ocorreu um erro técnico. Por favor, tente novamente.',
              endConversationMessage: response.data.settings?.endConversationMessage || 'Foi um prazer ajudá-lo!',
              escalationPrompt: response.data.settings?.escalationPrompt || 'Vou transferir você para um especialista humano.',
              contextualPrompts: response.data.settings?.contextualPrompts || [],
              responseTemplates: response.data.settings?.responseTemplates || [],
              enablePersonalization: response.data.settings?.enablePersonalization || true,
              tone: response.data.personality?.tone || 'professional',
              language: response.data.settings?.language || 'pt-BR'
            },
            conhecimento: response.data.knowledgeBase || {},
            ferramentas: {
              enabledTools: response.data.tools || [],
              availableTools: [],
              customFunctions: [],
              apiIntegrations: [],
              variables: [],
              webhooks: []
            },
            ambientes: response.data.environments || undefined
          };
          
          setInitialConfigData(initialData);
          setConfigChanges(initialData);
        } else {
          toast.error('Erro ao carregar agente', {
            description: response.error || 'Agente não encontrado'
          });
        }
      } catch (error) {
        console.error('Erro ao carregar agente:', error);
        toast.error('Erro ao carregar agente', {
          description: 'Ocorreu um erro inesperado'
        });
      } finally {
        setLoading(false);
      }
    };

    if (agentId) {
      loadAgent();
    }
  }, [agentId]);

  // Aviso de alterações não salvas
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Você tem alterações não salvas. Deseja realmente sair?';
        return 'Você tem alterações não salvas. Deseja realmente sair?';
      }
    };

    const handlePopState = () => {
      if (hasUnsavedChanges) {
        const confirmLeave = window.confirm('Você tem alterações não salvas. Deseja realmente sair?');
        if (!confirmLeave) {
          window.history.pushState(null, '', window.location.href);
        }
      }
    };

    if (hasUnsavedChanges) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('popstate', handlePopState);
      // Adiciona um estado ao histórico para interceptar o botão voltar
      window.history.pushState(null, '', window.location.href);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges]);

  const handleConfigChange = (section: string, config: any) => {
    console.log('📝 Page - handleConfigChange:', { section, config });
    setConfigChanges((prev: any) => {
      const newChanges = { ...prev, [section]: config };
      console.log('📝 Page - configChanges updated:', newChanges);
      return newChanges;
    });
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!agent) return;
    
    try {
      setSaving(true);
      
      // Preparar dados para atualização - apenas campos obrigatórios e válidos
      const updateData: any = {};
      
      // Modelo (obrigatório) - apenas se houver mudanças
      if (configChanges.modelo) {
        // ModelConfig é opcional no DTO
        if (configChanges.modelo.provider || configChanges.modelo.model || 
            configChanges.modelo.temperature !== undefined || configChanges.modelo.maxTokens !== undefined) {
          updateData.modelConfig = {
            provider: configChanges.modelo.provider,
            model: configChanges.modelo.model,
            temperature: configChanges.modelo.temperature,
            maxTokens: configChanges.modelo.maxTokens,
            topP: configChanges.modelo.topP,
            frequencyPenalty: configChanges.modelo.frequencyPenalty,
            presencePenalty: configChanges.modelo.presencePenalty
          };
        }
        
        // Prompt do Sistema é obrigatório no DTO
        if (configChanges.modelo.systemPrompt) {
          updateData.systemPrompt = configChanges.modelo.systemPrompt;
        }
        
        // Personality é opcional no DTO
        if (configChanges.modelo.responseStyle) {
          console.log('💾 Save - responseStyle found:', configChanges.modelo.responseStyle);
          updateData.personality = {
            ...agent.personality,
            style: configChanges.modelo.responseStyle
          };
          console.log('💾 Save - personality updateData:', updateData.personality);
        } else {
          console.log('💾 Save - NO responseStyle in configChanges.modelo:', configChanges.modelo);
        }
      }
      
      // Prompt/Instructions (opcional)
      if (configChanges.prompt?.systemInstructions) {
        updateData.instructions = configChanges.prompt.systemInstructions;
      }
      
      // Settings é opcional no DTO
      const settingsUpdate: any = {};
      if (configChanges.prompt?.welcomeMessage) settingsUpdate.welcomeMessage = configChanges.prompt.welcomeMessage;
      if (configChanges.prompt?.fallbackMessage) settingsUpdate.fallbackMessage = configChanges.prompt.fallbackMessage;
      if (configChanges.prompt?.errorMessage) settingsUpdate.errorMessage = configChanges.prompt.errorMessage;
      if (configChanges.prompt?.endConversationMessage) settingsUpdate.endConversationMessage = configChanges.prompt.endConversationMessage;
      if (configChanges.prompt?.escalationPrompt) settingsUpdate.escalationPrompt = configChanges.prompt.escalationPrompt;
      if (configChanges.prompt?.contextualPrompts) settingsUpdate.contextualPrompts = configChanges.prompt.contextualPrompts;
      if (configChanges.prompt?.responseTemplates) settingsUpdate.responseTemplates = configChanges.prompt.responseTemplates;
      if (configChanges.prompt?.enablePersonalization !== undefined) settingsUpdate.enablePersonalization = configChanges.prompt.enablePersonalization;
      if (configChanges.prompt?.language) settingsUpdate.language = configChanges.prompt.language;
      
      if (Object.keys(settingsUpdate).length > 0) {
        updateData.settings = {
          ...agent.settings,
          ...settingsUpdate
        };
      }
      
      // Personality tone
      if (configChanges.prompt?.tone) {
        updateData.personality = {
          ...updateData.personality,
          ...agent.personality,
          tone: configChanges.prompt.tone
        };
      }
      
      // Knowledge Base (opcional)
      if (configChanges.conhecimento) {
        updateData.knowledgeBase = configChanges.conhecimento;
      }
      
      // Tools (opcional)
      if (configChanges.ferramentas) {
        // Certifique-se de que tools é um objeto com enabledTools e availableTools
        updateData.tools = {
          enabledTools: configChanges.ferramentas.enabledTools || [],
          availableTools: configChanges.ferramentas.availableTools || [],
          // Adicione outras propriedades de tools se existirem e forem necessárias
        };
      }
      
      // Construir o objeto settings corretamente
      const newSettings: any = {
        ...(agent.settings || {}), // Copia as configurações existentes do agente
        ...(configChanges.settings || {}), // Sobrescreve com quaisquer mudanças gerais de settings
      };

      if (configChanges.ambientes) {
        newSettings.environments = configChanges.ambientes;
      }

      // Atribuir newSettings a updateData.settings apenas se houver alguma alteração
      if (Object.keys(newSettings).length > 0) {
        updateData.settings = newSettings;
      }
      
      // Verificar se há dados para atualizar
      if (Object.keys(updateData).length === 0) {
        toast.info('Nenhuma alteração para salvar.');
        return;
      }

      console.log('🚀 Save - Enviando updateData para backend:', JSON.stringify(updateData, null, 2));
      
      // Atualizar agente
      const response = await agentService.updateAgent(agentId, updateData);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Erro ao atualizar agente');
      }
      const updatedAgent = response.data;
      setAgent(updatedAgent);
      
      // Atualizar dados iniciais com os novos valores salvos
      const newInitialData = {
        modelo: {
          provider: updatedAgent.modelConfig?.provider || 'openai',
          model: updatedAgent.modelConfig?.model || 'gpt-3.5-turbo',
          temperature: updatedAgent.modelConfig?.temperature || 0.7,
          maxTokens: updatedAgent.modelConfig?.maxTokens || 1000,
          topP: updatedAgent.modelConfig?.topP || 0.9,
          frequencyPenalty: updatedAgent.modelConfig?.frequencyPenalty || 0.0,
          presencePenalty: updatedAgent.modelConfig?.presencePenalty || 0.0,
          systemPrompt: updatedAgent.systemPrompt || 'Você é um assistente útil.',
          responseStyle: updatedAgent.personality?.style || 'professional'
        },
        prompt: {
          welcomeMessage: updatedAgent.settings?.welcomeMessage || 'Olá! Como posso ajudá-lo hoje?',
          systemInstructions: updatedAgent.instructions || updatedAgent.systemPrompt || 'Você é um assistente útil.',
          fallbackMessage: updatedAgent.settings?.fallbackMessage || 'Desculpe, não entendi completamente sua solicitação. Poderia reformular?',
          errorMessage: updatedAgent.settings?.errorMessage || 'Ocorreu um erro técnico. Por favor, tente novamente.',
          endConversationMessage: updatedAgent.settings?.endConversationMessage || 'Foi um prazer ajudá-lo!',
          escalationPrompt: updatedAgent.settings?.escalationPrompt || 'Vou transferir você para um especialista humano.',
          contextualPrompts: updatedAgent.settings?.contextualPrompts || [],
          responseTemplates: updatedAgent.settings?.responseTemplates || [],
          enablePersonalization: updatedAgent.settings?.enablePersonalization || true,
          tone: updatedAgent.personality?.tone || 'professional',
          language: updatedAgent.settings?.language || 'pt-BR'
        },
        conhecimento: updatedAgent.knowledgeBase || {},
        ferramentas: updatedAgent.tools || [],
        ambientes: updatedAgent.environments || {}
      };
      
      setInitialConfigData(newInitialData);
      setConfigChanges(newInitialData);
      setHasUnsavedChanges(false);
      
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Carregando configurações do agente...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Agente não encontrado</h2>
            <p className="text-muted-foreground mb-4">O agente solicitado não foi encontrado.</p>
            <Link href="/dashboard/agentes">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Agentes
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              if (hasUnsavedChanges) {
                const confirmLeave = window.confirm('Você tem alterações não salvas. Deseja realmente sair?');
                if (confirmLeave) {
                  router.push('/dashboard/agentes');
                }
              } else {
                router.push('/dashboard/agentes');
              }
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
            {hasUnsavedChanges && (
              <span className="ml-2 h-2 w-2 bg-orange-500 rounded-full" title="Alterações não salvas" />
            )}
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Configurações do Agente</h1>
            <p className="text-muted-foreground">
              Configure o comportamento e funcionalidades do seu agente
            </p>
          </div>
        </div>
        
        <Button onClick={handleSave} disabled={!hasUnsavedChanges || saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>

      {/* Banner de alterações não salvas */}
      {hasUnsavedChanges && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Você tem alterações não salvas. Lembre-se de clicar em "Salvar Alterações" antes de sair da página.
          </AlertDescription>
        </Alert>
      )}

      {/* Agent Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <Settings className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">{agent.name}</CardTitle>
                <CardDescription>{agent.description}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusColor(agent.status) as any}>
                {getStatusText(agent.status)}
              </Badge>
              <Badge variant="outline">v{agent.version}</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Configuration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="modelo" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Modelo
          </TabsTrigger>
          <TabsTrigger value="prompt" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Prompt
          </TabsTrigger>
          <TabsTrigger value="conhecimento" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Base de Conhecimento
          </TabsTrigger>
          <TabsTrigger value="ferramentas" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Ferramentas
          </TabsTrigger>
          <TabsTrigger value="ambientes" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Ambientes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="modelo" className="space-y-6">

          <ModelConfig 
            agent={agent}
            initialConfig={configChanges.modelo}
            onConfigChange={(config) => handleConfigChange('modelo', config)}
          />
        </TabsContent>

        <TabsContent value="prompt" className="space-y-6">
          <PromptConfig 
            agent={agent}
            initialConfig={configChanges.prompt}
            onConfigChange={(config) => handleConfigChange('prompt', config)}
          />
        </TabsContent>

        <TabsContent value="conhecimento" className="space-y-6">
          <KnowledgeConfig 
            agent={agent}
            initialConfig={configChanges.conhecimento}
            onConfigChange={(config) => handleConfigChange('conhecimento', config)}
          />
        </TabsContent>

        <TabsContent value="ferramentas" className="space-y-6">
          <ToolsConfig 
            agent={agent}
            initialConfig={configChanges.ferramentas}
            onConfigChange={(config) => handleConfigChange('ferramentas', config)}
          />
        </TabsContent>

        <TabsContent value="ambientes" className="space-y-6">
          <EnvironmentsConfig
            agent={agent}
            initialConfig={configChanges.ambientes}
            onConfigChange={(section, config) => handleConfigChange(section, config)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}