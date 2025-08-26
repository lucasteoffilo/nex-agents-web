const axios = require('axios');

// Simular o comportamento do frontend
async function testFrontendApiCall() {
  try {
    console.log('=== Testando chamada da API do frontend ===');
    
    // Token válido obtido do login
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzYWQzMDBkNi05MGE1LTQ0ZWEtOGRlYS1lZThkMDYzMjg4ZWYiLCJlbWFpbCI6ImFkbWluQG5leGFpLmNvbSIsImZpcnN0TmFtZSI6IkFkbWluIiwibGFzdE5hbWUiOiJVc2VyIiwidGVuYW50SWQiOiI5MDdjM2RlNy03MDEyLTQ3YTItODM0OS1lNWJiZDU4MjRhMjgiLCJyb2xlSWQiOiJlYWY0Y2ZhZS04MWVlLTExZjAtYmIyNi0xYzFiMGRjZTFmOWYiLCJwZXJtaXNzaW9ucyI6WyJ2aWV3LWRhc2hib2FyZCIsImFnZW50LnJlYWQiLCJhZ2VudC5jcmVhdGUiLCJhZ2VudC51cGRhdGUiLCJhZ2VudC5kZWxldGUiLCJhZ2VudC5tYW5hZ2UiLCJjaGF0LnJlYWQiLCJjaGF0LmNyZWF0ZSIsImtub3dsZWRnZS5yZWFkIiwia25vd2xlZGdlLm1hbmFnZSJdLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU2MTU0ODUyLCJleHAiOjE3NTY3NTk2NTIsImF1ZCI6Im5leC1hcHAiLCJpc3MiOiJuZXgtYXBpIn0.x6HymWsvH0X1BahrEJh9g9I0G6i8aDMOiOSX4PBn_Sc';
    const tenantId = '907c3de7-7012-47a2-8349-e5bbd5824a28';
    
    // Configurar axios como o frontend faz
    const api = axios.create({
      baseURL: 'http://localhost:3001/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'API-Version': 'v1',
      },
    });
    
    // Interceptor de requisição (simular o que está no api.ts)
    api.interceptors.request.use(
      (config) => {
        console.log('Interceptor de requisição executado');
        
        // Simular obtenção do token do localStorage
        const nexToken = token; // localStorage.getItem('nex_token')
        console.log('Token encontrado:', nexToken ? 'SIM' : 'NÃO');
        
        if (nexToken) {
          config.headers.Authorization = `Bearer ${nexToken}`;
          console.log('Authorization header adicionado');
        } else {
          console.log('ERRO: Nenhum token encontrado!');
        }
        
        // Simular obtenção do tenant ID
        const currentTenantId = tenantId; // getCookie('nex_tenant_id') || localStorage.getItem('nex_tenant_id')
        console.log('Tenant ID encontrado:', currentTenantId);
        
        if (currentTenantId) {
          config.headers['X-Tenant-ID'] = currentTenantId;
          console.log('X-Tenant-ID header adicionado');
        }
        
        console.log('Headers finais:', config.headers);
        return config;
      },
      (error) => {
        console.error('Erro no interceptor de requisição:', error);
        return Promise.reject(error);
      }
    );
    
    // Interceptor de resposta (simular o que está no api.ts)
    api.interceptors.response.use(
      (response) => {
        console.log('Resposta recebida com sucesso:', response.status);
        console.log('Dados da resposta:', response.data);
        return response;
      },
      (error) => {
        console.error('Erro na resposta:', error.response?.status, error.response?.data);
        
        if (error.response?.status === 401) {
          console.log('Token expirado ou inválido - redirecionaria para login');
        }
        
        return Promise.reject(error);
      }
    );
    
    // Fazer a chamada para /agents/stats
    console.log('\n=== Fazendo chamada para /agents/stats ===');
    const response = await api.get('/agents/stats');
    
    console.log('\n=== Resultado da chamada ===');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    // Simular o processamento no agentService
    console.log('\n=== Simulando processamento no agentService ===');
    const apiResponse = response.data;
    
    if (apiResponse.success && apiResponse.data) {
      console.log('✅ Sucesso - dados encontrados:', apiResponse.data);
    } else {
      console.log('❌ Erro - resposta inválida:', apiResponse.error || 'Erro ao carregar estatísticas');
    }
    
  } catch (error) {
    console.error('\n=== ERRO CAPTURADO ===');
    console.error('Tipo:', error.constructor.name);
    console.error('Mensagem:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('Request:', error.request);
    }
    
    // Simular o que aconteceria no hook
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Mensagem que seria exibida no frontend:', errorMessage);
  }
}

// Executar o teste
testFrontendApiCall();