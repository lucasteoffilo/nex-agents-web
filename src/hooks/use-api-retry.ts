import { useState, useCallback } from 'react';
import { AppError, isRetryableError } from '@/types/error';
import { toast } from 'sonner';

interface RetryConfig {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
}

interface UseApiRetryOptions extends RetryConfig {
  onError?: (error: AppError) => void;
  onRetry?: (attempt: number, error: AppError) => void;
  onSuccess?: () => void;
}

interface ApiRetryState {
  isLoading: boolean;
  error: AppError | null;
  attempt: number;
}

export function useApiRetry<T>(options: UseApiRetryOptions = {}) {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    onError,
    onRetry,
    onSuccess
  } = options;

  const [state, setState] = useState<ApiRetryState>({
    isLoading: false,
    error: null,
    attempt: 0
  });

  const calculateDelay = useCallback((attempt: number): number => {
    const delay = baseDelay * Math.pow(backoffMultiplier, attempt - 1);
    const jitter = Math.random() * 0.1 * delay; // Adiciona jitter de até 10%
    return Math.min(delay + jitter, maxDelay);
  }, [baseDelay, backoffMultiplier, maxDelay]);

  const executeWithRetry = useCallback(async (
    apiCall: () => Promise<T>
  ): Promise<T> => {
    setState({ isLoading: true, error: null, attempt: 0 });

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        setState(prev => ({ ...prev, attempt }));
        
        const result = await apiCall();
        
        setState({ isLoading: false, error: null, attempt });
        onSuccess?.();
        
        return result;
      } catch (error) {
        const appError = error as AppError;
        
        // Se não é um erro que pode ser retentado ou é a última tentativa
        if (!isRetryableError(appError) || attempt === maxAttempts) {
          setState({ isLoading: false, error: appError, attempt });
          onError?.(appError);
          throw appError;
        }

        // Notificar sobre a tentativa de retry
        onRetry?.(attempt, appError);
        
        // Aguardar antes da próxima tentativa
        const delay = calculateDelay(attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Mostrar toast informativo sobre retry (apenas nas primeiras tentativas)
        if (attempt < maxAttempts) {
          toast.info(`Tentativa ${attempt + 1} de ${maxAttempts}...`, {
            duration: 2000
          });
        }
      }
    }

    // Este ponto nunca deve ser alcançado, mas TypeScript exige
    throw new Error('Erro inesperado no retry');
  }, [maxAttempts, calculateDelay, onError, onRetry, onSuccess]);

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null, attempt: 0 });
  }, []);

  return {
    executeWithRetry,
    reset,
    isLoading: state.isLoading,
    error: state.error,
    attempt: state.attempt,
    canRetry: state.error ? isRetryableError(state.error) : false
  };
}

// Hook especializado para operações de API com configurações padrão
export function useApiCall<T>(options: UseApiRetryOptions = {}) {
  return useApiRetry<T>({
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 8000,
    backoffMultiplier: 2,
    ...options
  });
}

// Hook para operações críticas com mais tentativas
export function useCriticalApiCall<T>(options: UseApiRetryOptions = {}) {
  return useApiRetry<T>({
    maxAttempts: 5,
    baseDelay: 500,
    maxDelay: 15000,
    backoffMultiplier: 1.5,
    ...options
  });
}

// Hook para operações rápidas com menos tentativas
export function useQuickApiCall<T>(options: UseApiRetryOptions = {}) {
  return useApiRetry<T>({
    maxAttempts: 2,
    baseDelay: 500,
    maxDelay: 2000,
    backoffMultiplier: 2,
    ...options
  });
}