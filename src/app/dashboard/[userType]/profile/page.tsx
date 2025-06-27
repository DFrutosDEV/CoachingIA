'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { User, Mail, Calendar, Shield, Edit, Save, Camera } from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks"
import { updateUser } from "@/lib/redux/slices/authSlice"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"

export default function ProfilePage() {
  const params = useParams()
  const userType = params.userType as "client" | "coach" | "admin" | "enterprise"
  const user = useAppSelector(state => state.auth.user)
  const dispatch = useAppDispatch()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.profile?.phone || '',
    address: user?.profile?.address || '',
    bio: ''
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.profile?.phone || '',
        address: user.profile?.address || '',
        bio: ''
      })
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = () => {
    if (user) {
      dispatch(updateUser({
        name: formData.name,
        lastName: formData.lastName,
        email: formData.email,
        profile: {
          ...user.profile,
          phone: formData.phone,
          address: formData.address
        }
      }))
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.profile?.phone || '',
        address: user.profile?.address || '',
        bio: ''
      })
    }
    setIsEditing(false)
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Cargando información del usuario...</p>
      </div>
    )
  }

  return (
    <div className="grid h-screen w-full md:grid-cols-[auto_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <DashboardSidebar userType={userType} className="h-full" />
      </div>
      <div className="flex flex-col overflow-hidden">
        <DashboardHeader userType={userType} />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-y-auto">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Mi Perfil</h1>
                <p className="text-muted-foreground">Administra tu información personal y configuración.</p>
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} className="gap-2">
                      <Save className="h-4 w-4" />
                      Guardar
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)} className="gap-2">
                    <Edit className="h-4 w-4" />
                    Editar Perfil
                  </Button>
                )}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
              {/* Información Personal */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Información Personal
                    </CardTitle>
                    <CardDescription>
                      Tu información básica y de contacto.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={!isEditing ? "bg-muted" : ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Apellido</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={!isEditing ? "bg-muted" : ""}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo Electrónico</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={true}
                        className="bg-muted"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-muted" : ""}
                        placeholder="Agregar número de teléfono"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Dirección</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-muted" : ""}
                        placeholder="Agregar dirección"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Biografía</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-muted" : ""}
                        placeholder="Cuéntanos un poco sobre ti..."
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Panel lateral con información adicional */}
              <div className="space-y-6">
                {/* Foto de perfil */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Foto de Perfil</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                        {user.profile?.avatar ? (
                          <img
                            src={user.profile.avatar}
                            alt="Foto de perfil"
                            className="w-24 h-24 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>
                      {isEditing && (
                        <Button
                          size="sm"
                          className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                          disabled
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{user.name} {user.lastName}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Información de la cuenta */}
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4" />
                      Información de la Cuenta
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">ID de Usuario:</span>
                      <span className="text-sm font-mono">{user._id.slice(-8)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Tipo de Usuario:</span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded capitalize">
                        {userType}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Roles:</span>
                      <div className="flex gap-1">
                        {user.roles.map((role: string, index: number) => (
                          <span
                            key={index}
                            className="text-xs bg-primary/10 text-primary px-2 py-1 rounded capitalize"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Estado:</span>
                      <span className="text-sm text-green-600 font-medium">Activo</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 