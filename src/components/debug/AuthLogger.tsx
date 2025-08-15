'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Trash2, Download, Eye, EyeOff } from 'lucide-react'

interface LogEntry {
  timestamp: string
  type: 'MIDDLEWARE' | 'HOOK' | 'PERMISSION' | 'TOKEN' | 'AUTH_CHECK' | 'LOGOUT' | 'CHECK' | 'ROUTES' | 'CONFIG'
  level: 'info' | 'success' | 'warning' | 'error'
  message: string
  data?: any
}

export function AuthLogger() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [originalConsole, setOriginalConsole] = useState<{
    log: typeof console.log
    error: typeof console.error
  }>()

  useEffect(() => {
    // Guardar las funciones originales de console
    const original = {
      log: console.log,
      error: console.error
    }
    setOriginalConsole(original)

    // Interceptar console.log y console.error
    console.log = (...args: any[]) => {
      original.log(...args)
      
      const message = args.join(' ')
      
      // Solo capturar logs relacionados con autenticación
      if (message.includes('[') && (
        message.includes('MIDDLEWARE') || 
        message.includes('HOOK') || 
        message.includes('PERMISSION') ||
        message.includes('TOKEN') ||
        message.includes('AUTH_CHECK') ||
        message.includes('LOGOUT') ||
        message.includes('CHECK') ||
        message.includes('ROUTES') ||
        message.includes('CONFIG')
      )) {
        const logEntry = parseLogMessage(message, args)
        if (logEntry) {
          setLogs(prev => [...prev.slice(-49), logEntry]) // Mantener solo los últimos 50 logs
        }
      }
    }

    console.error = (...args: any[]) => {
      original.error(...args)
      
      const message = args.join(' ')
      if (message.includes('HOOK') || message.includes('TOKEN')) {
        const logEntry = parseLogMessage(message, args, 'error')
        if (logEntry) {
          setLogs(prev => [...prev.slice(-49), logEntry])
        }
      }
    }

    // Cleanup al desmontar
    return () => {
      if (originalConsole) {
        console.log = originalConsole.log
        console.error = originalConsole.error
      }
    }
  }, [])

  const parseLogMessage = (message: string, args: any[], defaultLevel: 'info' | 'error' = 'info'): LogEntry | null => {
    try {
      // Extraer timestamp
      const timestampMatch = message.match(/\[([\d-T:.Z]+)\]/)
      const timestamp = timestampMatch ? timestampMatch[1] : new Date().toISOString()

      // Extraer tipo
      const typeMatch = message.match(/\] (\w+):/)
      const type = typeMatch ? typeMatch[1] as LogEntry['type'] : 'info' as any

      // Determinar nivel basado en emojis
      let level: LogEntry['level'] = defaultLevel
      if (message.includes('✅')) level = 'success'
      else if (message.includes('❌') || message.includes('🚫')) level = 'error'
      else if (message.includes('🔄') || message.includes('⚠️')) level = 'warning'

      // Extraer mensaje limpio
      const cleanMessage = message.replace(/^[🔐🔒🔍🎫📋👤❌✅🚫🔄🧹🍪⚙️🚪📝]+\s*\[[\d-T:.Z]+\]\s*\w+:\s*/, '')

      // Extraer datos adicionales si existen
      let data = undefined
      if (args.length > 1) {
        data = args.slice(1)
      }

      return {
        timestamp,
        type,
        level,
        message: cleanMessage,
        data
      }
    } catch (error) {
      return null
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  const downloadLogs = () => {
    const logText = logs.map(log => 
      `[${log.timestamp}] ${log.type} (${log.level}): ${log.message}${log.data ? '\nData: ' + JSON.stringify(log.data, null, 2) : ''}`
    ).join('\n\n')
    
    const blob = new Blob([logText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `auth-logs-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200'
      case 'error': return 'bg-red-100 text-red-800 border-red-200'
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const getTypeColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'MIDDLEWARE': return 'bg-purple-100 text-purple-800'
      case 'HOOK': return 'bg-blue-100 text-blue-800'
      case 'PERMISSION': return 'bg-orange-100 text-orange-800'
      case 'TOKEN': return 'bg-green-100 text-green-800'
      case 'AUTH_CHECK': return 'bg-indigo-100 text-indigo-800'
      case 'LOGOUT': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="shadow-lg"
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver Logs ({logs.length})
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 z-50">
      <Card className="shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm">Auth Logger</CardTitle>
              <CardDescription className="text-xs">
                Logs del sistema de autenticación ({logs.length})
              </CardDescription>
            </div>
            <div className="flex space-x-1">
              <Button
                onClick={downloadLogs}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={logs.length === 0}
              >
                <Download className="h-3 w-3" />
              </Button>
              <Button
                onClick={clearLogs}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={logs.length === 0}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
              <Button
                onClick={() => setIsVisible(false)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <EyeOff className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-80">
            <div className="p-3 space-y-2">
              {logs.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">
                  No hay logs aún. Navega por la aplicación para ver los logs de autenticación.
                </p>
              ) : (
                logs.map((log, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded border text-xs ${getLevelColor(log.level)}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs px-1 py-0 ${getTypeColor(log.type)}`}
                      >
                        {log.type}
                      </Badge>
                      <span className="text-xs opacity-70">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="font-mono text-xs leading-tight">
                      {log.message}
                    </p>
                    {log.data && (
                      <details className="mt-1">
                        <summary className="text-xs cursor-pointer opacity-70">
                          Ver datos
                        </summary>
                        <pre className="text-xs mt-1 p-1 bg-black/5 rounded overflow-x-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
