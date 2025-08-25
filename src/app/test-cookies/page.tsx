'use client';

import { useEffect, useState } from 'react';

export default function TestCookiesPage() {
  const [cookies, setCookies] = useState<string>('');
  const [localStorage, setLocalStorage] = useState<any>({});

  useEffect(() => {
    // Verificar cookies
    setCookies(document.cookie);
    
    // Verificar localStorage
    const localData = {
      nex_token: window.localStorage.getItem('nex_token'),
      nex_refresh_token: window.localStorage.getItem('nex_refresh_token'),
      current_tenant_id: window.localStorage.getItem('current_tenant_id')
    };
    setLocalStorage(localData);
  }, []);

  const testSetCookie = () => {
    const testToken = 'test-token-123';
    document.cookie = `nex_token=${testToken}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`;
    console.log('Cookie de teste definido:', testToken);
    setCookies(document.cookie);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teste de Cookies e LocalStorage</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Cookies:</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {cookies || 'Nenhum cookie encontrado'}
        </pre>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">LocalStorage:</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(localStorage, null, 2)}
        </pre>
      </div>
      
      <button 
        onClick={testSetCookie}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Definir Cookie de Teste
      </button>
    </div>
  );
}