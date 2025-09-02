'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestSimplePage() {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  const testToken = () => {
    addLog('🔍 Verificando token...');
    
    // Verificar localStorage
    const token = localStorage.getItem('nex_token');
    if (token) {
      addLog(`✅ Token no localStorage: ${token.substring(0, 20)}...`);
      
      // Tentar decodificar JWT
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          addLog(`📋 Payload do token:`);
          addLog(`  - User ID: ${payload.sub}`);
          addLog(`  - Email: ${payload.email}`);
          addLog(`  - Tenant ID: ${payload.tenantId}`);
          addLog(`  - Exp: ${new Date(payload.exp * 1000).toLocaleString()}`);
          
          // Verificar expiração
          const now = Date.now() / 1000;
          if (payload.exp < now) {
            addLog('❌ Token EXPIRADO!');
          } else {
            addLog('✅ Token ainda válido');
          }
        } else {
          addLog('❌ Token não é um JWT válido');
        }
      } catch (error) {
        addLog(`❌ Erro ao decodificar token: ${error}`);
      }
    } else {
      addLog('❌ Token não encontrado no localStorage');
    }
    
    // Verificar cookies
    const cookies = document.cookie;
    addLog(`🍪 Cookies: ${cookies}`);
    
    const tokenCookie = cookies
      .split(';')
      .find(c => c.trim().startsWith('nex_token='));
    
    if (tokenCookie) {
      const cookieToken = tokenCookie.split('=')[1];
      addLog(`✅ Token nos cookies: ${cookieToken.substring(0, 20)}...`);
      
      // Verificar se é o mesmo token
      if (token && token === cookieToken) {
        addLog('✅ Tokens são iguais');
      } else {
        addLog('❌ Tokens são diferentes!');
      }
    } else {
      addLog('❌ Token não encontrado nos cookies');
    }
  };

  const testDirectAccess = () => {
    addLog('🚀 Testando acesso direto ao dashboard...');
    
    fetch('/dashboard', {
      method: 'GET',
      credentials: 'include',
    })
    .then(response => {
      addLog(`📊 Status: ${response.status}`);
      addLog(`📍 URL final: ${response.url}`);
      addLog(`🔄 Redirecionado: ${response.redirected}`);
      
      if (response.status === 200) {
        addLog('✅ Acesso permitido');
      } else if (response.status === 302 || response.status === 307) {
        addLog('🔄 Redirecionamento detectado');
      } else {
        addLog(`❌ Acesso negado: ${response.status}`);
      }
    })
    .catch(error => {
      addLog(`❌ Erro: ${error}`);
    });
  };

  const testWindowLocation = () => {
    addLog('🌐 Testando window.location.href...');
    addLog('Redirecionando para /dashboard...');
    window.location.href = '/dashboard';
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const runAllTests = () => {
    clearLogs();
    addLog('🚀 Iniciando testes...');
    
    setTimeout(() => testToken(), 100);
    setTimeout(() => testDirectAccess(), 500);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Teste Simples de Autenticação</CardTitle>
            <CardDescription>
              Página simples para testar token e redirecionamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Testes</h3>
                <div className="space-y-2">
                  <Button onClick={runAllTests} className="w-full">
                    🧪 Executar Todos os Testes
                  </Button>
                  <Button onClick={testToken} variant="outline" className="w-full">
                    Verificar Token
                  </Button>
                  <Button onClick={testDirectAccess} variant="outline" className="w-full">
                    Testar Acesso Direto
                  </Button>
                  <Button onClick={testWindowLocation} variant="outline" className="w-full">
                    Ir para Dashboard
                  </Button>
                  <Button onClick={clearLogs} variant="secondary" className="w-full">
                    Limpar Logs
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Informações</h3>
                <div className="text-sm space-y-1">
                  <p><strong>URL Atual:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
                  <p><strong>User Agent:</strong> {typeof window !== 'undefined' ? navigator.userAgent.substring(0, 50) + '...' : 'N/A'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logs de Teste</CardTitle>
            <CardDescription>
              Resultados dos testes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-500">Nenhum teste executado ainda...</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
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
