'use client'

import { ReactNode } from 'react'
import { usePermissionGuard } from '@/hooks/usePermissions'
import { UserRole } from '@/lib/permissions'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface PermissionGuardProps {
  children: ReactNode
  requiredRoles: UserRole[]
  fallback?: ReactNode
  showLoading?: boolean
  loadingComponent?: ReactNode
}

export function PermissionGuard({ 
  children, 
  requiredRoles, 
  fallback,
  showLoading = true,
  loadingComponent
}: PermissionGuardProps) {
  const { hasAccess, isLoading } = usePermissionGuard(requiredRoles)

  // Mostrar loading mientras se verifica el permiso
  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>
    }
    
    if (showLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Verificando permisos...</span>
        </div>
      )
    }
    
    return null
  }

  // Si no tiene acceso, mostrar fallback o mensaje por defecto
  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Sin Permisos
          </CardTitle>
          <CardDescription className="text-gray-600">
            No tienes permisos para ver este contenido
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500 text-center">
            Tu rol actual no tiene los permisos necesarios para ver este contenido. 
            Si crees que esto es un error, contacta al administrador del sistema.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Si tiene acceso, mostrar el contenido
  return <>{children}</>
}

// Componente más simple para ocultar/mostrar elementos basado en permisos
interface PermissionWrapperProps {
  children: ReactNode
  requiredRoles: UserRole[]
  hideIfNoAccess?: boolean
}

export function PermissionWrapper({ 
  children, 
  requiredRoles, 
  hideIfNoAccess = true 
}: PermissionWrapperProps) {
  const { hasAccess, isLoading } = usePermissionGuard(requiredRoles)

  if (isLoading || (!hasAccess && hideIfNoAccess)) {
    return null
  }

  if (!hasAccess && !hideIfNoAccess) {
    return (
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
    )
  }

  return <>{children}</>
}

// Hook para usar dentro de componentes
export function usePermissionCheck(requiredRoles: UserRole[]) {
  return usePermissionGuard(requiredRoles)
}
