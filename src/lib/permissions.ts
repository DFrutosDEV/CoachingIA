// Tipos de roles disponibles en el sistema
export type UserRole = 'admin' | 'coach' | 'client' | 'enterprise'

// Configuración de permisos para rutas
export interface RoutePermission {
  path: string
  allowedRoles: UserRole[]
  requiresAuth: boolean
  description?: string
}

// Configuración de permisos para rutas del dashboard
export const dashboardRoutePermissions: RoutePermission[] = [
  {
    path: '/dashboard/admin',
    allowedRoles: ['admin'],
    requiresAuth: true,
    description: 'Panel de administración - Solo administradores'
  },
  {
    path: '/dashboard/coach',
    allowedRoles: ['admin', 'coach'],
    requiresAuth: true,
    description: 'Panel de coach - Administradores y coaches'
  },
  {
    path: '/dashboard/client',
    allowedRoles: ['admin', 'coach', 'client'],
    requiresAuth: true,
    description: 'Panel de cliente - Todos los roles autenticados'
  },
  {
    path: '/dashboard/enterprise',
    allowedRoles: ['admin', 'enterprise'],
    requiresAuth: true,
    description: 'Panel empresarial - Administradores y empresas'
  }
]

// Configuración de permisos para rutas de API
export const apiRoutePermissions: RoutePermission[] = [
  {
    path: '/api/admin',
    allowedRoles: ['admin'],
    requiresAuth: true,
    description: 'APIs de administración'
  },
  {
    path: '/api/coach',
    allowedRoles: ['admin', 'coach'],
    requiresAuth: true,
    description: 'APIs de coach'
  },
  {
    path: '/api/client',
    allowedRoles: ['admin', 'coach', 'client'],
    requiresAuth: true,
    description: 'APIs de cliente'
  },
  {
    path: '/api/enterprise',
    allowedRoles: ['admin', 'enterprise'],
    requiresAuth: true,
    description: 'APIs empresariales'
  }
]

// Rutas públicas que no requieren autenticación
export const publicRoutes: string[] = [
  '/',
  '/login',
  '/register',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/about',
  '/contact',
  '/terms',
  '/privacy',
  '/api/auth',
  '/api/health',
  '/api/loggin'
]

// Función para verificar si una ruta requiere autenticación
export function requiresAuthentication(pathname: string): boolean {
  const timestamp = new Date().toISOString()
  console.log(`🔍 [${timestamp}] AUTH_CHECK: Verificando si ${pathname} requiere autenticación...`)
  
  // Verificar si es una ruta pública
  const isPublicRoute = publicRoutes.some(route => {
    if (route === pathname) return true
    if (route.endsWith('*')) {
      return pathname.startsWith(route.slice(0, -1))
    }
    return pathname.startsWith(route)
  })

  if (isPublicRoute) {
    console.log(`✅ [${timestamp}] AUTH_CHECK: ${pathname} es una ruta pública`)
    return false
  }

  // Verificar en las configuraciones de permisos
  const allPermissions = [...dashboardRoutePermissions, ...apiRoutePermissions]
  const matchingPermission = allPermissions.find(permission => 
    pathname.startsWith(permission.path)
  )

  const requiresAuth = matchingPermission?.requiresAuth ?? false
  console.log(`🔒 [${timestamp}] AUTH_CHECK: ${pathname} ${requiresAuth ? 'REQUIERE' : 'NO REQUIERE'} autenticación`)
  
  if (matchingPermission) {
    console.log(`📋 [${timestamp}] AUTH_CHECK: Configuración encontrada:`, {
      path: matchingPermission.path,
      allowedRoles: matchingPermission.allowedRoles,
      requiresAuth: matchingPermission.requiresAuth
    })
  }
  
  return requiresAuth
}

// Función para verificar si un usuario tiene permisos para acceder a una ruta
export function hasRoutePermission(pathname: string, userRole: UserRole): boolean {
  const timestamp = new Date().toISOString()
  console.log(`🔐 [${timestamp}] PERMISSION_CHECK: Verificando permisos de '${userRole}' para ${pathname}`)
  
  // Si es una ruta pública, permitir acceso
  if (!requiresAuthentication(pathname)) {
    console.log(`✅ [${timestamp}] PERMISSION_CHECK: Ruta pública, acceso permitido`)
    return true
  }

  // Buscar la configuración de permisos para la ruta
  const allPermissions = [...dashboardRoutePermissions, ...apiRoutePermissions]
  const matchingPermission = allPermissions.find(permission => 
    pathname.startsWith(permission.path)
  )

  if (!matchingPermission) {
    console.log(`❌ [${timestamp}] PERMISSION_CHECK: No se encontró configuración para ${pathname}, denegando acceso`)
    return false
  }

  const hasAccess = matchingPermission.allowedRoles.includes(userRole)
  console.log(`${hasAccess ? '✅' : '❌'} [${timestamp}] PERMISSION_CHECK: Usuario '${userRole}' ${hasAccess ? 'TIENE' : 'NO TIENE'} acceso a ${pathname}`)
  console.log(`📋 [${timestamp}] PERMISSION_CHECK: Roles permitidos: [${matchingPermission.allowedRoles.join(', ')}]`)
  
  return hasAccess
}

// Función para obtener todas las rutas permitidas para un rol
export function getAllowedRoutesForRole(role: UserRole): string[] {
  const allowedRoutes = [...publicRoutes]
  
  const allPermissions = [...dashboardRoutePermissions, ...apiRoutePermissions]
  
  allPermissions.forEach(permission => {
    if (permission.allowedRoles.includes(role)) {
      allowedRoutes.push(permission.path)
    }
  })

  return allowedRoutes
}

// Función para obtener la configuración de permisos de una ruta específica
export function getRoutePermission(pathname: string): RoutePermission | null {
  const allPermissions = [...dashboardRoutePermissions, ...apiRoutePermissions]
  return allPermissions.find(permission => 
    pathname.startsWith(permission.path)
  ) || null
}

// Función helper para agregar nuevas rutas con permisos dinámicamente
export function addRoutePermission(permission: RoutePermission, isApiRoute: boolean = false): void {
  if (isApiRoute) {
    apiRoutePermissions.push(permission)
  } else {
    dashboardRoutePermissions.push(permission)
  }
}

// Función para validar si un rol es válido
export function isValidRole(role: string): role is UserRole {
  return ['admin', 'coach', 'client', 'enterprise'].includes(role)
}
