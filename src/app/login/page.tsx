"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@mui/material"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { useAuthService } from "@/lib/services/auth-service"

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading } = useAuthService()
  
  // Estados para manejar el formulario y "Recuérdame"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)

  // Cargar email guardado al montar el componente
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail")
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    
    const result = await login(email, password)
    console.log("result", result)
    if (result.success) {
      // Manejar localStorage según el estado de "Recuérdame"
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email)
      } else {
        localStorage.removeItem("rememberedEmail")
      }

      const user = result.user
      console.log("user", user)
      if (user) {
        setTimeout(() => {
          // Determinar la ruta basada en el primer rol o el rol principal
          const primaryRole = user.roles[0].toLowerCase() || 'client'
          router.push(`/dashboard/${primaryRole}`)
        }, 1000)
      }
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Contraseña</Label>
                    </div>
                    <Input 
                      id="password" 
                      name="password" 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <Label htmlFor="rememberMe" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Recuérdame
                    </Label>
                  </div>
                  <Button variant="outlined" type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
