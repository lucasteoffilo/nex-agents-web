'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Agent } from '@/services/agent-service';
import { 
  Wrench, 
  Plus, 
  Trash2, 
  Settings, 
  Code, 
  Globe, 
  Database, 
  Calculator,
  Calendar,
  Mail,
  Phone,
  CreditCard,
  FileText,
  Image,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ToolsConfigProps {
  agent: Agent;
  initialConfig?: ToolConfiguration;
  onConfigChange: (config: ToolConfiguration) => void;
}

interface ToolConfiguration {
  enabledTools: EnabledTool[];
  availableTools: AvailableTool[];
  customFunctions: CustomFunction[];
  apiIntegrations: ApiIntegration[];
  variables: Variable[];
  webhooks: Webhook[];
}

interface EnabledTool {
  id: string;
  name: string;
  category: string;
  enabled: boolean;
  config: Record<string, any>;
}

interface AvailableTool {
  id: string;
  name: string;
  description: string;
  category: 'communication' | 'data' | 'utility' | 'integration' | 'custom';
  icon: string;
  requiresConfig: boolean;
  configSchema?: any;
}

interface CustomFunction {
  id: string;
  name: string;
  description: string;
  code: string;
  parameters: Parameter[];
  returnType: string;
  enabled: boolean;
}

interface Parameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description: string;
  defaultValue?: any;
}

interface ApiIntegration {
  id: string;
  name: string;
  baseUrl: string;
  authType: 'none' | 'bearer' | 'apikey' | 'basic';
  authConfig: Record<string, string>;
  headers: Record<string, string>;
  endpoints: ApiEndpoint[];
  enabled: boolean;
  lastTested?: string;
  status: 'active' | 'error' | 'untested';
}

interface ApiEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  parameters: Parameter[];
  enabled: boolean;
}

interface Variable {
  id: string;
  name: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'secret';
  description: string;
  scope: 'global' | 'agent';
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  method: 'POST' | 'PUT';
  headers: Record<string, string>;
  events: string[];
  enabled: boolean;
  lastTriggered?: string;
}

const getDefaultConfig = (agent: Agent): ToolConfiguration => ({
  enabledTools: agent.tools?.enabledTools || [
    {
      id: 'email-sender',
      name: 'Envio de Email',
      category: 'communication',
      enabled: true,
      config: {
        smtpServer: 'smtp.gmail.com',
        port: 587,
        username: 'agent@empresa.com'
      }
    },
    {
      id: 'calendar-integration',
      name: 'Integração com Calendário',
      category: 'utility',
      enabled: true,
      config: {
        provider: 'google',
        calendarId: 'primary'
      }
    },
    {
      id: 'payment-processor',
      name: 'Processador de Pagamentos',
      category: 'integration',
      enabled: false,
      config: {}
    }
  ],
  availableTools: agent.tools?.availableTools || [],
  customFunctions: agent.tools?.customFunctions || [
    {
      id: 'custom-001',
      name: 'Calcular Desconto',
      description: 'Calcula desconto baseado no valor e tipo de cliente',
      code: `function calcularDesconto(valor, tipoCliente) {
  const descontos = {
    'premium': 0.15,
    'gold': 0.10,
    'silver': 0.05,
    'regular': 0
  };
  
  const desconto = descontos[tipoCliente] || 0;
  return valor * (1 - desconto);
}`,
      parameters: [
        {
          name: 'valor',
          type: 'number',
          required: true,
          description: 'Valor original do produto'
        },
        {
          name: 'tipoCliente',
          type: 'string',
          required: true,
          description: 'Tipo do cliente (premium, gold, silver, regular)'
        }
      ],
      returnType: 'number',
      enabled: true
    }
  ],
  apiIntegrations: agent.tools?.apiIntegrations || [
    {
      id: 'api-001',
      name: 'API de Produtos',
      baseUrl: 'https://api.empresa.com',
      authType: 'bearer',
      authConfig: {
        token: '***hidden***'
      },
      headers: {
        'Content-Type': 'application/json'
      },
      endpoints: [
        {
          id: 'get-products',
          name: 'Listar Produtos',
          method: 'GET',
          path: '/produtos',
          description: 'Retorna lista de produtos disponíveis',
          parameters: [
            {
              name: 'categoria',
              type: 'string',
              required: false,
              description: 'Filtrar por categoria'
            }
          ],
          enabled: true
        },
        {
          id: 'get-product',
          name: 'Obter Produto',
          method: 'GET',
          path: '/produtos/{id}',
          description: 'Retorna detalhes de um produto específico',
          parameters: [
            {
              name: 'id',
              type: 'string',
              required: true,
              description: 'ID do produto'
            }
          ],
          enabled: true
        }
      ],
      enabled: true,
      lastTested: '2024-01-20T10:30:00Z',
      status: 'active'
    }
  ],
  variables: agent.tools?.variables || [
    {
      id: 'var-001',
      name: 'EMPRESA_NOME',
      value: 'Minha Empresa LTDA',
      type: 'string',
      description: 'Nome da empresa',
      scope: 'global'
    },
    {
      id: 'var-002',
      name: 'SUPORTE_EMAIL',
      value: 'suporte@empresa.com',
      type: 'string',
      description: 'Email de suporte',
      scope: 'global'
    },
    {
      id: 'var-003',
      name: 'API_KEY_PAGAMENTOS',
      value: '***hidden***',
      type: 'secret',
      description: 'Chave da API de pagamentos',
      scope: 'agent'
    }
  ],
  webhooks: agent.tools?.webhooks || [
    {
      id: 'webhook-001',
      name: 'Notificação de Vendas',
      url: 'https://webhook.empresa.com/vendas',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer token123',
        'Content-Type': 'application/json'
      },
      events: ['venda_realizada', 'pagamento_confirmado'],
      enabled: true,
      lastTriggered: '2024-01-20T09:15:00Z'
    }
  ]
});

