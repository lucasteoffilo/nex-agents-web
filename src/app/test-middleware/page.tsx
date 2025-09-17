'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMultiTenantAuth } from '@/providers/multi-tenant-auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestMiddlewarePage() {
  const { user, tenant } = useMultiTenantAuth();
  const router = useRouter();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  const testTokenInCookies = () => {
    addLog('🍪 Testando token nos cookies...');
    const cookies = document.cookie;
    addLog(`Todos os cookies: ${cookies}`);
    
    const tokenCookie = cookies
      .split(';')
      .find(c => c.trim().startsWith('nex_token='));
    
    if (tokenCookie) {
      const token = tokenCookie.split('=')[1];
      addLog(`✅ Token encontrado: ${token.substring(0, 20)}...`);
      
      // Tentar decodificar o JWT
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        addLog(`📋 Payload do token:`);
        addLog(`  - User ID: ${payload.sub}`);
        addLog(`  - Email: ${payload.email}`);
        addLog(`  - Tenant ID: ${payload.tenantId}`);
        addLog(`  - Exp: ${new Date(payload.exp * 1000).toLocaleString()}`);
        addLog(`  - Iat: ${new Date(payload.iat * 1000).toLocaleString()}`);
        
        // Verificar se não expirou
        const now = Date.now() / 1000;
        if (payload.exp < now) {
          addLog('❌ Token EXPIRADO!');
        } else {
          addLog('✅ Token ainda válido');
        }
      } catch (error) {
        addLog(`❌ Erro ao decodificar token: ${error}`);
      }
    } else {
      addLog('❌ Token não encontrado nos cookies');
    }
  };

  const testDirectAccess = () => {
    addLog('🚀 Testando acesso direto ao dashboard...');
    addLog('Fazendo requisição fetch para /dashboard...');
    
    fetch('/dashboard', {
      method: 'GET',
      credentials: 'include', // Incluir cookies
    })
    .then(response => {
      addLog(`Status da resposta: ${response.status}`);
      addLog(`URL final: ${response.url}`);
      addLog(`Headers: ${JSON.stringify(Array.from(response.headers.entries()))}`);
      
      if (response.status === 200) {
        addLog('✅ Acesso permitido ao dashboard');
      } else if (response.status === 302 || response.status === 307) {
        addLog('🔄 Redirecionamento detectado');
      } else {
        addLog(`❌ Acesso negado: ${response.status}`);
      }
    })
    .catch(error => {
      addLog(`❌ Erro na requisição: ${error}`);
    });
  };

  const testRouterNavigation = () => {
    addLog('🧭 Testando navegação com router...');
    addLog('Executando router.push("/dashboard")...');
    
    router.push('/dashboard');
    
    setTimeout(() => {
      addLog(`URL após navegação: ${window.location.href}`);
      if (window.location.pathname === '/dashboard') {
        addLog('✅ Navegação bem-sucedida');
      } else {
        addLog(`⚠️ Redirecionado para: ${window.location.pathname}`);
      }
    }, 1000);
  };

  const testWindowLocation = () => {
    addLog('🌐 Testando window.location.href...');
    addLog('Executando window.location.href = "/dashboard"...');
    
    window.location.href = '/dashboard';
  };

  const clearLogs = () => {
    setTestResults([]);
  };

  const runAllTests = () => {
    clearLogs();
    addLog('🚀 Iniciando testes do middleware...');
    
    setTimeout(() => testTokenInCookies(), 100);
    setTimeout(() => testDirectAccess(), 500);
    setTimeout(() => testRouterNavigation(), 1000);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Teste do Middleware</CardTitle>
            <CardDescription>
              Página para testar se o middleware está reconhecendo o token corretamente
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
                <h3 className="font-semibold mb-2">Testes Disponíveis</h3>
                <div className="space-y-2">
                  <Button onClick={runAllTests} className="w-full">
                    🧪 Executar Todos os Testes
                  </Button>
                  <Button onClick={testTokenInCookies} variant="outline" className="w-full">
                    Testar Token nos Cookies
                  </Button>
                  <Button onClick={testDirectAccess} variant="outline" className="w-full">
                    Testar Acesso Direto
                  </Button>
                  <Button onClick={testRouterNavigation} variant="outline" className="w-full">
                    Testar Router Navigation
                  </Button>
                  <Button onClick={testWindowLocation} variant="outline" className="w-full">
                    Testar Window Location
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
              Resultados dos testes do middleware
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
              <Button variant="outline" onClick={() => window.location.href = '/test-redirect'}>
                Test Redirect
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
