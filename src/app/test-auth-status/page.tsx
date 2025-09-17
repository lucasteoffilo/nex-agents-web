'use client';

import { useState, useEffect } from 'react';
import { useMultiTenantAuth } from '@/providers/multi-tenant-auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

export default function TestAuthStatusPage() {
  const { user, tenant, isLoading, isInitialized, login, logout } = useMultiTenantAuth();
  const [localStorageData, setLocalStorageData] = useState<any>({});
  const [cookieData, setCookieData] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    // Verificar localStorage
    const data = {
      token: localStorage.getItem('nex_token'),
      refreshToken: localStorage.getItem('nex_refresh_token'),
      tenantId: localStorage.getItem('current_tenant_id'),
    };
    setLocalStorageData(data);

    // Verificar cookies
    setCookieData(document.cookie);
  }, []);

  const handleLogin = async () => {
    try {
      await login('admin@nexai.com', 'admin123');
    } catch (error) {
      console.error('Erro no login:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const goToCollections = () => {
    router.push('/dashboard/knowledge/collections/new');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Status da Autenticação</h1>
        
        {/* Status de Inicialização */}
        <Card>
          <CardHeader>
            <CardTitle>Status de Inicialização</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span>Inicializado:</span>
                <Badge variant={isInitialized ? 'default' : 'secondary'}>
                  {isInitialized ? 'Sim' : 'Não'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span>Carregando:</span>
                <Badge variant={isLoading ? 'destructive' : 'default'}>
                  {isLoading ? 'Sim' : 'Não'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dados do Usuário */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Usuário</CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-2">
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Nome:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role?.name} ({user.role?.level})</p>
                <Badge variant="default">Logado</Badge>
              </div>
            ) : (
              <div>
                <p>Usuário não logado</p>
                <Badge variant="secondary">Não logado</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dados do Tenant */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Tenant</CardTitle>
          </CardHeader>
          <CardContent>
            {tenant ? (
              <div className="space-y-2">
                <p><strong>ID:</strong> {tenant.id}</p>
                <p><strong>Nome:</strong> {tenant.name}</p>
                <p><strong>Status:</strong> {(tenant as any).status}</p>
                <Badge variant="default">Tenant Ativo</Badge>
              </div>
            ) : (
              <div>
                <p>Nenhum tenant selecionado</p>
                <Badge variant="secondary">Sem Tenant</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* LocalStorage */}
        <Card>
          <CardHeader>
            <CardTitle>LocalStorage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Token:</strong> {localStorageData.token ? `${localStorageData.token.substring(0, 20)}...` : 'Não encontrado'}</p>
              <p><strong>Refresh Token:</strong> {localStorageData.refreshToken ? `${localStorageData.refreshToken.substring(0, 20)}...` : 'Não encontrado'}</p>
              <p><strong>Tenant ID:</strong> {localStorageData.tenantId || 'Não encontrado'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Cookies */}
        <Card>
          <CardHeader>
            <CardTitle>Cookies</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
              {cookieData || 'Nenhum cookie encontrado'}
            </pre>
          </CardContent>
        </Card>

        {/* Ações */}
        <Card>
          <CardHeader>
            <CardTitle>Ações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-x-4">
              {!user ? (
                <Button onClick={handleLogin} disabled={isLoading}>
                  {isLoading ? 'Fazendo login...' : 'Login com admin@nexai.com'}
                </Button>
              ) : (
                <Button onClick={handleLogout} variant="destructive" disabled={isLoading}>
                  {isLoading ? 'Fazendo logout...' : 'Logout'}
                </Button>
              )}
              
              {user && tenant && (
                <Button onClick={goToCollections} variant="outline">
                  Ir para Criar Coleção
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}