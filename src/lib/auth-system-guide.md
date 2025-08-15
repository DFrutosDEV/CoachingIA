# Sistema de Autenticación y Permisos - Guía Completa

## 🔐 Funcionalidades Implementadas

### 1. **Redirección Automática a Login**
- **Middleware actualizado**: Detecta usuarios no loggeados y los redirige a `/login`
- **Detección de token**: Busca el token en headers `Authorization` y cookies
- **Limpieza automática**: Elimina tokens inválidos del localStorage

### 2. **Protección de Rutas Mejorada**
- **Middleware inteligente**: Diferencia entre rutas de dashboard (redirige) y APIs (error 401)
- **Verificación de cookies**: Soporte para tokens almacenados en cookies
- **Manejo de errores**: Limpia datos corruptos automáticamente

### 3. **Hooks de Autenticación Mejorados**

#### `usePermissions()`
```typescript
const { 
  userRole, 
  isAuthenticated, 
  hasPermission, 
  logout,
  checkAndRedirect 
} = usePermissions()
```

**Nuevas funcionalidades:**
- `logout()`: Limpia todos los datos y redirige a login
- `isAuthenticated`: Boolean que indica si hay usuario loggeado
- Redirección automática si no hay usuario en rutas protegidas

### 4. **Componentes de Protección**

#### `AuthGuard` - Protección General
```typescript
<AuthGuard requiredRoles={['admin', 'coach']}>
  <ComponenteProtegido />
</AuthGuard>
```

#### Guardias Específicos
- `DashboardGuard`: Para cualquier usuario autenticado
- `AdminGuard`: Solo administradores
- `CoachGuard`: Administradores y coaches
- `EnterpriseGuard`: Administradores y empresas

### 5. **Rutas Públicas Expandidas**
```typescript
// Rutas que NO requieren autenticación
[
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
  '/api/health'
]
```

## 🚀 Flujo de Autenticación

### 1. **Usuario No Loggeado**
```
Usuario accede a /dashboard/admin
↓
Middleware detecta falta de token
↓
Redirige a /login
```

### 2. **Usuario Loggeado Sin Permisos**
```
Usuario con rol 'client' accede a /dashboard/admin
↓
Middleware verifica permisos
↓
Redirige a /dashboard/unauthorized
```

### 3. **Usuario Loggeado Con Permisos**
```
Usuario con rol 'admin' accede a /dashboard/admin
↓
Middleware verifica permisos
↓
Permite acceso
```

## 📝 Ejemplos de Uso

### Proteger una Página Completa
```typescript
// pages/dashboard/admin/page.tsx
import { AdminGuard } from '@/components/auth/AuthGuard'

export default function AdminPage() {
  return (
    <AdminGuard>
      <div>Contenido solo para administradores</div>
    </AdminGuard>
  )
}
```

### Proteger Componentes Específicos
```typescript
import { PermissionWrapper } from '@/components/auth/PermissionGuard'

function Navigation() {
  return (
    <nav>
      <a href="/dashboard">Dashboard</a>
      
      <PermissionWrapper requiredRoles={['admin']}>
        <a href="/dashboard/admin">Administración</a>
      </PermissionWrapper>
    </nav>
  )
}
```

### Usar el Hook de Permisos
```typescript
import { usePermissions } from '@/hooks/usePermissions'

function MyComponent() {
  const { userRole, isAuthenticated, logout, hasPermission } = usePermissions()

  if (!isAuthenticated) {
    return <div>Cargando...</div> // Se redirigirá automáticamente
  }

  return (
    <div>
      <p>Rol: {userRole}</p>
      
      {hasPermission('/dashboard/admin') && (
        <button>Ir a Admin</button>
      )}
      
      <button onClick={logout}>
        Cerrar Sesión
      </button>
    </div>
  )
}
```

### Verificación Manual de Autenticación
```typescript
import { usePermissions } from '@/hooks/usePermissions'

function ProtectedComponent() {
  const { checkAndRedirect } = usePermissions()

  const handleAdminAction = () => {
    if (checkAndRedirect('/dashboard/admin')) {
      // Usuario tiene permisos, ejecutar acción
      console.log('Ejecutando acción de admin')
    }
    // Si no tiene permisos, se redirige automáticamente
  }

  return (
    <button onClick={handleAdminAction}>
      Acción de Admin
    </button>
  )
}
```

## 🔧 Configuración de Tokens

### En el Frontend (localStorage)
```javascript
// Guardar token después del login
localStorage.setItem('token', 'jwt-token-here')
localStorage.setItem('userRole', 'admin')
```

### En Cookies (para SSR)
```javascript
// Guardar en cookie para que el middleware pueda leerlo
document.cookie = `token=${jwtToken}; path=/; secure; samesite=strict`
```

### Formato del Token JWT
```json
{
  "role": "admin",        // o "userType": "admin"
  "userId": "123",
  "exp": 1234567890
}
```

## 🛡️ Seguridad

### Middleware
- ✅ Verifica tokens en headers y cookies
- ✅ Valida formato JWT
- ✅ Verifica roles y permisos
- ✅ Redirige según el tipo de ruta (dashboard vs API)

### Frontend
- ✅ Limpia datos inválidos automáticamente
- ✅ Redirige usuarios no autenticados
- ✅ Oculta contenido sin permisos
- ✅ Función de logout segura

### Rutas Protegidas
- ✅ `/dashboard/*` requiere autenticación
- ✅ `/api/*` (excepto públicas) requiere token
- ✅ Verificación de permisos por rol
- ✅ Páginas de error personalizadas

## 🎯 Próximos Pasos Recomendados

1. **Implementar refresh tokens** para sesiones más seguras
2. **Agregar rate limiting** en el middleware
3. **Implementar 2FA** para roles administrativos
4. **Logs de auditoría** para acciones sensibles
5. **Configurar HTTPS** en producción

## 📞 Soporte

Si necesitas agregar nuevas rutas o modificar permisos:

1. **Nuevas rutas**: Edita `src/lib/permissions.ts`
2. **Nuevos roles**: Actualiza el tipo `UserRole`
3. **Rutas públicas**: Agrega a `publicRoutes`
4. **Problemas**: Revisa la consola del navegador y logs del servidor
