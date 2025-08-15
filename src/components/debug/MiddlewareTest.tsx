'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Bug, CheckCircle, XCircle } from 'lucide-react'
import { Alert, DialogContent } from '@mui/material'

export function MiddlewareTest() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const testRoutes = [
    { path: '/dashboard/client', shouldWork: true, description: 'Dashboard Client' },
    { path: '/dashboard/admin', shouldWork: true, description: 'Dashboard Admin' },
    { path: '/api/client/test', shouldWork: true, description: 'API Client' },
    { path: '/login', shouldWork: true, description: 'Login (público)' },
  ]

  const testMiddleware = async () => {
    setIsLoading(true)
    setTestResults([])
    
    console.log('🧪 [TEST] Iniciando pruebas de middleware...')
    
    const results = []
    
    for (const route of testRoutes) {
      console.log(`🧪 [TEST] Probando ruta: ${route.path}`)
      
      try {
        // Hacer una petición HEAD para probar el middleware sin cargar la página completa
        const response = await fetch(route.path, {
          method: 'HEAD',
          headers: {
            'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
          }
        })
        
        const result = {
          path: route.path,
          description: route.description,
          status: response.status,
          success: response.ok,
          headers: Object.fromEntries(response.headers.entries()),
          timestamp: new Date().toISOString()
        }
        
        console.log(`🧪 [TEST] Resultado para ${route.path}:`, result)
        results.push(result)
        
      } catch (error) {
        console.error(`🧪 [TEST] Error probando ${route.path}:`, error)
        results.push({
          path: route.path,
          description: route.description,
          status: 'ERROR',
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
          timestamp: new Date().toISOString()
        })
      }
    }
    
    setTestResults(results)
    setIsLoading(false)
    console.log('🧪 [TEST] Pruebas completadas:', results)
  }

  const checkConsoleForLogs = () => {
    console.log('🔍 [DEBUG] Verificando si los logs del middleware aparecen...')
    console.log('🔍 [DEBUG] Si ves este mensaje, la consola funciona correctamente')
    console.log('🔍 [DEBUG] Navega a /dashboard/client para ver si aparecen logs del middleware')
    
    // Simular un log del middleware para comparar
    const timestamp = new Date().toISOString()
    console.log(`🔐 [${timestamp}] MIDDLEWARE: [SIMULADO] Verificando acceso a /dashboard/client`)
    console.log(`🔒 [${timestamp}] MIDDLEWARE: [SIMULADO] Ruta protegida /dashboard/client - Verificando autenticación`)
  }

  const getCurrentInfo = () => {
    const info = {
      currentPath: window.location.pathname,
      hasToken: !!localStorage.getItem('token'),
      tokenValue: localStorage.getItem('token')?.substring(0, 20) + '...',
      userRole: localStorage.getItem('userRole'),
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    }
    
    console.log('ℹ️ [INFO] Información actual:', info)
    return info
  }

  useEffect(() => {
    // Log automático al montar el componente
    console.log('🔧 [COMPONENT] MiddlewareTest montado')
    getCurrentInfo()
  }, [])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bug className="h-5 w-5" />
          <span>Test de Middleware</span>
        </CardTitle>
        <CardDescription>
          Herramientas para diagnosticar por qué no aparecen los logs del middleware
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Información actual */}
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <DialogContent>
            <strong>Ruta actual:</strong> {window.location.pathname}<br/>
            <strong>Token presente:</strong> {localStorage.getItem('token') ? 'Sí' : 'No'}<br/>
            <strong>Rol guardado:</strong> {localStorage.getItem('userRole') || 'Ninguno'}
          </DialogContent>
        </Alert>

        {/* Botones de prueba */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={testMiddleware}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Bug className="h-4 w-4" />}
            <span>Probar Middleware</span>
          </Button>
          
          <Button
            onClick={checkConsoleForLogs}
            variant="outline"
          >
            Verificar Consola
          </Button>
          
          <Button
            onClick={getCurrentInfo}
            variant="outline"
          >
            Info Actual
          </Button>
        </div>

        {/* Instrucciones */}
        <Alert>
          <DialogContent>
            <strong>Pasos para diagnosticar:</strong><br/>
            1. Abre las DevTools (F12) → Console<br/>
            2. Haz clic en "Verificar Consola" para confirmar que los logs funcionan<br/>
            3. Navega a /dashboard/client manualmente<br/>
            4. Si no ves logs del middleware, el problema puede ser:<br/>
            • El middleware no se está ejecutando<br/>
            • Los logs están siendo filtrados<br/>
            • Hay un problema con el matcher del middleware
          </DialogContent>
        </Alert>

        {/* Resultados de pruebas */}
        {testResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Resultados de Pruebas:</h4>
            {testResults.map((result, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded"
              >
                <div>
                  <p className="font-medium text-sm">{result.description}</p>
                  <p className="text-xs text-gray-500 font-mono">{result.path}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={result.success ? "outline" : "active"}>
                    {result.status}
                  </Badge>
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Debug adicional */}
        <details className="text-xs">
          <summary className="cursor-pointer text-gray-600 hover:text-gray-800 font-medium">
            Información de Debug Avanzada
          </summary>
          <div className="mt-2 p-3 bg-gray-50 rounded">
            <pre className="text-xs overflow-x-auto">
              {JSON.stringify({
                location: {
                  pathname: window.location.pathname,
                  search: window.location.search,
                  hash: window.location.hash,
                  href: window.location.href
                },
                localStorage: {
                  token: localStorage.getItem('token') ? 'PRESENTE' : 'AUSENTE',
                  userRole: localStorage.getItem('userRole'),
                  keys: Object.keys(localStorage)
                },
                navigator: {
                  userAgent: navigator.userAgent,
                  language: navigator.language
                },
                timestamp: new Date().toISOString()
              }, null, 2)}
            </pre>
          </div>
        </details>
      </CardContent>
    </Card>
  )
}
