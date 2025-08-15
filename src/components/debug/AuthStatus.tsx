'use client'

import { usePermissions } from '@/hooks/usePermissions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { User, Shield, Key, LogOut, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'

export function AuthStatus() {
  const { userRole, isAuthenticated, logout, getAllowedRoutes } = usePermissions()
  const [tokenInfo, setTokenInfo] = useState<any>(null)
  const [currentPath, setCurrentPath] = useState('')

  useEffect(() => {
    // Obtener información del token
    try {
      const token = localStorage.getItem('token')
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setTokenInfo({
          userId: payload.userId || payload.id,
          role: payload.role || payload.userType,
          exp: payload.exp ? new Date(payload.exp * 1000) : null,
          iat: payload.iat ? new Date(payload.iat * 1000) : null
        })
      }
    } catch (error) {
      setTokenInfo(null)
    }

    // Obtener ruta actual
    setCurrentPath(window.location.pathname)
  }, [userRole])

  const refreshAuth = () => {
    window.location.reload()
  }

  const isTokenExpired = tokenInfo?.exp ? new Date() > tokenInfo.exp : false

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>Estado de Autenticación</span>
        </CardTitle>
        <CardDescription>
          Información actual del usuario y permisos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estado de autenticación */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Estado:</span>
          <Badge variant={isAuthenticated ? "default" : "destructive"}>
            {isAuthenticated ? 'Autenticado' : 'No autenticado'}
          </Badge>
        </div>

        {/* Información del usuario */}
        {isAuthenticated && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Rol:</span>
              <Badge variant="outline" className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span>{userRole}</span>
              </Badge>
            </div>

            {tokenInfo && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Usuario ID:</span>
                  <span className="text-sm font-mono">{tokenInfo.userId || 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Token expira:</span>
                  <Badge variant={isTokenExpired ? "destructive" : "secondary"}>
                    {tokenInfo.exp ? tokenInfo.exp.toLocaleString() : 'Sin expiración'}
                  </Badge>
                </div>

                {isTokenExpired && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    ⚠️ El token ha expirado. Necesitas volver a autenticarte.
                  </div>
                )}
              </>
            )}
          </>
        )}

        <Separator />

        {/* Ruta actual */}
        <div>
          <span className="text-sm font-medium">Ruta actual:</span>
          <p className="text-sm font-mono bg-gray-100 p-2 rounded mt-1">
            {currentPath}
          </p>
        </div>

        {/* Rutas permitidas */}
        {isAuthenticated && (
          <div>
            <span className="text-sm font-medium">Rutas permitidas:</span>
            <div className="mt-2 max-h-32 overflow-y-auto">
              <div className="space-y-1">
                {getAllowedRoutes().slice(0, 10).map((route, index) => (
                  <Badge key={index} variant="outline" className="text-xs mr-1 mb-1">
                    {route}
                  </Badge>
                ))}
                {getAllowedRoutes().length > 10 && (
                  <Badge variant="secondary" className="text-xs">
                    +{getAllowedRoutes().length - 10} más...
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Datos del localStorage */}
        <div>
          <span className="text-sm font-medium">LocalStorage:</span>
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span>Token:</span>
              <Badge variant={localStorage.getItem('token') ? "default" : "secondary"}>
                {localStorage.getItem('token') ? 'Presente' : 'Ausente'}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>Rol guardado:</span>
              <Badge variant={localStorage.getItem('userRole') ? "default" : "secondary"}>
                {localStorage.getItem('userRole') || 'Ausente'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex space-x-2">
          <Button
            onClick={refreshAuth}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refrescar
          </Button>
          
          {isAuthenticated && (
            <Button
              onClick={logout}
              variant="destructive"
              size="sm"
              className="flex-1"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          )}
        </div>

        {/* Información de debug */}
        <details className="text-xs">
          <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
            Debug Info
          </summary>
          <div className="mt-2 p-2 bg-gray-50 rounded">
            <pre className="text-xs overflow-x-auto">
              {JSON.stringify({
                isAuthenticated,
                userRole,
                currentPath,
                tokenPresent: !!localStorage.getItem('token'),
                roleStored: localStorage.getItem('userRole'),
                tokenInfo: tokenInfo ? {
                  ...tokenInfo,
                  exp: tokenInfo.exp?.toISOString(),
                  iat: tokenInfo.iat?.toISOString()
                } : null
              }, null, 2)}
            </pre>
          </div>
        </details>
      </CardContent>
    </Card>
  )
}
