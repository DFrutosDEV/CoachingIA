import { store } from '../redux/store';
import { login, logout, setLoading, setError } from '../redux/slices/authSlice';
import { setSession, clearSession } from '../redux/slices/sessionSlice';
import { axiosClient } from './axios-client';
import { User } from '@/types';

// Tipos para la respuesta de la API
interface Role {
  _id: string;
  name: string;
  code: string;
}

interface Profile {
  _id: string;
  profilePicture: string;
  bio: string;
  indexDashboard: number[];
}

interface Enterprise {
  _id: string;
  name: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  socialMedia: string[];
}

interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
  error?: string;
}

// Función para mapear usuario de la API al formato del store
const mapApiUserToStore = (apiUser: User) => {
  return {
    _id: apiUser._id,
    role: apiUser.role || apiUser.roles[0],
    email: apiUser.email,
    roles: apiUser.roles,
    profile: apiUser.profile,
    enterprise: apiUser.enterprise,
  };
};

// Servicio de autenticación con Redux
export class AuthService {
  private static baseUrl = '/api/loggin';

  // Obtener token del store para requests
  static getToken(): string | null {
    const state = store.getState();
    return state.auth.token;
  }

  // Obtener headers con token para requests
  static getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Función de login que actualiza el estado global con Redux
  static async login(email: string, password: string) {
    const dispatch = store.dispatch;

    try {
      dispatch(setLoading(true));

      // ✅ Usar axiosClient en lugar de fetch
      const response = await axiosClient.post(this.baseUrl, {
        email,
        password,
      });

      const data: LoginResponse = response.data;

      if (data.success && data.user) {
        const user = mapApiUserToStore(data.user);
        const token = data.token || '';

        dispatch(login({ user, token }));
        dispatch(setSession({ isLoggedIn: true, userType: user.role.name }));

        return { success: true, user };
      } else {
        dispatch(setError(data.error || 'Error de autenticación'));
        return { success: false, error: data.error };
      }
    } catch (error: any) {
      // Manejar específicamente errores de login
      let errorMessage = 'Error de conexión';

      if (error.response?.status === 401) {
        errorMessage =
          error.response?.data?.message || 'Credenciales inválidas';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }

  // Función de logout que limpia el estado global
  static async logout() {
    const dispatch = store.dispatch;

    try {
      // Limpiar el estado de autenticación
      dispatch(logout());
      dispatch(clearSession());

      // Limpiar localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('persist:auth');
        localStorage.removeItem('persist:session');
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }

      return { success: true };
    } catch (error) {
      console.error('Error durante logout:', error);
      return { success: false, error: 'Error durante logout' };
    }
  }

  // Verificar si el usuario está autenticado
  static isAuthenticated(): boolean {
    const state = store.getState();
    return state.auth.isAuthenticated ?? false;
  }

  // Obtener usuario actual
  static getCurrentUser(): User | null {
    const state = store.getState();
    return state.auth.user ?? null;
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
  };
};
