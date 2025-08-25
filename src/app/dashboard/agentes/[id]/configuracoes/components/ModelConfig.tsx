'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, Settings2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ModelConfigProps {
  agentId: string;
  onConfigChange: () => void;
}

interface ModelConfiguration {
  provider: string;
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  systemPrompt: string;
  responseStyle: string;
  enableStreaming: boolean;
  enableFunctionCalling: boolean;
}

const mockConfig: ModelConfiguration = {
  provider: 'openai',
  model: 'gpt-4-turbo',
  temperature: 0.7,
  maxTokens: 2048,
  topP: 0.9,
  frequencyPenalty: 0.0,
  presencePenalty: 0.0,
  systemPrompt: 'Você é um assistente de vendas especializado em qualificação de leads. Seja profissional, prestativo e focado em entender as necessidades do cliente.',
  responseStyle: 'professional',
  enableStreaming: true,
  enableFunctionCalling: true
};

const providers = [
  { value: 'openai', label: 'OpenAI', models: ['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'] },
  { value: 'anthropic', label: 'Anthropic', models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'] },
  { value: 'google', label: 'Google', models: ['gemini-pro', 'gemini-pro-vision'] },
  { value: 'local', label: 'Local/Custom', models: ['llama-2-70b', 'mistral-7b'] }
];

const responseStyles = [
  { value: 'professional', label: 'Profissional' },
  { value: 'casual', label: 'Casual' },
  { value: 'friendly', label: 'Amigável' },
  { value: 'technical', label: 'Técnico' },
  { value: 'concise', label: 'Conciso' }
];

export default function ModelConfig({ agentId, onConfigChange }: ModelConfigProps) {
  const [config, setConfig] = useState<ModelConfiguration>(mockConfig);

  const handleConfigUpdate = (key: keyof ModelConfiguration, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    onConfigChange();
  };

  const selectedProvider = providers.find(p => p.value === config.provider);
  const availableModels = selectedProvider?.models || [];

  return (
    <div className="space-y-6">
      {/* Provider and Model Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Configurações do Modelo
          </CardTitle>
          <CardDescription>
            Selecione o provedor de IA e configure os parâmetros do modelo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="provider">Provedor de IA</Label>
              <Select 
                value={config.provider} 
                onValueChange={(value) => handleConfigUpdate('provider', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o provedor" />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((provider) => (
                    <SelectItem key={provider.value} value={provider.value}>
                      {provider.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Modelo</Label>
              <Select 
                value={config.model} 
                onValueChange={(value) => handleConfigUpdate('model', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o modelo" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="responseStyle">Estilo de Resposta</Label>
            <Select 
              value={config.responseStyle} 
              onValueChange={(value) => handleConfigUpdate('responseStyle', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o estilo" />
              </SelectTrigger>
              <SelectContent>
                {responseStyles.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Parâmetros Avançados
          </CardTitle>
          <CardDescription>
            Ajuste fino do comportamento do modelo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Temperature */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Temperatura</Label>
              <Badge variant="outline">{config.temperature}</Badge>
            </div>
            <Slider
              value={[config.temperature]}
              onValueChange={([value]) => handleConfigUpdate('temperature', value)}
              max={2}
              min={0}
              step={0.1}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Controla a criatividade das respostas. Valores baixos são mais determinísticos.
            </p>
          </div>

          {/* Max Tokens */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Máximo de Tokens</Label>
              <Badge variant="outline">{config.maxTokens}</Badge>
            </div>
            <Slider
              value={[config.maxTokens]}
              onValueChange={([value]) => handleConfigUpdate('maxTokens', value)}
              max={4096}
              min={256}
              step={256}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Limite máximo de tokens na resposta do modelo.
            </p>
          </div>

          {/* Top P */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Top P</Label>
              <Badge variant="outline">{config.topP}</Badge>
            </div>
            <Slider
              value={[config.topP]}
              onValueChange={([value]) => handleConfigUpdate('topP', value)}
              max={1}
              min={0}
              step={0.1}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Controla a diversidade das respostas através de amostragem nucleus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Frequency Penalty */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Penalidade de Frequência</Label>
                <Badge variant="outline">{config.frequencyPenalty}</Badge>
              </div>
              <Slider
                value={[config.frequencyPenalty]}
                onValueChange={([value]) => handleConfigUpdate('frequencyPenalty', value)}
                max={2}
                min={-2}
                step={0.1}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Reduz repetições baseadas na frequência.
              </p>
            </div>

            {/* Presence Penalty */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Penalidade de Presença</Label>
                <Badge variant="outline">{config.presencePenalty}</Badge>
              </div>
              <Slider
                value={[config.presencePenalty]}
                onValueChange={([value]) => handleConfigUpdate('presencePenalty', value)}
                max={2}
                min={-2}
                step={0.1}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Encoraja novos tópicos na conversa.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Funcionalidades
          </CardTitle>
          <CardDescription>
            Habilite ou desabilite funcionalidades específicas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Streaming de Respostas</Label>
              <p className="text-sm text-muted-foreground">
                Exibe as respostas em tempo real conforme são geradas
              </p>
            </div>
            <Switch
              checked={config.enableStreaming}
              onCheckedChange={(checked) => handleConfigUpdate('enableStreaming', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Chamadas de Função</Label>
              <p className="text-sm text-muted-foreground">
                Permite que o agente execute funções e use ferramentas
              </p>
            </div>
            <Switch
              checked={config.enableFunctionCalling}
              onCheckedChange={(checked) => handleConfigUpdate('enableFunctionCalling', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* System Prompt */}
      <Card>
        <CardHeader>
          <CardTitle>Prompt do Sistema</CardTitle>
          <CardDescription>
            Instruções fundamentais que definem o comportamento do agente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={config.systemPrompt}
            onChange={(e) => handleConfigUpdate('systemPrompt', e.target.value)}
            placeholder="Digite as instruções do sistema para o agente..."
            className="min-h-[120px]"
          />
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              O prompt do sistema é fundamental para o comportamento do agente. 
              Seja específico sobre o papel, tom e limitações do agente.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}