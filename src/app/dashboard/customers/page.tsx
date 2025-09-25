'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Building, 
  Users, 
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  XCircle,
  TrendingUp
} from 'lucide-react';

import { useTenants } from '@/hooks/use-tenants';
import { useAuth } from '@/hooks/use-auth';
import { Tenant } from '@/types';
import { TenantForm } from './components/tenant-form';
import { TenantTree } from './components/tenant-tree';

export default function CustomersPage() {
  const router = useRouter();
  const { user, tenant: currentTenant } = useAuth();
  const { 
    tenants, 
    loading, 
    error, 
    selectedTenant, 
    fetchTenants, 
    selectTenant,
    createTenant,
    updateTenant,
    deleteTenant
  } = useTenants();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Verificar permissões
  const isSuperAdmin = user?.permissions?.some(p => 
    p.resource === 'tenants' && p.action === 'manage' && p.scope === 'all'
  );

  const canCreateTenant = user?.permissions?.some(p => 
    p.resource === 'tenants' && p.action === 'create'
  );

  const canEditTenant = user?.permissions?.some(p => 
    p.resource === 'tenants' && p.action === 'update'
  );

  const canDeleteTenant = user?.permissions?.some(p => 
    p.resource === 'tenants' && p.action === 'delete'
  );

  // Função para calcular estatísticas dos clientes
  const calculateClientStats = () => {
    if (!tenants || tenants.length === 0) {
      return {
        total: 0,
        active: 0,
        inactive: 0
      };
    }

    // Filtrar apenas clientes (excluir a própria empresa)
    const clients = tenants.filter(tenant => {
      // Se o usuário for Super Admin, considerar todos os tenants como clientes
      // Se não for Super Admin, considerar apenas sub-tenants
      if (isSuperAdmin) {
        return tenant.id !== currentTenant?.id; // Excluir a própria empresa
      } else {
        return tenant.parentTenantId === currentTenant?.id;
      }
    });

    return {
      total: clients.length,
      active: clients.filter(tenant => tenant.isActive).length,
      inactive: clients.filter(tenant => !tenant.isActive).length
    };
  };

  const clientStats = calculateClientStats();

  // Filtrar tenants (com verificação de segurança)
  const filteredTenants = (tenants || []).filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.slug.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && tenant.isActive) ||
                         (statusFilter === 'inactive' && !tenant.isActive);
    
    const matchesPlan = planFilter === 'all' || tenant.plan === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Agrupar tenants por parent
  const tenantsByParent = filteredTenants.reduce((acc, tenant) => {
    const parentId = tenant.parentTenantId || 'root';
    if (!acc[parentId]) {
      acc[parentId] = [];
    }
    acc[parentId].push(tenant);
    return acc;
  }, {} as Record<string, Tenant[]>);

  const handleCreateTenant = async (data: any) => {
    const result = await createTenant(data);
    if (result) {
      setIsCreateDialogOpen(false);
    }
  };

  const handleEditTenant = async (data: any) => {
    if (selectedTenant) {
      const result = await updateTenant(selectedTenant.id, data);
      if (result) {
        setIsEditDialogOpen(false);
      }
    }
  };

  const handleDeleteTenant = async () => {
    if (selectedTenant) {
      const confirmed = confirm(`Tem certeza que deseja deletar o tenant "${selectedTenant.name}"? Esta ação não pode ser desfeita.`);
      if (confirmed) {
        await deleteTenant(selectedTenant.id);
      }
    }
  };

  const handleViewTenant = (tenant: Tenant) => {
    router.push(`/dashboard/customers/${tenant.id}`);
  };

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-destructive">
              <p>Erro ao carregar clientes: {error}</p>
              <Button 
                onClick={() => fetchTenants()} 
                className="mt-4"
              >
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie todos os clientes e empresas do sistema
          </p>
        </div>
        
        {canCreateTenant && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Criar Novo Cliente</DialogTitle>
                <DialogDescription>
                  Preencha os dados do novo cliente abaixo.
                </DialogDescription>
              </DialogHeader>
              <TenantForm 
                onSubmit={handleCreateTenant}
                onCancel={() => setIsCreateDialogOpen(false)}
                parentTenantId={currentTenant?.id}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Cards de Métricas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.total}</div>
            <p className="text-xs text-muted-foreground">
              Total de clientes cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.active}</div>
            <p className="text-xs text-muted-foreground">
              Clientes com status ativo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Inativos</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.inactive}</div>
            <p className="text-xs text-muted-foreground">
              Clientes com status inativo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Controles */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Clientes</CardTitle>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <Users className="w-4 h-4 mr-2" />
                Lista
              </Button>
              <Button
                variant={viewMode === 'tree' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('tree')}
              >
                <Building className="w-4 h-4 mr-2" />
                Hierarquia
              </Button>
            </div>
          </div>
          {/* <CardDescription>
            {isSuperAdmin 
              ? 'Todos os clientes e empresas do sistema' 
              : `Clientes abaixo de ${currentTenant?.name}`
            }
          </CardDescription> */}
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar clientes..."
                  className="pl-8 sm:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Planos</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="mt-6">
            {viewMode === 'tree' ? (
              <TenantTree 
                tenants={filteredTenants}
                onSelectTenant={selectTenant}
                onViewTenant={handleViewTenant}
              />
            ) : (
              <>
                {loading ? (
                  <div className="text-center py-8">
                    <p>Carregando clientes...</p>
                  </div>
                ) : filteredTenants.length === 0 ? (
                  <div className="text-center py-8">
                    <Building className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">Nenhum cliente encontrado</h3>
                    <p className="text-muted-foreground">
                      {searchTerm || statusFilter !== 'all' || planFilter !== 'all'
                        ? 'Tente ajustar os filtros de busca.'
                        : canCreateTenant
                          ? 'Comece criando seu primeiro cliente.'
                          : 'Não há clientes disponíveis para visualização.'
                      }
                    </p>
                    {canCreateTenant && filteredTenants.length === 0 && !searchTerm && (
                      <Button 
                        className="mt-4"
                        onClick={() => setIsCreateDialogOpen(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Primeiro Cliente
                      </Button>
                    )}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Plano</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Sub-clientes</TableHead>
                        <TableHead>Criado em</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTenants.map((tenant) => (
                        <TableRow key={tenant.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4 text-muted-foreground" />
                              {tenant.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs font-mono text-muted-foreground">{tenant.slug}</span>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={tenant.plan === 'enterprise' ? 'default' : 'outline'}
                              className={{
                                'bg-green-100 text-green-800': tenant.plan === 'pro',
                                'bg-purple-100 text-purple-800': tenant.plan === 'enterprise',
                              }}
                            >
                              {tenant.plan}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={tenant.isActive ? 'default' : 'secondary'}
                              className={tenant.isActive ? 'bg-green-100 text-green-800' : ''}
                            >
                              {tenant.isActive ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {tenant.currentSubTenants} / {tenant.maxSubTenants}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(tenant.createdAt).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuItem 
                                  onClick={() => handleViewTenant(tenant)}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  Visualizar
                                </DropdownMenuItem>
                                
                                {canEditTenant && (
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      selectTenant(tenant);
                                      setIsEditDialogOpen(true);
                                    }}
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                )}
                                
                                {canDeleteTenant && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      className="text-destructive"
                                      onClick={() => {
                                        selectTenant(tenant);
                                        handleDeleteTenant();
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Deletar
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Atualize os dados do cliente abaixo.
            </DialogDescription>
          </DialogHeader>
          {selectedTenant && (
            <TenantForm 
              tenant={selectedTenant}
              onSubmit={handleEditTenant}
              onCancel={() => setIsEditDialogOpen(false)}
              isEditing
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}