'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Monitor,
  Moon,
  Sun,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Upload,
  Download,
  Trash2,
  Check,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useMultiTenantAuth } from '@/providers/multi-tenant-auth-provider';
import { useSettings } from '@/hooks/use-settings';

// Cores do tema disponíveis

const themeColors = [
  { name: 'Azul Nex', value: '#0072b9', class: 'bg-[#0072b9]' },
  { name: 'Verde', value: '#10b981', class: 'bg-green-500' },
  { name: 'Azul Nex', value: '#0072b9', class: 'bg-[#0072b9]' },
  { name: 'Rosa', value: '#ec4899', class: 'bg-pink-500' },
  { name: 'Laranja', value: '#f59e0b', class: 'bg-orange-500' },
  { name: 'Vermelho', value: '#ef4444', class: 'bg-red-500' }
];

export default function SettingsPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user } = useMultiTenantAuth();
  const {
    userSettings,
    tenantSettings,
    isLoading,
    error,
    updateUserSettings,
    updateTenantSettings,
    resetUserSettings,
    resetTenantSettings
  } = useSettings();

  const handleSave = async () => {
    try {
      await updateUserSettings(userSettings);
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    }
  };

  const handleReset = async () => {
    try {
      await resetUserSettings();
      toast.info('Configurações restauradas para o padrão');
    } catch (error) {
      toast.error('Erro ao restaurar configurações');
    }
  };

  const updateSetting = (section: string, key: string, value: any) => {
    const updatedSettings = {
      ...userSettings,
      [section]: {
        ...userSettings[section as keyof typeof userSettings],
        [key]: value
      }
    };
    updateUserSettings(updatedSettings);
  };

  const updateNestedSetting = (section: string, subsection: string, key: string, value: any) => {
    const updatedSettings = {
      ...userSettings,
      [section]: {
        ...userSettings[section as keyof typeof userSettings],
        [subsection]: {
          ...(userSettings[section as keyof typeof userSettings] as any)[subsection],
          [key]: value
        }
      }
    };
    updateUserSettings(updatedSettings);
  };

  // Exibir estado de carregamento
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando configurações...</span>
        </div>
      </div>
    );
  }

  // Exibir erro se houver
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="h-6 w-6" />
          <span>Erro ao carregar configurações: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Personalize sua experiência na plataforma
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Restaurar Padrão
          </Button>
          
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Aparência
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacidade
          </TabsTrigger>
          <TabsTrigger value="language" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Idioma
          </TabsTrigger>
        </TabsList>

        {/* Perfil */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Gerencie suas informações de perfil e conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {userSettings.profile.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Alterar Foto
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remover
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={userSettings.profile.name}
                    onChange={(e) => updateSetting('profile', 'name', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userSettings.profile.email}
                    onChange={(e) => updateSetting('profile', 'email', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={userSettings.profile.phone}
                    onChange={(e) => updateSetting('profile', 'phone', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="department">Departamento</Label>
                  <Input
                    id="department"
                    value={userSettings.profile.department}
                    onChange={(e) => updateSetting('profile', 'department', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Biografia</Label>
                <Textarea
                  id="bio"
                  value={userSettings.profile.bio}
                    onChange={(e) => updateSetting('profile', 'bio', e.target.value)}
                  placeholder="Conte um pouco sobre você..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>
                Gerencie sua senha e configurações de segurança
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Senha Atual</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha atual"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova Senha</Label>
                  <Input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite a nova senha"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Senha</Label>
                  <Input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirme a nova senha"
                  />
                </div>
              </div>
              
              <Button variant="outline">
                Alterar Senha
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aparência */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tema</CardTitle>
              <CardDescription>
                Escolha como a interface deve aparecer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Seletor de tema */}
              <div className="space-y-3">
                <Label>Modo de Exibição</Label>
                <Select
                  value={userSettings.appearance.theme || 'system'}
                  onValueChange={(value) => updateSetting('appearance', 'theme', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Escuro</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Cores do tema */}
              <div className="space-y-3">
                <Label>Cor Principal</Label>
                <div className="grid grid-cols-6 gap-2">
                  {themeColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => updateSetting('appearance', 'primaryColor', color.value)}
                      className={`
                        relative w-12 h-12 rounded-lg ${color.class} 
                        hover:scale-105 transition-transform
                        ${userSettings.appearance.primaryColor === color.value ? 'ring-2 ring-offset-2 ring-foreground' : ''}
                      `}
                      title={color.name}
                    >
                      {userSettings.appearance.primaryColor === color.value && (
                        <Check className="absolute inset-0 m-auto h-4 w-4 text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tamanho da fonte */}
              <div className="space-y-3">
                <Label>Tamanho da Fonte</Label>
                <Select
                  value={userSettings.appearance.fontSize || 'medium'}
                  onValueChange={(value) => updateSetting('appearance', 'fontSize', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tamanho" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Pequena</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="large">Grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Opções de interface */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sidebar Recolhida</Label>
                    <p className="text-sm text-muted-foreground">
                      Manter a barra lateral recolhida por padrão
                    </p>
                  </div>
                  <Switch
                    checked={userSettings.appearance.sidebarCollapsed}
                    onCheckedChange={(checked) => updateSetting('appearance', 'sidebarCollapsed', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Animações</Label>
                    <p className="text-sm text-muted-foreground">
                      Habilitar animações e transições
                    </p>
                  </div>
                  <Switch
                    checked={userSettings.appearance.animations}
                    onCheckedChange={(checked) => updateSetting('appearance', 'animations', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo Compacto</Label>
                    <p className="text-sm text-muted-foreground">
                      Reduzir espaçamentos para mais conteúdo
                    </p>
                  </div>
                  <Switch
                    checked={userSettings.appearance.compactMode}
                    onCheckedChange={(checked) => updateSetting('appearance', 'compactMode', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notificações */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notificações por Email</CardTitle>
              <CardDescription>
                Configure quando receber emails de notificação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Novas Mensagens</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber email quando houver novas mensagens
                  </p>
                </div>
                <Switch
                  checked={userSettings.notifications.email.newMessages}
                  onCheckedChange={(checked) => updateNestedSetting('notifications', 'email', 'newMessages', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Atualizações de Tickets</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificações sobre mudanças em tickets
                  </p>
                </div>
                <Switch
                  checked={userSettings.notifications.email.ticketUpdates}
                  onCheckedChange={(checked) => updateNestedSetting('notifications', 'email', 'ticketUpdates', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alertas do Sistema</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificações importantes do sistema
                  </p>
                </div>
                <Switch
                  checked={userSettings.notifications.email.systemAlerts}
                  onCheckedChange={(checked) => updateNestedSetting('notifications', 'email', 'systemAlerts', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Relatórios Semanais</Label>
                  <p className="text-sm text-muted-foreground">
                    Resumo semanal de atividades
                  </p>
                </div>
                <Switch
                  checked={userSettings.notifications.email.weeklyReports}
                  onCheckedChange={(checked) => updateNestedSetting('notifications', 'email', 'weeklyReports', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notificações Push</CardTitle>
              <CardDescription>
                Configure notificações em tempo real no navegador
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Novas Mensagens</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificação instantânea para novas mensagens
                  </p>
                </div>
                <Switch
                  checked={userSettings.notifications.push.newMessages}
                  onCheckedChange={(checked) => updateNestedSetting('notifications', 'push', 'newMessages', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Atribuições de Tickets</Label>
                  <p className="text-sm text-muted-foreground">
                    Quando um ticket for atribuído a você
                  </p>
                </div>
                <Switch
                  checked={userSettings.notifications.push.ticketAssignments}
                  onCheckedChange={(checked) => updateNestedSetting('notifications', 'push', 'ticketAssignments', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Menções</Label>
                  <p className="text-sm text-muted-foreground">
                    Quando você for mencionado em conversas
                  </p>
                </div>
                <Switch
                  checked={userSettings.notifications.push.mentions}
                  onCheckedChange={(checked) => updateNestedSetting('notifications', 'push', 'mentions', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sons</CardTitle>
              <CardDescription>
                Configure alertas sonoros para notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Habilitar Sons</Label>
                  <p className="text-sm text-muted-foreground">
                    Reproduzir sons para notificações
                  </p>
                </div>
                <Switch
                  checked={userSettings.notifications.sound.enabled}
                  onCheckedChange={(checked) => updateNestedSetting('notifications', 'sound', 'enabled', checked)}
                />
              </div>
              
              {userSettings.notifications.sound.enabled && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Volume ({userSettings.notifications.sound.volume}%)</Label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={userSettings.notifications.sound.volume}
                      onChange={(e) => updateNestedSetting('notifications', 'sound', 'volume', parseInt(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacidade */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visibilidade do Perfil</CardTitle>
              <CardDescription>
                Controle quem pode ver suas informações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label>Visibilidade</Label>
                <Select
                  value={userSettings.privacy.profileVisibility || 'team'}
                  onValueChange={(value) => updateSetting('privacy', 'profileVisibility', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a visibilidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Público</SelectItem>
                    <SelectItem value="team">Apenas Equipe</SelectItem>
                    <SelectItem value="private">Privado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Status de Atividade</Label>
                  <p className="text-sm text-muted-foreground">
                    Mostrar quando você está online
                  </p>
                </div>
                <Switch
                  checked={userSettings.privacy.activityStatus}
                  onCheckedChange={(checked) => updateSetting('privacy', 'activityStatus', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Confirmações de Leitura</Label>
                  <p className="text-sm text-muted-foreground">
                    Mostrar quando você leu mensagens
                  </p>
                </div>
                <Switch
                  checked={userSettings.privacy.readReceipts}
                  onCheckedChange={(checked) => updateSetting('privacy', 'readReceipts', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Indicadores de Digitação</Label>
                  <p className="text-sm text-muted-foreground">
                    Mostrar quando você está digitando
                  </p>
                </div>
                <Switch
                  checked={userSettings.privacy.typingIndicators}
                  onCheckedChange={(checked) => updateSetting('privacy', 'typingIndicators', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dados e Analytics</CardTitle>
              <CardDescription>
                Controle como seus dados são utilizados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Coleta de Dados</Label>
                  <p className="text-sm text-muted-foreground">
                    Permitir coleta de dados para melhorar o serviço
                  </p>
                </div>
                <Switch
                  checked={userSettings.privacy.dataCollection}
                  onCheckedChange={(checked) => updateSetting('privacy', 'dataCollection', checked)}
                />
              </div>
              
              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Meus Dados
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Idioma */}
        <TabsContent value="language" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Idioma e Região</CardTitle>
              <CardDescription>
                Configure idioma, fuso horário e formatos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Idioma da Interface</Label>
                  <Select
                    value={userSettings.language.interface || 'pt-BR'}
                    onValueChange={(value) => updateSetting('language', 'interface', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o idioma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Fuso Horário</Label>
                  <Select
                    value={userSettings.language.timezone || 'America/Sao_Paulo'}
                    onValueChange={(value) => updateSetting('language', 'timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o fuso horário" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                      <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Formato de Data</Label>
                  <Select
                    value={userSettings.language.dateFormat || 'DD/MM/YYYY'}
                    onValueChange={(value) => updateSetting('language', 'dateFormat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o formato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/AAAA</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/AAAA</SelectItem>
                      <SelectItem value="YYYY-MM-DD">AAAA-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Formato de Hora</Label>
                  <Select
                    value={userSettings.language.timeFormat || '24h'}
                    onValueChange={(value) => updateSetting('language', 'timeFormat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o formato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">24 horas</SelectItem>
                      <SelectItem value="12h">12 horas (AM/PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}