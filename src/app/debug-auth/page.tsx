'use client';

import { useState, useEffect } from 'react';

export default function DebugAuthPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [token, setToken] = useState('');
  const [cookies, setCookies] = useState('');
  const [localStorage, setLocalStorage] = useState('');

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const updateInfo = () => {
    if (typeof window !== 'undefined') {
      setCookies(document.cookie);
      setLocalStorage(window.localStorage.getItem('nex_token') || 'Não encontrado');
    }
  };

  useEffect(() => {
    addLog('Página carregada');
    updateInfo();
  }, []);

  const testLogin = async () => {
    try {
      addLog('Iniciando login...');
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@test.com',
          password: 'Password123!'
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      addLog(`Login bem-sucedido! Token: ${data.accessToken.substring(0, 20)}...`);
      
      // Salvar no localStorage
      localStorage.setItem('nex_token', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('nex_refresh_token', data.refreshToken);
      }
      addLog('Token salvo no localStorage');
      
      // Salvar nos cookies
      document.cookie = `nex_token=${data.accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`;
      addLog('Token salvo nos cookies');
      
      // Atualizar informações
      updateInfo();
      
      addLog('Aguardando 2 segundos antes de redirecionar...');
      setTimeout(() => {
        addLog('Redirecionando para dashboard...');
        window.location.href = '/dashboard';
      }, 2000);
      
    } catch (error: any) {
      addLog(`Erro no login: ${error.message}`);
    }
  };

  const testCookie = () => {
    const testToken = 'test-token-123';
    document.cookie = `nex_token=${testToken}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`;
    addLog(`Cookie de teste definido: ${testToken}`);
    updateInfo();
  };

  const clearAll = () => {
    localStorage.removeItem('nex_token');
    localStorage.removeItem('nex_refresh_token');
    document.cookie = 'nex_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    addLog('Todos os tokens removidos');
    updateInfo();
  };

  const testDashboard = () => {
    addLog('Navegando para dashboard...');
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Debug de Autenticação</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Controles */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Controles</h2>
            <div className="space-y-3">
              <button
                onClick={testLogin}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Testar Login
              </button>
              
              <button
                onClick={testCookie}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Definir Cookie de Teste
              </button>
              
              <button
                onClick={testDashboard}
                className="w-full bg-[#0072b9] hover:bg-[#005a92] text-white font-bold py-2 px-4 rounded"
              >
                Ir para Dashboard
              </button>
              
              <button
                onClick={clearAll}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Limpar Tudo
              </button>
              
              <button
                onClick={updateInfo}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Atualizar Info
              </button>
            </div>
          </div>
          
          {/* Informações */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Estado Atual</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-sm text-gray-700">Cookies:</h3>
                <p className="text-xs bg-gray-100 p-2 rounded break-all">
                  {cookies || 'Nenhum cookie encontrado'}
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-sm text-gray-700">LocalStorage Token:</h3>
                <p className="text-xs bg-gray-100 p-2 rounded break-all">
                  {localStorage}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Logs */}
        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Logs</h2>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}