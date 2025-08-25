'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Configurações padrão para queries
            staleTime: 1000 * 60 * 5, // 5 minutos
            gcTime: 1000 * 60 * 10, // 10 minutos (anteriormente cacheTime)
            retry: (failureCount, error: any) => {
              // Não tentar novamente para erros 4xx
              if (error?.response?.status >= 400 && error?.response?.status < 500) {
                return false;
              }
              // Tentar até 3 vezes para outros erros
              return failureCount < 3;
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            refetchOnMount: true,
          },
          mutations: {
            // Configurações padrão para mutations
            retry: false,
            onError: (error: any) => {
              console.error('Mutation error:', error);
              // Aqui você pode adicionar notificações de erro globais
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}