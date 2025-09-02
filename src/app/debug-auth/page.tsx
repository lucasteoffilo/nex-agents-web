'use client';

import { AuthDebug } from '@/components/auth-debug';
import { useMultiTenantAuth } from '@/providers/multi-tenant-auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { toast } from 'sonner';

export default function DebugAuthPage() {
  const { login, logout, user } = useMultiTenantAuth();
  const [testEmail, setTestEmail] = useState('admin@test.com');
  const [testPassword, setTestPassword] = useState('Password123!');
  const [isLoading, setIsLoading] = useState(false);

  const handleTestLogin = async () => {
    setIsLoading(true);
    try {
      await login(testEmail, testPassword);
      toast.success('Login de teste realizado com sucesso!');
    } catch (error: any) {
      toast.error(`Erro no login de teste: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logout realizado com sucesso!');
    } catch (error: any) {
      toast.error(`Erro no logout: ${error.message}`);
    }
  };

  const clearStorage = () => {
    localStorage.clear();
    document.cookie = 'nex_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    document.cookie = 'current_tenant=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    toast.success('Storage limpo!');
    window.location.reload();
  };

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Debug de Autenticação</CardTitle>
            <CardDescription>
              Página para diagnosticar problemas de autenticação e redirecionamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Button 
                onClick={handleTestLogin} 
                disabled={isLoading}
                variant="default"
              >
                {isLoading ? 'Fazendo Login...' : 'Testar Login'}
              </Button>
              <Button 
                onClick={handleLogout} 
                variant="outline"
                disabled={!user}
              >
                Logout
              </Button>
              <Button 
                onClick={clearStorage} 
                variant="destructive"
              >
                Limpar Storage
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email de Teste:</label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Senha de Teste:</label>
                <input
                  type="password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <AuthDebug />
      </div>
    </div>
  );
}