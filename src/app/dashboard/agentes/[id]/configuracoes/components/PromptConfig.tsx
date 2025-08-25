'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Plus, Trash2, AlertCircle, FileText, Lightbulb } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PromptConfigProps {
  agentId: string;
  onConfigChange: () => void;
}

interface PromptConfiguration {
  welcomeMessage: string;
  systemInstructions: string;
  fallbackMessage: string;
  errorMessage: string;
  endConversationMessage: string;
  escalationPrompt: string;
  contextualPrompts: ContextualPrompt[];
  responseTemplates: ResponseTemplate[];
  enablePersonalization: boolean;
  tone: string;
  language: string;
}

interface ContextualPrompt {
  id: string;
  name: string;
  trigger: string;
  prompt: string;
  active: boolean;
}

interface ResponseTemplate {
  id: string;
  name: string;
  category: string;
  template: string;
  variables: string[];
}

const mockConfig: PromptConfiguration = {
  welcomeMessage: 'Olá! Sou seu assistente de vendas. Como posso ajudá-lo hoje?',
  systemInstructions: 'Você é um assistente de vendas especializado. Seja sempre profissional, prestativo e focado em entender as necessidades do cliente. Faça perguntas qualificadoras e ofereça soluções adequadas.',
  fallbackMessage: 'Desculpe, não entendi completamente sua solicitação. Poderia reformular ou ser mais específico?',
  errorMessage: 'Ocorreu um erro técnico. Por favor, tente novamente em alguns instantes.',
  endConversationMessage: 'Foi um prazer ajudá-lo! Se precisar de mais alguma coisa, estarei aqui.',
  escalationPrompt: 'Vou transferir você para um especialista humano que poderá ajudá-lo melhor com essa questão.',
  contextualPrompts: [
    {
      id: '1',
      name: 'Qualificação de Lead',
      trigger: 'interesse em produto',
      prompt: 'Identifique as necessidades específicas do cliente e qualifique o lead fazendo perguntas sobre orçamento, timeline e autoridade de decisão.',
      active: true
    },
    {
      id: '2',
      name: 'Objeções de Preço',
      trigger: 'preço alto',
      prompt: 'Foque no valor e ROI do produto. Apresente opções de pagamento e compare com concorrentes.',
      active: true
    }
  ],
  responseTemplates: [
    {
      id: '1',
      name: 'Apresentação de Produto',
      category: 'Vendas',
      template: 'Nosso {produto} é ideal para {necessidade}. Com {beneficio_principal}, você pode {resultado_esperado}.',
      variables: ['produto', 'necessidade', 'beneficio_principal', 'resultado_esperado']
    },
    {
      id: '2',
      name: 'Agendamento de Reunião',
      category: 'Agendamento',
      template: 'Vou agendar uma reunião para {data} às {horario}. Confirma sua disponibilidade?',
      variables: ['data', 'horario']
    }
  ],
  enablePersonalization: true,
  tone: 'professional',
  language: 'pt-BR'
};

const tones = [
  { value: 'professional', label: 'Profissional' },
  { value: 'friendly', label: 'Amigável' },
  { value: 'casual', label: 'Casual' },
  { value: 'formal', label: 'Formal' },
  { value: 'enthusiastic', label: 'Entusiasmado' }
];

const languages = [
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'es-ES', label: 'Español' },
  { value: 'fr-FR', label: 'Français' }
];

