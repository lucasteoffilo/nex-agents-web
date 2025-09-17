# Docker Setup - Nex Agentes Web

Este documento contém instruções para executar o projeto Nex Agentes Web usando Docker com nginx.

## 📋 Pré-requisitos

- Docker instalado (versão 20.10 ou superior)
- Docker Compose instalado (versão 2.0 ou superior)

## 🏗️ Arquitetura

O projeto utiliza um build multi-stage:

1. **Stage 1 (deps)**: Instala as dependências do Node.js
2. **Stage 2 (builder)**: Faz o build da aplicação Next.js com export estático
3. **Stage 3 (production)**: Serve os arquivos estáticos usando nginx

## 🚀 Como usar

### Opção 1: Docker Compose (Recomendado)

```bash
# Build e executar o container
docker-compose up --build

# Executar em background
docker-compose up -d --build

# Parar os containers
docker-compose down
```

### Opção 2: Docker Commands

```bash
# Build da imagem
docker build -t nex-agentes-web .

# Executar o container
docker run -d -p 80:80 --name nex-agentes-web nex-agentes-web

# Parar o container
docker stop nex-agentes-web

# Remover o container
docker rm nex-agentes-web
```

## 🌐 Acesso

Após executar o container, a aplicação estará disponível em:
- **URL**: http://localhost
- **Porta**: 80

## 📁 Arquivos de Configuração

### Dockerfile
- Build multi-stage otimizado
- Usa Node.js 18 Alpine para build
- Nginx Alpine para produção
- Inclui healthcheck

### nginx.conf
- Configuração otimizada para SPA
- Compressão gzip habilitada
- Cache configurado para assets estáticos
- Headers de segurança
- Suporte a proxy para API (comentado)

### .dockerignore
- Exclui arquivos desnecessários do build
- Otimiza o tamanho da imagem
- Reduz tempo de build

### docker-compose.yml
- Configuração simplificada
- Healthcheck configurado
- Rede isolada
- Restart automático

## 🔧 Configurações Avançadas

### Variáveis de Ambiente

Para configurar variáveis de ambiente, edite o `docker-compose.yml`:

```yaml
environment:
  - NODE_ENV=production
  - NEXT_PUBLIC_API_URL=https://sua-api.com/api
  - NEXT_PUBLIC_WS_URL=wss://sua-api.com
```

### Proxy para API

Para habilitar o proxy para a API, descomente as linhas no `nginx.conf`:

```nginx
location /api/ {
    proxy_pass http://backend:3001;
    # ... outras configurações
}
```

E no `docker-compose.yml`, descomente o serviço da API.

### Portas Customizadas

Para usar uma porta diferente, modifique o `docker-compose.yml`:

```yaml
ports:
  - "8080:80"  # Aplicação disponível em http://localhost:8080
```

## 🐛 Troubleshooting

### Container não inicia

```bash
# Verificar logs
docker-compose logs nex-agentes-web

# Ou para container individual
docker logs nex-agentes-web
```

### Problemas de build

```bash
# Limpar cache do Docker
docker system prune -a

# Rebuild sem cache
docker-compose build --no-cache
```

### Healthcheck falhando

```bash
# Verificar status do healthcheck
docker inspect nex-agentes-web | grep -A 10 Health
```

## 📊 Monitoramento

### Verificar status dos containers

```bash
# Status dos containers
docker-compose ps

# Logs em tempo real
docker-compose logs -f

# Estatísticas de uso
docker stats
```

### Healthcheck

O container inclui um healthcheck que verifica se a aplicação está respondendo:
- **Intervalo**: 30 segundos
- **Timeout**: 10 segundos
- **Tentativas**: 3
- **Período inicial**: 40 segundos

## 🔒 Segurança

O nginx está configurado com headers de segurança:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## 📈 Performance

- **Compressão gzip** habilitada para todos os assets
- **Cache** configurado para arquivos estáticos (1 ano)
- **Build multi-stage** para imagem otimizada
- **Alpine Linux** para menor tamanho da imagem

## 🚀 Deploy em Produção

Para deploy em produção, considere:

1. **HTTPS**: Configure um reverse proxy (nginx, Traefik, etc.)
2. **Domínio**: Configure as variáveis de ambiente adequadas
3. **Monitoramento**: Implemente logs centralizados
4. **Backup**: Configure backup dos dados se necessário
5. **Scaling**: Use Docker Swarm ou Kubernetes para scaling

## 📝 Notas Importantes

- O projeto usa `output: 'export'` no Next.js para gerar arquivos estáticos
- Todas as rotas são tratadas como SPA (Single Page Application)
- O nginx serve os arquivos estáticos diretamente
- Para APIs externas, configure as URLs nas variáveis de ambiente