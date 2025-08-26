'use client';

import { useState, useEffect, useRef } from 'react';
import { Agent } from '@/types/agent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageCircle, 
  Link, 
  Globe, 
  Smartphone,
  Monitor,
  Settings,
  QrCode,
  Copy,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock,
  Palette,
  Type,
  Image,
  Volume2
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface EnvironmentsConfigProps {
  agent: Agent;
  initialConfig?: EnvironmentConfiguration;
  onConfigChange: (section: string, config: any) => void;
}

interface EnvironmentConfiguration {
  whatsapp: WhatsAppConfig;
  webChat: WebChatConfig;
  website: WebsiteConfig;
  mobile: MobileConfig;
}

interface WhatsAppConfig {
  enabled: boolean;
  phoneNumber: string;
  businessAccountId: string;
  accessToken: string;
  webhookUrl: string;
  verifyToken: string;
  status: 'connected' | 'disconnected' | 'pending';
  lastSync: string;
  features: {
    mediaMessages: boolean;
    templateMessages: boolean;
    interactiveMessages: boolean;
    businessProfile: boolean;
  };
  businessProfile: {
    name: string;
    description: string;
    website: string;
    email: string;
    address: string;
  };
}

interface WebChatConfig {
  enabled: boolean;
  widgetId: string;
  embedCode: string;
  customization: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    borderRadius: number;
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    size: 'small' | 'medium' | 'large';
    showAvatar: boolean;
    showTypingIndicator: boolean;
    playMessageSounds: boolean;
  };
  behavior: {
    autoOpen: boolean;
    autoOpenDelay: number;
    showWelcomeMessage: boolean;
    allowFileUpload: boolean;
    maxFileSize: number;
    allowedFileTypes: string[];
  };
  branding: {
    showPoweredBy: boolean;
    customLogo: string;
    customTitle: string;
    customSubtitle: string;
  };
}

interface WebsiteConfig {
  enabled: boolean;
  domain: string;
  subdomain: string;
  customDomain: string;
  sslEnabled: boolean;
  status: 'active' | 'inactive' | 'deploying';
  theme: {
    template: string;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    layout: 'centered' | 'sidebar' | 'fullwidth';
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
    favicon: string;
    ogImage: string;
  };
  analytics: {
    googleAnalytics: string;
    facebookPixel: string;
    customScripts: string;
  };
}

interface MobileConfig {
  enabled: boolean;
  appName: string;
  bundleId: string;
  version: string;
  buildNumber: number;
  status: 'development' | 'review' | 'published';
  platforms: {
    ios: {
      enabled: boolean;
      appStoreId: string;
      certificateId: string;
    };
    android: {
      enabled: boolean;
      playStoreId: string;
      keystore: string;
    };
  };
  features: {
    pushNotifications: boolean;
    offlineMode: boolean;
    biometricAuth: boolean;
    darkMode: boolean;
  };
  branding: {
    appIcon: string;
    splashScreen: string;
    primaryColor: string;
    secondaryColor: string;
  };
}

