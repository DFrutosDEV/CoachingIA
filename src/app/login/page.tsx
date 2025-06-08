"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@mui/material"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    
    try {
      const formData = new FormData(event.currentTarget)
      const email = formData.get("email") as string
      const contrasena = formData.get("password") as string

      const response = await fetch('/api/loggin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          contrasena
        })
      })

      const data = await response.json()

      if (data.success) {
        // Login exitoso - mostrar toast de éxito
        toast.success("¡Bienvenido! Iniciando sesión...")
        
        // Guardar datos del usuario en localStorage
        localStorage.setItem('usuario', JSON.stringify(data.usuario))
        
        // Redirección basada en el tipo de usuario (basado en email por ahora)
        setTimeout(() => {
          if (email.includes("coach")) {
            router.push("/dashboard/coach")
          } else if (email.includes("admin")) {
            router.push("/dashboard/admin")
          } else if (email.includes("enterprise")) {
            router.push("/dashboard/enterprise")
          } else {
            router.push("/dashboard/client")
          }
        }, 1000)
      } else {
        toast.error(data.message || "Error al iniciar sesión")
      }
    } catch (error) {
      console.error('Error en login:', error)
      toast.error("Error de conexión. Por favor intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center mx-auto">
      <Link href="/" className="absolute left-4 top-4 md:left-8 md:top-8">
        <Button variant="outlined">← Volver</Button>
      </Link>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Bienvenido a CoachingIA</h1>
          <p className="text-sm text-muted-foreground">Ingresa tus credenciales para acceder a tu cuenta</p>
        </div>
        <Tabs defaultValue="login" className="w-full">
          {/* <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
            <TabsTrigger value="register">Registrarse</TabsTrigger>
          </TabsList> */}
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Iniciar Sesión</CardTitle>
                <CardDescription>Ingresa tus datos para acceder a tu cuenta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      placeholder="nombre@ejemplo.com"
                      type="email"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Contraseña</Label>
                      {/* <Link href="#" className="text-xs text-muted-foreground underline-offset-4 hover:underline">
                        ¿Olvidaste tu contraseña?
                      </Link> */}
                    </div>
                    <Input id="password" name="password" type="password" required />
                  </div>
                  <Button variant="outlined" type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                  </Button>
                </form>
              </CardContent>
              {/* <CardFooter className="flex flex-col">
                <div className="text-sm text-muted-foreground mt-2">
                  ¿No tienes una cuenta?{" "}
                  <Link href="/register" className="text-primary underline-offset-4 hover:underline">
                    Regístrate
                  </Link>
                </div>
              </CardFooter> */}
            </Card>
          </TabsContent>
          {/* <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Crear cuenta</CardTitle>
                <CardDescription>Regístrate para comenzar tu experiencia de coaching</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input id="name" placeholder="Juan Pérez" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="nombre@ejemplo.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input id="password" type="password" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-type">Tipo de usuario</Label>
                  <select
                    id="user-type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="client">Cliente</option>
                    <option value="coach">Coach</option>
                  </select>
                </div>
                <Button className="w-full">Crear cuenta</Button>
              </CardContent>
              <CardFooter className="flex flex-col">
                <div className="text-sm text-muted-foreground mt-2">
                  ¿Ya tienes una cuenta?{" "}
                  <Link href="/login" className="text-primary underline-offset-4 hover:underline">
                    Inicia sesión
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </TabsContent> */}
        </Tabs>
      </div>
    </div>
  )
}
