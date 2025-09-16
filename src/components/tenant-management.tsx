'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Building2,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Users,
  Settings,
  Crown,
  Shield,
  Eye,
  UserPlus,
  Download,
  Upload,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useTenant, usePermissions } from '@/providers/multi-tenant-auth-provider';
import { Tenant, TenantMetadata } from '@/types';
import apiService from '@/services/api';

// Schema de validação para criação/edição de tenant
const tenantSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  parentTenantId: z.string().optional(),
  maxSubTenants: z.number().min(0, 'Deve ser um número positivo').optional(),
  metadata: z.object({
    industry: z.string().optional(),
    size: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']).optional(),
    country: z.string().optional(),
    timezone: z.string().optional(),
    contactEmail: z.string().email('Email inválido').optional(),
    contactPhone: z.string().optional(),
  }).optional(),
});

type TenantFormData = z.infer<typeof tenantSchema>;

interface TenantManagementProps {
  className?: string;
}

export function TenantManagement({ className }: TenantManagementProps) {
  const { tenant: currentTenant, availableTenants, refreshTenantData } = useTenant();
  const { hasPermission, isSystemAdmin, isTenantAdmin } = usePermissions();
  
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);

  const form = useForm<TenantFormData>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      name: '',
      description: '',
      maxSubTenants: 10,
      metadata: {
        industry: '',
        size: 'small',
        country: 'BR',
        timezone: 'America/Sao_Paulo',
        contactEmail: '',
        contactPhone: '',
      },
    },
  });

  // Carregar tenants
  const loadTenants = async () => {
    setIsLoading(true);
    try {
      let response;
      
      if (isSystemAdmin) {
        // Admin de sistema pode ver todos os tenants
        response = await apiService.tenant.getAllTenants();
      } else if (isTenantAdmin && currentTenant) {
        // Admin de tenant pode ver seus sub-tenants
        response = await apiService.tenant.getSubTenants(currentTenant.id);
      } else {
        // Usuário comum vê apenas tenants disponíveis
        setTenants(availableTenants);
        setIsLoading(false);
        return;
      }
      
      if (response.success && response.data) {
        setTenants(response.data);
      }
    } catch (error: any) {
      toast.error('Erro ao carregar tenants: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, [isSystemAdmin, isTenantAdmin, currentTenant, availableTenants]);

  // Verificar permissões
  const canCreateTenant = hasPermission('tenant', 'create');
  const canEditTenant = hasPermission('tenant', 'update');
  const canDeleteTenant = hasPermission('tenant', 'delete');
  const canViewTenantDetails = hasPermission('tenant', 'read');

  // Função para criar/editar tenant
  const handleSubmit = async (data: TenantFormData) => {
    try {
      let response;
      
      if (editingTenant) {
        response = await apiService.tenant.updateTenant(editingTenant.id, data);
        toast.success('Tenant atualizado com sucesso!');
      } else {
        response = await apiService.tenant.createTenant(data);
        toast.success('Tenant criado com sucesso!');
      }
      
      if (response.success) {
        await loadTenants();
        await refreshTenantData();
        setIsDialogOpen(false);
        setEditingTenant(null);
        form.reset();
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar tenant');
    }
  };

  // Função para deletar tenant
  const handleDelete = async () => {
    if (!tenantToDelete) return;
    
    try {
      const response = await apiService.tenant.deleteTenant(tenantToDelete.id);
      
      if (response.success) {
        toast.success('Tenant deletado com sucesso!');
        await loadTenants();
        await refreshTenantData();
        setIsDeleteDialogOpen(false);
        setTenantToDelete(null);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao deletar tenant');
    }
  };

  // Função para abrir dialog de edição
  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    form.reset({
      name: tenant.name,
      description: tenant.description || '',
      parentTenantId: tenant.parentTenantId || undefined,
      maxSubTenants: tenant.maxSubTenants || 10,
      metadata: {
        industry: tenant.metadata?.industry || '',
        size: tenant.metadata?.size || 'small',
        country: tenant.metadata?.country || 'BR',
        timezone: tenant.metadata?.timezone || 'America/Sao_Paulo',
        contactEmail: tenant.metadata?.contactEmail || '',
        contactPhone: tenant.metadata?.contactPhone || '',
      },
    });
    setIsDialogOpen(true);
  };

  // Função para abrir dialog de criação
  const handleCreate = () => {
    setEditingTenant(null);
    form.reset();
    setIsDialogOpen(true);
  };

  // Função para ver detalhes
  const handleViewDetails = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsDetailsOpen(true);
  };

  // Função para obter badge do nível
  const getLevelBadge = (level: number) => {
    const configs = {
      0: { text: 'Principal', variant: 'default' as const, color: 'text-yellow-600' },
      1: { text: 'Cliente', variant: 'secondary' as const, color: 'text-blue-600' },
      2: { text: 'Sub-cliente', variant: 'outline' as const, color: 'text-gray-600' },
    };
    
    const config = configs[level as keyof typeof configs] || { 
      text: `Nível ${level}`, 
      variant: 'outline' as const, 
      color: 'text-gray-600' 
    };
    
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  // Função para obter ícone do tenant
  const getTenantIcon = (level: number) => {
    switch (level) {
      case 0:
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 1:
        return <Building2 className="h-4 w-4 text-blue-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando tenants...</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Gerenciamento de Tenants</span>
              </CardTitle>
              <CardDescription>
                Gerencie tenants e sub-tenants do sistema
              </CardDescription>
            </div>
            
            {canCreateTenant && (
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Tenant
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Total de Tenants</p>
                      <p className="text-2xl font-bold">{tenants.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Crown className="h-4 w-4 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium">Principais</p>
                      <p className="text-2xl font-bold">
                        {tenants.filter(t => t.level === 0).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Clientes</p>
                      <p className="text-2xl font-bold">
                        {tenants.filter(t => t.level === 1).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-[#0072b9]" />
                    <div>
                      <p className="text-sm font-medium">Sub-clientes</p>
                      <p className="text-2xl font-bold">
                        {tenants.filter(t => (t.level || 0) >= 2).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Separator />
            
            {/* Tabela de tenants */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Nível</TableHead>
                    <TableHead>Usuários</TableHead>
                    <TableHead>Sub-tenants</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {getTenantIcon(tenant.level || 0)}
                          <div>
                            <p className="font-medium">{tenant.name}</p>
                            {tenant.description && (
                              <p className="text-sm text-gray-500">{tenant.description}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getLevelBadge(tenant.level || 0)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {tenant.currentSubTenants || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <span>{tenant.currentSubTenants || 0}</span>
                          <span className="text-gray-400">/</span>
                          <span>{tenant.maxSubTenants || '∞'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={tenant.isActive ? 'default' : 'secondary'}>
                          {tenant.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(tenant.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            
                            {canViewTenantDetails && (
                              <DropdownMenuItem onClick={() => handleViewDetails(tenant)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver detalhes
                              </DropdownMenuItem>
                            )}
                            
                            {canEditTenant && (
                              <DropdownMenuItem onClick={() => handleEdit(tenant)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuSeparator />
                            
                            {canDeleteTenant && (
                              <DropdownMenuItem 
                                onClick={() => {
                                  setTenantToDelete(tenant);
                                  setIsDeleteDialogOpen(true);
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Deletar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {tenants.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum tenant encontrado</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de criação/edição */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTenant ? 'Editar Tenant' : 'Criar Novo Tenant'}
            </DialogTitle>
            <DialogDescription>
              {editingTenant 
                ? 'Atualize as informações do tenant'
                : 'Preencha as informações para criar um novo tenant'
              }
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do tenant" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="maxSubTenants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Máximo de Sub-tenants</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="10" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descrição do tenant" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Metadados */}
              <div className="space-y-4">
                <h4 className="font-medium">Informações Adicionais</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="metadata.industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Setor</FormLabel>
                        <FormControl>
                          <Input placeholder="Tecnologia, Saúde, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="metadata.size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tamanho</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tamanho" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="startup">Startup</SelectItem>
                            <SelectItem value="small">Pequena</SelectItem>
                            <SelectItem value="medium">Média</SelectItem>
                            <SelectItem value="large">Grande</SelectItem>
                            <SelectItem value="enterprise">Enterprise</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="metadata.contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email de Contato</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="contato@empresa.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="metadata.contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone de Contato</FormLabel>
                        <FormControl>
                          <Input placeholder="(11) 99999-9999" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingTenant ? 'Atualizar' : 'Criar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>Confirmar Exclusão</span>
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar o tenant "{tenantToDelete?.name}"? 
              Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Deletar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de detalhes */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedTenant && getTenantIcon(selectedTenant.level || 0)}
              <span>{selectedTenant?.name}</span>
            </DialogTitle>
            <DialogDescription>
              Informações detalhadas do tenant
            </DialogDescription>
          </DialogHeader>
          
          {selectedTenant && (
            <div className="space-y-6">
              {/* Informações básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Informações Básicas</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">ID:</span>
                      <span className="font-mono">{selectedTenant.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Nível:</span>
                      {getLevelBadge(selectedTenant.level || 0)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <Badge variant={selectedTenant.isActive ? 'default' : 'secondary'}>
                        {selectedTenant.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Criado em:</span>
                      <span>{new Date(selectedTenant.createdAt).toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Limites e Uso</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sub-tenants:</span>
                      <span>{selectedTenant.currentSubTenants || 0} / {selectedTenant.maxSubTenants || '∞'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Metadados */}
              {selectedTenant.metadata && (
                <div>
                  <h4 className="font-medium mb-2">Metadados</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {selectedTenant.metadata.industry && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Setor:</span>
                        <span>{selectedTenant.metadata.industry}</span>
                      </div>
                    )}
                    {selectedTenant.metadata.size && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tamanho:</span>
                        <span className="capitalize">{selectedTenant.metadata.size}</span>
                      </div>
                    )}
                    {selectedTenant.metadata.contactEmail && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Email:</span>
                        <span>{selectedTenant.metadata.contactEmail}</span>
                      </div>
                    )}
                    {selectedTenant.metadata.contactPhone && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Telefone:</span>
                        <span>{selectedTenant.metadata.contactPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}