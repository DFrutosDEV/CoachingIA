'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

// Tipos de roles
type UserRole = 'admin' | 'coach' | 'client' | 'enterprise'

// Configuración de permisos por ruta
const routePermissions: Record<string, UserRole[]> = {
  '/dashboard/admin': ['admin'],
  '/dashboard/coach': ['admin', 'coach'],
  '/dashboard/client': ['admin', 'coach', 'client'],
  '/dashboard/enterprise': ['admin', 'enterprise'],
}

// Función para extraer rol del token JWT
function getUserRoleFromToken(token: string): UserRole | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const role = payload.role || payload.userType
    
    if (['admin', 'coach', 'client', 'enterprise'].includes(role)) {
      return role as UserRole
    }
    return null
  } catch (error) {
    console.log('❌ ROUTE GUARD: Error decodificando token:', error)
    return null
  }
}

// Función para verificar permisos
function hasRoutePermission(pathname: string, userRole: UserRole): boolean {
  for (const [routePath, allowedRoles] of Object.entries(routePermissions)) {
    if (pathname.startsWith(routePath)) {
      return allowedRoles.includes(userRole)
    }
  }
  return false
}

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const timestamp = new Date().toISOString()
    console.log(`🔐 [${timestamp}] ROUTE GUARD: Verificando ruta ${pathname}`)
    
    // Rutas públicas
    const publicRoutes = ['/', '/login', '/register', '/debug-middleware']
    const isPublicRoute = publicRoutes.some(route => {
      if (route === '/') return pathname === '/' // Solo la raíz exacta
      return pathname.startsWith(route)
    })
    
    if (isPublicRoute) {
      console.log(`✅ [${timestamp}] ROUTE GUARD: Ruta pública ${pathname}`)
      return
    }

    // Verificar autenticación para rutas protegidas
    if (pathname.startsWith('/dashboard')) {
      console.log(`🔒 [${timestamp}] ROUTE GUARD: Ruta protegida ${pathname}`)
      
      const token = localStorage.getItem('token')
      if (!token) {
        console.log(`❌ [${timestamp}] ROUTE GUARD: Sin token, redirigiendo a /login`)
        router.push('/login')
        return
      }

      console.log(`🎫 [${timestamp}] ROUTE GUARD: Token encontrado, verificando rol...`)
      
      const userRole = getUserRoleFromToken(token)
      if (!userRole) {
        console.log(`❌ [${timestamp}] ROUTE GUARD: Token inválido, redirigiendo a /login`)
        // Limpiar token inválido
        localStorage.removeItem('token')
        localStorage.removeItem('userRole')
        router.push('/login')
        return
      }

      console.log(`👤 [${timestamp}] ROUTE GUARD: Usuario con rol '${userRole}' verificando permisos para ${pathname}`)

      if (!hasRoutePermission(pathname, userRole)) {
        console.log(`🚫 [${timestamp}] ROUTE GUARD: Usuario '${userRole}' sin permisos para ${pathname}`)
        router.push('/dashboard/unauthorized')
        return
      }

      console.log(`✅ [${timestamp}] ROUTE GUARD: Acceso permitido para '${userRole}' a ${pathname}`)
    }
  }, [pathname, router])

  return <>{children}</>
}
