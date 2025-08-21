import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/lib/redux/store';
import { AuthClient } from '@/lib/auth-client';
import { logout, setLoading, setError } from '@/lib/redux/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  
  // Obtener estado de autenticación del store
  const { user, isAuthenticated, isLoading, token, error } = useSelector(
    (state: RootState) => state.auth
  );

  // ✅ Función de login con localStorage automático
  const login = async (email: string, password: string) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      // Usar AuthClient que maneja localStorage automáticamente
      const result = await AuthClient.loginUser(email, password);
      
      console.log('✅ Login exitoso desde hook');
      
      // Redirigir al dashboard según el rol
      const userRole = result.user?.role?.name?.toLowerCase();
      if (userRole) {
        router.push(`/dashboard/${userRole}`);
      } else {
        router.push('/dashboard');
      }
      
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Error en el login';
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  // ✅ Función de logout con limpieza automática
  const logoutUser = () => {
    try {
      dispatch(setLoading(true));
      
      // Usar AuthClient que maneja localStorage automáticamente
      AuthClient.logoutUser();
      
      console.log('✅ Logout exitoso desde hook');
    } catch (error: any) {
      console.error('❌ Error en logout:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  // ✅ Restaurar sesión al cargar la app
  const restoreSession = () => {
    try {
      AuthClient.restoreSession();
    } catch (error) {
      console.error('❌ Error restaurando sesión:', error);
    }
  };

  // ✅ Verificar si el usuario tiene un rol específico
  const hasRole = (role: string): boolean => {
    return user?.roles?.includes(role.toLowerCase()) ?? false;
  };

  // ✅ Verificar si el usuario tiene permisos específicos
  const hasPermission = (permission: string): boolean => {
    // Implementar lógica de permisos según tu sistema
    return isAuthenticated;
  };

  return {
    // Estado
    user,
    isAuthenticated,
    isLoading,
    token,
    error,
    
    // Funciones
    login,
    logout: logoutUser,
    restoreSession,
    hasRole,
    hasPermission,
    
    // Utilidades
    clearError: () => dispatch(setError(null)),
  };
};
