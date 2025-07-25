"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@mui/material"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Target, ArrowRight, User, Mail, Phone, Calendar } from "lucide-react"
import { useAppSelector } from "@/lib/redux/hooks"
import { RootState } from "@/lib/redux/store"
import { toast } from "sonner"

interface NewObjectiveCardProps {
  userType: "coach" | "admin" | "enterprise"
}

interface ExistingClient {
  _id: string
  clientId: string
  name: string
  lastName: string
  email: string
  phone?: string
  age?: number
}

export function NewObjectiveCard({ userType }: NewObjectiveCardProps) {
  const [showClientDialog, setShowClientDialog] = useState(false)
  const [showExistingUserDialog, setShowExistingUserDialog] = useState(false)
  const [existingClient, setExistingClient] = useState<ExistingClient | null>(null)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  
  // Estados para el formulario de cliente
  const [clientForm, setClientForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    focus: '',
    startDate: '',
    startTime: '',
    coachId: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldsEnabled, setFieldsEnabled] = useState(false)
  
  // Obtener usuario autenticado y datos del estado global
  const user = useAppSelector((state: RootState) => state.auth.user)

  const handleClientFormChange = (field: string, value: string) => {
    setClientForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Función para verificar si existe un usuario por email
  const checkEmailExists = async (email: string) => {
    if (!email || email.length < 3) return

    setIsCheckingEmail(true)
    try {
      const response = await fetch(`/api/users/check-email?email=${encodeURIComponent(email)}`)
      const result = await response.json()

      if (result.success && result.exists) {
        setExistingClient(result.user)
        setShowExistingUserDialog(true)
        // No habilitar campos si existe el usuario
        setFieldsEnabled(false)
      } else if (!result.success && result.exists) {
        // Email existe pero no es cliente
        toast.error(result.message)
        setExistingClient(null)
        setFieldsEnabled(false)
      } else {
        // Email no existe, habilitar campos para crear nuevo cliente
        setFieldsEnabled(true)
        setExistingClient(null)
      }
    } catch (error) {
      console.error('Error verificando email:', error)
      toast.error('Error al verificar el email')
    } finally {
      setIsCheckingEmail(false)
    }
  }

  // Función para verificar si el cliente tiene un objetivo activo
  const checkActiveObjective = async (clientId: string) => {
    try {
      const response = await fetch(`/api/objective/check-active?clientId=${clientId}`)
      const result = await response.json()

      if (result.success && result.hasActiveObjective) {
        toast.error('Este cliente ya tiene un objetivo activo. Debe completar el objetivo actual antes de crear uno nuevo.')
        return false
      }
      return true
    } catch (error) {
      console.error('Error verificando objetivo activo:', error)
      toast.error('Error al verificar el objetivo activo')
      return false
    }
  }

  // Función para manejar cambios en el campo email
  const handleEmailChange = (value: string) => {
    handleClientFormChange('email', value)
    
    // Si el email está vacío, deshabilitar campos
    if (!value) {
      setFieldsEnabled(false)
      setExistingClient(null)
      return
    }

    // Verificar email después de un delay para evitar muchas requests
    const timeoutId = setTimeout(() => {
      checkEmailExists(value)
    }, 500)

    return () => clearTimeout(timeoutId)
  }

  // Función para confirmar usuario existente
  const handleConfirmExistingUser = () => {
    if (existingClient) {
      setClientForm(prev => ({
        ...prev,
        firstName: existingClient.name,
        lastName: existingClient.lastName,
        email: existingClient.email,
        phone: existingClient.phone || '',
        focus: '',
        startDate: '',
        startTime: '',
        coachId: ''
      }))
      // Los campos quedan deshabilitados para solo lectura
      setFieldsEnabled(false)
      setShowExistingUserDialog(false)
      toast.success('Datos del cliente cargados automáticamente')
    }
  }

  // Función para rechazar usuario existente
  const handleRejectExistingUser = () => {
    setShowExistingUserDialog(false)
    setExistingClient(null)
    setFieldsEnabled(false)
    // Limpiar solo el email para que pueda ingresar uno nuevo
    handleClientFormChange('email', '')
    toast.info('Por favor ingresa un email diferente')
  }

  const handleCreateClient = async () => {
    if (!clientForm.firstName || !clientForm.lastName || !clientForm.email || !clientForm.focus || !clientForm.startDate || !clientForm.startTime) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    //! UNA VEZ QUE SE HAGA EL MIDDLEWARE DE AUTH, SE DEBE REMOVER ESTA VALIDACIÓN
    if (!user?._id) {
      toast.error('No se pudo identificar al usuario autenticado')
      return
    }

    // Si es un usuario existente, verificar que no tenga un objetivo activo
    if (existingClient?.clientId) {
      const canCreateObjective = await checkActiveObjective(existingClient.clientId)
      if (!canCreateObjective) {
        return
      }
    }

    setIsSubmitting(true)

    try {  
      // Si es admin o enterprise y se especificó un coach, usar ese
      let coachIdToUse = user?.profile?._id
      if ((userType === "admin" || userType === "enterprise") && clientForm.coachId) {
        coachIdToUse = clientForm.coachId
      }

      const response = await fetch('/api/objective', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-timezone': Intl.DateTimeFormat().resolvedOptions().timeZone // Enviar zona horaria en header
        },
        body: JSON.stringify({
          firstName: clientForm.firstName,
          lastName: clientForm.lastName,
          email: clientForm.email,
          phone: clientForm.phone,
          focus: clientForm.focus,
          startDate: clientForm.startDate,
          startTime: clientForm.startTime,
          coachId: coachIdToUse,
          clientId: existingClient?.clientId // Si existe un usuario, se usa su ID
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Cliente creado exitosamente con objetivo y reunión programada')
        setShowClientDialog(false)
        // Resetear formulario
        setClientForm({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          focus: '',
          startDate: '',
          startTime: '',
          coachId: ''
        })
        setFieldsEnabled(false)
        setExistingClient(null)
      } else {
        toast.error(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error creando cliente:', error)
      toast.error('Error interno del servidor')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Target className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="mt-4">Crear nuevo Objetivo</CardTitle>
        <CardDescription>
          Añade nuevos objetivos a tu lista y configura sus perfiles, objetivos y planes de coaching.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            <span>Crea un nuevo objetivo</span>
          </li>
          <li className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            <span>Establece objetivos iniciales</span>
          </li>
          <li className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            <span>Programa primeras sesiones</span>
          </li>
        </ul>
      </CardContent>
      <CardFooter>
        <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
          <DialogTrigger asChild>
            <Button variant="outlined" className="w-full">
              Añadir Objetivo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Añadir Nuevo Objetivo</DialogTitle>
              <DialogDescription>Completa la información para crear un nuevo perfil de objetivo.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="email@ejemplo.com"
                    value={clientForm.email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {isCheckingEmail && (
                  <small className="text-sm text-muted-foreground">
                    Verificando email...
                  </small>
                )}
                {existingClient && (
                  <small className="text-sm text-green-600 font-medium">
                    ✓ Cliente existente
                  </small>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="first-name">Nombre</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="first-name" 
                      placeholder="Nombre"
                      value={clientForm.firstName}
                      onChange={(e) => handleClientFormChange('firstName', e.target.value)}
                      disabled={!fieldsEnabled}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="last-name">Apellidos</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="last-name" 
                      placeholder="Apellidos"
                      value={clientForm.lastName}
                      onChange={(e) => handleClientFormChange('lastName', e.target.value)}
                      disabled={!fieldsEnabled}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="phone">Teléfono</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="phone" 
                    placeholder="+34 600 000 000"
                    value={clientForm.phone}
                    onChange={(e) => handleClientFormChange('phone', e.target.value)}
                    disabled={!fieldsEnabled}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="focus">Enfoque principal</Label>
                <Input 
                  id="focus" 
                  placeholder="Ej: Desarrollo personal, Liderazgo, etc."
                  value={clientForm.focus}
                  onChange={(e) => handleClientFormChange('focus', e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start-date">Fecha Inicio</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="start-date" 
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={clientForm.startDate}
                      onChange={(e) => handleClientFormChange('startDate', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="start-time">Hora Inicio</Label>
                  <Input 
                    id="start-time" 
                    type="time"
                    min="08:00"
                    max="18:00"
                    value={clientForm.startTime}
                    onChange={(e) => handleClientFormChange('startTime', e.target.value)}
                  />
                </div>
              </div>
              
              {
                (userType === "admin") && (
                  <div className="grid gap-2">
                    <Label htmlFor="coach">Coach asignado</Label>
                    <Input 
                      id="coach" 
                      placeholder="ID del coach (opcional - se asignará automáticamente si se deja vacío)"
                      value={clientForm.coachId}
                      onChange={(e) => handleClientFormChange('coachId', e.target.value)}
                    />
                    <small className="text-sm text-muted-foreground">
                      Deja vacío para auto-asignar al usuario actual
                    </small>
                  </div>
                )
              }
            </div>
            <DialogFooter className="flex justify-end gap-2">
              <Button 
                variant="outlined" 
                onClick={() => {
                  setShowClientDialog(false)
                  setFieldsEnabled(false)
                  setExistingClient(null)
                  setClientForm({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    focus: '',
                    startDate: '',
                    startTime: '',
                    coachId: ''
                  })
                }}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateClient}
                disabled={isSubmitting || (!fieldsEnabled && !existingClient)}
              >
                {isSubmitting ? 'Creando...' : 'Crear Objetivo'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de confirmación para usuario existente */}
        <Dialog open={showExistingUserDialog} onOpenChange={setShowExistingUserDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Usuario encontrado</DialogTitle>
              <DialogDescription>
                Ya existe un usuario con el email <strong>{existingClient?.email}</strong>:
              </DialogDescription>
            </DialogHeader>
            <div className="my-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4" />
                <span><strong>{existingClient?.name} {existingClient?.lastName}</strong></span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4" />
                <span>{existingClient?.email}</span>
              </div>
              {existingClient?.phone && (
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="h-4 w-4" />
                  <span>{existingClient.phone}</span>
                </div>
              )}
              {existingClient?.age && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{existingClient.age} años</span>
                </div>
              )}
            </div>
            <DialogFooter className="flex justify-end gap-2">
              <Button 
                variant="outlined" 
                onClick={handleRejectExistingUser}
              >
                No, es otro usuario
              </Button>
              <Button 
                onClick={handleConfirmExistingUser}
              >
                Sí, es este usuario
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
} 