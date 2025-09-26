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
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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

    // Usar todos os tenants para as estatísticas
    const allTenants = tenants;
    
    // Calcular estatísticas baseadas no status
    let activeCount = 0;
    let inactiveCount = 0;
    
    allTenants.forEach(tenant => {
      const isActive = (tenant as any).status === 'active' || tenant.isActive;
      if (isActive) {
        activeCount++;
      } else {
        inactiveCount++;
      }
    });

    return {
      total: allTenants.length,
      active: activeCount,
      inactive: inactiveCount
    };
  };

  const clientStats = calculateClientStats();
  
  // Fallback para garantir que pelo menos o total apareça
  const finalStats = {
    total: clientStats.total || (tenants?.length || 0),
    active: clientStats.active || 0,
    inactive: clientStats.inactive || 0
  };
  

  // Filtrar tenants (com verificação de segurança)
  const filteredTenants = (tenants || []).filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.slug.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && ((tenant as any).status === 'active' || tenant.isActive)) ||
                         (statusFilter === 'inactive' && ((tenant as any).status !== 'active' && !tenant.isActive));
    
    const matchesPlan = planFilter === 'all' || (tenant.plan || 'free') === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Lógica de paginação
  const totalPages = Math.ceil(filteredTenants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTenants = filteredTenants.slice(startIndex, endIndex);

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, planFilter]);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
            <div className="text-2xl font-bold">{finalStats.total}</div>
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
            <div className="text-2xl font-bold">{finalStats.active}</div>
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
            <div className="text-2xl font-bold">{finalStats.inactive}</div>
            <p className="text-xs text-muted-foreground">
              Clientes com status inativo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Controles */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar clientes..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Status</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={planFilter} onValueChange={setPlanFilter}>
                  <SelectTrigger className="w-[140px]">
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
            
            {/* Contador de resultados */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Mostrando {startIndex + 1}-{Math.min(endIndex, filteredTenants.length)} de {filteredTenants.length} clientes
              </span>
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
                  <div className="space-y-3">
                    {[...Array(itemsPerPage)].map((_, i) => (
                      <div key={i} className="animate-pulse bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                              </div>
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                            </div>
                            <div className="hidden lg:flex items-center gap-6">
                              <div className="text-center">
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-8 mb-1"></div>
                                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                              </div>
                              <div className="text-center">
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                              </div>
                              <div className="text-center">
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          </div>
                        </div>
                      </div>
                    ))}
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
                  <div className="space-y-3">
                    {paginatedTenants.map((tenant) => (
                      <div 
                        key={tenant.id} 
                        className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          {/* Informações principais */}
                          <div className="flex items-center gap-4 flex-1 min-w-0 mr-4">
                            {/* Ícone e avatar */}
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <Building className="h-6 w-6 text-white" />
                              </div>
                            </div>
                            
                            {/* Nome e slug */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                  {tenant.name}
                                </h3>
                                <Badge 
                                  variant={((tenant as any).status === 'active' || tenant.isActive) ? 'default' : 'secondary'}
                                  className={`text-xs ${
                                    ((tenant as any).status === 'active' || tenant.isActive)
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                  }`}
                                >
                                  {((tenant as any).status === 'active' || tenant.isActive) ? 'Ativo' : 'Inativo'}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                {tenant.slug}
                              </p>
                            </div>
                            
                            {/* Informações secundárias */}
                            <div className="hidden lg:flex items-center gap-8 text-sm">
                              <div className="text-center">
                                <div className="text-gray-500 dark:text-gray-400 text-xs">Plano</div>
                                <Badge 
                                  variant={(tenant.plan || 'free') === 'enterprise' ? 'default' : 'outline'}
                                  className={`text-xs ${
                                    (tenant.plan || 'free') === 'pro' 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                      : (tenant.plan || 'free') === 'enterprise'
                                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                  }`}
                                >
                                  {tenant.plan || 'free'}
                                </Badge>
                              </div>
                              
                              <div className="text-center">
                                <div className="text-gray-500 dark:text-gray-400 text-xs">Sub-clientes</div>
                                <div className="font-medium">
                                  {tenant.currentSubTenants} / {tenant.maxSubTenants}
                                </div>
                              </div>
                              
                              <div className="text-center">
                                <div className="text-gray-500 dark:text-gray-400 text-xs">Criado em</div>
                                <div className="font-medium">
                                  {new Date(tenant.createdAt).toLocaleDateString('pt-BR')}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Ações */}
                          <div className="flex items-center gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
                          </div>
                        </div>
                        
                        {/* Informações secundárias para mobile */}
                        <div className="lg:hidden mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 text-xs">Plano</span>
                              <div className="mt-1">
                                <Badge 
                                  variant={(tenant.plan || 'free') === 'enterprise' ? 'default' : 'outline'}
                                  className={`text-xs ${
                                    (tenant.plan || 'free') === 'pro' 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                      : (tenant.plan || 'free') === 'enterprise'
                                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                  }`}
                                >
                                  {tenant.plan || 'free'}
                                </Badge>
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 text-xs">Sub-clientes</span>
                              <div className="mt-1 font-medium">
                                {tenant.currentSubTenants} / {tenant.maxSubTenants}
                              </div>
                            </div>
                            
                            <div className="col-span-2">
                              <span className="text-gray-500 dark:text-gray-400 text-xs">Criado em</span>
                              <div className="mt-1 font-medium">
                                {new Date(tenant.createdAt).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Paginação */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Próximo
                </Button>
              </div>
            </div>
          )}
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