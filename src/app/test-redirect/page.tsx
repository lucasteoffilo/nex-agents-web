'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMultiTenantAuth } from '@/providers/multi-tenant-auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestRedirectPage() {
  const { user, tenant } = useMultiTenantAuth();
  const router = useRouter();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  const testRouterPush = () => {
    addLog('🧪 Testando router.push("/dashboard")...');
    try {
      router.push('/dashboard');
      addLog('✅ router.push executado sem erro');
    } catch (error) {
      addLog(`❌ Erro no router.push: ${error}`);
    }
  };

  const testWindowLocation = () => {
    addLog('🧪 Testando window.location.href = "/dashboard"...');
    try {
      window.location.href = '/dashboard';
      addLog('✅ window.location.href executado');
    } catch (error) {
      addLog(`❌ Erro no window.location.href: ${error}`);
    }
  };

  const testCookies = () => {
    addLog('🍪 Verificando cookies...');
    const cookies = document.cookie;
    addLog(`Cookies encontrados: ${cookies || 'Nenhum'}`);
    
    const tokenCookie = document.cookie
      .split(';')
      .find(c => c.trim().startsWith('nex_token='));
    
    if (tokenCookie) {
      const token = tokenCookie.split('=')[1];
      addLog(`Token encontrado: ${token.substring(0, 20)}...`);
    } else {
      addLog('❌ Token não encontrado nos cookies');
    }
  };

  const testLocalStorage = () => {
    addLog('💾 Verificando localStorage...');
    const token = localStorage.getItem('nex_token');
    const tenantId = localStorage.getItem('current_tenant_id');
    
    if (token) {
      addLog(`Token no localStorage: ${token.substring(0, 20)}...`);
    } else {
      addLog('❌ Token não encontrado no localStorage');
    }
    
    if (tenantId) {
      addLog(`Tenant ID no localStorage: ${tenantId}`);
    } else {
      addLog('❌ Tenant ID não encontrado no localStorage');
    }
  };

  const clearLogs = () => {
    setTestResults([]);
  };

  const runAllTests = () => {
    clearLogs();
    addLog('🚀 Iniciando testes de redirecionamento...');
    
    setTimeout(() => testCookies(), 100);
    setTimeout(() => testLocalStorage(), 200);
    setTimeout(() => testRouterPush(), 500);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Teste de Redirecionamento</CardTitle>
            <CardDescription>
              Página para testar diferentes métodos de redirecionamento e diagnosticar problemas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Estado Atual</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Usuário:</strong> {user ? `${user.name} (${user.email})` : 'Não logado'}</p>
                  <p><strong>Tenant:</strong> {tenant ? tenant.name : 'Nenhum'}</p>
                  <p><strong>URL Atual:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Ações de Teste</h3>
                <div className="space-y-2">
                  <Button onClick={runAllTests} className="w-full">
                    🧪 Executar Todos os Testes
                  </Button>
                  <Button onClick={testRouterPush} variant="outline" className="w-full">
                    Testar router.push
                  </Button>
                  <Button onClick={testWindowLocation} variant="outline" className="w-full">
                    Testar window.location
                  </Button>
                  <Button onClick={clearLogs} variant="secondary" className="w-full">
                    Limpar Logs
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logs de Teste</CardTitle>
            <CardDescription>
              Resultados dos testes executados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500">Nenhum teste executado ainda...</p>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="mb-1">
                    {result}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Links Úteis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" onClick={() => window.location.href = '/login-debug'}>
                Login Debug
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/debug-auth'}>
                Debug Auth
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/login'}>
                Login Normal
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
                Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
