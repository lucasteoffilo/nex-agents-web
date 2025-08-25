'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppError, getFriendlyErrorMessage, shouldShowTechnicalDetails } from '@/types/error';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log do erro
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Callback personalizado
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Enviar erro para serviço de monitoramento (ex: Sentry)
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrar com serviço de monitoramento
      // Sentry.captureException(error, { contexts: { react: errorInfo } });
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      // Renderizar fallback customizado se fornecido
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error } = this.state;
      const isAppError = error instanceof AppError;
      const errorMessage = isAppError 
        ? getFriendlyErrorMessage(error)
        : 'Ocorreu um erro inesperado na aplicação.';
      
      const showTechnicalDetails = isAppError 
        ? shouldShowTechnicalDetails(error)
        : process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-red-900">
                Oops! Algo deu errado
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {errorMessage}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {showTechnicalDetails && error && (
                <div className="bg-muted p-3 rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <Bug className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Detalhes técnicos:
                    </span>
                  </div>
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-words">
                    {error.message}
                    {error.stack && (
                      <>
                        {'\n\nStack trace:\n'}
                        {error.stack}
                      </>
                    )}
                  </pre>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={this.handleRetry}
                  className="flex-1"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </Button>
                
                <Button 
                  onClick={this.handleGoHome}
                  className="flex-1"
                  variant="outline"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Ir para Início
                </Button>
              </div>
              
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-muted-foreground text-center">
                  Este erro foi capturado pelo Error Boundary em modo de desenvolvimento.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook para usar Error Boundary de forma mais simples
export function useErrorHandler() {
  return (error: Error) => {
    // Força o Error Boundary a capturar o erro
    throw error;
  };
}

// Componente funcional para casos específicos
export function ErrorFallback({ 
  error, 
  resetError 
}: { 
  error: Error; 
  resetError: () => void; 
}) {
  const isAppError = error instanceof AppError;
  const errorMessage = isAppError 
    ? getFriendlyErrorMessage(error)
    : 'Ocorreu um erro inesperado.';

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
      <h2 className="text-lg font-semibold mb-2">Erro</h2>
      <p className="text-muted-foreground mb-4">{errorMessage}</p>
      <Button onClick={resetError}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Tentar Novamente
      </Button>
    </div>
  );
}

export default ErrorBoundary;