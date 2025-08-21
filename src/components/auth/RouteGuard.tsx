'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { axiosClient } from '@/lib/services/axios-client'

// Tipos de roles
type UserRole = 'admin' | 'coach' | 'client' | 'enterprise'

// ✅ RouteGuard mejorado - Verificación real con el servidor
export function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isVerifying, setIsVerifying] = useState(true)

  useEffect(() => {
    const verifyAccess = async () => {
      const timestamp = new Date().toISOString()
      console.log(`🔐 [${timestamp}] ROUTE GUARD CLIENTE: Verificando ruta ${pathname}`)
      
      // Rutas públicas
      const publicRoutes = ['/', '/login', '/register', '/debug-middleware']
      const isPublicRoute = publicRoutes.some(route => {
        if (route === '/') return pathname === '/' // Solo la raíz exacta
        return pathname.startsWith(route)
      })
      
      if (isPublicRoute) {
        console.log(`✅ [${timestamp}] ROUTE GUARD CLIENTE: Ruta pública ${pathname}`)
        setIsVerifying(false)
        return
      }

      // Verificar autenticación para rutas protegidas
      if (pathname.startsWith('/dashboard')) {
        console.log(`🔒 [${timestamp}] ROUTE GUARD CLIENTE: Ruta protegida ${pathname}`)
        
        const { token } = JSON.parse(localStorage.getItem('persist:auth') || '{}')
        console.log('🔍 Token en cliente:', !!token)
        
        if (!token) {
          console.log(`❌ [${timestamp}] ROUTE GUARD CLIENTE: Sin token, redirigiendo a /login`)
          router.push('/login')
          return
        }

        try {
          // ✅ Hacer una verificación real con el servidor
          console.log(`🔍 [${timestamp}] ROUTE GUARD CLIENTE: Verificando token con servidor...`)
          
          const response = await axiosClient.get('/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          console.log(`✅ [${timestamp}] ROUTE GUARD CLIENTE: Token válido en servidor`)
          
          // Verificar permisos específicos
          const userRole = response.data.user?.role?.name?.toLowerCase()
          console.log(`👤 [${timestamp}] ROUTE GUARD CLIENTE: Usuario con rol '${userRole}'`)
          
          // Verificar si tiene permisos para esta ruta
          const hasPermission = checkRoutePermission(pathname, userRole)
          
          if (!hasPermission) {
            console.log(`🚫 [${timestamp}] ROUTE GUARD CLIENTE: Usuario '${userRole}' sin permisos para ${pathname}`)
            router.push('/dashboard/unauthorized')
            return
          }
          
          console.log(`✅ [${timestamp}] ROUTE GUARD CLIENTE: Acceso permitido para '${userRole}' a ${pathname}`)
          
        } catch (error: any) {
          console.log(`❌ [${timestamp}] ROUTE GUARD CLIENTE: Error verificando token:`, error.response?.status)
          
          if (error.response?.status === 401 || error.response?.status === 403) {
            console.log(`🚫 [${timestamp}] ROUTE GUARD CLIENTE: Token inválido o sin permisos, redirigiendo a /login`)
            router.push('/login')
            return
          }
        }
      }
      
      setIsVerifying(false)
    }

    verifyAccess()
  }, [pathname, router])

  // Mostrar loading mientras verifica
  if (isVerifying) {
    return <div className="flex items-center justify-center min-h-screen">Verificando acceso...</div>
  }

  return <>{children}</>
}

// Función para verificar permisos por ruta
function checkRoutePermission(pathname: string, userRole: string): boolean {
  const routePermissions: Record<string, string[]> = {
    '/dashboard/admin': ['admin'],
    '/dashboard/coach': ['admin', 'coach'],
    '/dashboard/client': ['admin', 'coach', 'client'],
    '/dashboard/enterprise': ['admin', 'enterprise'],
  }

  for (const [routePath, allowedRoles] of Object.entries(routePermissions)) {
    if (pathname.startsWith(routePath)) {
      return allowedRoles.includes(userRole)
    }
  }
  
  return false
}
