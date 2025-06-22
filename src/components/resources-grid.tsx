"use client"

import { useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Bell, FileText, UserPlus, Ticket, ArrowRight } from "lucide-react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useNotifications } from "@/lib/hooks/use-stores"

export function ResourcesGrid({ userType }: { userType: "client" | "coach" | "admin" | "enterprise" }) {
  const [showNotificationDialog, setShowNotificationDialog] = useState(false)
  const [showNoteDialog, setShowNoteDialog] = useState(false)
  const [showClientDialog, setShowClientDialog] = useState(false)
  const [showCoachDialog, setShowCoachDialog] = useState(false)
  const [showTicketDialog, setShowTicketDialog] = useState(false)
  const [ticketPriority, setTicketPriority] = useState("medium")
  
  // Obtener usuario autenticado del estado global
  const { user } = useAuthStore()
  const { showSuccess, showError } = useNotifications()
  
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

  const handleClientFormChange = (field: string, value: string) => {
    setClientForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCreateClient = async () => {
    if (!clientForm.firstName || !clientForm.lastName || !clientForm.email || !clientForm.focus || !clientForm.startDate || !clientForm.startTime) {
      showError('Por favor completa todos los campos requeridos')
      return
    }

    //! UNA VEZ QUE SE HAGA EL MIDDLEWARE DE AUTH, SE DEBE REMOVER ESTA VALIDACIÓN
    if (!user?._id) {
      showError('No se pudo identificar al usuario autenticado')
      return
    }

    setIsSubmitting(true)

    try {
      // Determinar el coachId basado en el tipo de usuario
      let coachIdToUse = user._id // Por defecto el usuario actual
      
      // Si es admin o enterprise y se especificó un coach, usar ese
      if ((userType === "admin" || userType === "enterprise") && clientForm.coachId) {
        coachIdToUse = clientForm.coachId
      }

      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
          createdBy: user._id // Usuario que está creando el cliente
        }),
      })

      const result = await response.json()

      if (result.success) {
        showSuccess('Cliente creado exitosamente con objetivo y reunión programada')
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
      } else {
        showError(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error creando cliente:', error)
      showError('Error interno del servidor')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {/* Notificaciones */}
      {(userType === "coach" || userType === "enterprise" || userType === "admin") && <Card className="flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="mt-4">Notificaciones</CardTitle>
          <CardDescription>
            Envía notificaciones a tus clientes sobre sesiones, recordatorios o información importante.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" />
              <span>Envía recordatorios de sesiones</span>
            </li>
            <li className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" />
              <span>Notifica cambios de horario</span>
            </li>
            <li className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" />
              <span>Comparte recursos y materiales</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
            <DialogTrigger asChild>
              <Button variant="outlined" className="w-full">
                Crear Notificación
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Notificación</DialogTitle>
                <DialogDescription>Envía una notificación a un cliente o grupo de clientes.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="recipient">Destinatario</Label>
                  <Input id="recipient" placeholder="Seleccionar cliente o grupo" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="title">Título</Label>
                  <Input id="title" placeholder="Título de la notificación" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea id="message" placeholder="Escribe tu mensaje aquí..." />
                </div>
              </div>
              <DialogFooter className="flex justify-end gap-2">
                <Button variant="outlined" onClick={() => setShowNotificationDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setShowNotificationDialog(false)}>Enviar Notificación</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>}

      {/* Notas */}
      {userType === "coach" && <Card className="flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="mt-4">Notas</CardTitle>
          <CardDescription>
            Crea y gestiona notas sobre tus sesiones de coaching, progreso de clientes y planes de acción.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" />
              <span>Registra notas de sesiones</span>
            </li>
            <li className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" />
              <span>Documenta el progreso</span>
            </li>
            <li className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" />
              <span>Crea planes de acción</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
            <DialogTrigger asChild>
              <Button variant="outlined" className="w-full">
                Crear Nota
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nota</DialogTitle>
                <DialogDescription>Añade una nueva nota para un cliente o sesión específica.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="client">Cliente</Label>
                  <Input id="client" placeholder="Seleccionar cliente" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="session">Sesión</Label>
                  <Input id="session" placeholder="Seleccionar sesión (opcional)" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="note-title">Título</Label>
                  <Input id="note-title" placeholder="Título de la nota" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="note-content">Contenido</Label>
                  <Textarea id="note-content" placeholder="Escribe tu nota aquí..." className="min-h-[120px]" />
                </div>
              </div>
              <DialogFooter className="flex justify-end gap-2">
                <Button variant="outlined" onClick={() => setShowNoteDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setShowNoteDialog(false)}>Guardar Nota</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>}

      {/* Agregar Cliente */}
      {(userType === "coach" || userType === "enterprise" || userType === "admin") && <Card className="flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="mt-4">Agregar Cliente</CardTitle>
          <CardDescription>
            Añade nuevos clientes a tu lista y configura sus perfiles, objetivos y planes de coaching.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" />
              <span>Crea perfiles de clientes</span>
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
                Añadir Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Añadir Nuevo Cliente</DialogTitle>
                <DialogDescription>Completa la información para crear un nuevo perfil de cliente.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="first-name">Nombre</Label>
                    <Input 
                      id="first-name" 
                      placeholder="Nombre"
                      value={clientForm.firstName}
                      onChange={(e) => handleClientFormChange('firstName', e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="last-name">Apellidos</Label>
                    <Input 
                      id="last-name" 
                      placeholder="Apellidos"
                      value={clientForm.lastName}
                      onChange={(e) => handleClientFormChange('lastName', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="email@ejemplo.com"
                    value={clientForm.email}
                    onChange={(e) => handleClientFormChange('email', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input 
                    id="phone" 
                    placeholder="+34 600 000 000"
                    value={clientForm.phone}
                    onChange={(e) => handleClientFormChange('phone', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="focus">Enfoque principal</Label>
                  <Input 
                    id="focus" 
                    placeholder="Ej: Desarrollo personal, Liderazgo..."
                    value={clientForm.focus}
                    onChange={(e) => handleClientFormChange('focus', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="start-date">Fecha Inicio</Label>
                    <Input 
                      id="start-date" 
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={clientForm.startDate}
                      onChange={(e) => handleClientFormChange('startDate', e.target.value)}
                    />
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
                  (userType === "admin" || userType === "enterprise") && (
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
                  onClick={() => setShowClientDialog(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreateClient}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creando...' : 'Crear Cliente'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>}

      {/* Agregar Coach */}
      {(userType === "enterprise" || userType === "admin") && <Card className="flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="mt-4">Agregar Coach</CardTitle>
          <CardDescription>
            Añade nuevos coaches a tu lista y configura sus perfiles, objetivos y planes de coaching.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" />
              <span>Crea perfiles de coaches</span>
            </li>
            <li className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" />
              <span>Empieza a programar sesiones</span>
            </li>
            <li className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" />
              <span>Programa sesiones con tus clientes</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Dialog open={showCoachDialog} onOpenChange={setShowCoachDialog}>
            <DialogTrigger asChild>
              <Button variant="outlined" className="w-full">
                Añadir Coach
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Añadir Nuevo Coach</DialogTitle>
                <DialogDescription>Completa la información para crear un nuevo perfil de coach.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="first-name">Nombre</Label>
                    <Input id="first-name" placeholder="Nombre" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="last-name">Apellidos</Label>
                    <Input id="last-name" placeholder="Apellidos" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="email@ejemplo.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" placeholder="+34 600 000 000" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="focus">Enfoque principal</Label>
                  <Input id="focus" placeholder="Ej: Desarrollo personal, Liderazgo..." />
                </div>
              </div>
              <DialogFooter className="flex justify-end gap-2">
                <Button variant="outlined" onClick={() => setShowCoachDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setShowCoachDialog(false)}>Crear Coach</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>}

      {/* Generar Ticket */}
      {(userType === "coach" || userType === "enterprise") && <Card className="flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Ticket className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="mt-4">Generar Ticket</CardTitle>
          <CardDescription>
            Crea tickets para reportar problemas, solicitar soporte o enviar sugerencias al equipo técnico.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" />
              <span>Reporta problemas técnicos</span>
            </li>
            <li className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" />
              <span>Solicita nuevas funciones</span>
            </li>
            <li className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" />
              <span>Recibe soporte personalizado</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
            <DialogTrigger asChild>
              <Button variant="outlined" className="w-full">
                Crear Ticket
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generar Ticket de Soporte</DialogTitle>
                <DialogDescription>Describe el problema o solicitud para el equipo de soporte.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="ticket-type">Tipo de Ticket</Label>
                  <select
                    id="ticket-type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="technical">Problema técnico</option>
                    <option value="billing">Facturación</option>
                    <option value="feature">Solicitud de función</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ticket-subject">Asunto</Label>
                  <Input id="ticket-subject" placeholder="Asunto del ticket" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ticket-description">Descripción</Label>
                  <Textarea
                    id="ticket-description"
                    placeholder="Describe el problema o solicitud en detalle..."
                    className="min-h-[120px]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ticket-priority">Prioridad</Label>
                  <select
                    id="ticket-priority"
                    value={ticketPriority}
                    onChange={(e) => setTicketPriority(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>
              <DialogFooter className="flex justify-end gap-2">
                <Button variant="outlined" onClick={() => setShowTicketDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setShowTicketDialog(false)}>Enviar Ticket</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>}

      {/* Visualiza PDA */}
      {userType === "client" && <Card className="flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Ticket className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="mt-4">Visualiza tu PDA</CardTitle>
          <CardDescription>
            Accede a tu PDA (Personal Development Analysis).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" />
              <span>Visualiza tu PDA</span>
            </li>
            <li className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" />
              <span>Descarga tu PDA</span>
            </li>
            <li className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" />
              <span>Comparte tu PDA</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter></CardFooter>
      </Card>
      }

      {/* Visualiza tu formulario de configuración */}
      {userType === "client" && <Card className="flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Ticket className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="mt-4">Visualiza tu formulario de configuración</CardTitle>
          <CardDescription>
            Accede a tu formulario de configuración.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" />
              <span>Visualiza tu formulario de configuración</span>
            </li>
            <li className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" />
              <span>Descarga tu formulario de configuración</span>
            </li>
            <li className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" />
              <span>Comparte tu formulario de configuración</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter></CardFooter>
      </Card>
      }
    </div>
  )
}
