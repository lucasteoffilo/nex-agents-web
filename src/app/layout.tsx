import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'sonner';

import '@/styles/globals.css';

// Providers
import { ThemeProvider } from '@/providers/theme-provider';
import { QueryProvider } from '@/providers/query-provider';
import { MultiTenantAuthProvider } from '@/providers/multi-tenant-auth-provider';
import { SocketProvider } from '@/providers/socket-provider';
import ErrorBoundary from '@/components/error-boundary';

// Fonts
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'NexAgents | Solução de Atendimento ao Cliente com IA',
    template: '%s | NEX Platform',
  },
  description: 'Plataforma inteligente de atendimento ao cliente com IA avançada',
  keywords: [
    'atendimento ao cliente',
    'inteligência artificial',
    'chatbot',
    'automação',
    'CRM',
    'knowledge base',
  ],
  authors: [{ name: 'NEX Team' }],
  creator: 'NEX Platform',
  publisher: 'NEX Platform',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  ),
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    title: 'NexAgents | Solução de Atendimento ao Cliente com IA',
    description: 'Plataforma inteligente de atendimento ao cliente com IA avançada',
    siteName: 'NEX Platform',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NexAgents | Solução de Atendimento ao Cliente com IA',
    description: 'Plataforma inteligente de atendimento ao cliente com IA avançada',
    creator: '@nexplatform',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#6366f1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`
          min-h-screen bg-background font-sans antialiased
          selection:bg-primary/20 selection:text-primary-foreground
        `}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
          storageKey="nex-theme"
        >
          <QueryProvider>
            <MultiTenantAuthProvider>
              <SocketProvider>
                <ErrorBoundary>
                  <div className="relative flex min-h-screen flex-col">
                    <div className="flex-1">{children}</div>
                  </div>
                </ErrorBoundary>
                
                {/* Toast notifications */}
                <Toaster
                  position="top-right"
                  expand={true}
                  richColors
                  closeButton
                  toastOptions={{
                    duration: 4000,
                    className: 'font-sans',
                  }}
                />
                
                {/* Loading overlay para transições */}
                <div
                  id="loading-overlay"
                  className="fixed inset-0 z-50 hidden bg-background/80 backdrop-blur-sm"
                >
                  <div className="flex h-full items-center justify-center">
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span className="text-sm text-muted-foreground">
                        Carregando...
                      </span>
                    </div>
                  </div>
                </div>
              </SocketProvider>
            </MultiTenantAuthProvider>
          </QueryProvider>
        </ThemeProvider>
        
        {/* Scripts de analytics e monitoramento */}
        {process.env.NODE_ENV === 'production' && (
          <>
            {/* Google Analytics */}
            {process.env.NEXT_PUBLIC_GA_ID && (
              <>
                <script
                  async
                  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
                />
                <script
                  dangerouslySetInnerHTML={{
                    __html: `
                      window.dataLayer = window.dataLayer || [];
                      function gtag(){dataLayer.push(arguments);}
                      gtag('js', new Date());
                      gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                    `,
                  }}
                />
              </>
            )}
            
            {/* Hotjar */}
            {process.env.NEXT_PUBLIC_HOTJAR_ID && (
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                    (function(h,o,t,j,a,r){
                      h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                      h._hjSettings={hjid:${process.env.NEXT_PUBLIC_HOTJAR_ID},hjsv:6};
                      a=o.getElementsByTagName('head')[0];
                      r=o.createElement('script');r.async=1;
                      r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                      a.appendChild(r);
                    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
                  `,
                }}
              />
            )}
          </>
        )}
      </body>
    </html>
  );
}