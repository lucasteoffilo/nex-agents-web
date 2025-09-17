'use client';

import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Building2,
  ChevronDown,
  Users,
  Settings,
  Crown,
  Shield,
  User,
  Loader2,
} from 'lucide-react';
import { useMultiTenantAuth, useTenant, usePermissions } from '@/providers/multi-tenant-auth-provider';
import { Tenant } from '@/types';
import { toast } from 'sonner';

interface TenantSelectorProps {
  className?: string;
  showDetails?: boolean;
}

export function TenantSelector({ className, showDetails = false }: TenantSelectorProps) {
  const { user, isLoading } = useMultiTenantAuth();
  const { tenant, availableTenants, switchTenant, canAccessTenant } = useTenant();
  const { isSystemAdmin, isTenantAdmin } = usePermissions();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  // Função para obter ícone baseado no nível do tenant
  const getTenantIcon = (tenantLevel: number) => {
    switch (tenantLevel) {
      case 0:
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 1:
        return <Building2 className="h-4 w-4 text-blue-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  // Função para obter badge do nível
  const getLevelBadge = (level: number) => {
    const labels = {
      0: { text: 'Principal', variant: 'default' as const },
      1: { text: 'Cliente', variant: 'secondary' as const },
      2: { text: 'Sub-cliente', variant: 'outline' as const },
    };
    
    const config = labels[level as keyof typeof labels] || { text: `Nível ${level}`, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  // Função para obter badge do papel do usuário
  const getUserRoleBadge = () => {
    if (isSystemAdmin) {
      return (
        <Badge variant="destructive" className="text-xs">
          <Shield className="h-3 w-3 mr-1" />
          Admin Sistema
        </Badge>
      );
    }
    if (isTenantAdmin) {
      return (
        <Badge variant="default" className="text-xs">
          <Crown className="h-3 w-3 mr-1" />
          Admin Tenant
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-xs">
        <User className="h-3 w-3 mr-1" />
        Usuário
      </Badge>
    );
  };

  // Função para trocar de tenant
  const handleTenantSwitch = async (tenantId: string) => {
    if (tenantId === tenant?.id) {
      setIsDialogOpen(false);
      return;
    }

    if (!canAccessTenant(tenantId)) {
      toast.error('Você não tem permissão para acessar este tenant');
      return;
    }

    setIsSwitching(true);
    try {
      await switchTenant(tenantId);
      toast.success('Tenant alterado com sucesso!');
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao trocar de tenant');
    } finally {
      setIsSwitching(false);
    }
  };

  // Organizar tenants por hierarquia
  const organizedTenants = React.useMemo(() => {
    const tenantMap = new Map<string, Tenant & { children: Tenant[] }>();
    const rootTenants: (Tenant & { children: Tenant[] })[] = [];

    // Primeiro, criar o mapa com todos os tenants
    availableTenants.forEach(t => {
      tenantMap.set(t.id, { ...t, children: [] });
    });

    // Depois, organizar a hierarquia
    availableTenants.forEach(t => {
      const tenantWithChildren = tenantMap.get(t.id)!;
      
      if (t.parentTenantId && tenantMap.has(t.parentTenantId)) {
        tenantMap.get(t.parentTenantId)!.children.push(tenantWithChildren);
      } else {
        rootTenants.push(tenantWithChildren);
      }
    });

    return rootTenants;
  }, [availableTenants]);

  // Renderizar tenant na árvore
  const renderTenantTree = (tenants: Tenant[], depth = 0) => {
    return tenants.map(t => (
      <div key={t.id} className={`${depth > 0 ? 'ml-4 border-l border-gray-200 pl-4' : ''}`}>
        <div
          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
            t.id === tenant?.id
              ? 'bg-primary/10 border border-primary/20'
              : 'hover:bg-gray-50'
          }`}
          onClick={() => handleTenantSwitch(t.id)}
        >
          <div className="flex items-center space-x-3">
            {getTenantIcon(t.level || 0)}
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{t.name}</span>
                {t.id === tenant?.id && (
                  <Badge variant="default" className="text-xs">Atual</Badge>
                )}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                {getLevelBadge(t.level || 0)}
                {t.metadata?.industry && (
                  <span className="text-xs text-gray-500">{t.metadata.industry}</span>
                )}
              </div>
            </div>
          </div>
          
          {!canAccessTenant(t.id) && (
            <Badge variant="outline" className="text-xs text-red-500">
              Sem acesso
            </Badge>
          )}
        </div>
      </div>
    ));
  };

  if (isLoading || !tenant) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-gray-500">Carregando...</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <div className="flex items-center space-x-2">
              {getTenantIcon(tenant.level || 0)}
              <span className="truncate">{tenant.name}</span>
              {showDetails && getLevelBadge(tenant.level || 0)}
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Selecionar Tenant</span>
            </DialogTitle>
            <DialogDescription>
              Escolha o tenant que deseja acessar. Você só pode acessar tenants para os quais tem permissão.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Informações do usuário atual */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
                {getUserRoleBadge()}
              </div>
            </div>
            
            <Separator />
            
            {/* Lista de tenants */}
            <div>
              <h4 className="font-medium mb-3">Tenants Disponíveis</h4>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {organizedTenants.length > 0 ? (
                    renderTenantTree(organizedTenants)
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum tenant disponível</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
            
            {/* Ações */}
            <Separator />
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {availableTenants.length} tenant(s) disponível(is)
              </div>
              
              <div className="flex space-x-2">
                {(isSystemAdmin || isTenantAdmin) && (
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Gerenciar
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          </div>
          
          {isSwitching && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Trocando tenant...</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente simplificado para uso em headers/navbars
export function TenantSelectorCompact({ className }: { className?: string }) {
  const { tenant } = useTenant();
  const { isLoading } = useMultiTenantAuth();

  if (isLoading || !tenant) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  return (
    <TenantSelector className={className} showDetails={false} />
  );
}