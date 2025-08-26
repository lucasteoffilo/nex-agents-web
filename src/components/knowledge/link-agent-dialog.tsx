'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bot,
  Search,
  Loader2,
  CheckCircle,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

interface Agent {
  id: string;
  name: string;
  description: string;
  type: 'chatbot' | 'assistant' | 'analyzer' | 'custom';
  status: 'active' | 'inactive' | 'training';
  model: string;
  capabilities: string[];
  isLinked?: boolean;
  linkDate?: string;
}

interface LinkAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collectionId: string;
  collectionName: string;
  onAgentsLinked?: (agents: Agent[]) => void;
}

// Mock data para agentes disponíveis
const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'Assistente de Vendas',
    description: 'Especializado em processos de vendas e atendimento ao cliente',
    type: 'assistant',
    status: 'active',
    model: 'gpt-4',
    capabilities: ['vendas', 'atendimento', 'crm'],
    isLinked: false,
  },
  {
    id: '2',
    name: 'Analisador de Documentos',
    description: 'Analisa e extrai informações de documentos técnicos',
    type: 'analyzer',
    status: 'active',
    model: 'gpt-4',
    capabilities: ['análise', 'documentos', 'extração'],
    isLinked: true,
    linkDate: '2024-01-15',
  },
  {
    id: '3',
    name: 'Chatbot Suporte',
    description: 'Bot para suporte técnico e FAQ',
    type: 'chatbot',
    status: 'active',
    model: 'gpt-3.5-turbo',
    capabilities: ['suporte', 'faq', 'troubleshooting'],
    isLinked: false,
  },
  {
    id: '4',
    name: 'Assistente Jurídico',
    description: 'Especializado em documentos e processos jurídicos',
    type: 'assistant',
    status: 'inactive',
    model: 'gpt-4',
    capabilities: ['jurídico', 'contratos', 'compliance'],
    isLinked: false,
  },
  {
    id: '5',
    name: 'Bot de Marketing',
    description: 'Criação de conteúdo e campanhas de marketing',
    type: 'custom',
    status: 'training',
    model: 'gpt-4',
    capabilities: ['marketing', 'conteúdo', 'campanhas'],
    isLinked: false,
  },
];

export function LinkAgentDialog({ 
  open, 
  onOpenChange, 
  collectionId, 
  collectionName,
  onAgentsLinked 
}: LinkAgentDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLinking, setIsLinking] = useState(false);

  // Filtrar agentes baseado nos critérios
  const filteredAgents = mockAgents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.capabilities.some(cap => cap.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || agent.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleAgentToggle = (agentId: string, isLinked: boolean) => {
    if (isLinked) {
      // Se já está vinculado, não permite desmarcar aqui
      return;
    }
    
    setSelectedAgents(prev => 
      prev.includes(agentId) 
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const handleLinkAgents = async () => {
    if (selectedAgents.length === 0) {
      toast.error('Selecione pelo menos um agente para vincular');
      return;
    }

    setIsLinking(true);
    try {
      // Simular chamada para API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const linkedAgents = mockAgents.filter(agent => selectedAgents.includes(agent.id));
      
      if (onAgentsLinked) {
        onAgentsLinked(linkedAgents);
      }
      
      toast.success(`${selectedAgents.length} agente(s) vinculado(s) com sucesso!`);
      setSelectedAgents([]);
      onOpenChange(false);
    } catch (error) {
      toast.error('Erro ao vincular agentes');
    } finally {
      setIsLinking(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      chatbot: 'Chatbot',
      assistant: 'Assistente',
      analyzer: 'Analisador',
      custom: 'Personalizado'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      training: 'outline'
    } as const;
    
    const labels = {
      active: 'Ativo',
      inactive: 'Inativo',
      training: 'Treinando'
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const availableAgents = filteredAgents.filter(agent => !agent.isLinked);
  const linkedAgents = filteredAgents.filter(agent => agent.isLinked);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Vincular Agentes à Collection</DialogTitle>
          <DialogDescription>
            Selecione os agentes que terão acesso à collection "{collectionName}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Filtros e Busca */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar agentes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="chatbot">Chatbot</SelectItem>
                <SelectItem value="assistant">Assistente</SelectItem>
                <SelectItem value="analyzer">Analisador</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
                <SelectItem value="training">Treinando</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Lista de Agentes */}
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {/* Agentes Já Vinculados */}
              {linkedAgents.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Agentes Já Vinculados ({linkedAgents.length})
                  </h4>
                  <div className="space-y-2">
                    {linkedAgents.map((agent) => (
                      <div 
                        key={agent.id} 
                        className="flex items-center space-x-3 p-3 border rounded-lg bg-muted/50"
                      >
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <Bot className="h-8 w-8 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{agent.name}</h4>
                            <Badge variant="outline">{getTypeLabel(agent.type)}</Badge>
                            {getStatusBadge(agent.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">{agent.description}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {agent.capabilities.map((capability) => (
                              <Badge key={capability} variant="secondary" className="text-xs">
                                {capability}
                              </Badge>
                            ))}
                          </div>
                          {agent.linkDate && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Vinculado em: {new Date(agent.linkDate).toLocaleDateString('pt-BR')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Agentes Disponíveis */}
              {availableAgents.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Agentes Disponíveis ({availableAgents.length})
                  </h4>
                  <div className="space-y-2">
                    {availableAgents.map((agent) => {
                      const isSelected = selectedAgents.includes(agent.id);
                      const isDisabled = agent.status !== 'active';
                      
                      return (
                        <div 
                          key={agent.id} 
                          className={`flex items-center space-x-3 p-3 border rounded-lg transition-colors ${
                            isSelected ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
                          } ${
                            isDisabled ? 'opacity-50' : 'cursor-pointer'
                          }`}
                          onClick={() => !isDisabled && handleAgentToggle(agent.id, false)}
                        >
                          <Checkbox
                            checked={isSelected}
                            disabled={isDisabled}
                            onCheckedChange={() => !isDisabled && handleAgentToggle(agent.id, false)}
                          />
                          <Bot className="h-8 w-8 text-muted-foreground" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{agent.name}</h4>
                              <Badge variant="outline">{getTypeLabel(agent.type)}</Badge>
                              {getStatusBadge(agent.status)}
                              {isDisabled && (
                                <AlertCircle className="h-4 w-4 text-yellow-500" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{agent.description}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {agent.capabilities.map((capability) => (
                                <Badge key={capability} variant="secondary" className="text-xs">
                                  {capability}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Modelo: {agent.model}
                            </p>
                            {isDisabled && (
                              <p className="text-xs text-yellow-600 mt-1">
                                Agente não está ativo
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Nenhum agente encontrado */}
              {filteredAgents.length === 0 && (
                <div className="text-center py-8">
                  <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Nenhum agente encontrado</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                      ? 'Tente ajustar os filtros de busca'
                      : 'Não há agentes disponíveis no momento'}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
          
          {/* Resumo da Seleção */}
          {selectedAgents.length > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <p className="text-sm font-medium">
                {selectedAgents.length} agente(s) selecionado(s) para vinculação
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedAgents.map(agentId => {
                  const agent = mockAgents.find(a => a.id === agentId);
                  return agent ? (
                    <Badge key={agentId} variant="outline">
                      {agent.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLinking}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleLinkAgents} 
            disabled={selectedAgents.length === 0 || isLinking}
          >
            {isLinking ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Vinculando...
              </>
            ) : (
              `Vincular ${selectedAgents.length} Agente(s)`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}