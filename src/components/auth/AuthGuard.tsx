'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import { UserRole } from '@/lib/permissions';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
  redirectTo?: string;
  fallback?: ReactNode;
}

export function AuthGuard({
  children,
  requiredRoles,
  redirectTo = '/login',
  fallback,
}: AuthGuardProps) {
  const { userRole, isLoading, hasPermission, isAuthenticated } =
    usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Si no está autenticado, redirigir al login
      if (!isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      // Si se especificaron roles requeridos, verificar permisos
      if (requiredRoles && requiredRoles.length > 0) {
        const hasRequiredRole = requiredRoles.includes(userRole!);
        if (!hasRequiredRole) {
          router.push('/dashboard/unauthorized');
          return;
        }
      }
    }
  }, [isLoading, isAuthenticated, userRole, requiredRoles, router, redirectTo]);

  // Mostrar loading mientras se verifica
  if (isLoading) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Verificando autenticación...</span>
        </div>
      </div>
    );
  }

  // Si no está autenticado, no mostrar nada (se redirigirá)
  if (!isAuthenticated) {
    return null;
  }

  // Si se especificaron roles y no los tiene, no mostrar nada (se redirigirá)
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.includes(userRole!);
    if (!hasRequiredRole) {
      return null;
    }
  }

  // Si todo está bien, mostrar el contenido
  return <>{children}</>;
}

// Componente específico para proteger rutas del dashboard
export function DashboardGuard({ children }: { children: ReactNode }) {
  return (
    <AuthGuard
      requiredRoles={['admin', 'coach', 'client', 'enterprise']}
      redirectTo="/login"
    >
      {children}
    </AuthGuard>
  );
}

// Componente específico para rutas de administración
export function AdminGuard({ children }: { children: ReactNode }) {
  return (
    <AuthGuard requiredRoles={['admin']} redirectTo="/dashboard/unauthorized">
      {children}
    </AuthGuard>
  );
}

// Componente específico para rutas de coach
export function CoachGuard({ children }: { children: ReactNode }) {
  return (
    <AuthGuard
      requiredRoles={['admin', 'coach']}
      redirectTo="/dashboard/unauthorized"
    >
      {children}
    </AuthGuard>
  );
}

// Componente específico para rutas empresariales
export function EnterpriseGuard({ children }: { children: ReactNode }) {
  return (
    <AuthGuard
      requiredRoles={['admin', 'enterprise']}
      redirectTo="/dashboard/unauthorized"
    >
      {children}
    </AuthGuard>
  );
}
