# Sistema de Permisos - Guía de Uso

Este sistema te permite manejar permisos de rutas de manera centralizada y flexible. A continuación se muestran ejemplos de cómo usar cada parte del sistema.

## Configuración de Permisos

### Archivo Principal: `src/lib/permissions.ts`

Este archivo contiene toda la configuración de permisos para rutas del dashboard y APIs.

#### Agregar Nuevas Rutas

```typescript
// Para agregar una nueva ruta al dashboard
dashboardRoutePermissions.push({
  path: '/dashboard/reports',
  allowedRoles: ['admin', 'coach'],
  requiresAuth: true,
  description: 'Panel de reportes - Solo admin y coaches'
})

// Para agregar una nueva ruta de API
apiRoutePermissions.push({
  path: '/api/reports',
  allowedRoles: ['admin'],
  requiresAuth: true,
  description: 'API de reportes - Solo administradores'
})
```

#### Modificar Permisos Existentes

```typescript
// Encontrar y modificar una ruta existente
const clientRoute = dashboardRoutePermissions.find(r => r.path === '/dashboard/client')
if (clientRoute) {
  clientRoute.allowedRoles = ['admin', 'coach', 'client', 'enterprise'] // Agregar más roles
}
```

## Uso en el Middleware

El middleware se ejecuta automáticamente y verifica:
1. Si la ruta requiere autenticación
2. Si el usuario tiene un token válido
3. Si el rol del usuario tiene permisos para la ruta

No necesitas modificar el middleware, solo actualiza la configuración en `permissions.ts`.

## Uso en Componentes React

### 1. Hook usePermissions

```typescript
'use client'
import { usePermissions } from '@/hooks/usePermissions'

function MyComponent() {
  const { hasPermission, userRole, isLoading } = usePermissions()

  if (isLoading) return <div>Cargando...</div>

  return (
    <div>
      <p>Tu rol: {userRole}</p>
      {hasPermission('/dashboard/admin') && (
        <button>Ir a Admin</button>
      )}
    </div>
  )
}
```

### 2. Hook useRoutePermission

```typescript
'use client'
import { useRoutePermission } from '@/hooks/usePermissions'

function AdminPage() {
  const { hasPermission, isLoading } = useRoutePermission('/dashboard/admin')

  // Se redirige automáticamente si no tiene permisos
  if (isLoading) return <div>Verificando permisos...</div>
  if (!hasPermission) return null // No debería llegar aquí

  return <div>Contenido de administración</div>
}
```

### 3. Componente PermissionGuard

```typescript
import { PermissionGuard } from '@/components/auth/PermissionGuard'

function MyPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Solo admins pueden ver esto */}
      <PermissionGuard requiredRoles={['admin']}>
        <AdminPanel />
      </PermissionGuard>

      {/* Admins y coaches pueden ver esto */}
      <PermissionGuard 
        requiredRoles={['admin', 'coach']}
        fallback={<div>No tienes permisos para ver este panel</div>}
      >
        <CoachPanel />
      </PermissionGuard>
    </div>
  )
}
```

### 4. Componente PermissionWrapper

```typescript
import { PermissionWrapper } from '@/components/auth/PermissionGuard'

function Navigation() {
  return (
    <nav>
      <a href="/dashboard">Dashboard</a>
      
      {/* Solo mostrar si es admin */}
      <PermissionWrapper requiredRoles={['admin']}>
        <a href="/dashboard/admin">Administración</a>
      </PermissionWrapper>

      {/* Mostrar deshabilitado si no tiene permisos */}
      <PermissionWrapper 
        requiredRoles={['enterprise']} 
        hideIfNoAccess={false}
      >
        <a href="/dashboard/enterprise">Empresas</a>
      </PermissionWrapper>
    </nav>
  )
}
```

## Ejemplos de Configuración Común

### Configuración por Roles

```typescript
// Solo administradores
{
  path: '/dashboard/admin',
  allowedRoles: ['admin'],
  requiresAuth: true
}

// Administradores y coaches
{
  path: '/dashboard/coach',
  allowedRoles: ['admin', 'coach'],
  requiresAuth: true
}

// Todos los usuarios autenticados
{
  path: '/dashboard/profile',
  allowedRoles: ['admin', 'coach', 'client', 'enterprise'],
  requiresAuth: true
}

// Ruta pública (no requiere autenticación)
// Se agrega a publicRoutes array en lugar de las configuraciones de permisos
```

### Configuración Jerárquica

```typescript
// Estructura jerárquica de permisos
const hierarchicalPermissions = {
  admin: ['admin', 'coach', 'client', 'enterprise'], // Admin puede acceder a todo
  coach: ['coach', 'client'], // Coach puede acceder a coach y client
  enterprise: ['enterprise'], // Enterprise solo a enterprise
  client: ['client'] // Client solo a client
}
```

## Funciones Utilitarias

### Verificar Permisos Programáticamente

```typescript
import { hasRoutePermission, getAllowedRoutesForRole } from '@/lib/permissions'

// Verificar si un rol puede acceder a una ruta
const canAccess = hasRoutePermission('/dashboard/admin', 'admin') // true

// Obtener todas las rutas permitidas para un rol
const allowedRoutes = getAllowedRoutesForRole('coach')
console.log(allowedRoutes) // ['/dashboard/coach', '/dashboard/client', ...]
```

### Agregar Rutas Dinámicamente

```typescript
import { addRoutePermission } from '@/lib/permissions'

// Agregar nueva ruta de dashboard
addRoutePermission({
  path: '/dashboard/analytics',
  allowedRoles: ['admin', 'coach'],
  requiresAuth: true,
  description: 'Panel de analíticas'
}, false) // false = dashboard route

// Agregar nueva ruta de API
addRoutePermission({
  path: '/api/analytics',
  allowedRoles: ['admin'],
  requiresAuth: true,
  description: 'API de analíticas'
}, true) // true = API route
```

## Manejo de Errores

### Redirecciones Automáticas

- **Sin token**: Redirige a `/login`
- **Sin permisos**: Redirige a `/dashboard/unauthorized`
- **Token inválido**: Redirige a `/login`

### Respuestas de API

```json
// 401 - No autenticado
{
  "success": false,
  "error": "Token de autenticación requerido"
}

// 403 - Sin permisos
{
  "success": false,
  "error": "No tienes permisos para acceder a este recurso"
}
```

## Mejores Prácticas

1. **Principio de Menor Privilegio**: Asigna solo los permisos mínimos necesarios
2. **Configuración Centralizada**: Mantén todos los permisos en `permissions.ts`
3. **Validación en Frontend y Backend**: Usa los hooks en frontend y el middleware protege el backend
4. **Roles Descriptivos**: Usa nombres de roles claros (`admin`, `coach`, `client`, `enterprise`)
5. **Documentación**: Agrega descripciones a cada configuración de ruta

## Troubleshooting

### Problema: "No tienes permisos" pero debería tener acceso
- Verifica que el rol esté en `allowedRoles` de la ruta en `permissions.ts`
- Confirma que el token JWT contiene el rol correcto
- Revisa que la ruta coincida exactamente (incluyendo `/` al final)

### Problema: Redirección infinita
- Asegúrate de que `/login` y `/dashboard/unauthorized` estén en `publicRoutes`
- Verifica que el middleware no esté aplicándose a rutas públicas

### Problema: Hook no funciona en componente
- Confirma que el componente tenga `'use client'` al inicio
- Verifica que el token esté guardado en localStorage
- Asegúrate de que el rol esté en el formato correcto en el token
