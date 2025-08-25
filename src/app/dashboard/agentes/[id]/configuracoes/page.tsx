'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Settings, Brain, MessageSquare, Database, Wrench, Globe } from 'lucide-react';
import Link from 'next/link';

// Componentes das seções
import ModelConfig from './components/ModelConfig';
import PromptConfig from './components/PromptConfig';
import KnowledgeConfig from './components/KnowledgeConfig';
import ToolsConfig from './components/ToolsConfig';
import EnvironmentsConfig from './components/EnvironmentsConfig';

interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'training' | 'error';
  type: 'chatbot' | 'voice' | 'email' | 'whatsapp';
  version: string;
  lastUpdated: string;
}

// Mock data - em produção viria da API
const mockAgent: Agent = {
  id: 'agent-001',
  name: 'Assistente de Vendas',
  description: 'Agente especializado em qualificação de leads e suporte pré-venda',
  status: 'active',
  type: 'chatbot',
  version: '2.1.0',
  lastUpdated: '2024-01-15T14:30:00Z'
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    case 'training': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
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
  const agentId = params.id as string;
  const [agent] = useState<Agent>(mockAgent);
  const [activeTab, setActiveTab] = useState('modelo');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleSave = () => {
    // Implementar salvamento
    console.log('Salvando configurações do agente:', agentId);
    setHasUnsavedChanges(false);
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
            <h1 className="text-3xl font-bold tracking-tight">Configurações do Agente</h1>
            <p className="text-muted-foreground">
              Configure o comportamento e funcionalidades do seu agente
            </p>
          </div>
        </div>
        
        <Button onClick={handleSave} disabled={!hasUnsavedChanges}>
          <Save className="h-4 w-4 mr-2" />
          Salvar Alterações
        </Button>
      </div>

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
              <Badge className={getStatusColor(agent.status)}>
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
            agentId={agentId} 
            onConfigChange={() => setHasUnsavedChanges(true)}
          />
        </TabsContent>

        <TabsContent value="prompt" className="space-y-6">
          <PromptConfig 
            agentId={agentId} 
            onConfigChange={() => setHasUnsavedChanges(true)}
          />
        </TabsContent>

        <TabsContent value="conhecimento" className="space-y-6">
          <KnowledgeConfig 
            agentId={agentId} 
            onConfigChange={() => setHasUnsavedChanges(true)}
          />
        </TabsContent>

        <TabsContent value="ferramentas" className="space-y-6">
          <ToolsConfig 
            agentId={agentId} 
            onConfigChange={() => setHasUnsavedChanges(true)}
          />
        </TabsContent>

        <TabsContent value="ambientes" className="space-y-6">
          <EnvironmentsConfig 
            agentId={agentId} 
            onConfigChange={() => setHasUnsavedChanges(true)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}