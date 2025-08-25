'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import apiService from '@/services/api';
import { useApiCall } from './use-api-retry';
import { AppError } from '@/types/error';

// Tipos para configurações de usuário
export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  role: string;
  department?: string;
  phone?: string;
  bio?: string;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  sidebarCollapsed: boolean;
  animations: boolean;
  compactMode: boolean;
}

export interface NotificationSettings {
  email: {
    newMessages: boolean;
    ticketUpdates: boolean;
    systemAlerts: boolean;
    weeklyReports: boolean;
  };
  push: {
    newMessages: boolean;
    ticketAssignments: boolean;
    mentions: boolean;
    systemAlerts: boolean;
  };
  sound: {
    enabled: boolean;
    volume: number;
    newMessage: string;
    mention: string;
  };
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'team' | 'private';
  activityStatus: boolean;
  readReceipts: boolean;
  typingIndicators: boolean;
  dataCollection: boolean;
}

export interface LanguageSettings {
  interface: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
}

export interface UserSettings {
  profile: UserProfile;
  appearance: AppearanceSettings;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  language: LanguageSettings;
}

export interface TenantSettings {
  name: string;
  domain: string;
  logo?: string;
  primaryColor: string;
  features: {
    chatEnabled: boolean;
    agentsEnabled: boolean;
    knowledgeBaseEnabled: boolean;
    analyticsEnabled: boolean;
    customBrandingEnabled: boolean;
  };
  limits: {
    maxUsers: number;
    maxAgents: number;
    maxDocuments: number;
    storageLimit: number;
  };
  integrations: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    webhooksEnabled: boolean;
    apiAccessEnabled: boolean;
  };
}

export function useSettings() {
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [tenantSettings, setTenantSettings] = useState<TenantSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  
  const {
    executeWithRetry: executeUserSettingsCall,
    isLoading: isLoadingUser
  } = useApiCall<UserSettings>({
    onError: (error) => setError(error)
  });
  
  const {
    executeWithRetry: executeTenantSettingsCall,
    isLoading: isLoadingTenant
  } = useApiCall<TenantSettings>({
    onError: (error) => setError(error)
  });
  
  const isLoading = isLoadingUser || isLoadingTenant;

  // Carregar configurações do usuário
  const loadUserSettings = async () => {
    try {
      setError(null);
      const response = await executeUserSettingsCall(() => apiService.getSettings());
      
      if (response.success && response.data) {
        setUserSettings(response.data);
      } else {
        throw new Error(response.message || 'Erro ao carregar configurações');
      }
    } catch (err) {
      // Erro já tratado pelo hook de retry
      console.error('Erro ao carregar configurações do usuário:', err);
    }
  };

  // Carregar configurações do tenant
  const loadTenantSettings = async () => {
    try {
      setError(null);
      const response = await executeTenantSettingsCall(() => apiService.getTenantSettings());
      
      if (response.success && response.data) {
        setTenantSettings(response.data);
      } else {
        throw new Error(response.message || 'Erro ao carregar configurações do tenant');
      }
    } catch (err) {
      // Erro já tratado pelo hook de retry
      console.error('Erro ao carregar configurações do tenant:', err);
    }
  };

  // Atualizar configurações do usuário
  const updateUserSettings = async (settings: Partial<UserSettings>) => {
    try {
      setIsSaving(true);
      setError(null);
      
      const response = await executeUserSettingsCall(() => apiService.updateSettings(settings));
      
      if (response.success && response.data) {
        setUserSettings(response.data);
        toast.success('Configurações atualizadas com sucesso!');
        return response.data;
      } else {
        throw new Error(response.message || 'Erro ao atualizar configurações');
      }
    } catch (err) {
      // Erro já tratado pelo hook de retry
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // Atualizar configurações do tenant
  const updateTenantSettings = async (settings: Partial<TenantSettings>) => {
    try {
      setIsSaving(true);
      setError(null);
      
      const response = await executeTenantSettingsCall(() => apiService.updateTenantSettings(settings));
      
      if (response.success && response.data) {
        setTenantSettings(response.data);
        toast.success('Configurações do tenant atualizadas com sucesso!');
        return response.data;
      } else {
        throw new Error(response.message || 'Erro ao atualizar configurações do tenant');
      }
    } catch (err) {
      // Erro já tratado pelo hook de retry
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // Atualizar seção específica das configurações
  const updateUserSettingsSection = async <K extends keyof UserSettings>(
    section: K,
    data: Partial<UserSettings[K]>
  ) => {
    if (!userSettings) return;
    
    const updatedSettings = {
      ...userSettings,
      [section]: {
        ...userSettings[section],
        ...data
      }
    };
    
    return updateUserSettings(updatedSettings);
  };

  // Resetar configurações para padrão
  const resetUserSettings = async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      // Aqui você pode implementar um endpoint específico para reset
      // ou usar configurações padrão
      const defaultSettings: UserSettings = {
        profile: {
          name: '',
          email: '',
          role: 'user'
        },
        appearance: {
          theme: 'system',
          primaryColor: '#6366f1',
          fontSize: 'medium',
          sidebarCollapsed: false,
          animations: true,
          compactMode: false
        },
        notifications: {
          email: {
            newMessages: true,
            ticketUpdates: true,
            systemAlerts: true,
            weeklyReports: false
          },
          push: {
            newMessages: true,
            ticketAssignments: true,
            mentions: true,
            systemAlerts: false
          },
          sound: {
            enabled: true,
            volume: 50,
            newMessage: 'notification.mp3',
            mention: 'mention.mp3'
          }
        },
        privacy: {
          profileVisibility: 'team',
          activityStatus: true,
          readReceipts: true,
          typingIndicators: true,
          dataCollection: true
        },
        language: {
          interface: 'pt-BR',
          timezone: 'America/Sao_Paulo',
          dateFormat: 'DD/MM/YYYY',
          timeFormat: '24h'
        }
      };
      
      return updateUserSettings(defaultSettings);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao resetar configurações';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // Carregar configurações na inicialização
  useEffect(() => {
    loadUserSettings();
    loadTenantSettings();
  }, []);

  return {
    // Estados
    userSettings,
    tenantSettings,
    isLoading,
    isSaving,
    error,
    
    // Ações
    loadUserSettings,
    loadTenantSettings,
    updateUserSettings,
    updateTenantSettings,
    updateUserSettingsSection,
    resetUserSettings,
    
    // Utilitários
    refresh: () => {
      loadUserSettings();
      loadTenantSettings();
    }
  };
}

export default useSettings;