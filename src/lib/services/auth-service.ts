import { store } from '../redux/store'
import { login, logout, setLoading, setError } from '../redux/slices/authSlice'
import { setSession, clearSession } from '../redux/slices/sessionSlice'

// Tipos para la respuesta de la API
interface Role {
  _id: string
  name: string
  code: string
}

interface Profile {
  _id: string
  profilePicture: string
  bio: string
  indexDashboard: number[]
}

interface Enterprise {
  _id: string
  name: string
  logo: string
  address: string
  phone: string
  email: string
  website: string
  socialMedia: string[]
}

interface ApiUser {
  _id: string
  role: Role
  profile: Profile
  enterprise: Enterprise | null
  name: string
  lastName: string
  email: string
  roles: string[]
  age?: number
}

interface LoginResponse {
  success: boolean
  message: string
  user?: ApiUser
  token?: string
  error?: string
}

// Función para mapear usuario de la API al formato del store
const mapApiUserToStore = (apiUser: ApiUser) => {
  return {
    _id: apiUser._id,
    role: apiUser.role || apiUser.roles[0],
    email: apiUser.email,
    name: apiUser.name,
    lastName: apiUser.lastName,
    roles: apiUser.roles,
    age: apiUser.age,
    profile: apiUser.profile,
    enterprise: apiUser.enterprise,
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
        body: JSON.stringify({ email, password }),
      })

      const data: LoginResponse = await response.json()

      if (data.success && data.user) {
        const user = mapApiUserToStore(data.user)
        dispatch(login({ user, token: data.token || '' }))
        dispatch(setSession({ isLoggedIn: true, userType: user.role.code }))
        return { success: true, user }
      } else {
        dispatch(setError(data.error || 'Error de autenticación'))
        return { success: false, error: data.error }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error de conexión'
      dispatch(setError(errorMessage))
      return { success: false, error: errorMessage }
    } finally {
      dispatch(setLoading(false))
    }
  }

  // Función de logout que limpia el estado global
  static async logout() {
    const dispatch = store.dispatch
    
    try {
      // Limpiar el estado de autenticación
      dispatch(logout())
      dispatch(clearSession())
      
      // Redirigir al login
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      
      return { success: true }
    } catch (error) {
      console.error('Error durante logout:', error)
      return { success: false, error: 'Error durante logout' }
    }
  }

  // Verificar si el usuario está autenticado
  static isAuthenticated(): boolean {
    const state = store.getState()
    return state.auth.isAuthenticated
  }

  // Obtener usuario actual
  static getCurrentUser() {
    const state = store.getState()
    return state.auth.user
  }
}

// Hook personalizado para usar el servicio de autenticación
export const useAuthService = () => {
  return {
    login: AuthService.login.bind(AuthService),
    logout: AuthService.logout.bind(AuthService),
    isAuthenticated: AuthService.isAuthenticated.bind(AuthService),
    getCurrentUser: AuthService.getCurrentUser.bind(AuthService),
    getToken: AuthService.getToken.bind(AuthService),
    getAuthHeaders: AuthService.getAuthHeaders.bind(AuthService),
  }
} 