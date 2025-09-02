'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useMultiTenantAuth } from '@/providers/multi-tenant-auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { redirectToDashboard } from '@/utils/navigation';

export default function LoginDebugPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [debugMode, setDebugMode] = useState(true); // Modo debug ativado
  const [loginCompleted, setLoginCompleted] = useState(false);
  const { login, user, tenant, isInitialized } = useMultiTenantAuth();
  const router = useRouter();

  // Detectar quando o estado é atualizado após o login
  useEffect(() => {
    if (loginCompleted && user && tenant) {
      console.log('=== ESTADO ATUALIZADO APÓS LOGIN ===');
      console.log('Usuário:', user);
      console.log('Tenant:', tenant);
      console.log('Inicializado:', isInitialized);
    }
  }, [user, tenant, isInitialized, loginCompleted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    try {
      setIsLoading(true);
      console.log('=== INICIANDO LOGIN DEBUG ===');
      console.log('Email:', email);
      console.log('Debug mode ativo:', debugMode);
      
      await login(email, password);
      setLoginCompleted(true);
      
      console.log('=== LOGIN CONCLUÍDO ===');
      console.log('Aguardando atualização do estado...');
      
      if (debugMode) {
        toast.success('Login realizado! Verifique o console para debug. Clique em "Ir para Dashboard" quando quiser.');
      } else {
        // O redirecionamento é feito no MultiTenantAuthProvider
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      toast.error(error.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    console.log('=== TESTANDO REDIRECIONAMENTO MANUAL ===');
    console.log('URL atual:', window.location.href);
    console.log('Cookies:', document.cookie);
    console.log('LocalStorage token:', localStorage.getItem('nex_token')?.substring(0, 20) + '...');
    console.log('Usuário atual:', user);
    console.log('Tenant atual:', tenant);
    
    // Verificar se o token está nos cookies
    const tokenCookie = document.cookie
      .split(';')
      .find(c => c.trim().startsWith('nex_token='));
    
    if (tokenCookie) {
      const token = tokenCookie.split('=')[1];
      console.log('✅ Token encontrado nos cookies:', token.substring(0, 20) + '...');
    } else {
      console.log('❌ Token NÃO encontrado nos cookies!');
    }
    
    console.log('Tentando redirecionamento...');
    
    // Usar função de redirecionamento segura
    redirectToDashboard(router);
  };

  const handleClearStorage = () => {
    localStorage.clear();
    document.cookie = 'nex_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    document.cookie = 'current_tenant=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    toast.success('Storage limpo!');
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <Image
            src="/nex-logo.png"
            alt="NEX Platform"
            width={200}
            height={60}
            className="mx-auto h-12 w-auto"
            priority
          />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            Login Debug
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Versão de debug para diagnosticar problemas de redirecionamento
          </p>
        </div>

        {/* Debug Info */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-sm text-yellow-800">Modo Debug Ativo</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-yellow-700">
            <p>• O redirecionamento automático está desabilitado</p>
            <p>• Verifique o console do navegador para logs detalhados</p>
            <p>• Após o login, clique em "Ir para Dashboard" manualmente</p>
          </CardContent>
        </Card>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Entrar na sua conta</CardTitle>
            <CardDescription>
              Digite suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="debugMode"
                  checked={debugMode}
                  onChange={(e) => setDebugMode(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="debugMode" className="text-sm">
                  Modo Debug (desabilita redirecionamento automático)
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Debug Actions */}
        {user && (
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-sm text-green-800">Login Bem-sucedido!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-green-700">
                <strong>Usuário:</strong> {user.name} ({user.email})
              </p>
              {tenant && (
                <p className="text-sm text-green-700">
                  <strong>Tenant:</strong> {tenant.name}
                </p>
              )}
              <div className="flex gap-2">
                <Button onClick={handleGoToDashboard} className="flex-1">
                  Ir para Dashboard
                </Button>
                <Button onClick={handleClearStorage} variant="outline">
                  Limpar Storage
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Test Credentials */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-sm text-blue-800">Credenciais de Teste</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEmail('admin@test.com');
                setPassword('Password123!');
              }}
              className="w-full"
            >
              Usar Credenciais de Teste
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
