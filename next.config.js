/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker production builds
  output: 'standalone',
  // Disable experimental features that might interfere with CSS
  experimental: {
    appDir: true,
  },
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
    // Adicionando suporte a aliases do tsconfig.json
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
      '@/components': require('path').resolve(__dirname, 'src/components'),
      '@/lib': require('path').resolve(__dirname, 'src/lib'),
      '@/hooks': require('path').resolve(__dirname, 'src/hooks'),
      '@/types': require('path').resolve(__dirname, 'src/types'),
      '@/utils': require('path').resolve(__dirname, 'src/utils'),
      '@/styles': require('path').resolve(__dirname, 'src/styles'),
      '@/store': require('path').resolve(__dirname, 'src/store'),
      '@/services': require('path').resolve(__dirname, 'src/services'),
      '@/providers': require('path').resolve(__dirname, 'src/providers'),
    };
    return config;
  },
};
module.exports = nextConfig;