function getDefaultConfig(agent: Agent): EnvironmentConfiguration {
  return {
    whatsapp: {
      enabled: agent.environments?.whatsapp?.enabled || false,
      phoneNumber: agent.environments?.whatsapp?.phoneNumber || '',
      businessAccountId: agent.environments?.whatsapp?.businessAccountId || '',
      accessToken: agent.environments?.whatsapp?.accessToken || '',
      webhookUrl: agent.environments?.whatsapp?.webhookUrl || '',
      verifyToken: agent.environments?.whatsapp?.verifyToken || '',
      status: agent.environments?.whatsapp?.status || 'disconnected',
      lastSync: agent.environments?.whatsapp?.lastSync || '',
      features: {
        mediaMessages: agent.environments?.whatsapp?.features?.mediaMessages || false,
        templateMessages: agent.environments?.whatsapp?.features?.templateMessages || false,
        interactiveMessages: agent.environments?.whatsapp?.features?.interactiveMessages || false,
        businessProfile: agent.environments?.whatsapp?.features?.businessProfile || false
      },
      businessProfile: {
        name: agent.environments?.whatsapp?.businessProfile?.name || '',
        description: agent.environments?.whatsapp?.businessProfile?.description || '',
        website: agent.environments?.whatsapp?.businessProfile?.website || '',
        email: agent.environments?.whatsapp?.businessProfile?.email || '',
        address: agent.environments?.whatsapp?.businessProfile?.address || ''
      }
    },
    webChat: {
      enabled: agent.environments?.webChat?.enabled || false,
      widgetId: agent.environments?.webChat?.widgetId || '',
      embedCode: agent.environments?.webChat?.embedCode || '',
      customization: {
        primaryColor: agent.environments?.webChat?.customization?.primaryColor || '#3B82F6',
        secondaryColor: agent.environments?.webChat?.customization?.secondaryColor || '#1F2937',
        fontFamily: agent.environments?.webChat?.customization?.fontFamily || 'Inter',
        borderRadius: agent.environments?.webChat?.customization?.borderRadius || 12,
        position: agent.environments?.webChat?.customization?.position || 'bottom-right',
        size: agent.environments?.webChat?.customization?.size || 'medium',
        showAvatar: agent.environments?.webChat?.customization?.showAvatar || true,
        showTypingIndicator: agent.environments?.webChat?.customization?.showTypingIndicator || true,
        playMessageSounds: agent.environments?.webChat?.customization?.playMessageSounds || true
      },
      behavior: {
        autoOpen: agent.environments?.webChat?.behavior?.autoOpen || false,
        autoOpenDelay: agent.environments?.webChat?.behavior?.autoOpenDelay || 5000,
        showWelcomeMessage: agent.environments?.webChat?.behavior?.showWelcomeMessage || true,
        allowFileUpload: agent.environments?.webChat?.behavior?.allowFileUpload || true,
        maxFileSize: agent.environments?.webChat?.behavior?.maxFileSize || 10485760,
        allowedFileTypes: agent.environments?.webChat?.behavior?.allowedFileTypes || ['image/*', 'application/pdf']
      },
      branding: {
        showPoweredBy: agent.environments?.webChat?.branding?.showPoweredBy || true,
        customLogo: agent.environments?.webChat?.branding?.customLogo || '',
        customTitle: agent.environments?.webChat?.branding?.customTitle || '',
        customSubtitle: agent.environments?.webChat?.branding?.customSubtitle || ''
      }
    },
    website: {
      enabled: agent.environments?.website?.enabled || false,
      domain: agent.environments?.website?.domain || '',
      subdomain: agent.environments?.website?.subdomain || '',
      customDomain: agent.environments?.website?.customDomain || '',
      sslEnabled: agent.environments?.website?.sslEnabled || false,
      status: agent.environments?.website?.status || 'inactive',
      theme: {
        template: agent.environments?.website?.theme?.template || 'modern',
        primaryColor: agent.environments?.website?.theme?.primaryColor || '#3B82F6',
        secondaryColor: agent.environments?.website?.theme?.secondaryColor || '#1F2937',
        fontFamily: agent.environments?.website?.theme?.fontFamily || 'Inter',
        layout: agent.environments?.website?.theme?.layout || 'centered'
      },
      seo: {
        title: agent.environments?.website?.seo?.title || '',
        description: agent.environments?.website?.seo?.description || '',
        keywords: agent.environments?.website?.seo?.keywords || [],
        favicon: agent.environments?.website?.seo?.favicon || '',
        ogImage: agent.environments?.website?.seo?.ogImage || ''
      },
      analytics: {
        googleAnalytics: agent.environments?.website?.analytics?.googleAnalytics || '',
        facebookPixel: agent.environments?.website?.analytics?.facebookPixel || '',
        customScripts: agent.environments?.website?.analytics?.customScripts || ''
      }
    },
    mobile: {
      enabled: agent.environments?.mobile?.enabled || false,
      appName: agent.environments?.mobile?.appName || '',
      bundleId: agent.environments?.mobile?.bundleId || '',
      version: agent.environments?.mobile?.version || '1.0.0',
      buildNumber: agent.environments?.mobile?.buildNumber || 1,
      status: agent.environments?.mobile?.status || 'development',
      platforms: {
        ios: {
          enabled: agent.environments?.mobile?.platforms?.ios?.enabled || false,
          appStoreId: agent.environments?.mobile?.platforms?.ios?.appStoreId || '',
          certificateId: agent.environments?.mobile?.platforms?.ios?.certificateId || ''
        },
        android: {
          enabled: agent.environments?.mobile?.platforms?.android?.enabled || false,
          playStoreId: agent.environments?.mobile?.platforms?.android?.playStoreId || '',
          keystore: agent.environments?.mobile?.platforms?.android?.keystore || ''
        }
      },
      features: {
        pushNotifications: agent.environments?.mobile?.features?.pushNotifications || false,
        offlineMode: agent.environments?.mobile?.features?.offlineMode || false,
        biometricAuth: agent.environments?.mobile?.features?.biometricAuth || false,
        darkMode: agent.environments?.mobile?.features?.darkMode || false
      },
      branding: {
        appIcon: agent.environments?.mobile?.branding?.appIcon || '',
        splashScreen: agent.environments?.mobile?.branding?.splashScreen || '',
        primaryColor: agent.environments?.mobile?.branding?.primaryColor || '#3B82F6',
        secondaryColor: agent.environments?.mobile?.branding?.secondaryColor || '#1F2937'
      }
    }
  };
}

