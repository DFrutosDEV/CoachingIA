import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './src/lib/auth-jwt';

// Tipos de roles
type UserRole = 'admin' | 'coach' | 'client' | 'enterprise';

// Configuración de permisos por ruta
const routePermissions: Record<string, UserRole[]> = {
  '/dashboard/admin': ['admin'],
  '/dashboard/coach': ['admin', 'coach'],
  '/dashboard/client': ['admin', 'coach', 'client'],
  '/dashboard/enterprise': ['admin', 'enterprise'],
};

// Función para extraer rol del token
function getUserRoleFromToken(token: string): UserRole | null {
  try {
    const decoded = verifyToken(token);

    if (!decoded) {
      console.log('❌ MIDDLEWARE: Token inválido o expirado');
      return null;
    }

    const role = (decoded as any).role;
    console.log('🔍 MIDDLEWARE: Rol extraído del token:', role);

    if (role && ['admin', 'coach', 'client', 'enterprise'].includes(role)) {
      return role as UserRole;
    }

    console.warn('⚠️ MIDDLEWARE: Rol no válido:', role);
    return null;
  } catch (error) {
    console.error('❌ MIDDLEWARE: Error verificando token:', error);
    return null;
  }
}

// Función para verificar permisos
function hasRoutePermission(pathname: string, userRole: UserRole): boolean {
  for (const [routePath, allowedRoles] of Object.entries(routePermissions)) {
    if (pathname.startsWith(routePath)) {
      return allowedRoles.includes(userRole);
    }
  }
  return false;
}

// Rutas que requieren autenticación
const protectedRoutes = [
  '/dashboard',
  '/api/admin',
  '/api/coach',
  '/api/client',
  '/api/enterprise',
  '/api/calendar',
  '/api/notes',
  '/api/meets',
  '/api/goals',
  '/api/objectives',
  '/api/notification',
  '/api/config-forms',
];

// Rutas públicas (no requieren autenticación)
const publicRoutes = [
  '/login',
  '/api/loggin',
  '/api/users/check-email',
  '/api/health',
  '/',
  '/api/auth/verify',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip para archivos estáticos y _next
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  console.log('🔍 Middleware verificando ruta:', pathname);

  // Verificar si es una ruta pública
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    console.log('✅ Ruta pública permitida:', pathname);
    return NextResponse.next();
  }

  // Verificar si es una ruta protegida
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // Extraer token del header Authorization
    const authHeader = request.headers.get('authorization');
    let token = null;

    console.log(
      '🔍 MIDDLEWARE DEBUG: Headers disponibles:',
      Array.from(request.headers.keys())
    );
    console.log('🔍 MIDDLEWARE DEBUG: Authorization header:', authHeader);

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
      console.log('🔑 MIDDLEWARE: Token extraído de Authorization header');
    } else {
      // También intentar obtener de cookies si no está en headers
      token = request.cookies.get('authToken')?.value;
      console.log('🍪 MIDDLEWARE: Token extraído de cookies:', !!token);
    }

    console.log('🔑 MIDDLEWARE: Token encontrado:', !!token);
    if (token) {
      console.log(
        '🔑 MIDDLEWARE: Token (primeros 20 chars):',
        token.substring(0, 20) + '...'
      );
    }

    if (!token) {
      console.log('❌ No hay token - Redirigiendo al login');

      // Para rutas API, devolver 401
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, message: 'Token requerido' },
          { status: 401 }
        );
      }

      // Para rutas de páginas, redirigir al login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verificar validez del token
    const decoded = verifyToken(token);

    if (!decoded) {
      console.log('❌ Token inválido - Redirigiendo al login');

      // Para rutas API, devolver 401
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, message: 'Token inválido o expirado' },
          { status: 401 }
        );
      }

      // Para rutas de páginas, redirigir al login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    console.log('✅ Token válido para usuario:', (decoded as any).userId);

    // Verificar permisos específicos por ruta
    const userRole = getUserRoleFromToken(token);

    if (!userRole) {
      console.log('❌ MIDDLEWARE: No se pudo obtener rol del usuario');

      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, message: 'Rol de usuario no válido' },
          { status: 403 }
        );
      }

      return NextResponse.redirect(new URL('/login', request.url));
    }

    console.log(
      `👤 MIDDLEWARE: Usuario con rol '${userRole}' verificando permisos para ${pathname}`
    );

    // Verificar permisos específicos para rutas del dashboard
    if (pathname.startsWith('/dashboard/')) {
      if (!hasRoutePermission(pathname, userRole)) {
        console.log(
          `🚫 MIDDLEWARE: Usuario '${userRole}' sin permisos para ${pathname}`
        );

        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { success: false, message: 'Acceso denegado' },
            { status: 403 }
          );
        }

        return NextResponse.redirect(
          new URL('/dashboard/unauthorized', request.url)
        );
      }

      console.log(
        `✅ MIDDLEWARE: Acceso permitido para '${userRole}' a ${pathname}`
      );
    }

    // Agregar información del usuario a los headers para uso en las rutas API
    const response = NextResponse.next();
    response.headers.set('x-user-id', (decoded as any).userId);
    response.headers.set('x-user-email', (decoded as any).email || '');
    response.headers.set('x-user-role', userRole);

    return response;
  }

  // Permitir otras rutas
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
