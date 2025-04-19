'use client'

import { Button } from "@mui/material"
import { RefreshCcw } from "lucide-react"
import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Opcionalmente podrías registrar el error en un servicio de monitoreo
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">¡Ups! Algo salió mal</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Ha ocurrido un error inesperado. Por favor, intenta de nuevo.
          </p>
        </div>
        <div className="flex justify-center">
          <Button 
            variant="text" 
            size="large" 
            className="gap-2"
            onClick={reset}
          >
            <RefreshCcw className="h-4 w-4" />
            Intentar de nuevo
          </Button>
        </div>
      </div>
    </div>
  )
}
