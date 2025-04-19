import { Button } from "@mui/material"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">404 - Página no encontrada</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
          </p>
        </div>
        <div className="flex justify-center">
          <Link href="/dashboard/coach">
            <Button variant="text" size="large" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 