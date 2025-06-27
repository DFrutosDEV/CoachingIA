import { store } from '../redux/store'
import { login, logout, setLoading, setError } from '../redux/slices/authSlice'
import { setSession, clearSession } from '../redux/slices/sessionSlice'
import { addNotification } from '../redux/slices/uiSlice'
import { useAppSelector } from '../redux/hooks'

// Tipos para la respuesta de la API
interface Role {
  _id: string
  name: string
  code: string
  active: boolean
}

interface ApiUser {
  _id: string
  roleId: string
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
    roleId: apiUser.roleId,
    email: apiUser.email,
    name: apiUser.name,
    lastName: apiUser.lastName,
    roles: mapRolesToStore(apiUser.roles),
    age: apiUser.age,
    creationDate: apiUser.creationDate,
    active: apiUser.active
  }
}

// Servicio de autenticación con Redux
export class AuthService {
  private static baseUrl = '/api/loggin'

  // Obtener token del store para requests
  static getToken(): string | null {
    const state = store.getState()
    return state.auth.token
  }

  // Obtener headers con token para requests
  static getAuthHeaders(): Record<string, string> {
    const token = this.getToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    return headers
  }

  // Función de login que actualiza el estado global con Redux
  static async login(email: string, password: string) {
    const dispatch = store.dispatch

    try {
      dispatch(setLoading(true))

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Para incluir cookies httpOnly
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
      
      // Actualizar el estado global con Redux
      dispatch(login({ user, token }))
      
      // Actualizar sesión (solo información no sensible)
      const primaryRole = user.roles[0] || 'client'
      dispatch(setSession({ isLoggedIn: true, userType: primaryRole }))
      
      // Mostrar notificación de éxito
      dispatch(addNotification({
        type: 'success',
        message: 'Inicio de sesión exitoso',
        duration: 3000
      }))
      
      return { success: true, user }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      
      dispatch(setError(errorMessage))
      dispatch(addNotification({
        type: 'error',
        message: errorMessage,
        duration: 5000
      }))
      
      return { success: false, error: errorMessage }
    } finally {
      dispatch(setLoading(false))
    }
  }

  // Función de logout con Redux
  static logout() {
    const dispatch = store.dispatch
    
    dispatch(logout())
    dispatch(clearSession())
    dispatch(addNotification({
      type: 'info',
      message: 'Sesión cerrada correctamente',
      duration: 2000
    }))
  }

  // Función para verificar si el usuario está autenticado
  static isAuthenticated(): boolean {
    const state = store.getState()
    return state.auth.isAuthenticated
  }

  // Función para obtener el usuario actual
  static getCurrentUser() {
    const state = store.getState()
    return state.auth.user
  }

  // Función para verificar si el usuario tiene un rol específico
  static hasRole(role: 'admin' | 'client' | 'coach' | 'enterprise'): boolean {
    const state = store.getState()
    return state.auth.user?.roles?.includes(role) || false
  }

  // Función para obtener todos los roles del usuario
  static getUserRoles(): ('admin' | 'client' | 'coach' | 'enterprise')[] {
    const state = store.getState()
    return state.auth.user?.roles || []
  }
}

// Hook personalizado para usar el servicio de autenticación con Redux
export const useAuthService = () => {
  const { user, isAuthenticated, isLoading } = useAppSelector(state => state.auth)

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