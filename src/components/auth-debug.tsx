'use client';

import { useState, useEffect } from 'react';
import { useMultiTenantAuth } from '@/providers/multi-tenant-auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function AuthDebug() {
  const { user, tenant, permissions, isLoading, isInitialized, error } = useMultiTenantAuth();
  const [cookies, setCookies] = useState<string>('');
  const [localStorage, setLocalStorage] = useState<Record<string, string>>({});

  useEffect(() => {
    // Atualizar informações do navegador
    setCookies(document.cookie);
    const storage: Record<string, string> = {};
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key) {
        storage[key] = window.localStorage.getItem(key) || '';
      }
    }
    setLocalStorage(storage);
  }, [user, tenant]);

  const refreshData = () => {
    setCookies(document.cookie);
    const storage: Record<string, string> = {};
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key) {
        storage[key] = window.localStorage.getItem(key) || '';
      }
    }
    setLocalStorage(storage);
  };

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Debug de Autenticação</CardTitle>
          <CardDescription>
            Informações de debug para diagnosticar problemas de login
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={refreshData} variant="outline" size="sm">
              Atualizar Dados
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Estado do Provider */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Estado do Provider</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Inicializado:</span>
                  <Badge variant={isInitialized ? "default" : "secondary"}>
                    {isInitialized ? "Sim" : "Não"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Carregando:</span>
                  <Badge variant={isLoading ? "default" : "secondary"}>
                    {isLoading ? "Sim" : "Não"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Usuário:</span>
                  <Badge variant={user ? "default" : "secondary"}>
                    {user ? user.name : "Não logado"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Tenant:</span>
                  <Badge variant={tenant ? "default" : "secondary"}>
                    {tenant ? tenant.name : "Nenhum"}
                  </Badge>
                </div>
                {error && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    <strong>Erro:</strong> {error}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cookies */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Cookies</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                  {cookies || "Nenhum cookie encontrado"}
                </pre>
              </CardContent>
            </Card>

            {/* LocalStorage */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">LocalStorage</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                  {JSON.stringify(localStorage, null, 2)}
                </pre>
              </CardContent>
            </Card>

            {/* Permissões */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Permissões</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {permissions.length > 0 ? (
                    permissions.map((perm, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {typeof perm === 'string' ? perm : perm.slug}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">Nenhuma permissão</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
