# Estados Globales con Zustand

Este proyecto utiliza Zustand para manejar estados globales de manera eficiente y simple, integrado con la API de autenticación.

## Stores Disponibles

### 1. Auth Store (`auth-store.ts`)
Maneja la autenticación y sesión del usuario.

**Estado:**
- `user`: Usuario actual logueado
- `isAuthenticated`: Si el usuario está autenticado
- `isLoading`: Estado de carga
- `token`: Token de autenticación

**Tipos:**
```typescript
interface User {
  _id: string
  email: string
  name: string
  role: ('admin' | 'client' | 'coach' | 'enterprise')[] // Array de roles
  profile?: {
    avatar?: string
    phone?: string
    address?: string
  }
}
```

**Acciones:**
- `login(user, token)`: Iniciar sesión
- `logout()`: Cerrar sesión
- `setLoading(loading)`: Cambiar estado de carga
- `updateUser(userData)`: Actualizar datos del usuario

## Servicio de Autenticación

### AuthService (`auth-service.ts`)
Servicio que integra la API de login con el estado global.

**Funciones principales:**
- `login(email, password)`: Login con la API y actualización del store
- `logout()`: Cerrar sesión y limpiar estado
- `hasRole(role)`: Verificar si el usuario tiene un rol específico
- `getUserRoles()`: Obtener todos los roles del usuario

**Uso:**
```typescript
import { useAuthService } from '../lib/services/auth-service'

const { login, logout, user, isAuthenticated, hasRole } = useAuthService()

// Login
const result = await login('usuario@ejemplo.com', 'password123')

// Verificar rol
const isAdmin = hasRole('admin')
```

## Componentes de Protección

### AuthGuard
Componente para proteger rutas basado en autenticación y roles.

```typescript
import { AuthGuard } from '../components/auth-guard'

// Proteger ruta solo para admins
<AuthGuard requiredRoles={['admin']}>
  <AdminDashboard />
</AuthGuard>

// Proteger ruta para múltiples roles
<AuthGuard requiredRoles={['admin', 'coach']}>
  <AnalyticsPage />
</AuthGuard>
```

## Integración con la API

El sistema está integrado con la API `/api/loggin` y mapea automáticamente:

- **Roles de la API** → **Roles del store**
- `admin` → `admin`
- `client/cliente` → `client`
- `coach` → `coach`
- `enterprise/empresa` → `enterprise`

### Ejemplo de uso completo:

```typescript
// En un componente de login
const { login, isLoading } = useAuthService()

const handleLogin = async (email: string, password: string) => {
  const result = await login(email, password)
  
  if (result.success) {
    // El usuario ya está en el estado global
    // Redirigir basado en roles
    const primaryRole = result.user.role[0]
    router.push(`/dashboard/${primaryRole}`)
  }
}

// En un componente protegido
const { user, hasRole } = useAuthService()

if (hasRole('admin')) {
  return <AdminPanel />
} else if (hasRole('coach')) {
  return <CoachDashboard />
}
```

## Flujo de Autenticación

1. **Usuario ingresa credenciales** → `login(email, password)`
2. **API valida credenciales** → `/api/loggin`
3. **Servicio mapea respuesta** → Convierte roles de API a formato del store
4. **Store se actualiza** → `useAuthStore.login(user, token)`
5. **Notificación de éxito** → Toast automático
6. **Redirección** → Basada en roles del usuario

## Persistencia

- **Auth Store**: Persiste en localStorage automáticamente
- **Sesión**: Se mantiene al recargar la página
- **Token**: Se genera automáticamente (en producción usar JWT)

## Mejores Prácticas

1. **Usar AuthService**: En lugar de llamar directamente a la API
2. **Proteger rutas**: Usar AuthGuard para páginas sensibles
3. **Verificar roles**: Usar `hasRole()` para permisos específicos
4. **Manejar errores**: Los errores se muestran automáticamente
5. **Persistencia**: El estado se mantiene entre sesiones

## Estructura de Archivos

```
src/lib/
├── stores/
│   ├── auth-store.ts      # Autenticación
│   ├── ui-store.ts        # Interfaz de usuario
│   ├── data-store.ts      # Datos de la aplicación
│   └── index.ts           # Exportaciones centralizadas
├── hooks/
│   └── use-stores.ts      # Hooks personalizados
└── components/
    └── notifications-provider.tsx  # Provider de notificaciones
``` 