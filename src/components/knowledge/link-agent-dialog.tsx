'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Search, Bot, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import agentService from '@/services/agent-service';
import collectionService from '@/services/collection-service';

interface Agent {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'training';
  description?: string;
  conversations?: number;
  successRate?: number;
  lastUsed?: string;
}

interface LinkAgentDialogProps {
  collectionId: string;
  onLinkSuccess: () => void;
  onClose: () => void;
}

export function LinkAgentDialog({ collectionId, onLinkSuccess, onClose }: LinkAgentDialogProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [linkedAgents, setLinkedAgents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);

  // Carregar agentes disponíveis
  useEffect(() => {
    const loadAgents = async () => {
      try {
        setLoading(true);
        
        // Buscar todos os agentes
        const agentsResponse = await agentService.getAgents({ page: 1, limit: 100 });
        const allAgents = agentsResponse.data?.agents || [];
        
        // Buscar agentes já vinculados à coleção
        const linkedResponse = await collectionService.getCollectionAgents(collectionId);
        const linkedAgentIds = (linkedResponse.data?.agents || []).map(agent => agent.id);
        
        console.log('=== DEBUG VINCULAR AGENTE ===');
        console.log('Total de agentes carregados:', allAgents.length);
        console.log('Agentes carregados:', allAgents.map(a => ({ id: a.id, name: a.name, collections: a.collections?.length || 0 })));
        console.log('Agentes já vinculados (IDs):', linkedAgentIds);
        console.log('Resposta getCollectionAgents:', linkedResponse);
        
        setAgents(allAgents);
        setLinkedAgents(linkedAgentIds);
      } catch (error) {
        console.error('Erro ao carregar agentes:', error);
        toast.error('Erro ao carregar agentes');
      } finally {
        setLoading(false);
      }
    };

    loadAgents();
  }, [collectionId]);

  // Filtrar agentes
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (agent.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Agentes disponíveis para vincular (não vinculados)
  const availableAgents = filteredAgents.filter(agent => {
    const isLinked = linkedAgents.includes(agent.id);
    console.log(`Agente ${agent.name} (${agent.id}): isLinked = ${isLinked}`);
    return !isLinked;
  });
  
  console.log('=== FILTRO DE AGENTES ===');
  console.log('Agentes filtrados por busca:', filteredAgents.length);
  console.log('Agentes disponíveis para vincular:', availableAgents.length);
  console.log('IDs dos agentes vinculados:', linkedAgents);

  const handleAgentSelect = (agentId: string, checked: boolean) => {
    if (checked) {
      setSelectedAgents(prev => [...prev, agentId]);
    } else {
      setSelectedAgents(prev => prev.filter(id => id !== agentId));
    }
  };

  const handleLinkAgents = async () => {
    if (selectedAgents.length === 0) {
      toast.error('Selecione pelo menos um agente');
      return;
    }

    try {
      setLinking(true);
      
      // Vincular cada agente selecionado
      for (const agentId of selectedAgents) {
        await collectionService.linkAgentToCollection(agentId, collectionId);
      }
      
      toast.success(`${selectedAgents.length} agente(s) vinculado(s) com sucesso!`);
      onLinkSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao vincular agentes:', error);
      toast.error('Erro ao vincular agentes');
    } finally {
      setLinking(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'training':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'training':
        return 'Treinando';
      case 'inactive':
        return 'Inativo';
      default:
        return 'Desconhecido';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando agentes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar agentes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Lista de agentes */}
      <div className="max-h-96 overflow-y-auto space-y-2">
        {availableAgents.length === 0 ? (
          <div className="text-center py-8">
            <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {searchTerm ? 'Nenhum agente encontrado' : 'Todos os agentes já estão vinculados'}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm 
                ? 'Tente ajustar o termo de busca' 
                : 'Não há agentes disponíveis para vincular a esta coleção'
              }
            </p>
          </div>
        ) : (
          availableAgents.map((agent) => (
            <Card key={agent.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={selectedAgents.includes(agent.id)}
                    onCheckedChange={(checked) => handleAgentSelect(agent.id, checked as boolean)}
                    className="mt-1"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{agent.name}</h4>
                      <Badge className={getStatusColor(agent.status)}>
                        {getStatusText(agent.status)}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-1">
                      {agent.type} • {agent.conversations || 0} conversas
                    </p>
                    
                    {agent.description && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {agent.description}
                      </p>
                    )}
                    
                    {agent.successRate && (
                      <div className="flex items-center mt-2 text-xs text-muted-foreground">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {agent.successRate}% de sucesso
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Ações */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          {selectedAgents.length} agente(s) selecionado(s)
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleLinkAgents}
            disabled={selectedAgents.length === 0 || linking}
          >
            {linking ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Vinculando...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Vincular Agentes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}