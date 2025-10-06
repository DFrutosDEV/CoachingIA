'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/redux/hooks';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export function AuthGuard({ children, requiredRoles }: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAppSelector(
    state => state.auth
  );
  const router = useRouter();

  useEffect(() => {
    // Si está cargando, esperar
    if (isLoading) return;

    // Si no está autenticado, redirigir al login
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    // Si se requieren roles específicos, verificar
    if (requiredRoles && requiredRoles.length > 0) {
      const userRoles = user.roles || [];
      const hasRequiredRole = requiredRoles.some(role =>
        userRoles.includes(role)
      );

      if (!hasRequiredRole) {
        // Redirigir al dashboard del rol principal del usuario
        const primaryRole = userRoles[0] || 'client';
        router.push(`/dashboard/${primaryRole}`);
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, requiredRoles, router]);

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">
            Verificando autenticación...
          </p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, no mostrar nada (se redirigirá)
  if (!isAuthenticated || !user) {
    return null;
  }

  // Si se requieren roles específicos y no los tiene, no mostrar nada
  if (requiredRoles && requiredRoles.length > 0) {
    const userRoles = user.roles || [];
    const hasRequiredRole = requiredRoles.some(role =>
      userRoles.includes(role)
    );

    if (!hasRequiredRole) {
      return null;
    }
  }

  // Si todo está bien, mostrar el contenido
  return <>{children}</>;
}
