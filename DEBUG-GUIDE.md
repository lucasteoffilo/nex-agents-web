# Guia de Debug - Problema de Redirecionamento

## Páginas de Debug Disponíveis

### 1. `/login-debug` - Login com Debug
- **URL**: http://localhost:3000/login-debug
- **Função**: Página de login que NÃO redireciona automaticamente
- **Uso**: Faça login e veja os logs no console sem ser redirecionado
- **Recursos**:
  - Modo debug que desabilita redirecionamento automático
  - Credenciais de teste pré-preenchidas
  - Botão para ir ao dashboard manualmente
  - Botão para limpar storage

### 2. `/debug-auth` - Debug de Autenticação
- **URL**: http://localhost:3000/debug-auth
- **Função**: Mostra estado atual da autenticação
- **Uso**: Visualize cookies, localStorage, usuário e permissões
- **Recursos**:
  - Estado do provider em tempo real
  - Visualização de cookies e localStorage
  - Lista de permissões
  - Botões para testar login e logout

### 3. `/test-redirect` - Teste de Redirecionamento
- **URL**: http://localhost:3000/test-redirect
- **Função**: Testa diferentes métodos de redirecionamento
- **Uso**: Execute testes para ver qual método funciona
- **Recursos**:
  - Teste de router.push
  - Teste de window.location.href
  - Verificação de cookies e localStorage
  - Logs detalhados dos testes

## Como Usar para Diagnosticar

### Passo 1: Teste o Login
1. Acesse `/login-debug`
2. Use as credenciais de teste (admin@test.com / Password123!)
3. Abra o console do navegador (F12)
4. Faça o login e observe os logs

### Passo 2: Verifique o Estado
1. Acesse `/debug-auth`
2. Verifique se o usuário está logado
3. Confirme se os cookies estão definidos
4. Verifique se o localStorage tem o token

### Passo 3: Teste o Redirecionamento
1. Acesse `/test-redirect`
2. Execute "Executar Todos os Testes"
3. Observe qual método de redirecionamento funciona
4. Verifique os logs para identificar problemas

## Logs Importantes a Observar

### No Console do Navegador:
```
=== INICIANDO LOGIN DEBUG ===
Login bem-sucedido, redirecionando para dashboard...
Dados do usuário: {...}
Dados do tenant: {...}
🔍 MODO DEBUG: Redirecionamento automático desabilitado
=== DADOS DO LOGIN ===
URL atual: http://localhost:3000/login-debug
Cookies atuais: nex_token=...
LocalStorage: {...}
=== FIM DOS DADOS ===
```

### No Middleware (Terminal):
```
Middleware executado para: /dashboard
Token encontrado: true
Token (primeiros 20 chars): eyJhbGciOiJIUzI1NiIs...
Tenant solicitado: tenant-id
Middleware: Verificando rota protegida: /dashboard
Middleware: Verificando token JWT...
Middleware: Token JWT válido para usuário: admin@test.com
Middleware: Autenticação bem-sucedida, permitindo acesso a: /dashboard
```

## Problemas Comuns e Soluções

### 1. Token não está sendo salvo nos cookies
- **Sintoma**: Middleware não encontra o token
- **Solução**: Verificar se o cookie está sendo definido corretamente
- **Debug**: Usar `/debug-auth` para verificar cookies

### 2. Redirecionamento não funciona
- **Sintoma**: Fica na página de login após login bem-sucedido
- **Solução**: Testar diferentes métodos de redirecionamento
- **Debug**: Usar `/test-redirect` para testar métodos

### 3. Middleware bloqueia acesso
- **Sintoma**: Redireciona de volta para login
- **Solução**: Verificar se o token JWT é válido
- **Debug**: Verificar logs do middleware no terminal

## Credenciais de Teste
- **Email**: admin@test.com
- **Senha**: Password123!

## Comandos Úteis

### Limpar Storage Completo:
```javascript
localStorage.clear();
document.cookie = 'nex_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
document.cookie = 'current_tenant=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
window.location.reload();
```

### Verificar Token no Console:
```javascript
console.log('Token:', localStorage.getItem('nex_token'));
console.log('Cookies:', document.cookie);
```

## Próximos Passos

1. **Teste o login** em `/login-debug`
2. **Verifique os logs** no console
3. **Confirme o estado** em `/debug-auth`
4. **Teste redirecionamento** em `/test-redirect`
5. **Identifique o problema** baseado nos logs
6. **Aplique a correção** necessária
