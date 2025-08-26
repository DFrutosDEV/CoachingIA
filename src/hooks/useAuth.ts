import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/lib/redux/store';
import { AuthService } from '@/lib/services/auth-service';
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
      const result = await AuthService.login(email, password);
      
      console.log('✅ Login exitoso desde hook');
      
      // Redirigir al dashboard según el rol
      const userRole = result.user?.role;
      if (userRole) {
        router.push(`/dashboard/${userRole.name.toLowerCase()}`);
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
      AuthService.logout();
      
      console.log('✅ Logout exitoso desde hook');
    } catch (error: any) {
      console.error('❌ Error en logout:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  // ✅ Verificar si el usuario tiene un rol específico
  const hasRole = (role: string): boolean => {
    return user?.role.name === role;
  };

  // ✅ Verificar si el usuario tiene permisos específicos
  const hasPermission = (permission: string): boolean => {
    return isAuthenticated;
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    token,
    error,
    
    login,
    logout: logoutUser,
    hasRole,
    hasPermission,
    
    clearError: () => dispatch(setError(null)),
  };
};
