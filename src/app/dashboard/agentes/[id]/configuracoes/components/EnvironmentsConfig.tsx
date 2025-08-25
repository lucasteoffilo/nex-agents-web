'use client';

import { useState } from 'react';
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
  agentId: string;
  onConfigChange: () => void;
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
  status: 'published' | 'review' | 'development';
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

const mockConfig: EnvironmentConfiguration = {
  whatsapp: {
    enabled: true,
    phoneNumber: '+5511999999999',
    businessAccountId: 'ba_123456789',
    accessToken: '***hidden***',
    webhookUrl: 'https://api.empresa.com/webhook/whatsapp',
    verifyToken: '***hidden***',
    status: 'connected',
    lastSync: '2024-01-20T10:30:00Z',
    features: {
      mediaMessages: true,
      templateMessages: true,
      interactiveMessages: true,
      businessProfile: true
    },
    businessProfile: {
      name: 'Minha Empresa',
      description: 'Atendimento automatizado 24/7',
      website: 'https://www.empresa.com',
      email: 'contato@empresa.com',
      address: 'Rua das Empresas, 123 - São Paulo, SP'
    }
  },
  webChat: {
    enabled: true,
    widgetId: 'widget_abc123',
    embedCode: '<script src="https://chat.empresa.com/widget.js" data-widget-id="widget_abc123"></script>',
    customization: {
      primaryColor: '#3B82F6',
      secondaryColor: '#1F2937',
      fontFamily: 'Inter',
      borderRadius: 12,
      position: 'bottom-right',
      size: 'medium',
      showAvatar: true,
      showTypingIndicator: true,
      playMessageSounds: true
    },
    behavior: {
      autoOpen: false,
      autoOpenDelay: 5000,
      showWelcomeMessage: true,
      allowFileUpload: true,
      maxFileSize: 10485760, // 10MB
      allowedFileTypes: ['image/*', 'application/pdf', '.doc', '.docx']
    },
    branding: {
      showPoweredBy: false,
      customLogo: 'https://empresa.com/logo.png',
      customTitle: 'Fale Conosco',
      customSubtitle: 'Estamos aqui para ajudar!'
    }
  },
  website: {
    enabled: true,
    domain: 'empresa.nexchat.ai',
    subdomain: 'empresa',
    customDomain: 'chat.empresa.com',
    sslEnabled: true,
    status: 'active',
    theme: {
      template: 'modern',
      primaryColor: '#3B82F6',
      secondaryColor: '#1F2937',
      fontFamily: 'Inter',
      layout: 'centered'
    },
    seo: {
      title: 'Atendimento Automatizado - Minha Empresa',
      description: 'Converse com nosso assistente virtual 24/7',
      keywords: ['atendimento', 'suporte', 'chatbot', 'empresa'],
      favicon: 'https://empresa.com/favicon.ico',
      ogImage: 'https://empresa.com/og-image.png'
    },
    analytics: {
      googleAnalytics: 'GA_MEASUREMENT_ID',
      facebookPixel: 'FB_PIXEL_ID',
      customScripts: ''
    }
  },
  mobile: {
    enabled: false,
    appName: 'Minha Empresa App',
    bundleId: 'com.empresa.app',
    version: '1.0.0',
    buildNumber: 1,
    status: 'development',
    platforms: {
      ios: {
        enabled: false,
        appStoreId: '',
        certificateId: ''
      },
      android: {
        enabled: false,
        playStoreId: '',
        keystore: ''
      }
    },
    features: {
      pushNotifications: true,
      offlineMode: true,
      biometricAuth: false,
      darkMode: true
    },
    branding: {
      appIcon: '',
      splashScreen: '',
      primaryColor: '#3B82F6',
      secondaryColor: '#1F2937'
    }
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'connected':
    case 'active':
    case 'published': return 'text-green-600';
    case 'disconnected':
    case 'inactive': return 'text-red-600';
    case 'pending':
    case 'deploying':
    case 'review':
    case 'development': return 'text-yellow-600';
    default: return 'text-gray-600';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'connected':
    case 'active':
    case 'published': return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'disconnected':
    case 'inactive': return <AlertCircle className="h-4 w-4 text-red-600" />;
    case 'pending':
    case 'deploying':
    case 'review':
    case 'development': return <Clock className="h-4 w-4 text-yellow-600" />;
    default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
  }
};