const getToolIcon = (iconName: string) => {
  const icons: Record<string, any> = {
    Mail, Phone, Calendar, CreditCard, FileText, Image, Calculator, Globe, Database, MessageSquare
  };
  const IconComponent = icons[iconName] || Wrench;
  return <IconComponent className="h-4 w-4" />;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'success';
    case 'error': return 'destructive';
    case 'untested': return 'warning';
    default: return 'secondary';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active': return <CheckCircle className="h-4 w-4" />;
    case 'error': return <AlertCircle className="h-4 w-4" />;
    case 'untested': return <Clock className="h-4 w-4" />;
    default: return <AlertCircle className="h-4 w-4" />;
  }
};

export default function ToolsConfig({ agent, initialConfig, onConfigChange }: ToolsConfigProps) {
  const [config, setConfig] = useState<ToolConfiguration>(() => {
    if (initialConfig) {
      const defaultConfig = getDefaultConfig(agent);
      return {
        ...defaultConfig,
        ...initialConfig,
        // Para availableTools, sempre usar o que vem da API (pode ser vazio)
        availableTools: initialConfig.availableTools || [],
        // Para as outras seções, usar dados mockados como exemplo se estiver vazio
        customFunctions: initialConfig.customFunctions?.length > 0 ? initialConfig.customFunctions : defaultConfig.customFunctions,
        apiIntegrations: initialConfig.apiIntegrations?.length > 0 ? initialConfig.apiIntegrations : defaultConfig.apiIntegrations,
        variables: initialConfig.variables?.length > 0 ? initialConfig.variables : defaultConfig.variables,
        webhooks: initialConfig.webhooks?.length > 0 ? initialConfig.webhooks : defaultConfig.webhooks
      };
    }
    return getDefaultConfig(agent);
  });
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialConfig) {
      const defaultConfig = getDefaultConfig(agent);
      const mergedConfig = {
        ...defaultConfig,
        ...initialConfig,
        // Para availableTools, sempre usar o que vem da API (pode ser vazio)
        availableTools: initialConfig.availableTools || [],
        // Para as outras seções, usar dados mockados como exemplo se estiver vazio
        customFunctions: initialConfig.customFunctions?.length > 0 ? initialConfig.customFunctions : defaultConfig.customFunctions,
        apiIntegrations: initialConfig.apiIntegrations?.length > 0 ? initialConfig.apiIntegrations : defaultConfig.apiIntegrations,
        variables: initialConfig.variables?.length > 0 ? initialConfig.variables : defaultConfig.variables,
        webhooks: initialConfig.webhooks?.length > 0 ? initialConfig.webhooks : defaultConfig.webhooks
      };
      setConfig(mergedConfig);
    } else {
      setConfig(getDefaultConfig(agent));
    }
  }, [agent, initialConfig]);

  const handleConfigUpdate = (key: keyof ToolConfiguration, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  const toggleTool = (toolId: string) => {
    const updated = (config.enabledTools || []).map(tool => 
      tool.id === toolId ? { ...tool, enabled: !tool.enabled } : tool
    );
    handleConfigUpdate('enabledTools', updated);
  };

  const addCustomFunction = () => {
    const newFunction: CustomFunction = {
      id: Date.now().toString(),
      name: 'Nova Função',
      description: '',
      code: 'function novaFuncao() {\n  // Seu código aqui\n  return true;\n}',
      parameters: [],
      returnType: 'any',
      enabled: false
    };
    handleConfigUpdate('customFunctions', [...(config.customFunctions || []), newFunction]);
  };

  const addApiIntegration = () => {
    const newApi: ApiIntegration = {
      id: Date.now().toString(),
      name: 'Nova API',
      baseUrl: '',
      authType: 'none',
      authConfig: {},
      headers: {},
      endpoints: [],
      enabled: false,
      status: 'untested'
    };
    handleConfigUpdate('apiIntegrations', [...(config.apiIntegrations || []), newApi]);
  };

  const addVariable = () => {
    const newVariable: Variable = {
      id: Date.now().toString(),
      name: 'NOVA_VARIAVEL',
      value: '',
      type: 'string',
      description: '',
      scope: 'agent'
    };
    handleConfigUpdate('variables', [...(config.variables || []), newVariable]);
  };

  const addWebhook = () => {
    const newWebhook: Webhook = {
      id: Date.now().toString(),
      name: 'Novo Webhook',
      url: '',
      method: 'POST',
      headers: {},
      events: [],
      enabled: false
    };
    handleConfigUpdate('webhooks', [...(config.webhooks || []), newWebhook]);
  };

  const toggleSecretVisibility = (id: string) => {
    setShowSecrets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="tools" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="tools">Ferramentas</TabsTrigger>
          <TabsTrigger value="functions">Funções</TabsTrigger>
          <TabsTrigger value="apis">APIs</TabsTrigger>
          <TabsTrigger value="variables">Variáveis</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        {/* Available Tools */}
        <TabsContent value="tools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Ferramentas Disponíveis
              </CardTitle>
              <CardDescription>
                Habilite as ferramentas que o agente pode usar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(config.availableTools || []).length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    Nenhuma ferramenta disponível no momento
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    As ferramentas serão carregadas automaticamente quando disponíveis.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(config.availableTools || []).map((tool) => {
                    const enabledTool = (config.enabledTools || []).find(t => t.id === tool.id);
                    const isEnabled = enabledTool?.enabled || false;
                    
                    return (
                      <Card key={tool.id} className={`cursor-pointer transition-colors ${
                        isEnabled ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {getToolIcon(tool.icon)}
                              <h4 className="font-medium">{tool.name}</h4>
                            </div>
                            <Switch
                              checked={isEnabled}
                              onCheckedChange={() => toggleTool(tool.id)}
                            />
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {tool.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{tool.category}</Badge>
                            {tool.requiresConfig && (
                              <Button variant="ghost" size="sm">
                                <Settings className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Functions */}
        <TabsContent value="functions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Funções Personalizadas
                  </CardTitle>
                  <CardDescription>
                    Crie funções JavaScript customizadas para o agente
                  </CardDescription>
                </div>
                <Button onClick={addCustomFunction}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Função
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {(config.customFunctions || []).map((func) => (
                <Card key={func.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-medium">{func.name}</h4>
                        <p className="text-sm text-muted-foreground">{func.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={func.enabled}
                          onCheckedChange={(checked) => {
                            const updated = (config.customFunctions || []).map(f => 
                              f.id === func.id ? { ...f, enabled: checked } : f
                            );
                            handleConfigUpdate('customFunctions', updated);
                          }}
                        />
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <Label>Código da Função</Label>
                        <Textarea
                          value={func.code}
                          onChange={(e) => {
                            const updated = (config.customFunctions || []).map(f => 
                              f.id === func.id ? { ...f, code: e.target.value } : f
                            );
                            handleConfigUpdate('customFunctions', updated);
                          }}
                          className="font-mono text-sm"
                          rows={6}
                        />
                      </div>
                      
                      <div>
                        <Label>Parâmetros</Label>
                        <div className="space-y-2 mt-2">
                          {(func.parameters || []).map((param, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 border rounded">
                              <Badge variant="outline">{param.type}</Badge>
                              <span className="font-medium">{param.name}</span>
                              {param.required && <Badge variant="destructive" className="text-xs">obrigatório</Badge>}
                              <span className="text-sm text-muted-foreground flex-1">{param.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Integrations */}
        <TabsContent value="apis" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Integrações de API
                  </CardTitle>
                  <CardDescription>
                    Configure APIs externas que o agente pode acessar
                  </CardDescription>
                </div>
                <Button onClick={addApiIntegration}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova API
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {(config.apiIntegrations || []).map((api) => (
                <Card key={api.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div>
                          <h4 className="font-medium">{api.name}</h4>
                          <p className="text-sm text-muted-foreground">{api.baseUrl}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(api.status)}
                          <Badge variant={getStatusColor(api.status) as any}>
                            {api.status === 'active' ? 'Ativo' : 
                             api.status === 'error' ? 'Erro' : 'Não testado'}
                          </Badge>
                          <Badge variant="outline">{api.authType}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          Testar
                        </Button>
                        <Switch
                          checked={api.enabled}
                          onCheckedChange={(checked) => {
                            const updated = (config.apiIntegrations || []).map(a => 
                              a.id === api.id ? { ...a, enabled: checked } : a
                            );
                            handleConfigUpdate('apiIntegrations', updated);
                          }}
                        />
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>URL Base</Label>
                          <Input value={api.baseUrl} placeholder="https://api.exemplo.com" />
                        </div>
                        <div>
                          <Label>Tipo de Autenticação</Label>
                          <Select value={api.authType} onValueChange={() => {}}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a autenticação" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Nenhuma</SelectItem>
                              <SelectItem value="bearer">Bearer Token</SelectItem>
                              <SelectItem value="apikey">API Key</SelectItem>
                              <SelectItem value="basic">Basic Auth</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div>
                        <Label>Endpoints Disponíveis</Label>
                        <div className="space-y-2 mt-2">
                          {(api.endpoints || []).map((endpoint) => (
                            <div key={endpoint.id} className="flex items-center justify-between p-3 border rounded">
                              <div className="flex items-center gap-3">
                                <Badge variant={endpoint.method === 'GET' ? 'default' : 'secondary'}>
                                  {endpoint.method}
                                </Badge>
                                <div>
                                  <span className="font-medium">{endpoint.name}</span>
                                  <p className="text-sm text-muted-foreground">{endpoint.path}</p>
                                </div>
                              </div>
                              <Switch checked={endpoint.enabled} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Variables */}
        <TabsContent value="variables" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Variáveis de Ambiente
                  </CardTitle>
                  <CardDescription>
                    Configure variáveis que o agente pode usar
                  </CardDescription>
                </div>
                <Button onClick={addVariable}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Variável
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {(config.variables || []).map((variable) => (
                <div key={variable.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Nome</Label>
                      <Input value={variable.name} placeholder="NOME_VARIAVEL" />
                    </div>
                    <div>
                      <Label>Valor</Label>
                      <div className="relative">
                        <Input 
                          type={variable.type === 'secret' && !showSecrets[variable.id] ? 'password' : 'text'}
                          value={variable.value} 
                          placeholder="Valor da variável"
                        />
                        {variable.type === 'secret' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1 h-6 w-6 p-0"
                            onClick={() => toggleSecretVisibility(variable.id)}
                          >
                            {showSecrets[variable.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label>Tipo</Label>
                      <Select value={variable.type} onValueChange={() => {}}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                          <SelectItem value="secret">Secret</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Escopo</Label>
                      <Select value={variable.scope} onValueChange={() => {}}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o escopo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="global">Global</SelectItem>
                          <SelectItem value="agent">Agente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks */}
        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Webhooks
                  </CardTitle>
                  <CardDescription>
                    Configure notificações automáticas para eventos
                  </CardDescription>
                </div>
                <Button onClick={addWebhook}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Webhook
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {(config.webhooks || []).map((webhook) => (
                <Card key={webhook.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-medium">{webhook.name}</h4>
                        <p className="text-sm text-muted-foreground">{webhook.url}</p>
                        {webhook.lastTriggered && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Último disparo: {new Date(webhook.lastTriggered).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={webhook.enabled}
                          onCheckedChange={(checked) => {
                            const updated = (config.webhooks || []).map(w => 
                              w.id === webhook.id ? { ...w, enabled: checked } : w
                            );
                            handleConfigUpdate('webhooks', updated);
                          }}
                        />
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>URL do Webhook</Label>
                        <Input value={webhook.url} placeholder="https://webhook.exemplo.com" />
                      </div>
                      <div>
                        <Label>Método HTTP</Label>
                        <Select value={webhook.method} onValueChange={() => {}}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o método" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="POST">POST</SelectItem>
                            <SelectItem value="PUT">PUT</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Label>Eventos</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(webhook.events || []).map((event) => (
                          <Badge key={event} variant="secondary">
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Ferramentas e integrações podem afetar a performance do agente. 
          Habilite apenas as que são necessárias para o funcionamento adequado.
        </AlertDescription>
      </Alert>
    </div>
  );
}