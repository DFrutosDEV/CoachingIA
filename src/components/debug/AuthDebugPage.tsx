'use client'

import { AuthLogger } from './AuthLogger'
import { AuthStatus } from './AuthStatus'
import { usePermissions } from '@/hooks/usePermissions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Bug, 
  TestTube, 
  Shield, 
  Key, 
  User,
  Settings,
  Users,
  BarChart3,
  Building2
} from 'lucide-react'

export function AuthDebugPage() {
  const { hasPermission, userRole, checkAndRedirect } = usePermissions()

  const testRoutes = [
    { path: '/dashboard/admin', name: 'Admin Panel', icon: Settings },
    { path: '/dashboard/coach', name: 'Coach Panel', icon: Users },
    { path: '/dashboard/client', name: 'Client Panel', icon: User },
    { path: '/dashboard/enterprise', name: 'Enterprise Panel', icon: Building2 },
    { path: '/dashboard/reports', name: 'Reports', icon: BarChart3 },
    { path: '/api/admin/users', name: 'Admin API', icon: Key },
    { path: '/api/coach/clients', name: 'Coach API', icon: Key },
  ]

  const simulateLogin = (role: 'admin' | 'coach' | 'client' | 'enterprise') => {
    console.log(`🧪 [${new Date().toISOString()}] TEST: Simulando login como '${role}'`)
    
    // Crear un JWT simulado
    const mockPayload = {
      userId: `test-${role}-123`,
      role: role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
    }
    
    const mockToken = `header.${btoa(JSON.stringify(mockPayload))}.signature`
    
    localStorage.setItem('token', mockToken)
    localStorage.setItem('userRole', role)
    
    // Recargar para que los hooks detecten el cambio
    window.location.reload()
  }

  const testPermission = (path: string) => {
    console.log(`🧪 [${new Date().toISOString()}] TEST: Probando permisos para ${path}`)
    const result = hasPermission(path)
    console.log(`🧪 [${new Date().toISOString()}] TEST: Resultado: ${result ? 'PERMITIDO' : 'DENEGADO'}`)
    return result
  }

  const testRedirect = (path: string) => {
    console.log(`🧪 [${new Date().toISOString()}] TEST: Probando redirección para ${path}`)
    checkAndRedirect(path)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bug className="h-6 w-6" />
              <span>Panel de Debug - Sistema de Autenticación</span>
            </CardTitle>
            <CardDescription>
              Herramientas para debuggear y probar el sistema de autenticación y permisos
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Estado actual */}
          <div className="space-y-6">
            <AuthStatus />

            {/* Simulador de login */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TestTube className="h-5 w-5" />
                  <span>Simulador de Login</span>
                </CardTitle>
                <CardDescription>
                  Simula el login con diferentes roles para probar permisos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => simulateLogin('admin')}
                    variant="outline"
                    size="sm"
                  >
                    Login como Admin
                  </Button>
                  <Button
                    onClick={() => simulateLogin('coach')}
                    variant="outline"
                    size="sm"
                  >
                    Login como Coach
                  </Button>
                  <Button
                    onClick={() => simulateLogin('client')}
                    variant="outline"
                    size="sm"
                  >
                    Login como Client
                  </Button>
                  <Button
                    onClick={() => simulateLogin('enterprise')}
                    variant="outline"
                    size="sm"
                  >
                    Login como Enterprise
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pruebas de permisos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Pruebas de Permisos</span>
              </CardTitle>
              <CardDescription>
                Prueba los permisos para diferentes rutas con tu rol actual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testRoutes.map((route) => {
                  const hasAccess = hasPermission(route.path)
                  const Icon = route.icon
                  
                  return (
                    <div
                      key={route.path}
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-4 w-4" />
                        <div>
                          <p className="text-sm font-medium">{route.name}</p>
                          <p className="text-xs text-gray-500 font-mono">{route.path}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant={hasAccess ? "default" : "destructive"}>
                          {hasAccess ? 'Permitido' : 'Denegado'}
                        </Badge>
                        
                        <div className="flex space-x-1">
                          <Button
                            onClick={() => testPermission(route.path)}
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs"
                          >
                            Test
                          </Button>
                          
                          {route.path.startsWith('/dashboard') && (
                            <Button
                              onClick={() => testRedirect(route.path)}
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-xs"
                            >
                              Ir
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instrucciones */}
        <Card>
          <CardHeader>
            <CardTitle>Cómo usar este panel de debug</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">1. Ver logs en tiempo real:</h4>
              <p className="text-sm text-gray-600">
                El componente AuthLogger (abajo a la derecha) captura automáticamente todos los logs 
                del sistema de autenticación. Navega por la aplicación para ver los logs.
              </p>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-2">2. Simular diferentes usuarios:</h4>
              <p className="text-sm text-gray-600">
                Usa los botones de "Login como..." para simular diferentes roles y ver cómo cambian 
                los permisos. Esto creará un token JWT simulado.
              </p>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-2">3. Probar permisos:</h4>
              <p className="text-sm text-gray-600">
                Usa los botones "Test" para verificar permisos específicos, o "Ir" para probar 
                la redirección automática del middleware.
              </p>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-2">4. Monitorear el estado:</h4>
              <p className="text-sm text-gray-600">
                El panel de "Estado de Autenticación" muestra información en tiempo real sobre 
                tu sesión, token, y permisos.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logger flotante */}
      <AuthLogger />
    </div>
  )
}
