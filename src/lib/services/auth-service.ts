import { useAuthStore } from '../stores/auth-store'
import { useUIStore } from '../stores/ui-store'

// Tipos para la respuesta de la API
interface Role {
  _id: string
  name: string
  code: string
  active: boolean
}

interface ApiUser {
  _id: string
  name: string
  lastName: string
  email: string
  roles: Role[]
  age?: number
  creationDate: string
  active: boolean
}

interface LoginResponse {
  success: boolean
  message: string
  user?: ApiUser
  error?: string
}

// Función para mapear roles de la API al formato del store
const mapRolesToStore = (roles: Role[]): ('admin' | 'client' | 'coach' | 'enterprise')[] => {
  return roles.map(role => {
    switch (role.name.toLowerCase()) {
      case 'admin':
        return 'admin'
      case 'client':
      case 'cliente':
        return 'client'
      case 'coach':
        return 'coach'
      case 'enterprise':
      case 'empresa':
        return 'enterprise'
      default:
        return 'client' // Por defecto
    }
  })
}

// Función para mapear usuario de la API al formato del store
const mapApiUserToStore = (apiUser: ApiUser) => {
  return {
    _id: apiUser._id,
    email: apiUser.email,
    name: apiUser.name,
    lastName: apiUser.lastName,
    roles: mapRolesToStore(apiUser.roles),
    age: apiUser.age,
    creationDate: apiUser.creationDate,
    active: apiUser.active
  }
}

// Servicio de autenticación
export class AuthService {
  private static baseUrl = '/api/loggin'

  // Función de login que actualiza el estado global
  static async login(email: string, password: string) {
    const { login, setLoading } = useAuthStore.getState()
    const { addNotification } = useUIStore.getState()

    try {
      setLoading(true)

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          contrasena: password
        }),
      })

      const data: LoginResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error en el login')
      }

      if (!data.success || !data.user) {
        throw new Error(data.message || 'Credenciales inválidas')
      }

      // Mapear usuario de la API al formato del store
      const user = mapApiUserToStore(data.user)
      
      // Generar un token simple (en producción usar JWT)
      const token = btoa(`${user.email}:${Date.now()}`)
      
      // Actualizar el estado global
      login(user, token)
      
      // Mostrar notificación de éxito usando getState()
      addNotification({
        type: 'success',
        message: 'Inicio de sesión exitoso',
        duration: 3000
      })
      
      return { success: true, user }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      addNotification({
        type: 'error',
        message: errorMessage,
        duration: 5000
      })
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Función de logout
  static logout() {
    const { logout } = useAuthStore.getState()
    const { addNotification } = useUIStore.getState()
    
    logout()
    addNotification({
      type: 'info',
      message: 'Sesión cerrada correctamente',
      duration: 2000
    })
  }

  // Función para verificar si el usuario está autenticado
  static isAuthenticated(): boolean {
    const { isAuthenticated } = useAuthStore.getState()
    return isAuthenticated
  }

  // Función para obtener el usuario actual
  static getCurrentUser() {
    const { user } = useAuthStore.getState()
    return user
  }

  // Función para verificar si el usuario tiene un rol específico
  static hasRole(role: 'admin' | 'client' | 'coach' | 'enterprise'): boolean {
    const { user } = useAuthStore.getState()
    return user?.roles?.includes(role) || false
  }

  // Función para obtener todos los roles del usuario
  static getUserRoles(): ('admin' | 'client' | 'coach' | 'enterprise')[] {
    const { user } = useAuthStore.getState()
    return user?.roles || []
  }
}

// Hook personalizado para usar el servicio de autenticación
export const useAuthService = () => {
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const { addNotification } = useUIStore()

  const login = async (email: string, password: string) => {
    return await AuthService.login(email, password)
  }

  const logout = () => {
    AuthService.logout()
  }

  const hasRole = (role: 'admin' | 'client' | 'coach' | 'enterprise') => {
    return AuthService.hasRole(role)
  }

  const getUserRoles = () => {
    return AuthService.getUserRoles()
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasRole,
    getUserRoles,
  }
} 