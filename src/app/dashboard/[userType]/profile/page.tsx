'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { User, Edit, Save, Camera, X, Trash2, Lock } from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks"
import { updateUser } from "@/lib/redux/slices/authSlice"
import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"

export default function ProfilePage() {
  const params = useParams()
  const userType = params.userType as "client" | "coach" | "admin" | "enterprise"
  const user = useAppSelector(state => state.auth.user)
  const dispatch = useAppDispatch()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewImage, setPreviewImage] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.profile?.name || '',
    lastName: user?.profile?.lastName || '',
    email: user?.email || '',
    age: user?.profile?.age || '',
    phoneCountryCode: '',
    phoneArea: '',
    phoneNumber: '',
    bio: user?.profile?.bio || '',
    address: user?.profile?.address || ''
  })

  // Función para parsear el teléfono existente en sus componentes
  const parsePhone = (phone: string) => {
    if (!phone) return { countryCode: '', area: '', number: '' }
    
    // Remover espacios y caracteres especiales
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
    
    // Si empieza con + (formato internacional)
    if (cleanPhone.startsWith('+')) {
      // Buscar el código de país (1-3 dígitos)
      let countryCode = ''
      let remainingNumber = ''
      
      // Códigos de país más comunes
      const countryCodes = [
        '1', '7', '20', '27', '30', '31', '32', '33', '34', '36', '39', '40', '41', '43', '44', '45', '46', '47', '48', '49',
        '51', '52', '53', '54', '55', '56', '57', '58', '60', '61', '62', '63', '64', '65', '66', '81', '82', '84', '86', '90', '91', '92', '93', '94', '95', '98', '971', '972', '973', '974', '975', '976', '977', '994', '995', '996', '998', '999'
      ]
      
      // Intentar encontrar el código de país
      for (const code of countryCodes) {
        if (cleanPhone.startsWith('+' + code)) {
          countryCode = code
          remainingNumber = cleanPhone.substring(code.length + 1)
          break
        }
      }
      
      if (countryCode && remainingNumber.length >= 7) {
        // Para números con 7+ dígitos, dividir en área y número (combinando prefijo)
        if (remainingNumber.length >= 10) {
          return {
            countryCode,
            area: remainingNumber.substring(0, 2),
            number: remainingNumber.substring(2) // Combinar prefijo + número
          }
        } else {
          // Para números más cortos, solo área y número
          return {
            countryCode,
            area: remainingNumber.substring(0, Math.floor(remainingNumber.length / 2)),
            number: remainingNumber.substring(Math.floor(remainingNumber.length / 2))
          }
        }
      }
    }
    
    // Si no empieza con + pero tiene 10+ dígitos, asumir que es nacional
    if (cleanPhone.length >= 10) {
      return {
        countryCode: '',
        area: cleanPhone.substring(0, 2),
        number: cleanPhone.substring(2) // Combinar prefijo + número
      }
    }
    
    // Si no coincide con ningún formato, devolver como está
    return { countryCode: '', area: '', number: cleanPhone }
  }

  useEffect(() => {
    if (user) {
      const phoneParts = parsePhone(user.profile?.phone || '')
      setFormData({
        name: user.profile?.name || '',
        lastName: user.profile?.lastName || '',
        email: user.email || '',
        age: user.profile?.age || '',
        phoneCountryCode: phoneParts.countryCode,
        phoneArea: phoneParts.area,
        phoneNumber: phoneParts.number,
        bio: user.profile?.bio || '',
        address: user.profile?.address || ''
      })
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    // Validar que solo se ingresen números en los campos de teléfono
    if (name === 'phoneCountryCode' || name === 'phoneArea' || name === 'phoneNumber') {
      const numericValue = value.replace(/[^0-9]/g, '')
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleCancel = () => {
    if (user) {
      const phoneParts = parsePhone(user.profile?.phone || '')
      setFormData({
        name: user.profile?.name || '',
        lastName: user.profile?.lastName || '',
        email: user.email || '',
        age: user.profile?.age || '',
        phoneCountryCode: phoneParts.countryCode,
        phoneArea: phoneParts.area,
        phoneNumber: phoneParts.number,
        bio: user.profile?.bio || '',
        address: user.profile?.address || ''
      })
    }
    setIsEditing(false)
    setSelectedImage(null)
    setPreviewImage('')
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tamaño (10MB)
      const maxSize = 10 * 1024 * 1024
      if (file.size > maxSize) {
        toast.error('La imagen no puede pesar más de 10MB')
        return
      }

      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Solo se permiten archivos JPG, PNG y WebP')
        return
      }

      setSelectedImage(file)
      
      // Crear preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleClearProfilePicture = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('userId', user._id)
      formDataToSend.append('name', user.profile?.name || '')
      formDataToSend.append('lastName', user.profile?.lastName || '')
      formDataToSend.append('age', user.profile?.age?.toString() || '')
      formDataToSend.append('phone', user.profile?.phone || '')
      formDataToSend.append('bio', user.profile?.bio || '')
      formDataToSend.append('clearProfilePicture', 'true')

      const response = await fetch('/api/profile', {
        method: 'POST',
        body: formDataToSend
      })

      const result = await response.json()

      if (result.success) {
        // Actualizar el estado del usuario
        dispatch(updateUser({
          email: user.email,
          profile: {
            ...user.profile,
            profilePicture: ''
          }
        }))

        toast.success('Foto de perfil eliminada exitosamente')
      } else {
        toast.error(result.error || 'Error al eliminar la foto de perfil')
      }
    } catch (error) {
      console.error('Error al eliminar foto de perfil:', error)
      toast.error('Error al eliminar la foto de perfil')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!user) return

    // Validar que las contraseñas coincidan
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas nuevas no coinciden')
      return
    }

    // Validar longitud mínima
    if (passwordData.newPassword.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres')
      return
    }

    setIsChangingPassword(true)
    try {
      const response = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user._id,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Contraseña actualizada exitosamente')
        setShowPasswordDialog(false)
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        toast.error(result.error || 'Error al cambiar la contraseña')
      }
    } catch (error) {
      console.error('Error al cambiar contraseña:', error)
      toast.error('Error al cambiar la contraseña')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    // Validar campos obligatorios del teléfono
    const countryCode = formData.phoneCountryCode.replace(/\s/g, '')
    const area = formData.phoneArea.replace(/\s/g, '')
    const number = formData.phoneNumber.replace(/\s/g, '')
    
    if (!countryCode || !area || !number || !formData.name || !formData.lastName) {
      toast.error('Todos los campos son obligatorios')
      return
    }

    setIsLoading(true)
    try {
      // Concatenar los campos del teléfono en formato E.164
      let fullPhone = ''
      if (countryCode && area && number) {
        fullPhone = `+${countryCode}${area}${number}`
      }
      
      const formDataToSend = new FormData()
      formDataToSend.append('userId', user._id)
      formDataToSend.append('name', formData.name)
      formDataToSend.append('lastName', formData.lastName)
      formDataToSend.append('age', formData.age.toString())
      formDataToSend.append('phone', fullPhone)
      formDataToSend.append('bio', formData.bio)
      // formDataToSend.append('address', formData.address)
      
      if (selectedImage) {
        formDataToSend.append('profilePicture', selectedImage)
      }

      const response = await fetch('/api/profile', {
        method: 'POST',
        body: formDataToSend
      })

      const result = await response.json()

      if (result.success) {
        // Actualizar el estado del usuario con los nuevos datos del perfil
        dispatch(updateUser({
          email: formData.email,
          profile: {
            ...user.profile,
            name: formData.name,
            lastName: formData.lastName,
            age: formData.age ? parseInt(formData.age.toString()) : undefined,
            phone: fullPhone,
            bio: formData.bio,
            // address: formData.address,
            profilePicture: result.data.profilePicture || user.profile?.profilePicture
          }
        }))

        toast.success('Perfil actualizado exitosamente')
        setIsEditing(false)
        setSelectedImage(null)
        setPreviewImage('')
      } else {
        toast.error(result.error || 'Error al actualizar el perfil')
      }
    } catch (error) {
      console.error('Error al guardar perfil:', error)
      toast.error('Error al actualizar el perfil')
    } finally {
      setIsLoading(false)
    }
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
                    <Button 
                      onClick={handleSave} 
                      className="gap-2"
                      disabled={isLoading}
                    >
                      <Save className="h-4 w-4" />
                      {isLoading ? 'Guardando...' : 'Guardar'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleCancel}
                      disabled={isLoading}
                    >
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={() => setIsEditing(true)} className="gap-2">
                      <Edit className="h-4 w-4" />
                      Editar Perfil
                    </Button>
                    <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <Lock className="h-4 w-4" />
                          Cambiar Contraseña
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Cambiar Contraseña</DialogTitle>
                          <DialogDescription>
                            Ingresa tu contraseña actual y la nueva contraseña que deseas usar.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="currentPassword">Contraseña Actual</Label>
                            <Input
                              id="currentPassword"
                              type="password"
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData(prev => ({
                                ...prev,
                                currentPassword: e.target.value
                              }))}
                              placeholder="Ingresa tu contraseña actual"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="newPassword">Nueva Contraseña</Label>
                            <Input
                              id="newPassword"
                              type="password"
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData(prev => ({
                                ...prev,
                                newPassword: e.target.value
                              }))}
                              placeholder="Ingresa tu nueva contraseña"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData(prev => ({
                                ...prev,
                                confirmPassword: e.target.value
                              }))}
                              placeholder="Confirma tu nueva contraseña"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowPasswordDialog(false)
                              setPasswordData({
                                currentPassword: '',
                                newPassword: '',
                                confirmPassword: ''
                              })
                            }}
                            disabled={isChangingPassword}
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={handleChangePassword}
                            disabled={isChangingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                          >
                            {isChangingPassword ? 'Cambiando...' : 'Cambiar Contraseña'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
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
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre <span className="text-red-500">*</span></Label>
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
                        <Label htmlFor="lastName">Apellido <span className="text-red-500">*</span></Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={!isEditing ? "bg-muted" : ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="age">Edad</Label>
                        <Input
                          id="age"
                          name="age"
                          type="number"
                          min="0"
                          max="120"
                          value={formData.age}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={!isEditing ? "bg-muted" : ""}
                          placeholder="Edad"
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
                      <Label htmlFor="phone">Teléfono <span className="text-red-500">*</span></Label>
                      <div className="grid gap-2 md:grid-cols-3">
                        <div className="flex flex-col gap-1">
                          <Input
                            id="phoneCountryCode"
                            name="phoneCountryCode"
                            value={formData.phoneCountryCode}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={!isEditing ? "bg-muted" : ""}
                            placeholder="54"
                            maxLength={3}
                            required
                          />
                          <p className="text-xs text-muted-foreground">País <span className="text-red-500">*</span></p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Input
                            id="phoneArea"
                            name="phoneArea"
                            value={formData.phoneArea}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={!isEditing ? "bg-muted" : ""}
                            placeholder="11"
                            maxLength={2}
                            required
                          />
                          <p className="text-xs text-muted-foreground">Área <span className="text-red-500">*</span></p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Input
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={!isEditing ? "bg-muted" : ""}
                            placeholder="40317700"
                            maxLength={10}
                            required
                          />
                          <p className="text-xs text-muted-foreground">Número <span className="text-red-500">*</span></p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Formato: +[país] [área] [número] (ej: +54 11 40317700, +1 415 5552671)
                      </p>
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

                    {/* <div className="space-y-2">
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
                    </div> */}
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
                      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {previewImage ? (
                          <img
                            src={previewImage}
                            alt="Preview de foto de perfil"
                            className="w-24 h-24 rounded-full object-cover"
                          />
                        ) : user.profile?.profilePicture ? (
                          <img
                            src={user.profile.profilePicture}
                            alt="Foto de perfil"
                            className="w-24 h-24 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>
                      {isEditing && (
                        <div className="absolute -bottom-2 -right-2 flex gap-1">
                          <Button
                            size="sm"
                            className="rounded-full w-8 h-8 p-0"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Camera className="h-4 w-4" />
                          </Button>
                          {selectedImage && (
                            <Button
                              size="sm"
                              variant="destructive"
                              className="rounded-full w-8 h-8 p-0"
                              onClick={() => {
                                setSelectedImage(null)
                                setPreviewImage('')
                                if (fileInputRef.current) {
                                  fileInputRef.current.value = ''
                                }
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    
                    {isEditing && (
                      <div className="text-center space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Formatos: JPG, PNG, WebP
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Máximo: 10MB
                        </p>
                        {user.profile?.profilePicture && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearProfilePicture}
                            disabled={isLoading}
                            className="w-full gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Limpiar Foto
                          </Button>
                        )}
                      </div>
                    )}
                    
                    <div className="text-center">
                      <p className="font-medium">{user.profile?.name || ''} {user.profile?.lastName || ''}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
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