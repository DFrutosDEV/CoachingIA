import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Solo proteger rutas de API que requieren autenticación
const protectedApiRoutes = [
  '/api/admin',
  '/api/coach',
  '/api/client'
]

// Rutas de API públicas
const publicApiRoutes = [
  '/api/auth',
  '/api/health',
  '/api/loggin',
  '/api/client/getBasicData'  // Agregar temporalmente para debug
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Solo verificar autenticación para rutas de API protegidas
  const isProtectedApiRoute = protectedApiRoutes.some(route => 
    pathname.startsWith(route)
  )

  const isPublicApiRoute = publicApiRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Si es una ruta de API protegida, verificar autenticación
  if (isProtectedApiRoute) {
    // Obtener el token del header Authorization
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Token de autenticación requerido' },
        { status: 401 }
      )
    }

    // Si hay token, permitir el acceso (la validación se hace en cada endpoint)
    return NextResponse.next()
  }

  // Para rutas públicas y otras rutas, permitir el acceso
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Solo aplicar a rutas de API
    '/api/:path*',
  ],
} 