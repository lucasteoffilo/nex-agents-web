const axios = require('axios');

// Configurar axios para usar cookies
const api = axios.create({
  baseURL: 'http://api.nexagentes.com/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

async function testFrontendLogin() {
  try {
    console.log('🔐 Testando login...');
    
    // Fazer login
    const loginResponse = await api.post('/auth/login', {
      email: 'admin@nexai.com',
      password: 'admin123'
    });
    
    console.log('✅ Login bem-sucedido!');
    console.log('📋 Dados do usuário:', {
      id: loginResponse.data.data.user.id,
      name: loginResponse.data.data.user.name,
      email: loginResponse.data.data.user.email
    });
    
    console.log('🏢 Dados do tenant:', {
      id: loginResponse.data.data.tenant.id,
      name: loginResponse.data.data.tenant.name
    });
    
    // Extrair token e tenant ID
    const token = loginResponse.data.data.accessToken;
    const tenantId = loginResponse.data.data.tenant.id;
    
    console.log('🔑 Token:', token.substring(0, 20) + '...');
    console.log('🏢 Tenant ID:', tenantId);
    
    // Configurar headers para próximas requisições
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    api.defaults.headers.common['X-Tenant-ID'] = tenantId;
    
    console.log('\n📡 Testando criação de coleção...');
    
    // Testar criação de coleção
    const timestamp = Date.now();
    const collectionData = {
      name: `Teste Collection ${timestamp}`,
      description: 'Uma coleção de teste criada via script',
      type: 'general',
      settings: {
        isPublic: false
      }
    };
    
    console.log('📦 Dados da coleção:', JSON.stringify(collectionData, null, 2));
    console.log('📋 Headers da requisição:', {
      'Authorization': `Bearer ${token.substring(0, 20)}...`,
      'X-Tenant-ID': tenantId,
      'Content-Type': 'application/json'
    });
    
    const collectionResponse = await api.post('/collections', collectionData);
    
    console.log('✅ Coleção criada com sucesso!');
    console.log('📋 Dados da coleção criada:', {
      id: collectionResponse.data.data.id,
      name: collectionResponse.data.data.name,
      description: collectionResponse.data.data.description,
      tenantId: collectionResponse.data.data.tenantId
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    
    if (error.response) {
      console.error('📋 Status:', error.response.status);
      console.error('📋 Headers da resposta:', error.response.headers);
      console.error('📋 Dados da resposta:', error.response.data);
    }
  }
}

// Executar teste
testFrontendLogin();