const formatFileSize = (bytes: number) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export default function EnvironmentsConfig({ agentId, onConfigChange }: EnvironmentsConfigProps) {
  const [config, setConfig] = useState<EnvironmentConfiguration>(mockConfig);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleConfigUpdate = (environment: keyof EnvironmentConfiguration, updates: any) => {
    setConfig(prev => ({
      ...prev,
      [environment]: { ...prev[environment], ...updates }
    }));
    onConfigChange();
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

        {/* WhatsApp Configuration */}
        <TabsContent value="whatsapp" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Configuração WhatsApp Business
                  </CardTitle>
                  <CardDescription>
                    Configure a integração com WhatsApp Business API
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(config.whatsapp.status)}
                  <Badge className={getStatusColor(config.whatsapp.status)}>
                    {config.whatsapp.status === 'connected' ? 'Conectado' : 
                     config.whatsapp.status === 'disconnected' ? 'Desconectado' : 'Pendente'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Habilitar WhatsApp</Label>
                  <p className="text-sm text-muted-foreground">
                    Ativar integração com WhatsApp Business
                  </p>
                </div>
                <Switch
                  checked={config.whatsapp.enabled}
                  onCheckedChange={(checked) => handleConfigUpdate('whatsapp', { enabled: checked })}
                />
              </div>

              {config.whatsapp.enabled && (
                <div className="space-y-6">
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Número do WhatsApp</Label>
                      <Input 
                        value={config.whatsapp.phoneNumber} 
                        placeholder="+55 11 99999-9999"
                        onChange={(e) => handleConfigUpdate('whatsapp', { phoneNumber: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Business Account ID</Label>
                      <Input 
                        value={config.whatsapp.businessAccountId} 
                        placeholder="ba_123456789"
                        onChange={(e) => handleConfigUpdate('whatsapp', { businessAccountId: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Access Token</Label>
                      <Input 
                        type="password"
                        value={config.whatsapp.accessToken} 
                        placeholder="Token de acesso"
                        onChange={(e) => handleConfigUpdate('whatsapp', { accessToken: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Verify Token</Label>
                      <Input 
                        type="password"
                        value={config.whatsapp.verifyToken} 
                        placeholder="Token de verificação"
                        onChange={(e) => handleConfigUpdate('whatsapp', { verifyToken: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Webhook URL</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={config.whatsapp.webhookUrl} 
                        placeholder="https://api.empresa.com/webhook/whatsapp"
                        onChange={(e) => handleConfigUpdate('whatsapp', { webhookUrl: e.target.value })}
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => copyToClipboard(config.whatsapp.webhookUrl)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Recursos Habilitados</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <Label>Mensagens de Mídia</Label>
                        <Switch 
                          checked={config.whatsapp.features.mediaMessages}
                          onCheckedChange={(checked) => 
                            handleConfigUpdate('whatsapp', {
                              features: { ...config.whatsapp.features, mediaMessages: checked }
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Mensagens Template</Label>
                        <Switch 
                          checked={config.whatsapp.features.templateMessages}
                          onCheckedChange={(checked) => 
                            handleConfigUpdate('whatsapp', {
                              features: { ...config.whatsapp.features, templateMessages: checked }
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Mensagens Interativas</Label>
                        <Switch 
                          checked={config.whatsapp.features.interactiveMessages}
                          onCheckedChange={(checked) => 
                            handleConfigUpdate('whatsapp', {
                              features: { ...config.whatsapp.features, interactiveMessages: checked }
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Perfil Business</Label>
                        <Switch 
                          checked={config.whatsapp.features.businessProfile}
                          onCheckedChange={(checked) => 
                            handleConfigUpdate('whatsapp', {
                              features: { ...config.whatsapp.features, businessProfile: checked }
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={generateQRCode}>
                      <QrCode className="h-4 w-4 mr-2" />
                      Gerar QR Code
                    </Button>
                    <Button variant="outline">
                      Testar Conexão
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Web Chat Configuration */}
        <TabsContent value="webchat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Widget de Chat Web
              </CardTitle>
              <CardDescription>
                Configure o widget de chat para seu website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Habilitar Web Chat</Label>
                  <p className="text-sm text-muted-foreground">
                    Ativar widget de chat no website
                  </p>
                </div>
                <Switch
                  checked={config.webChat.enabled}
                  onCheckedChange={(checked) => handleConfigUpdate('webChat', { enabled: checked })}
                />
              </div>

              {config.webChat.enabled && (
                <div className="space-y-6">
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label>Código de Incorporação</Label>
                    <div className="relative">
                      <Textarea 
                        value={config.webChat.embedCode}
                        readOnly
                        className="font-mono text-sm"
                        rows={3}
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(config.webChat.embedCode)}
                      >
                        {copiedCode ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Cole este código no HTML do seu website, antes da tag &lt;/body&gt;
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-medium">Personalização Visual</Label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Cor Primária</Label>
                        <div className="flex gap-2">
                          <Input 
                            type="color"
                            value={config.webChat.customization.primaryColor}
                            className="w-12 h-10 p-1 border rounded"
                            onChange={(e) => 
                              handleConfigUpdate('webChat', {
                                customization: { ...config.webChat.customization, primaryColor: e.target.value }
                              })
                            }
                          />
                          <Input 
                            value={config.webChat.customization.primaryColor}
                            placeholder="#3B82F6"
                            onChange={(e) => 
                              handleConfigUpdate('webChat', {
                                customization: { ...config.webChat.customization, primaryColor: e.target.value }
                              })
                            }
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Posição</Label>
                        <Select 
                          value={config.webChat.customization.position}
                          onValueChange={(value) => 
                            handleConfigUpdate('webChat', {
                              customization: { ...config.webChat.customization, position: value }
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
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
                          value={config.webChat.customization.size}
                          onValueChange={(value) => 
                            handleConfigUpdate('webChat', {
                              customization: { ...config.webChat.customization, size: value }
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Pequeno</SelectItem>
                            <SelectItem value="medium">Médio</SelectItem>
                            <SelectItem value="large">Grande</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center justify-between">
                        <Label>Mostrar Avatar</Label>
                        <Switch 
                          checked={config.webChat.customization.showAvatar}
                          onCheckedChange={(checked) => 
                            handleConfigUpdate('webChat', {
                              customization: { ...config.webChat.customization, showAvatar: checked }
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Indicador de Digitação</Label>
                        <Switch 
                          checked={config.webChat.customization.showTypingIndicator}
                          onCheckedChange={(checked) => 
                            handleConfigUpdate('webChat', {
                              customization: { ...config.webChat.customization, showTypingIndicator: checked }
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Sons de Mensagem</Label>
                        <Switch 
                          checked={config.webChat.customization.playMessageSounds}
                          onCheckedChange={(checked) => 
                            handleConfigUpdate('webChat', {
                              customization: { ...config.webChat.customization, playMessageSounds: checked }
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Abrir Automaticamente</Label>
                        <Switch 
                          checked={config.webChat.behavior.autoOpen}
                          onCheckedChange={(checked) => 
                            handleConfigUpdate('webChat', {
                              behavior: { ...config.webChat.behavior, autoOpen: checked }
                            })
                          }
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
                          checked={config.webChat.behavior.allowFileUpload}
                          onCheckedChange={(checked) => 
                            handleConfigUpdate('webChat', {
                              behavior: { ...config.webChat.behavior, allowFileUpload: checked }
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tamanho Máximo: {formatFileSize(config.webChat.behavior.maxFileSize)}</Label>
                        <Input 
                          type="number"
                          value={config.webChat.behavior.maxFileSize / 1048576} // Convert to MB
                          onChange={(e) => 
                            handleConfigUpdate('webChat', {
                              behavior: { ...config.webChat.behavior, maxFileSize: parseInt(e.target.value) * 1048576 }
                            })
                          }
                          placeholder="10"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Website Configuration */}
        <TabsContent value="website" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Website Dedicado
                  </CardTitle>
                  <CardDescription>
                    Configure um site dedicado para o agente
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(config.website.status)}
                  <Badge className={getStatusColor(config.website.status)}>
                    {config.website.status === 'active' ? 'Ativo' : 
                     config.website.status === 'inactive' ? 'Inativo' : 'Implantando'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Habilitar Website</Label>
                  <p className="text-sm text-muted-foreground">
                    Criar um site dedicado para o agente
                  </p>
                </div>
                <Switch
                  checked={config.website.enabled}
                  onCheckedChange={(checked) => handleConfigUpdate('website', { enabled: checked })}
                />
              </div>

              {config.website.enabled && (
                <div className="space-y-6">
                  <Separator />
                  
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Configuração de Domínio</Label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Subdomínio</Label>
                        <div className="flex items-center gap-2">
                          <Input 
                            value={config.website.subdomain}
                            placeholder="empresa"
                            onChange={(e) => handleConfigUpdate('website', { subdomain: e.target.value })}
                          />
                          <span className="text-sm text-muted-foreground">.nexchat.ai</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Seu site ficará em: {config.website.subdomain}.nexchat.ai
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Domínio Personalizado</Label>
                        <Input 
                          value={config.website.customDomain}
                          placeholder="chat.empresa.com"
                          onChange={(e) => handleConfigUpdate('website', { customDomain: e.target.value })}
                        />
                        <p className="text-sm text-muted-foreground">
                          Configure um CNAME para apontar para nossos servidores
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>SSL Habilitado</Label>
                        <p className="text-sm text-muted-foreground">
                          Certificado SSL automático (HTTPS)
                        </p>
                      </div>
                      <Switch
                        checked={config.website.sslEnabled}
                        onCheckedChange={(checked) => handleConfigUpdate('website', { sslEnabled: checked })}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-medium">Tema e Aparência</Label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Template</Label>
                        <Select 
                          value={config.website.theme.template}
                          onValueChange={(value) => 
                            handleConfigUpdate('website', {
                              theme: { ...config.website.theme, template: value }
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="modern">Moderno</SelectItem>
                            <SelectItem value="classic">Clássico</SelectItem>
                            <SelectItem value="minimal">Minimalista</SelectItem>
                            <SelectItem value="corporate">Corporativo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Layout</Label>
                        <Select 
                          value={config.website.theme.layout}
                          onValueChange={(value) => 
                            handleConfigUpdate('website', {
                              theme: { ...config.website.theme, layout: value }
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
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
                          value={config.website.theme.fontFamily}
                          onValueChange={(value) => 
                            handleConfigUpdate('website', {
                              theme: { ...config.website.theme, fontFamily: value }
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Inter">Inter</SelectItem>
                            <SelectItem value="Roboto">Roboto</SelectItem>
                            <SelectItem value="Open Sans">Open Sans</SelectItem>
                            <SelectItem value="Poppins">Poppins</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visualizar Site
                    </Button>
                    <Button variant="outline">
                      Publicar Alterações
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mobile Configuration */}
        <TabsContent value="mobile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Aplicativo Mobile
              </CardTitle>
              <CardDescription>
                Configure aplicativos nativos iOS e Android
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Habilitar App Mobile</Label>
                  <p className="text-sm text-muted-foreground">
                    Criar aplicativos nativos para iOS e Android
                  </p>
                </div>
                <Switch
                  checked={config.mobile.enabled}
                  onCheckedChange={(checked) => handleConfigUpdate('mobile', { enabled: checked })}
                />
              </div>

              {config.mobile.enabled && (
                <div className="space-y-6">
                  <Separator />
                  
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      O desenvolvimento de aplicativos mobile está em fase beta. 
                      Entre em contato com nosso suporte para mais informações.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome do App</Label>
                      <Input 
                        value={config.mobile.appName}
                        placeholder="Minha Empresa App"
                        onChange={(e) => handleConfigUpdate('mobile', { appName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Bundle ID</Label>
                      <Input 
                        value={config.mobile.bundleId}
                        placeholder="com.empresa.app"
                        onChange={(e) => handleConfigUpdate('mobile', { bundleId: e.target.value })}
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
                              checked={config.mobile.platforms.ios.enabled}
                              onCheckedChange={(checked) => 
                                handleConfigUpdate('mobile', {
                                  platforms: { 
                                    ...config.mobile.platforms, 
                                    ios: { ...config.mobile.platforms.ios, enabled: checked }
                                  }
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>App Store ID</Label>
                            <Input 
                              value={config.mobile.platforms.ios.appStoreId}
                              placeholder="123456789"
                              disabled={!config.mobile.platforms.ios.enabled}
                            />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium">Google Play Store</h4>
                            <Switch 
                              checked={config.mobile.platforms.android.enabled}
                              onCheckedChange={(checked) => 
                                handleConfigUpdate('mobile', {
                                  platforms: { 
                                    ...config.mobile.platforms, 
                                    android: { ...config.mobile.platforms.android, enabled: checked }
                                  }
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Play Store ID</Label>
                            <Input 
                              value={config.mobile.platforms.android.playStoreId}
                              placeholder="com.empresa.app"
                              disabled={!config.mobile.platforms.android.enabled}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-medium">Recursos do App</Label>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center justify-between">
                        <Label>Push Notifications</Label>
                        <Switch 
                          checked={config.mobile.features.pushNotifications}
                          onCheckedChange={(checked) => 
                            handleConfigUpdate('mobile', {
                              features: { ...config.mobile.features, pushNotifications: checked }
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Modo Offline</Label>
                        <Switch 
                          checked={config.mobile.features.offlineMode}
                          onCheckedChange={(checked) => 
                            handleConfigUpdate('mobile', {
                              features: { ...config.mobile.features, offlineMode: checked }
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Auth Biométrica</Label>
                        <Switch 
                          checked={config.mobile.features.biometricAuth}
                          onCheckedChange={(checked) => 
                            handleConfigUpdate('mobile', {
                              features: { ...config.mobile.features, biometricAuth: checked }
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Modo Escuro</Label>
                        <Switch 
                          checked={config.mobile.features.darkMode}
                          onCheckedChange={(checked) => 
                            handleConfigUpdate('mobile', {
                              features: { ...config.mobile.features, darkMode: checked }
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}