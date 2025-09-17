export interface Agent {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  type: 'assistant' | 'chatbot' | 'support' | 'sales' | 'custom';
  status: 'active' | 'inactive' | 'training' | 'error';
  visibility: 'public' | 'private' | 'shared';
  systemPrompt?: string;
  instructions?: string;
  
  personality?: {
    tone?: 'formal' | 'casual' | 'friendly' | 'professional' | 'humorous';
    style?: 'concise' | 'detailed' | 'conversational' | 'technical';
    traits?: string[];
    customization?: Record<string, any>;
  };
  
  modelConfig?: {
    provider?: 'openai' | 'anthropic' | 'google' | 'deepseek' | 'local';
    model?: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stopSequences?: string[];
    customParams?: Record<string, any>;
  };
  
  capabilities?: {
    canAccessDocuments?: boolean;
    canSearchWeb?: boolean;
    canGenerateImages?: boolean;
    canAnalyzeFiles?: boolean;
    canExecuteCode?: boolean;
    canAccessAPIs?: boolean;
    customCapabilities?: string[];
  };
  
  knowledgeBase?: {
    documentIds?: string[];
    collections?: string[];
    selectedCollections?: string[];
    availableCollections?: string[];
    searchSettings?: {
      similarity?: number;
      maxResults?: number;
      includeMetadata?: boolean;
      similarityThreshold?: number;
    };
    customSources?: {
      type: string;
      config: Record<string, any>;
    }[];
  };
  
  tools?: {
    enabled?: string[];
    disabled?: string[];
    custom?: {
      name: string;
      description: string;
      endpoint: string;
      method: 'GET' | 'POST' | 'PUT' | 'DELETE';
      headers?: Record<string, string>;
      parameters?: Record<string, any>;
    }[];
  };
  
  settings?: {
    autoResponse?: boolean;
    responseDelay?: number;
    maxConversationLength?: number;
    memoryEnabled?: boolean;
    learningEnabled?: boolean;
    analyticsEnabled?: boolean;
    customSettings?: Record<string, any>;
  };
  
  environments?: {
    whatsapp?: {
      enabled?: boolean;
      phoneNumber?: string;
      businessAccountId?: string;
      accessToken?: string;
      webhookUrl?: string;
      verifyToken?: string;
      status?: 'pending' | 'connected' | 'disconnected';
      lastSync?: string;
      features?: {
        mediaMessages?: boolean;
        voiceMessages?: boolean;
        documentMessages?: boolean;
        locationMessages?: boolean;
        contactMessages?: boolean;
        templateMessages?: boolean;
        interactiveMessages?: boolean;
        businessProfile?: boolean;
      };
      businessProfile?: {
        name?: string;
        description?: string;
        email?: string;
        website?: string;
        address?: string;
        category?: string;
        profilePictureUrl?: string;
      };
    };
    telegram?: {
      enabled?: boolean;
      botToken?: string;
      webhookUrl?: string;
    };
    discord?: {
      enabled?: boolean;
      botToken?: string;
      guildId?: string;
    };
    slack?: {
      enabled?: boolean;
      botToken?: string;
      signingSecret?: string;
    };
    web?: {
      enabled?: boolean;
      embedCode?: string;
      allowedDomains?: string[];
    };
    webChat?: {
      enabled?: boolean;
      widgetId?: string;
      embedCode?: string;
      customization?: {
         theme?: string;
         position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
         colors?: {
           primary?: string;
           secondary?: string;
           background?: string;
           text?: string;
         };
         primaryColor?: string;
         secondaryColor?: string;
         fontFamily?: string;
         borderRadius?: number;
         avatar?: string;
         welcomeMessage?: string;
         placeholder?: string;
         showBranding?: boolean;
         buttonStyle?: string;
         chatHeight?: number;
         chatWidth?: number;
         size?: 'small' | 'medium' | 'large';
         showAvatar?: boolean;
         showTypingIndicator?: boolean;
         enableSounds?: boolean;
         autoOpen?: boolean;
         openDelay?: number;
         playMessageSounds?: boolean;
      };
      behavior?: {
         autoOpen?: boolean;
         openDelay?: number;
         autoOpenDelay?: number;
         closeOnClickOutside?: boolean;
         minimizeOnClose?: boolean;
         showOnPages?: string[];
         hideOnPages?: string[];
         triggerEvents?: string[];
         showWelcomeMessage?: boolean;
         allowFileUpload?: boolean;
         maxFileSize?: number;
         enableTypingIndicator?: boolean;
         enableReadReceipts?: boolean;
         enableOfflineMode?: boolean;
         allowedFileTypes?: string[];
      };
      branding?: {
         showPoweredBy?: boolean;
         customLogo?: string;
         customText?: string;
         customUrl?: string;
         customTitle?: string;
         customSubtitle?: string;
      };
      features?: {
        fileUpload?: boolean;
        voiceInput?: boolean;
        typing?: boolean;
        readReceipts?: boolean;
        chatHistory?: boolean;
        offlineMessage?: boolean;
        emailCapture?: boolean;
      };
    };
    website?: {
      enabled?: boolean;
      domain?: string;
      subdomain?: string;
      customDomain?: string;
      sslEnabled?: boolean;
      status?: 'active' | 'inactive' | 'deploying';
      theme?: {
        template?: string;
        primaryColor?: string;
        secondaryColor?: string;
        backgroundColor?: string;
        textColor?: string;
        fontFamily?: string;
        logoUrl?: string;
        layout?: 'centered' | 'sidebar' | 'fullwidth';
      };
      seo?: {
        title?: string;
        description?: string;
        keywords?: string[];
        ogImage?: string;
        favicon?: string;
      };
      analytics?: {
        googleAnalyticsId?: string;
        facebookPixelId?: string;
        hotjarId?: string;
        googleAnalytics?: string;
        facebookPixel?: string;
        customScripts?: string;
      };
      features?: {
        contactForm?: boolean;
        livechat?: boolean;
        blog?: boolean;
        testimonials?: boolean;
        pricing?: boolean;
        faq?: boolean;
      };
    };
    mobile?: {
      enabled?: boolean;
      appName?: string;
      bundleId?: string;
      version?: string;
      buildNumber?: number;
      status?: 'development' | 'review' | 'published';
      platform?: 'ios' | 'android' | 'both';
      storeUrl?: string;
      deepLinking?: boolean;
      pushNotifications?: boolean;
      offlineMode?: boolean;
      platforms?: {
        ios?: {
          enabled?: boolean;
          bundleId?: string;
          version?: string;
          buildNumber?: number;
          storeUrl?: string;
          appStoreId?: string;
          certificateId?: string;
          certificates?: {
            development?: string;
            distribution?: string;
          };
        };
        android?: {
          enabled?: boolean;
          packageName?: string;
          version?: string;
          versionCode?: number;
          storeUrl?: string;
          playStoreId?: string;
          keystore?: string;
        };
      };
      features?: {
          pushNotifications?: boolean;
          offlineMode?: boolean;
          biometricAuth?: boolean;
          darkMode?: boolean;
        };
        branding?: {
          appIcon?: string;
          splashScreen?: string;
          primaryColor?: string;
          secondaryColor?: string;
        };
      };
  };
  
  metrics?: {
    totalConversations?: number;
    totalMessages?: number;
    averageResponseTime?: number;
    satisfactionScore?: number;
    successRate?: number;
    lastUsed?: Date;
    popularQueries?: string[];
  };
  
  tags?: string[];
  metadata?: {
    version?: string;
    category?: string;
    language?: string;
    region?: string;
    industry?: string;
    useCase?: string;
    lastError?: string;
    customFields?: Record<string, any>;
  };
  
  trainingStatus?: 'pending' | 'in_progress' | 'completed' | 'failed';
  trainingProgress?: number;
  lastTrainedAt?: string;
  version?: number;
  isPublished?: boolean;
  isFeatured?: boolean;
  usageCount?: number;
  lastUsedAt?: string;
  
  tenantId: string;
  createdById: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  
  createdBy?: {
    id: string;
    name: string;
  };
}

export interface CreateAgentDto {
  name: string;
  description?: string;
  type: 'assistant' | 'chatbot' | 'support' | 'sales' | 'custom';
  systemPrompt?: string;
  instructions?: string;
  personality?: Agent['personality'];
  modelConfig?: Agent['modelConfig'];
  capabilities?: Agent['capabilities'];
  knowledgeBase?: Agent['knowledgeBase'];
  tools?: Agent['tools'];
  settings?: Agent['settings'];
  visibility?: 'public' | 'private' | 'shared';
  avatar?: string;
  tags?: string[];
  metadata?: Agent['metadata'];
}

export interface UpdateAgentDto extends Partial<CreateAgentDto> {
  id?: string;
}

export interface AgentStats {
  totalAgents: number;
  activeAgents: number;
  inactiveAgents: number;
  agentsByType: Record<string, number>;
}