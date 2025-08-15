'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  hasRoutePermission, 
  getAllowedRoutesForRole, 
  getRoutePermission,
  type UserRole 
} from '@/lib/permissions'

interface UsePermissionsReturn {
  hasPermission: (path: string) => boolean
  getAllowedRoutes: () => string[]
  getRouteConfig: (path: string) => any
  userRole: UserRole | null
  isLoading: boolean
  checkAndRedirect: (path: string) => boolean
  logout: () => void
  isAuthenticated: boolean
}

export function usePermissions(): UsePermissionsReturn {
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const timestamp = new Date().toISOString()
    console.log(`🔧 [${timestamp}] HOOK: Inicializando usePermissions...`)
    
    // Obtener el rol del usuario desde el localStorage o token
    const getUserRole = () => {
      try {
        console.log(`🔍 [${timestamp}] HOOK: Buscando rol en localStorage...`)
        
        // Intentar obtener desde localStorage primero
        const storedRole = localStorage.getItem('userRole')
        if (storedRole && ['admin', 'coach', 'client', 'enterprise'].includes(storedRole)) {
          console.log(`✅ [${timestamp}] HOOK: Rol encontrado en localStorage: '${storedRole}'`)
          return storedRole as UserRole
        }

        console.log(`🔍 [${timestamp}] HOOK: Rol no encontrado en localStorage, buscando en token...`)
        
        // Si no está en localStorage, intentar obtener del token
        const token = localStorage.getItem('token')
        if (token) {
          console.log(`🎫 [${timestamp}] HOOK: Token encontrado, decodificando...`)
          
          const payload = JSON.parse(atob(token.split('.')[1]))
          const role = payload.role || payload.userType
          
          console.log(`📋 [${timestamp}] HOOK: Payload del token:`, { 
            role: payload.role, 
            userType: payload.userType,
            userId: payload.userId || payload.id 
          })
          
          if (['admin', 'coach', 'client', 'enterprise'].includes(role)) {
            console.log(`✅ [${timestamp}] HOOK: Rol válido encontrado en token: '${role}', guardando en localStorage`)
            // Guardar en localStorage para futuras consultas
            localStorage.setItem('userRole', role)
            return role as UserRole
          }
          
          console.log(`❌ [${timestamp}] HOOK: Rol inválido en token: '${role}'`)
        } else {
          console.log(`❌ [${timestamp}] HOOK: No se encontró token en localStorage`)
        }

        return null
      } catch (error) {
        console.error(`❌ [${timestamp}] HOOK: Error al obtener el rol del usuario:`, error)
        // Limpiar datos inválidos
        localStorage.removeItem('token')
        localStorage.removeItem('userRole')
        return null
      }
    }

    const role = getUserRole()
    console.log(`👤 [${timestamp}] HOOK: Rol final obtenido: '${role || 'null'}'`)
    
    setUserRole(role)
    setIsLoading(false)

    // Si no hay usuario loggeado y estamos en una ruta protegida, redirigir a login
    if (!role && typeof window !== 'undefined') {
      const currentPath = window.location.pathname
      console.log(`🔍 [${timestamp}] HOOK: Verificando ruta actual: '${currentPath}'`)
      
      if (currentPath.startsWith('/dashboard')) {
        console.log(`🔄 [${timestamp}] HOOK: Usuario no autenticado en ruta protegida, redirigiendo a /login`)
        router.push('/login')
      } else {
        console.log(`✅ [${timestamp}] HOOK: Usuario no autenticado pero en ruta pública`)
      }
    } else if (role) {
      console.log(`✅ [${timestamp}] HOOK: Usuario autenticado con rol '${role}'`)
    }
  }, [])

  const hasPermission = (path: string): boolean => {
    const timestamp = new Date().toISOString()
    
    if (!userRole) {
      console.log(`❌ [${timestamp}] PERMISSION: Sin usuario autenticado para verificar ${path}`)
      return false
    }
    
    const hasAccess = hasRoutePermission(path, userRole)
    console.log(`🔐 [${timestamp}] PERMISSION: Usuario '${userRole}' ${hasAccess ? 'TIENE' : 'NO TIENE'} permisos para ${path}`)
    
    return hasAccess
  }

  const getAllowedRoutes = (): string[] => {
    const timestamp = new Date().toISOString()
    
    if (!userRole) {
      console.log(`❌ [${timestamp}] ROUTES: Sin usuario autenticado, devolviendo rutas vacías`)
      return []
    }
    
    const routes = getAllowedRoutesForRole(userRole)
    console.log(`📋 [${timestamp}] ROUTES: Rutas permitidas para '${userRole}':`, routes)
    
    return routes
  }

  const getRouteConfig = (path: string) => {
    const timestamp = new Date().toISOString()
    const config = getRoutePermission(path)
    
    console.log(`⚙️ [${timestamp}] CONFIG: Configuración para ${path}:`, config)
    
    return config
  }

  const checkAndRedirect = (path: string): boolean => {
    const timestamp = new Date().toISOString()
    console.log(`🔍 [${timestamp}] CHECK: Verificando acceso y redirección para ${path}`)
    
    if (!userRole) {
      console.log(`🔄 [${timestamp}] CHECK: Sin usuario, redirigiendo a /login`)
      router.push('/login')
      return false
    }

    if (!hasPermission(path)) {
      console.log(`🔄 [${timestamp}] CHECK: Sin permisos, redirigiendo a /dashboard/unauthorized`)
      router.push('/dashboard/unauthorized')
      return false
    }

    console.log(`✅ [${timestamp}] CHECK: Acceso permitido para ${path}`)
    return true
  }

  const logout = () => {
    const timestamp = new Date().toISOString()
    console.log(`🚪 [${timestamp}] LOGOUT: Iniciando proceso de logout...`)
    
    // Limpiar datos del usuario
    console.log(`🧹 [${timestamp}] LOGOUT: Limpiando localStorage...`)
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    
    // Limpiar cookies si existen
    console.log(`🍪 [${timestamp}] LOGOUT: Limpiando cookies...`)
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    
    // Actualizar estado
    console.log(`🔄 [${timestamp}] LOGOUT: Actualizando estado del usuario...`)
    setUserRole(null)
    
    // Redirigir al login
    console.log(`🔄 [${timestamp}] LOGOUT: Redirigiendo a /login...`)
    router.push('/login')
    
    console.log(`✅ [${timestamp}] LOGOUT: Logout completado`)
  }

  return {
    hasPermission,
    getAllowedRoutes,
    getRouteConfig,
    userRole,
    isLoading,
    checkAndRedirect,
    logout,
    isAuthenticated: !!userRole
  }
}

// Hook específico para verificar permisos de una ruta específica
export function useRoutePermission(path: string) {
  const { hasPermission, userRole, isLoading } = usePermissions()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && userRole && !hasPermission(path)) {
      router.push('/dashboard/unauthorized')
    }
  }, [path, hasPermission, userRole, isLoading, router])

  return {
    hasPermission: hasPermission(path),
    userRole,
    isLoading
  }
}

// Hook para proteger componentes basado en permisos
export function usePermissionGuard(requiredRoles: UserRole[]) {
  const { userRole, isLoading } = usePermissions()
  
  const hasAccess = userRole ? requiredRoles.includes(userRole) : false

  return {
    hasAccess,
    userRole,
    isLoading,
    canAccess: (roles: UserRole[]) => userRole ? roles.includes(userRole) : false
  }
}
