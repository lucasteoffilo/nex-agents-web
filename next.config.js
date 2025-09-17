/** @type {import('next').NextConfig} */
const nextConfig = {
  // Temporariamente desativado para resolver problemas com páginas dinâmicas
  // output: 'export',
  // Configurações para ignorar erros de páginas dinâmicas
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  trailingSlash: true,
  images: {
    domains: ['localhost', 'api.nex.com'],
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    NEXT_PUBLIC_WORKER_URL: process.env.NEXT_PUBLIC_WORKER_URL || 'http://localhost:3002',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
  },
  // Rewrites não funcionam com output: 'export'
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: 'http://localhost:3001/api/:path*',
  //     },
  //   ];
  // },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

module.exports = nextConfig;