import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Configuração de rotas
const publicRoutes = ['/login', '/register', '/', '/login-debug', '/test-simple', '/test-middleware', '/debug-auth'];
const authRoutes = ['/login', '/register'];
const protectedRoutes = ['/dashboard', '/chat', '/agents', '/documents', '/settings', '/admin'];
const adminRoutes = ['/admin'];
const tenantManagementRoutes = ['/admin/tenants', '/admin/users', '/admin/billing'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('nex_token')?.value;
  const requestedTenant = request.headers.get('x-tenant-id') || request.cookies.get('current_tenant')?.value;
  
  console.log('=== MIDDLEWARE DEBUG EXECUTADO ===');
  console.log('Pathname:', pathname);
  console.log('Token encontrado:', !!token);
  console.log('Token (primeiros 20 chars):', token ? token.substring(0, 20) + '...' : 'N/A');
  console.log('Tenant solicitado:', requestedTenant);
  console.log('Todos os cookies:', request.cookies.getAll().map(c => `${c.name}=${c.value.substring(0, 20)}...`));

  // Permitir rotas públicas
  if (publicRoutes.includes(pathname)) {
    console.log('Middleware: Rota pública, permitindo acesso');
    if (pathname === '/' && token) {
      console.log('Middleware: Redirecionando usuário logado de / para /dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (pathname === '/' && !token) {
      console.log('Middleware: Redirecionando usuário não logado de / para /login');
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // Redirecionar usuários logados das rotas de auth
  if (authRoutes.includes(pathname) && token) {
    console.log('Middleware: Usuário já logado detectado em', pathname);
    console.log('Middleware: Redirecionando para /dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Verificar autenticação para rotas protegidas
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    console.log('Middleware: Verificando rota protegida:', pathname);
    if (!token) {
      console.log('Middleware: Token não encontrado, redirecionando para login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // MODO DEBUG: Permitir acesso se há token, sem verificar JWT
    console.log('Middleware: MODO DEBUG - Permitindo acesso com token presente');
    console.log('Middleware: Token encontrado, permitindo acesso a:', pathname);
    
    // Adicionar headers de contexto para a aplicação
    const response = NextResponse.next();
    response.headers.set('x-user-id', 'debug-user');
    response.headers.set('x-tenant-id', requestedTenant || 'debug-tenant');
    response.headers.set('x-user-role', 'debug-role');
    response.headers.set('x-user-permissions', '[]');
    
    return response;
  }

  console.log('Middleware: Rota não protegida, permitindo acesso');
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