export default function PromptConfig({ agentId, onConfigChange }: PromptConfigProps) {
  const [config, setConfig] = useState<PromptConfiguration>(mockConfig);

  const handleConfigUpdate = (key: keyof PromptConfiguration, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    onConfigChange();
  };

  const addContextualPrompt = () => {
    const newPrompt: ContextualPrompt = {
      id: Date.now().toString(),
      name: 'Novo Prompt',
      trigger: '',
      prompt: '',
      active: true
    };
    handleConfigUpdate('contextualPrompts', [...config.contextualPrompts, newPrompt]);
  };

  const updateContextualPrompt = (id: string, field: keyof ContextualPrompt, value: any) => {
    const updated = config.contextualPrompts.map(prompt => 
      prompt.id === id ? { ...prompt, [field]: value } : prompt
    );
    handleConfigUpdate('contextualPrompts', updated);
  };

  const removeContextualPrompt = (id: string) => {
    const filtered = config.contextualPrompts.filter(prompt => prompt.id !== id);
    handleConfigUpdate('contextualPrompts', filtered);
  };

  const addResponseTemplate = () => {
    const newTemplate: ResponseTemplate = {
      id: Date.now().toString(),
      name: 'Novo Template',
      category: 'Geral',
      template: '',
      variables: []
    };
    handleConfigUpdate('responseTemplates', [...config.responseTemplates, newTemplate]);
  };

  const updateResponseTemplate = (id: string, field: keyof ResponseTemplate, value: any) => {
    const updated = config.responseTemplates.map(template => 
      template.id === id ? { ...template, [field]: value } : template
    );
    handleConfigUpdate('responseTemplates', updated);
  };

  const removeResponseTemplate = (id: string) => {
    const filtered = config.responseTemplates.filter(template => template.id !== id);
    handleConfigUpdate('responseTemplates', filtered);
  };

  return (
    <div className="space-y-6">
      {/* Basic Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Mensagens Básicas
          </CardTitle>
          <CardDescription>
            Configure as mensagens principais do agente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="welcomeMessage">Mensagem de Boas-vindas</Label>
            <Textarea
              id="welcomeMessage"
              value={config.welcomeMessage}
              onChange={(e) => handleConfigUpdate('welcomeMessage', e.target.value)}
              placeholder="Digite a mensagem de boas-vindas..."
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fallbackMessage">Mensagem de Fallback</Label>
            <Textarea
              id="fallbackMessage"
              value={config.fallbackMessage}
              onChange={(e) => handleConfigUpdate('fallbackMessage', e.target.value)}
              placeholder="Mensagem quando o agente não entende..."
              className="min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="errorMessage">Mensagem de Erro</Label>
              <Textarea
                id="errorMessage"
                value={config.errorMessage}
                onChange={(e) => handleConfigUpdate('errorMessage', e.target.value)}
                placeholder="Mensagem para erros técnicos..."
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endConversationMessage">Mensagem de Encerramento</Label>
              <Textarea
                id="endConversationMessage"
                value={config.endConversationMessage}
                onChange={(e) => handleConfigUpdate('endConversationMessage', e.target.value)}
                placeholder="Mensagem de despedida..."
                className="min-h-[80px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Instruções do Sistema
          </CardTitle>
          <CardDescription>
            Instruções detalhadas sobre o comportamento do agente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={config.systemInstructions}
            onChange={(e) => handleConfigUpdate('systemInstructions', e.target.value)}
            placeholder="Digite as instruções detalhadas do sistema..."
            className="min-h-[150px]"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Tom de Voz</Label>
              <Select 
                value={config.tone} 
                onValueChange={(value) => handleConfigUpdate('tone', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tones.map((tone) => (
                    <SelectItem key={tone.value} value={tone.value}>
                      {tone.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Idioma</Label>
              <Select 
                value={config.language} 
                onValueChange={(value) => handleConfigUpdate('language', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between pt-6">
              <Label>Personalização</Label>
              <Switch
                checked={config.enablePersonalization}
                onCheckedChange={(checked) => handleConfigUpdate('enablePersonalization', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contextual Prompts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Prompts Contextuais
              </CardTitle>
              <CardDescription>
                Prompts específicos para diferentes situações
              </CardDescription>
            </div>
            <Button onClick={addContextualPrompt} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {config.contextualPrompts.map((prompt) => (
            <Card key={prompt.id} className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Input
                      value={prompt.name}
                      onChange={(e) => updateContextualPrompt(prompt.id, 'name', e.target.value)}
                      className="font-medium"
                      placeholder="Nome do prompt"
                    />
                    <Switch
                      checked={prompt.active}
                      onCheckedChange={(checked) => updateContextualPrompt(prompt.id, 'active', checked)}
                    />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeContextualPrompt(prompt.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Gatilho</Label>
                    <Input
                      value={prompt.trigger}
                      onChange={(e) => updateContextualPrompt(prompt.id, 'trigger', e.target.value)}
                      placeholder="Palavra ou frase que ativa o prompt"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Prompt</Label>
                    <Textarea
                      value={prompt.prompt}
                      onChange={(e) => updateContextualPrompt(prompt.id, 'prompt', e.target.value)}
                      placeholder="Instruções específicas para esta situação"
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Response Templates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Templates de Resposta</CardTitle>
              <CardDescription>
                Templates reutilizáveis para respostas comuns
              </CardDescription>
            </div>
            <Button onClick={addResponseTemplate} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {config.responseTemplates.map((template) => (
            <Card key={template.id} className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="grid grid-cols-2 gap-4 flex-1">
                    <Input
                      value={template.name}
                      onChange={(e) => updateResponseTemplate(template.id, 'name', e.target.value)}
                      placeholder="Nome do template"
                    />
                    <Input
                      value={template.category}
                      onChange={(e) => updateResponseTemplate(template.id, 'category', e.target.value)}
                      placeholder="Categoria"
                    />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeResponseTemplate(template.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label>Template</Label>
                  <Textarea
                    value={template.template}
                    onChange={(e) => updateResponseTemplate(template.id, 'template', e.target.value)}
                    placeholder="Use {variavel} para campos dinâmicos"
                    className="min-h-[80px]"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {template.variables.map((variable, index) => (
                    <Badge key={index} variant="secondary">
                      {variable}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Escalation */}
      <Card>
        <CardHeader>
          <CardTitle>Escalação para Humanos</CardTitle>
          <CardDescription>
            Configure quando e como transferir para atendentes humanos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="escalationPrompt">Mensagem de Escalação</Label>
            <Textarea
              id="escalationPrompt"
              value={config.escalationPrompt}
              onChange={(e) => handleConfigUpdate('escalationPrompt', e.target.value)}
              placeholder="Mensagem ao transferir para humano..."
              className="min-h-[80px]"
            />
          </div>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Configure gatilhos automáticos para escalação baseados em palavras-chave, 
              sentimento negativo ou número de tentativas sem sucesso.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}