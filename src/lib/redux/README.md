# Sistema de Estados Globales con Redux Toolkit

Este proyecto utiliza **Redux Toolkit** para el manejo de estados globales, reemplazando Zustand por motivos de:

- ✅ **Mejor debugging** con Redux DevTools
- ✅ **Más escalable** para aplicaciones grandes
- ✅ **Mejor tipado** con TypeScript
- ✅ **Patrón más establecido** en la industria
- ✅ **Persistencia selectiva** para seguridad

## 🏗️ Arquitectura

### 📁 Estructura
```
src/lib/redux/
├── store.ts              # Store principal con persistencia
├── hooks.ts              # Hooks tipados
├── slices/
│   ├── authSlice.ts     # Estado de autenticación (NO persistido)
│   ├── sessionSlice.ts  # Sesión no sensible (PERSISTIDO)
│   └── uiSlice.ts       # Estado de UI (NO persistido)
└── index.ts             # Exportaciones centralizadas
```

### 🔐 Seguridad
- **authSlice**: Datos sensibles solo en memoria (tokens, usuario completo)
- **sessionSlice**: Solo datos no sensibles persisten (tema, idioma, estado básico)
- **uiSlice**: Estado temporal de interfaz

## 🚀 Uso Básico

### 1. En Componentes
```tsx
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks'
import { login, logout } from '@/lib/redux'

function MyComponent() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(state => state.auth.user)
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated)
  
  const handleLogin = async () => {
    dispatch(login({ user: userData, token: tokenData }))
  }
  
  return (
    <div>
      {isAuthenticated ? `Hola ${user?.name}` : 'No autenticado'}
    </div>
  )
}
```

### 2. Múltiples Estados
```tsx
function Dashboard() {
  const dispatch = useAppDispatch()
  
  // Estados de diferentes slices
  const { user, isLoading } = useAppSelector(state => ({
    user: state.auth.user,
    isLoading: state.auth.isLoading
  }))
  
  const { theme, sidebarOpen } = useAppSelector(state => ({
    theme: state.session.theme,
    sidebarOpen: state.ui.sidebarOpen
  }))
  
  // Acciones
  const handleLogout = () => dispatch(logout())
  const toggleSidebar = () => dispatch(toggleSidebar())
  
  return (
    <div className={`theme-${theme} ${sidebarOpen ? 'sidebar-open' : ''}`}>
      {/* UI */}
    </div>
  )
}
```

### 3. Con Servicios
```tsx
import { AuthServiceRedux } from '@/lib/redux'

function LoginForm() {
  const handleSubmit = async (email: string, password: string) => {
    const result = await AuthServiceRedux.login(email, password)
    
    if (result.success) {
      // El estado se actualiza automáticamente
      router.push('/dashboard')
    }
  }
  
  return <form onSubmit={handleSubmit}>{/* formulario */}</form>
}
```

## 🔄 Migración desde Zustand

### Antes (Zustand)
```tsx
const { user, login, logout } = useAuthStore()
```

### Después (Redux)
```tsx
const dispatch = useAppDispatch()
const user = useAppSelector(state => state.auth.user)

// Para acciones
dispatch(login({ user, token }))
dispatch(logout())
```

## 🛠️ Acciones Disponibles

### Auth Slice
- `login({ user, token })` - Iniciar sesión
- `logout()` - Cerrar sesión
- `setAuthLoading(boolean)` - Estado de carga
- `updateUser(userData)` - Actualizar usuario
- `setClients(clients[])` - Establecer clientes
- `addClient(client)` - Agregar cliente
- `updateClient({ id, updates })` - Actualizar cliente
- `removeClient(id)` - Eliminar cliente
- (Similar para coaches y enterprises)

### Session Slice
- `setSession({ isLoggedIn, userType })` - Establecer sesión
- `clearSession()` - Limpiar sesión
- `setSessionTheme(theme)` - Cambiar tema
- `setLanguage(lang)` - Cambiar idioma

### UI Slice
- `toggleSidebar()` - Alternar sidebar
- `setSidebarOpen(boolean)` - Establecer sidebar
- `openModal(modalId)` - Abrir modal
- `closeModal()` - Cerrar modal
- `addNotification(notification)` - Agregar notificación
- `removeNotification(id)` - Remover notificación

## 🔧 Redux DevTools

Para debug en el navegador:
1. Instala Redux DevTools Extension
2. Los estados se ven en la pestaña Redux
3. Puedes ver el historial de acciones
4. Viajar en el tiempo entre estados

## 📱 Persistencia

Solo **sessionSlice** persiste datos:
- `theme` - Tema del usuario
- `language` - Idioma preferido  
- `isLoggedIn` - Estado de login (booleano)
- `userType` - Tipo de usuario (sin datos sensibles)
- `lastLoginDate` - Última fecha de login

**Datos NO persistidos** (por seguridad):
- Tokens de autenticación
- Información completa del usuario
- Listas de clientes/coaches
- Estados temporales de UI

## 🎯 Mejores Prácticas

1. **Usa hooks tipados**: `useAppSelector` y `useAppDispatch`
2. **Agrupa selectors**: Para múltiples valores del mismo slice
3. **Usa servicios**: Para lógica compleja de autenticación
4. **No mutes estado**: Redux Toolkit usa Immer internamente
5. **Usa DevTools**: Para debugging y desarrollo

## 🔄 Recuperación de Sesión

El hook `useSessionRecoveryRedux` maneja automáticamente:
- Verificación de sesión al recargar
- Recuperación desde servidor si hay sesión guardada
- Limpieza de estado si la sesión es inválida 