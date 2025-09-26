'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Building, 
  Users, 
  Calendar,
  Settings,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  TrendingUp,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  Globe
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTenants } from '@/hooks/use-tenants';
import { useAuth } from '@/hooks/use-auth';
import { Tenant } from '@/types';
import { formatDate } from '@/lib/utils';

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, tenant: currentTenant } = useAuth();
  const { 
    tenants, 
    loading, 
    error, 
    fetchTenants, 
    updateTenant,
    deleteTenant
  } = useTenants();

  const [customer, setCustomer] = useState<Tenant | null>(null);
  const [subCustomers, setSubCustomers] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados de paginação para sub-clientes
  const [subCustomersPage, setSubCustomersPage] = useState(1);
  const [subCustomersPerPage] = useState(5);

  // Verificar permissões
  const canEditTenant = user?.permissions?.some(p => 
    p.resource === 'tenants' && p.action === 'update'
  );

  const canDeleteTenant = user?.permissions?.some(p => 
    p.resource === 'tenants' && p.action === 'delete'
  );

  // Carregar dados do cliente
  useEffect(() => {
    const loadCustomerData = async () => {
      if (!tenants || tenants.length === 0) {
        await fetchTenants();
        return;
      }

      const customerId = params.id as string;
      const foundCustomer = tenants.find(t => t.id === customerId);
      
      if (foundCustomer) {
        setCustomer(foundCustomer);
        
        // Buscar sub-clientes (clientes que têm este como parentTenantId)
        const subs = tenants.filter(t => t.parentTenantId === customerId);
        setSubCustomers(subs);
      }
      
      setIsLoading(false);
    };

    loadCustomerData();
  }, [tenants, params.id, fetchTenants]);

  const handleEditCustomer = () => {
    // TODO: Implementar edição
    console.log('Edit customer:', customer?.id);
  };

  const handleDeleteCustomer = async () => {
    if (!customer) return;
    
    const confirmed = confirm(`Tem certeza que deseja deletar o cliente "${customer.name}"? Esta ação não pode ser desfeita.`);
    if (confirmed) {
      await deleteTenant(customer.id);
      router.push('/dashboard/customers');
    }
  };

  const handleViewSubCustomer = (subCustomer: Tenant) => {
    router.push(`/dashboard/customers/${subCustomer.id}`);
  };

  // Lógica de paginação para sub-clientes
  const subCustomersTotalPages = Math.ceil(subCustomers.length / subCustomersPerPage);
  const subCustomersStartIndex = (subCustomersPage - 1) * subCustomersPerPage;
  const subCustomersEndIndex = subCustomersStartIndex + subCustomersPerPage;
  const paginatedSubCustomers = subCustomers.slice(subCustomersStartIndex, subCustomersEndIndex);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push('/dashboard/customers')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Cliente não encontrado</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-destructive">
              <p>Cliente não encontrado ou você não tem permissão para visualizá-lo.</p>
              <Button 
                onClick={() => router.push('/dashboard/customers')} 
                className="mt-4"
              >
                Voltar para Lista
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
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => router.push('/dashboard/customers')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{customer.name}</h1>
          <p className="text-muted-foreground">
            {customer.slug}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações principais */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detalhes do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Informações do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nome</label>
                  <p className="text-sm font-medium">{customer.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Slug</label>
                  <p className="text-sm font-mono">{customer.slug}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nível</label>
                  <p className="text-sm font-medium">{customer.level}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Criado em</label>
                  <p className="text-sm font-medium">{formatDate(customer.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Atualizado em</label>
                  <p className="text-sm font-medium">{formatDate(customer.updatedAt)}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Plano</label>
                <div className="mt-1">
                  <Badge 
                    variant={(customer.plan || 'free') === 'enterprise' ? 'default' : 'outline'}
                    className={`text-xs ${
                      (customer.plan || 'free') === 'pro' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : (customer.plan || 'free') === 'enterprise'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}
                  >
                    {(customer.plan || 'free') as string}
                  </Badge>
                </div>
              </div>
              
              {customer.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Descrição</label>
                  <p className="text-sm mt-1">{customer.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sub-clientes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Sub-clientes
                <Badge variant="outline" className="ml-2">
                  {subCustomers.length}
                </Badge>
              </CardTitle>
              <CardDescription>
                Clientes que estão sob este cliente principal
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subCustomers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum sub-cliente</h3>
                  <p className="text-muted-foreground">
                    Este cliente ainda não possui sub-clientes cadastrados.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {paginatedSubCustomers.map((subCustomer) => (
                    <div 
                      key={subCustomer.id}
                      className="group relative bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <Building className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {subCustomer.name}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                              {subCustomer.slug}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={((subCustomer as any).status === 'active' || subCustomer.isActive) ? 'default' : 'secondary'}
                            className={`text-xs ${
                              ((subCustomer as any).status === 'active' || subCustomer.isActive)
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                            }`}
                          >
                            {((subCustomer as any).status === 'active' || subCustomer.isActive) ? 'Ativo' : 'Inativo'}
                          </Badge>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuItem 
                                onClick={() => handleViewSubCustomer(subCustomer)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Visualizar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
                  
                  {/* Paginação para sub-clientes */}
                  {subCustomersTotalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Mostrando {subCustomersStartIndex + 1}-{Math.min(subCustomersEndIndex, subCustomers.length)} de {subCustomers.length} sub-clientes
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSubCustomersPage(prev => Math.max(prev - 1, 1))}
                          disabled={subCustomersPage === 1}
                        >
                          Anterior
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSubCustomersPage(prev => Math.min(prev + 1, subCustomersTotalPages))}
                          disabled={subCustomersPage === subCustomersTotalPages}
                        >
                          Próximo
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Estatísticas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Sub-clientes</span>
                <div className="text-right">
                  <div className="text-2xl font-bold">{subCustomers.length}</div>
                  <div className="text-xs text-muted-foreground">
                    de {customer.maxSubTenants} máximo
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge 
                  variant={((customer as any).status === 'active' || customer.isActive) ? 'default' : 'secondary'}
                  className={`${
                    ((customer as any).status === 'active' || customer.isActive)
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}
                >
                  {((customer as any).status === 'active' || customer.isActive) ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Nível</span>
                <span className="text-sm font-medium">{customer.level}</span>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
