'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthService } from '../lib/services/auth-service'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRoles?: ('admin' | 'client' | 'coach' | 'enterprise')[]
  redirectTo?: string
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requiredRoles = [], 
  redirectTo = '/login' 
}) => {
  const { isAuthenticated, user, hasRole } = useAuthService()
  const router = useRouter()

  useEffect(() => {
    // Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
      router.push(redirectTo)
      return
    }

    // Si se requieren roles específicos, verificar que el usuario los tenga
    if (requiredRoles.length > 0 && user) {
      const hasRequiredRole = requiredRoles.some(role => hasRole(role))
      
      if (!hasRequiredRole) {
        // Redirigir al dashboard del primer rol del usuario
        const primaryRole = user.role[0] || 'client'
        router.push(`/dashboard/${primaryRole}`)
        return
      }
    }
  }, [isAuthenticated, user, requiredRoles, hasRole, router, redirectTo])

  // Mostrar loading mientras verifica autenticación
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Si se requieren roles y el usuario no los tiene, mostrar loading
  if (requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.some(role => hasRole(role))
    if (!hasRequiredRole) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Redirigiendo...</p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
} 