export default function EnvironmentsConfig({ agent, initialConfig, onConfigChange }: EnvironmentsConfigProps) {
  const [config, setConfig] = useState<EnvironmentConfiguration>(() => 
    initialConfig || getDefaultConfig(agent)
  );
  const [copiedCode, setCopiedCode] = useState(false);
  const initialConfigRef = useRef(initialConfig);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // Só atualiza se é a primeira vez ou se initialConfig realmente mudou
    if (!isInitializedRef.current) {
      // Primeira inicialização
      if (initialConfig) {
        setConfig(initialConfig);
      } else {
        const newConfig = getDefaultConfig(agent);
        setConfig(newConfig);
      }
      isInitializedRef.current = true;
      initialConfigRef.current = initialConfig;
    } else if (initialConfig && initialConfig !== initialConfigRef.current) {
      // initialConfig mudou após a inicialização
      setConfig(initialConfig);
      initialConfigRef.current = initialConfig;
    }
  }, [agent, initialConfig]);

  const handleConfigUpdate = (environment: keyof EnvironmentConfiguration, updates: any) => {
    // Se estamos habilitando o WhatsApp, também atualizar o status para 'pending'
    if (environment === 'whatsapp' && updates.enabled === true && !config.whatsapp?.enabled) {
      updates = { ...updates, status: 'pending' };
    }
    // Se estamos desabilitando o WhatsApp, voltar status para 'disconnected'
    if (environment === 'whatsapp' && updates.enabled === false) {
      updates = { ...updates, status: 'disconnected' };
    }
    
    const newConfig = {
      ...config,
      [environment]: { ...(config[environment] || {}), ...updates }
    };
    
    setConfig(newConfig);
    onConfigChange('ambientes', newConfig);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const generateQRCode = () => {
    // Simular geração de QR Code
    alert('QR Code gerado! Escaneie com seu WhatsApp Business.');
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="whatsapp" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="webchat" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Web Chat
          </TabsTrigger>
          <TabsTrigger value="website" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Website
          </TabsTrigger>
          <TabsTrigger value="mobile" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Mobile
          </TabsTrigger>
        </TabsList>

        {/* WhatsApp Tab */}
        <TabsContent value="whatsapp" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    WhatsApp Business
                  </CardTitle>
                  <CardDescription>
                    Configure a integração com WhatsApp Business API
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={config.whatsapp?.status === 'connected' ? 'default' : 'secondary'}>
                    {config.whatsapp?.status === 'connected' ? 'Conectado' : 
                     config.whatsapp?.status === 'pending' ? 'Pendente' : 'Desconectado'}
                  </Badge>
                  <Switch
                    checked={config.whatsapp?.enabled || false}
                    onCheckedChange={(checked) => handleConfigUpdate('whatsapp', { enabled: checked })}
                  />
                </div>
              </div>
            </CardHeader>
            
            {config.whatsapp?.enabled && (
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Número de Telefone</Label>
                    <Input
                      id="phoneNumber"
                      value={config.whatsapp?.phoneNumber || ''}
                      onChange={(e) => handleConfigUpdate('whatsapp', { phoneNumber: e.target.value })}
                      placeholder="+55 11 99999-9999"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="businessAccountId">Business Account ID</Label>
                    <Input
                      id="businessAccountId"
                      value={config.whatsapp?.businessAccountId || ''}
                      onChange={(e) => handleConfigUpdate('whatsapp', { businessAccountId: e.target.value })}
                      placeholder="123456789"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accessToken">Access Token</Label>
                  <Input
                    id="accessToken"
                    type="password"
                    value={config.whatsapp?.accessToken || ''}
                    onChange={(e) => handleConfigUpdate('whatsapp', { accessToken: e.target.value })}
                    placeholder="Seu access token do WhatsApp"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="verifyToken">Verify Token</Label>
                  <Input
                    id="verifyToken"
                    value={config.whatsapp?.verifyToken || ''}
                    onChange={(e) => handleConfigUpdate('whatsapp', { verifyToken: e.target.value })}
                    placeholder="Token de verificação do webhook"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="webhookUrl"
                      value={config.whatsapp?.webhookUrl || ''}
                      onChange={(e) => handleConfigUpdate('whatsapp', { webhookUrl: e.target.value })}
                      placeholder="https://sua-api.com/webhook/whatsapp"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(config.whatsapp?.webhookUrl || '')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-base font-medium">Recursos Habilitados</Label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <Label>Mensagens de Mídia</Label>
                      <Switch
                        checked={config.whatsapp?.features?.mediaMessages || false}
                        onCheckedChange={(checked) => 
                          handleConfigUpdate('whatsapp', { 
                            features: { ...config.whatsapp?.features, mediaMessages: checked }
                          })
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Templates de Mensagem</Label>
                      <Switch
                        checked={config.whatsapp?.features?.templateMessages || false}
                        onCheckedChange={(checked) => 
                          handleConfigUpdate('whatsapp', { 
                            features: { ...config.whatsapp?.features, templateMessages: checked }
                          })
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Mensagens Interativas</Label>
                      <Switch
                        checked={config.whatsapp?.features?.interactiveMessages || false}
                        onCheckedChange={(checked) => 
                          handleConfigUpdate('whatsapp', { 
                            features: { ...config.whatsapp?.features, interactiveMessages: checked }
                          })
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Perfil Comercial</Label>
                      <Switch
                        checked={config.whatsapp?.features?.businessProfile || false}
                        onCheckedChange={(checked) => 
                          handleConfigUpdate('whatsapp', { 
                            features: { ...config.whatsapp?.features, businessProfile: checked }
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {config.whatsapp?.features?.businessProfile && (
                  <>
                    <Separator />
                    
                    <div className="space-y-4">
                      <Label className="text-base font-medium">Perfil Comercial</Label>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nome da Empresa</Label>
                          <Input
                            value={config.whatsapp?.businessProfile?.name || ''}
                            onChange={(e) => 
                              handleConfigUpdate('whatsapp', { 
                                businessProfile: { ...config.whatsapp?.businessProfile, name: e.target.value }
                              })
                            }
                            placeholder="Nome da sua empresa"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Website</Label>
                          <Input
                            value={config.whatsapp?.businessProfile?.website || ''}
                            onChange={(e) => 
                              handleConfigUpdate('whatsapp', { 
                                businessProfile: { ...config.whatsapp?.businessProfile, website: e.target.value }
                              })
                            }
                            placeholder="https://www.empresa.com"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={config.whatsapp?.businessProfile?.email || ''}
                            onChange={(e) => 
                              handleConfigUpdate('whatsapp', { 
                                businessProfile: { ...config.whatsapp?.businessProfile, email: e.target.value }
                              })
                            }
                            placeholder="contato@empresa.com"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Endereço</Label>
                          <Input
                            value={config.whatsapp?.businessProfile?.address || ''}
                            onChange={(e) => 
                              handleConfigUpdate('whatsapp', { 
                                businessProfile: { ...config.whatsapp?.businessProfile, address: e.target.value }
                              })
                            }
                            placeholder="Rua, Cidade, Estado"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Descrição</Label>
                        <Textarea
                          value={config.whatsapp?.businessProfile?.description || ''}
                          onChange={(e) => 
                            handleConfigUpdate('whatsapp', { 
                              businessProfile: { ...config.whatsapp?.businessProfile, description: e.target.value }
                            })
                          }
                          placeholder="Descrição da sua empresa"
                          className="min-h-[80px]"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex gap-2">
                  <Button onClick={generateQRCode} className="flex items-center gap-2">
                    <QrCode className="h-4 w-4" />
                    Gerar QR Code
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Testar Conexão
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>

        {/* Web Chat Tab */}
        <TabsContent value="webchat" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Web Chat Widget
                  </CardTitle>
                  <CardDescription>
                    Configure o widget de chat para seu website
                  </CardDescription>
                </div>
                <Switch
                  checked={config.webChat?.enabled || false}
                  onCheckedChange={(checked) => handleConfigUpdate('webChat', { enabled: checked })}
                />
              </div>
            </CardHeader>
            
            {config.webChat?.enabled && (
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-base font-medium">Código de Incorporação</Label>
                  
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Textarea
                        value={config.webChat?.embedCode || ''}
                        readOnly
                        className="min-h-[100px] font-mono text-sm"
                        placeholder="Código será gerado automaticamente..."
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(config.webChat?.embedCode || '')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    {copiedCode && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          Código copiado para a área de transferência!
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-base font-medium">Personalização Visual</Label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Cor Primária</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={config.webChat?.customization?.primaryColor || '#3B82F6'}
                          onChange={(e) => 
                            handleConfigUpdate('webChat', { 
                              customization: { ...config.webChat?.customization, primaryColor: e.target.value }
                            })
                          }
                          className="w-16 h-10 p-1 border rounded"
                        />
                        <Input
                          value={config.webChat?.customization?.primaryColor || '#3B82F6'}
                          onChange={(e) => 
                            handleConfigUpdate('webChat', { 
                              customization: { ...config.webChat?.customization, primaryColor: e.target.value }
                            })
                          }
                          placeholder="#3B82F6"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Posição</Label>
                      <Select
                        value={config.webChat?.customization?.position || 'bottom-right'}
                        onValueChange={(value) => 
                          handleConfigUpdate('webChat', { 
                            customization: { ...config.webChat?.customization, position: value }
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a posição" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bottom-right">Inferior Direita</SelectItem>
                          <SelectItem value="bottom-left">Inferior Esquerda</SelectItem>
                          <SelectItem value="top-right">Superior Direita</SelectItem>
                          <SelectItem value="top-left">Superior Esquerda</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Tamanho</Label>
                      <Select
                        value={config.webChat?.customization?.size || 'medium'}
                        onValueChange={(value) => 
                          handleConfigUpdate('webChat', { 
                            customization: { ...config.webChat?.customization, size: value }
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tamanho" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Pequeno</SelectItem>
                          <SelectItem value="medium">Médio</SelectItem>
                          <SelectItem value="large">Grande</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between">
                      <Label>Mostrar Avatar</Label>
                      <Switch
                        checked={config.webChat?.customization?.showAvatar || false}
                        onCheckedChange={(checked) => 
                          handleConfigUpdate('webChat', { 
                            customization: { ...config.webChat?.customization, showAvatar: checked }
                          })
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Indicador de Digitação</Label>
                      <Switch
                        checked={config.webChat?.customization?.showTypingIndicator || false}
                        onCheckedChange={(checked) => 
                          handleConfigUpdate('webChat', { 
                            customization: { ...config.webChat?.customization, showTypingIndicator: checked }
                          })
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Sons de Mensagem</Label>
                      <Switch
                        checked={config.webChat?.customization?.playMessageSounds || false}
                        onCheckedChange={(checked) => 
                          handleConfigUpdate('webChat', { 
                            customization: { ...config.webChat?.customization, playMessageSounds: checked }
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-base font-medium">Comportamento</Label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <Label>Abertura Automática</Label>
                      <Switch
                        checked={config.webChat?.behavior?.autoOpen || false}
                        onCheckedChange={(checked) => 
                          handleConfigUpdate('webChat', { 
                            behavior: { ...config.webChat?.behavior, autoOpen: checked }
                          })
                        }
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Delay de Abertura (ms)</Label>
                      <Input
                        type="number"
                        value={config.webChat?.behavior?.autoOpenDelay || 5000}
                        onChange={(e) => 
                          handleConfigUpdate('webChat', { 
                            behavior: { ...config.webChat?.behavior, autoOpenDelay: parseInt(e.target.value) }
                          })
                        }
                        disabled={!config.webChat?.behavior?.autoOpen}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-medium">Upload de Arquivos</Label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <Label>Permitir Upload</Label>
                      <Switch
                        checked={config.webChat?.behavior?.allowFileUpload || false}
                        onCheckedChange={(checked) => 
                          handleConfigUpdate('webChat', { 
                            behavior: { ...config.webChat?.behavior, allowFileUpload: checked }
                          })
                        }
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Tamanho Máximo</Label>
                      <Select
                        value={(config.webChat?.behavior?.maxFileSize || 10485760).toString()}
                        onValueChange={(value) => 
                          handleConfigUpdate('webChat', { 
                            behavior: { ...config.webChat?.behavior, maxFileSize: parseInt(value) }
                          })
                        }
                        disabled={!config.webChat?.behavior?.allowFileUpload}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tamanho máximo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1048576">1 MB</SelectItem>
                          <SelectItem value="5242880">5 MB</SelectItem>
                          <SelectItem value="10485760">10 MB</SelectItem>
                          <SelectItem value="20971520">20 MB</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>

        {/* Website Tab */}
        <TabsContent value="website" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Website Público
                  </CardTitle>
                  <CardDescription>
                    Configure um website público para seu agente
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={config.website?.status === 'active' ? 'default' : 'secondary'}>
                    {config.website?.status === 'active' ? 'Ativo' : 
                     config.website?.status === 'deploying' ? 'Implantando' : 'Inativo'}
                  </Badge>
                  <Switch
                    checked={config.website?.enabled || false}
                    onCheckedChange={(checked) => {
                      const newStatus = checked ? 'deploying' : 'inactive';
                      handleConfigUpdate('website', { enabled: checked, status: newStatus });
                    }}
                  />
                </div>
              </div>
            </CardHeader>
            
            {config.website?.enabled && (
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Subdomínio</Label>
                    <div className="flex">
                      <Input
                        value={config.website?.subdomain || ''}
                        onChange={(e) => handleConfigUpdate('website', { subdomain: e.target.value })}
                        placeholder="meuagente"
                        className="rounded-r-none"
                      />
                      <div className="flex items-center px-3 bg-muted border border-l-0 rounded-r-md text-sm text-muted-foreground">
                        .nexchat.ai
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Domínio Personalizado</Label>
                    <Input
                      value={config.website?.customDomain || ''}
                      onChange={(e) => handleConfigUpdate('website', { customDomain: e.target.value })}
                      placeholder="chat.meusite.com"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label>SSL Habilitado</Label>
                  <Switch
                    checked={config.website?.sslEnabled || false}
                    onCheckedChange={(checked) => handleConfigUpdate('website', { sslEnabled: checked })}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-base font-medium">Tema e Layout</Label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Template</Label>
                      <Select
                        value={config.website?.theme?.template || 'modern'}
                        onValueChange={(value) => 
                          handleConfigUpdate('website', { 
                            theme: { ...config.website?.theme, template: value }
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o template" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="modern">Moderno</SelectItem>
                          <SelectItem value="classic">Clássico</SelectItem>
                          <SelectItem value="minimal">Minimalista</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Layout</Label>
                      <Select
                        value={config.website?.theme?.layout || 'centered'}
                        onValueChange={(value) => 
                          handleConfigUpdate('website', { 
                            theme: { ...config.website?.theme, layout: value }
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o layout" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="centered">Centralizado</SelectItem>
                          <SelectItem value="sidebar">Barra Lateral</SelectItem>
                          <SelectItem value="fullwidth">Largura Total</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Fonte</Label>
                      <Select
                        value={config.website?.theme?.fontFamily || 'Inter'}
                        onValueChange={(value) => 
                          handleConfigUpdate('website', { 
                            theme: { ...config.website?.theme, fontFamily: value }
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a fonte" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Roboto">Roboto</SelectItem>
                          <SelectItem value="Open Sans">Open Sans</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>

        {/* Mobile Tab */}
        <TabsContent value="mobile" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Aplicativo Mobile
                  </CardTitle>
                  <CardDescription>
                    Configure um aplicativo mobile para seu agente
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={config.mobile?.status === 'published' ? 'default' : 'secondary'}>
                    {config.mobile?.status === 'published' ? 'Publicado' : 
                     config.mobile?.status === 'review' ? 'Em Análise' : 'Desenvolvimento'}
                  </Badge>
                  <Switch
                    checked={config.mobile?.enabled || false}
                    onCheckedChange={(checked) => handleConfigUpdate('mobile', { enabled: checked })}
                  />
                </div>
              </div>
            </CardHeader>
            
            {config.mobile?.enabled && (
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome do Aplicativo</Label>
                    <Input
                      value={config.mobile?.appName || ''}
                      onChange={(e) => handleConfigUpdate('mobile', { appName: e.target.value })}
                      placeholder="Meu Agente App"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Bundle ID</Label>
                    <Input
                      value={config.mobile?.bundleId || ''}
                      onChange={(e) => handleConfigUpdate('mobile', { bundleId: e.target.value })}
                      placeholder="com.empresa.agente"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-medium">Plataformas</Label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium">iOS App Store</h4>
                          <Switch
                            checked={config.mobile?.platforms?.ios?.enabled || false}
                            onCheckedChange={(checked) => 
                              handleConfigUpdate('mobile', { 
                                platforms: { 
                                  ...config.mobile?.platforms, 
                                  ios: { ...config.mobile?.platforms?.ios, enabled: checked }
                                }
                              })
                            }
                          />
                        </div>
                        
                        {config.mobile?.platforms?.ios?.enabled && (
                          <div className="space-y-2">
                            <Label>App Store ID</Label>
                            <Input
                              value={config.mobile?.platforms?.ios?.appStoreId || ''}
                              onChange={(e) => 
                                handleConfigUpdate('mobile', { 
                                  platforms: { 
                                    ...config.mobile?.platforms, 
                                    ios: { ...config.mobile?.platforms?.ios, appStoreId: e.target.value }
                                  }
                                })
                              }
                              placeholder="123456789"
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium">Google Play Store</h4>
                          <Switch
                            checked={config.mobile?.platforms?.android?.enabled || false}
                            onCheckedChange={(checked) => 
                              handleConfigUpdate('mobile', { 
                                platforms: { 
                                  ...config.mobile?.platforms, 
                                  android: { ...config.mobile?.platforms?.android, enabled: checked }
                                }
                              })
                            }
                          />
                        </div>
                        
                        {config.mobile?.platforms?.android?.enabled && (
                          <div className="space-y-2">
                            <Label>Play Store ID</Label>
                            <Input
                              value={config.mobile?.platforms?.android?.playStoreId || ''}
                              onChange={(e) => 
                                handleConfigUpdate('mobile', { 
                                  platforms: { 
                                    ...config.mobile?.platforms, 
                                    android: { ...config.mobile?.platforms?.android, playStoreId: e.target.value }
                                  }
                                })
                              }
                              placeholder="com.empresa.agente"
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-medium">Recursos</Label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <Label>Notificações Push</Label>
                      <Switch
                        checked={config.mobile?.features?.pushNotifications || false}
                        onCheckedChange={(checked) => 
                          handleConfigUpdate('mobile', { 
                            features: { ...config.mobile?.features, pushNotifications: checked }
                          })
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Modo Offline</Label>
                      <Switch
                        checked={config.mobile?.features?.offlineMode || false}
                        onCheckedChange={(checked) => 
                          handleConfigUpdate('mobile', { 
                            features: { ...config.mobile?.features, offlineMode: checked }
                          })
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Autenticação Biométrica</Label>
                      <Switch
                        checked={config.mobile?.features?.biometricAuth || false}
                        onCheckedChange={(checked) => 
                          handleConfigUpdate('mobile', { 
                            features: { ...config.mobile?.features, biometricAuth: checked }
                          })
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Modo Escuro</Label>
                      <Switch
                        checked={config.mobile?.features?.darkMode || false}
                        onCheckedChange={(checked) => 
                          handleConfigUpdate('mobile', { 
                            features: { ...config.mobile?.features, darkMode: checked }
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}