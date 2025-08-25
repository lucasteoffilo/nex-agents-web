// Script para testar login programaticamente
const testLogin = async () => {
  try {
    console.log('Iniciando teste de login...');
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
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
    console.log('Resposta da API:', data);
    
    // Simular salvamento do token no localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('nex_token', data.accessToken);
      console.log('Token salvo no localStorage');
    }
    
    // Simular salvamento do token nos cookies
    if (typeof document !== 'undefined') {
      document.cookie = `nex_token=${data.accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`;
      console.log('Token salvo nos cookies');
    }
    
    console.log('Login realizado com sucesso!');
    return data;
    
  } catch (error) {
    console.error('Erro no login:', error);
    throw error;
  }
};

// Executar o teste
if (typeof window !== 'undefined') {
  window.testLogin = testLogin;
  console.log('Função testLogin() disponível no console do navegador');
} else {
  // Executar diretamente se for Node.js
  testLogin().then(result => {
    console.log('Teste concluído:', result);
  }).catch(error => {
    console.error('Teste falhou:', error);
  });
}