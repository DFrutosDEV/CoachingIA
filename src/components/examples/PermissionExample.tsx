'use client'

import { PermissionGuard, PermissionWrapper } from '@/components/auth/PermissionGuard'
import { usePermissions } from '@/hooks/usePermissions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Settings, Users, BarChart3, Building2 } from 'lucide-react'

export function PermissionExample() {
  const { userRole, hasPermission, getAllowedRoutes } = usePermissions()

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Estado Actual del Usuario</CardTitle>
          <CardDescription>
            Información sobre tu rol y permisos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <span className="font-medium">Rol actual: </span>
              <Badge variant="outline">{userRole || 'No autenticado'}</Badge>
            </div>
            
            <div>
              <span className="font-medium">Rutas permitidas:</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {getAllowedRoutes().map((route) => (
                  <Badge key={route} variant="outline" className="text-xs">
                    {route}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel de Administración - Solo Admin */}
        <PermissionGuard 
          requiredRoles={['admin']}
          fallback={
            <Card className="opacity-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Panel de Administración
                </CardTitle>
                <CardDescription>
                  Solo disponible para administradores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No tienes permisos para acceder a este panel
                </p>
              </CardContent>
            </Card>
          }
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Panel de Administración
              </CardTitle>
              <CardDescription>
                Gestión completa del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Acceso completo a todas las funcionalidades administrativas
              </p>
              <Button>Ir a Administración</Button>
            </CardContent>
          </Card>
        </PermissionGuard>

        {/* Panel de Coach - Admin y Coach */}
        <PermissionGuard requiredRoles={['admin', 'coach']}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Panel de Coach
              </CardTitle>
              <CardDescription>
                Gestión de clientes y sesiones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Herramientas para coaches y administradores
              </p>
              <Button variant="outline">Ir a Coach</Button>
            </CardContent>
          </Card>
        </PermissionGuard>

        {/* Panel de Reportes - Admin y Coach */}
        <PermissionGuard requiredRoles={['admin', 'coach']}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Reportes y Analíticas
              </CardTitle>
              <CardDescription>
                Estadísticas y métricas del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Visualiza el rendimiento y estadísticas
              </p>
              <Button variant="outline">Ver Reportes</Button>
            </CardContent>
          </Card>
        </PermissionGuard>

        {/* Panel Empresarial - Admin y Enterprise */}
        <PermissionGuard requiredRoles={['admin', 'enterprise']}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Panel Empresarial
              </CardTitle>
              <CardDescription>
                Gestión empresarial y equipos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Herramientas para gestión empresarial
              </p>
              <Button variant="outline">Ir a Empresas</Button>
            </CardContent>
          </Card>
        </PermissionGuard>
      </div>

      {/* Ejemplo de navegación con permisos */}
      <Card>
        <CardHeader>
          <CardTitle>Navegación Basada en Permisos</CardTitle>
          <CardDescription>
            Los enlaces se muestran según tus permisos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {/* Siempre visible */}
            <Button variant="outline" size="sm">
              Dashboard Principal
            </Button>

            {/* Solo para admin */}
            <PermissionWrapper requiredRoles={['admin']}>
              <Button variant="outline" size="sm">
                Administración
              </Button>
            </PermissionWrapper>

            {/* Para admin y coach */}
            <PermissionWrapper requiredRoles={['admin', 'coach']}>
              <Button variant="outline" size="sm">
                Gestión de Coaches
              </Button>
            </PermissionWrapper>

            {/* Para admin y enterprise */}
            <PermissionWrapper requiredRoles={['admin', 'enterprise']}>
              <Button variant="outline" size="sm">
                Panel Empresarial
              </Button>
            </PermissionWrapper>

            {/* Para todos los autenticados */}
            <PermissionWrapper requiredRoles={['admin', 'coach', 'client', 'enterprise']}>
              <Button variant="outline" size="sm">
                Mi Perfil
              </Button>
            </PermissionWrapper>
          </div>
        </CardContent>
      </Card>

      {/* Verificación de permisos específicos */}
      <Card>
        <CardHeader>
          <CardTitle>Verificación de Permisos Específicos</CardTitle>
          <CardDescription>
            Comprueba el acceso a rutas específicas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              '/dashboard/admin',
              '/dashboard/coach', 
              '/dashboard/client',
              '/dashboard/enterprise'
            ].map((route) => (
              <div key={route} className="flex items-center justify-between">
                <span className="text-sm font-mono">{route}</span>
                <Badge 
                  variant={hasPermission(route) ? "outline" : "outline"}
                >
                  {hasPermission(route) ? 'Permitido' : 'Denegado'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
