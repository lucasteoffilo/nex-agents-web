# Multi-stage build para Next.js com Node.js
 
# Stage 1: Instalar dependências
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci --include=dev && npm cache clean --force

# Stage 2: Build da aplicação
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build da aplicação Next.js
RUN npm run build

# Stage 3: Produção com Node.js
FROM node:18-alpine AS production
WORKDIR /app

# Instalar curl para healthcheck
RUN apk add --no-cache curl

# Copiar arquivos necessários para executar o Next.js
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Configurar comando para iniciar o servidor Next.js
EXPOSE 3000
CMD ["npm", "start"]

# Healthcheck para verificar se o servidor está rodando
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 CMD curl -f http://localhost:3000/ || exit 1

# Fim do Dockerfile