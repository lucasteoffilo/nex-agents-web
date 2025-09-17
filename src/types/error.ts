// Tipos de erro da aplicação
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  path?: string;
  statusCode?: number;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ErrorResponse {
  error: ApiError;
  validationErrors?: ValidationError[];
}

// Códigos de erro padronizados
export enum ErrorCodes {
  // Autenticação
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  
  // Validação
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  REQUIRED_FIELD = 'REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  
  // Recursos
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',
  
  // Servidor
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  TIMEOUT = 'TIMEOUT',
  
  // Rede
  NETWORK_ERROR = 'NETWORK_ERROR',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  
  // Tenant
  TENANT_NOT_FOUND = 'TENANT_NOT_FOUND',
  TENANT_SUSPENDED = 'TENANT_SUSPENDED',
  
  // Limites
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  
  // Outros
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Classe de erro customizada
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly details?: any;
  public readonly timestamp: string;
  public readonly path?: string;
  public readonly isRetryable: boolean;

  constructor(
    message: string,
    code: string = ErrorCodes.INTERNAL_ERROR,
    statusCode?: number,
    details?: any,
    path?: string,
    isRetryable: boolean = false
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.path = path;
    this.isRetryable = isRetryable;
  }

  toJSON(): ApiError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
      path: this.path,
      statusCode: this.statusCode
    };
  }

  static fromApiError(apiError: ApiError): AppError {
    return new AppError(
      apiError.message,
      apiError.code,
      apiError.statusCode,
      apiError.details,
      apiError.path,
      isRetryableError(apiError.code)
    );
  }
}

// Função para determinar se um erro é passível de retry
export function isRetryableError(code: string): boolean {
  const retryableCodes = [
    ErrorCodes.TIMEOUT,
    ErrorCodes.NETWORK_ERROR,
    ErrorCodes.CONNECTION_ERROR,
    ErrorCodes.SERVICE_UNAVAILABLE,
    ErrorCodes.RATE_LIMIT_EXCEEDED
  ];
  
  return retryableCodes.includes(code as ErrorCodes);
}

// Função para obter mensagem de erro amigável
export function getFriendlyErrorMessage(error: AppError | ApiError): string {
  const code = 'code' in error ? error.code : ErrorCodes.INTERNAL_ERROR;
  
  const messages: Record<string, string> = {
    [ErrorCodes.UNAUTHORIZED]: 'Você não tem permissão para acessar este recurso.',
    [ErrorCodes.FORBIDDEN]: 'Acesso negado. Verifique suas permissões.',
    [ErrorCodes.TOKEN_EXPIRED]: 'Sua sessão expirou. Faça login novamente.',
    [ErrorCodes.INVALID_CREDENTIALS]: 'Credenciais inválidas. Verifique seu email e senha.',
    [ErrorCodes.NOT_FOUND]: 'Recurso não encontrado.',
    [ErrorCodes.ALREADY_EXISTS]: 'Este recurso já existe.',
    [ErrorCodes.VALIDATION_ERROR]: 'Dados inválidos. Verifique os campos obrigatórios.',
    [ErrorCodes.NETWORK_ERROR]: 'Erro de conexão. Verifique sua internet.',
    [ErrorCodes.SERVICE_UNAVAILABLE]: 'Serviço temporariamente indisponível. Tente novamente.',
    [ErrorCodes.TIMEOUT]: 'Operação demorou muito para responder. Tente novamente.',
    [ErrorCodes.RATE_LIMIT_EXCEEDED]: 'Muitas tentativas. Aguarde um momento.',
    [ErrorCodes.TENANT_NOT_FOUND]: 'Organização não encontrada.',
    [ErrorCodes.TENANT_SUSPENDED]: 'Organização suspensa. Entre em contato com o suporte.',
    [ErrorCodes.QUOTA_EXCEEDED]: 'Limite de uso excedido. Considere fazer upgrade do plano.'
  };
  
  return messages[code] || error.message || 'Ocorreu um erro inesperado.';
}

// Função para determinar se deve mostrar detalhes técnicos
export function shouldShowTechnicalDetails(error: AppError | ApiError): boolean {
  const code = 'code' in error ? error.code : ErrorCodes.INTERNAL_ERROR;
  
  // Mostrar detalhes técnicos apenas para erros de desenvolvimento
  const technicalCodes = [
    ErrorCodes.VALIDATION_ERROR,
    ErrorCodes.INTERNAL_ERROR
  ];
  
  return technicalCodes.includes(code as ErrorCodes) && process.env.NODE_ENV === 'development';
}