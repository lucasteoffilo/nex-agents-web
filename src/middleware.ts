import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Configuração de rotas
const publicRoutes = ['/login', '/register', '/'];
const authRoutes = ['/login', '/register'];
const protectedRoutes = ['/dashboard', '/chat', '/agents', '/documents', '/settings', '/admin'];
const adminRoutes = ['/admin'];
const tenantManagementRoutes = ['/admin/tenants', '/admin/users', '/admin/billing'];

// Chave secreta para JWT (em produção, usar variável de ambiente)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

interface TokenPayload {
  sub: string; // User ID
  email: string;
  firstName: string;
  lastName: string;
  tenantId?: string;
  roleId?: string;
  permissions?: string[];
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('nex_token')?.value;
  const requestedTenant = request.headers.get('x-tenant-id') || request.cookies.get('current_tenant')?.value;
  
  console.log('Middleware executado para:', pathname, 'Token encontrado:', !!token);

  // Permitir rotas públicas
  if (publicRoutes.includes(pathname)) {
    if (pathname === '/' && token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (pathname === '/' && !token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // Redirecionar usuários logados das rotas de auth
  if (authRoutes.includes(pathname) && token) {
    console.log('Middleware: Redirecionando usuário logado de', pathname, 'para /dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Verificar autenticação para rotas protegidas
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Verificar e decodificar o token JWT
      const { payload } = await jwtVerify(token, JWT_SECRET) as { payload: TokenPayload };
      
      // Verificar se o token não expirou
      if (payload.exp && payload.exp < Date.now() / 1000) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('nex_token');
        response.cookies.delete('current_tenant');
        return response;
      }

      // Verificar permissões para rotas administrativas
      if (adminRoutes.some(route => pathname.startsWith(route))) {
        // Por enquanto, permitir acesso - implementar verificação de role depois
        // if (payload.role.level !== 'system' && payload.role.level !== 'tenant') {
        //   return NextResponse.redirect(new URL('/dashboard', request.url));
        // }
      }

      // Verificar permissões específicas para gerenciamento de tenants
      if (tenantManagementRoutes.some(route => pathname.startsWith(route))) {
        const hasPermission = payload.permissions?.some(perm => 
          perm.includes('tenants:manage') || perm.includes('users:manage')
        );
        
        // Por enquanto, permitir acesso - implementar verificação de role depois
        // if (!hasPermission && payload.role.level !== 'system') {
        //   return NextResponse.redirect(new URL('/dashboard', request.url));
        // }
      }

      // Verificar contexto de tenant
      if (requestedTenant && requestedTenant !== payload.tenantId) {
        // Verificar se o usuário tem acesso ao tenant solicitado
        const canAccessTenant = await verifyTenantAccess(payload, requestedTenant);
        if (!canAccessTenant) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }

      // Adicionar headers de contexto para a aplicação
      const response = NextResponse.next();
      response.headers.set('x-user-id', payload.sub);
      response.headers.set('x-tenant-id', payload.tenantId || '');
      response.headers.set('x-user-role', payload.roleId || '');
      response.headers.set('x-user-permissions', JSON.stringify(payload.permissions || []));
      
      return response;

    } catch (error) {
      // Token inválido
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('nex_token');
      response.cookies.delete('current_tenant');
      return response;
    }
  }

  return NextResponse.next();
}

// Função auxiliar para verificar acesso a tenant
async function verifyTenantAccess(payload: TokenPayload, targetTenantId: string): Promise<boolean> {
  // Por enquanto, simplificar - usuários só podem acessar seu próprio tenant
  // Em uma implementação real, isso faria uma consulta ao banco de dados
  return payload.tenantId === targetTenantId;
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