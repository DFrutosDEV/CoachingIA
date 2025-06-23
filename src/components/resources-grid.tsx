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
import { useAppSelector } from "@/lib/redux/hooks"
import { toast } from "sonner"

export function ResourcesGrid({ userType }: { userType: "client" | "coach" | "admin" | "enterprise" }) {
  const [showNotificationDialog, setShowNotificationDialog] = useState(false)
  const [showNoteDialog, setShowNoteDialog] = useState(false)
  const [showClientDialog, setShowClientDialog] = useState(false)
  const [showCoachDialog, setShowCoachDialog] = useState(false)
  const [showTicketDialog, setShowTicketDialog] = useState(false)
  const [ticketPriority, setTicketPriority] = useState("medium")
  
  // Estados para el autocompletado de notificaciones
  const [recipientSearch, setRecipientSearch] = useState("")
  const [selectedRecipient, setSelectedRecipient] = useState<{id: string, name: string} | null>(null)
  const [showRecipientSuggestions, setShowRecipientSuggestions] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  
  // Obtener usuario autenticado y datos del estado global
  const user = useAppSelector(state => state.auth.user)
  const clients = useAppSelector(state => state.auth.clients)
  
  // Función para buscar usuarios en el endpoint
  const searchUsers = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([])
      setShowRecipientSuggestions(false)
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/coach/search?search=${encodeURIComponent(query)}&limit=10`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setSearchResults(result.users || [])
          setShowRecipientSuggestions(true)
        } else {
          setSearchResults([])
          setShowRecipientSuggestions(false)
        }
      }
    } catch (error) {
      console.error('Error al buscar usuarios:', error)
      setSearchResults([])
      setShowRecipientSuggestions(false)
    } finally {
      setIsSearching(false)
    }
  }

  // Debounce para la búsqueda
  const debounceSearch = (() => {
    let timeoutId: NodeJS.Timeout
    return (query: string) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => searchUsers(query), 300)
    }
  })()

  const handleRecipientInputChange = (value: string) => {
    setRecipientSearch(value)
    setSelectedRecipient(null)
    
    if (value.length >= 3) {
      debounceSearch(value)
    } else {
      setShowRecipientSuggestions(false)
      setSearchResults([])
    }
  }

  const handleRecipientSelect = (user: any) => {
    setSelectedRecipient({ id: user._id, name: `${user.name} ${user.lastName}` })
    setRecipientSearch(`${user.name} ${user.lastName}`)
    setShowRecipientSuggestions(false)
    setSearchResults([])
  }

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
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    //! UNA VEZ QUE SE HAGA EL MIDDLEWARE DE AUTH, SE DEBE REMOVER ESTA VALIDACIÓN
    if (!user?._id) {
      toast.error('No se pudo identificar al usuario autenticado')
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

      const response = await fetch('/api/client', {
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

  // Estados para el formulario de notificación
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: ''
  })
  
  const [isSendingNotification, setIsSendingNotification] = useState(false)

  const handleNotificationFormChange = (field: string, value: string) => {
    setNotificationForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSendNotification = async () => {
    if (!selectedRecipient) {
      toast.error('Por favor selecciona un destinatario')
      return
    }

    if (!notificationForm.title || !notificationForm.message) {
      toast.error('Por favor completa el título y mensaje')
      return
    }

    if (!user?._id) {
      toast.error('No se pudo identificar al usuario autenticado')
      return
    }

    setIsSendingNotification(true)

    try {
      const response = await fetch('/api/notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipients: [selectedRecipient.id], // Array con el ID del destinatario
          title: notificationForm.title,
          message: notificationForm.message,
          userId: user._id
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(result.message)
        setShowNotificationDialog(false)
        // Resetear formulario
        setNotificationForm({ title: '', message: '' })
        setRecipientSearch("")
        setSelectedRecipient(null)
        setShowRecipientSuggestions(false)
        setSearchResults([])
      } else {
        toast.error(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error enviando notificación:', error)
      toast.error('Error interno del servidor')
    } finally {
      setIsSendingNotification(false)
    }
  }

  // Estados para el formulario de notas
  const [noteForm, setNoteForm] = useState({
    destinatario: '',
    sesion: '',
    titulo: '',
    contenido: ''
  })
  
  // Estados para autocompletado de notas
  const [noteRecipientSearch, setNoteRecipientSearch] = useState("")
  const [selectedNoteRecipient, setSelectedNoteRecipient] = useState<{id: string, name: string} | null>(null)
  const [showNoteRecipientSuggestions, setShowNoteRecipientSuggestions] = useState(false)
  const [noteSearchResults, setNoteSearchResults] = useState<any[]>([])
  const [isSearchingNoteRecipients, setIsSearchingNoteRecipients] = useState(false)
  
  // Estados para sesiones
  const [availableSessions, setAvailableSessions] = useState<any[]>([])
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)
  const [isSendingNote, setIsSendingNote] = useState(false)

  const handleNoteFormChange = (field: string, value: string) => {
    setNoteForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Función para buscar usuarios para las notas
  const searchNoteUsers = async (query: string) => {
    if (query.length < 3) {
      setNoteSearchResults([])
      setShowNoteRecipientSuggestions(false)
      return
    }

    setIsSearchingNoteRecipients(true)
    try {
      const response = await fetch(`/api/coach/search?search=${encodeURIComponent(query)}&limit=10`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setNoteSearchResults(result.users || [])
          setShowNoteRecipientSuggestions(true)
        } else {
          setNoteSearchResults([])
          setShowNoteRecipientSuggestions(false)
        }
      }
    } catch (error) {
      console.error('Error al buscar usuarios para notas:', error)
      setNoteSearchResults([])
      setShowNoteRecipientSuggestions(false)
    } finally {
      setIsSearchingNoteRecipients(false)
    }
  }

  // Debounce para la búsqueda de usuarios de notas
  const debounceNoteSearch = (() => {
    let timeoutId: NodeJS.Timeout
    return (query: string) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => searchNoteUsers(query), 300)
    }
  })()

  const handleNoteRecipientInputChange = (value: string) => {
    setNoteRecipientSearch(value)
    setSelectedNoteRecipient(null)
    
    if (value.length >= 3) {
      debounceNoteSearch(value)
    } else {
      setShowNoteRecipientSuggestions(false)
      setNoteSearchResults([])
    }
  }

  const handleNoteRecipientSelect = (user: any) => {
    setSelectedNoteRecipient({ id: user._id, name: `${user.name} ${user.lastName}` })
    setNoteRecipientSearch(`${user.name} ${user.lastName}`)
    setShowNoteRecipientSuggestions(false)
    setNoteSearchResults([])
    
    // Cargar sesiones del usuario seleccionado
    loadUserSessions(user._id)
  }

  // Función para cargar sesiones de un usuario
  const loadUserSessions = async (userId: string) => {
    setIsLoadingSessions(true)
    try {
      // Aquí asumo que tienes un endpoint para obtener sesiones por usuario
      // Ajusta la URL según tu endpoint real
      const response = await fetch(`/api/meet?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setAvailableSessions(result.sessions || [])
        } else {
          setAvailableSessions([])
        }
      }
    } catch (error) {
      console.error('Error al cargar sesiones:', error)
      setAvailableSessions([])
    } finally {
      setIsLoadingSessions(false)
    }
  }

  const handleCreateNote = async () => {
    if (!selectedNoteRecipient) {
      toast.error('Por favor selecciona un destinatario')
      return
    }

    if (!noteForm.sesion || !noteForm.titulo || !noteForm.contenido) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    if (!user?._id) {
      toast.error('No se pudo identificar al usuario autenticado')
      return
    }

    setIsSendingNote(true)

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destinatario: selectedNoteRecipient.id,
          sesion: noteForm.sesion,
          titulo: noteForm.titulo,
          contenido: noteForm.contenido,
          clienteId: selectedNoteRecipient.id, // Asumiendo que el destinatario es el cliente
          coachId: user._id
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Nota creada exitosamente')
        setShowNoteDialog(false)
        // Resetear formulario
        setNoteForm({
          destinatario: '',
          sesion: '',
          titulo: '',
          contenido: ''
        })
        setNoteRecipientSearch("")
        setSelectedNoteRecipient(null)
        setShowNoteRecipientSuggestions(false)
        setNoteSearchResults([])
        setAvailableSessions([])
      } else {
        toast.error(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error creando nota:', error)
      toast.error('Error interno del servidor')
    } finally {
      setIsSendingNote(false)
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
                <DialogDescription>Envía una notificación a {userType === "coach" ? "un cliente" : "uno o varios usuarios"}.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2 relative">
                  <Label htmlFor="recipient">Destinatario{userType === "coach" ? "" : "s"}</Label>
                  <Input 
                    id="recipient" 
                    placeholder="Escribe 3 letras para empezar a buscar..."
                    value={recipientSearch}
                    onChange={(e) => handleRecipientInputChange(e.target.value)}
                    onFocus={() => recipientSearch.length >= 3 && setShowRecipientSuggestions(true)}
                  />
                  {isSearching && (
                    <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-md shadow-lg z-50 p-3">
                      <div className="text-sm text-muted-foreground">Buscando usuarios...</div>
                    </div>
                  )}
                  {showRecipientSuggestions && searchResults.length > 0 && !isSearching && (
                    <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
                      {searchResults.map((searchUser) => (
                        <div
                          key={searchUser._id}
                          className="px-3 py-2 hover:bg-accent cursor-pointer border-b border-border last:border-b-0 transition-colors"
                          onClick={() => handleRecipientSelect(searchUser)}
                        >
                          <div className="font-medium text-foreground">{searchUser.name} {searchUser.lastName}</div>
                          <div className="text-sm text-muted-foreground">{searchUser.email}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {recipientSearch.length >= 3 && searchResults.length === 0 && showRecipientSuggestions && !isSearching && (
                    <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-md shadow-lg z-50 p-3">
                      <div className="text-sm text-muted-foreground">No se encontraron usuarios</div>
                    </div>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="title">Título</Label>
                  <Input 
                    id="title" 
                    placeholder="Título de la notificación"
                    value={notificationForm.title}
                    onChange={(e) => handleNotificationFormChange('title', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Escribe tu mensaje aquí..."
                    value={notificationForm.message}
                    onChange={(e) => handleNotificationFormChange('message', e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter className="flex justify-end gap-2">
                <Button 
                  variant="outlined" 
                  onClick={() => {
                    setShowNotificationDialog(false)
                    setNotificationForm({ title: '', message: '' })
                    setRecipientSearch("")
                    setSelectedRecipient(null)
                    setShowRecipientSuggestions(false)
                    setSearchResults([])
                  }}
                  disabled={isSendingNotification}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSendNotification}
                  disabled={isSendingNotification}
                >
                  {isSendingNotification ? 'Enviando...' : 'Enviar Notificación'}
                </Button>
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
                <DialogDescription>Añade una nueva nota para un cliente y sesión específica.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2 relative">
                  <Label htmlFor="note-recipient">Destinatario *</Label>
                  <Input 
                    id="note-recipient" 
                    placeholder="Escribe 3 letras para empezar a buscar..."
                    value={noteRecipientSearch}
                    onChange={(e) => handleNoteRecipientInputChange(e.target.value)}
                    onFocus={() => noteRecipientSearch.length >= 3 && setShowNoteRecipientSuggestions(true)}
                  />
                  {isSearchingNoteRecipients && (
                    <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-md shadow-lg z-50 p-3">
                      <div className="text-sm text-muted-foreground">Buscando usuarios...</div>
                    </div>
                  )}
                  {showNoteRecipientSuggestions && noteSearchResults.length > 0 && !isSearchingNoteRecipients && (
                    <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
                      {noteSearchResults.map((searchUser) => (
                        <div
                          key={searchUser._id}
                          className="px-3 py-2 hover:bg-accent cursor-pointer border-b border-border last:border-b-0 transition-colors"
                          onClick={() => handleNoteRecipientSelect(searchUser)}
                        >
                          <div className="font-medium text-foreground">{searchUser.name} {searchUser.lastName}</div>
                          <div className="text-sm text-muted-foreground">{searchUser.email}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {noteRecipientSearch.length >= 3 && noteSearchResults.length === 0 && showNoteRecipientSuggestions && !isSearchingNoteRecipients && (
                    <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-md shadow-lg z-50 p-3">
                      <div className="text-sm text-muted-foreground">No se encontraron usuarios</div>
                    </div>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="note-session">Sesión *</Label>
                  {isLoadingSessions ? (
                    <div className="text-sm text-muted-foreground">Cargando sesiones...</div>
                  ) : (
                    <select
                      id="note-session"
                      value={noteForm.sesion}
                      onChange={(e) => handleNoteFormChange('sesion', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!selectedNoteRecipient || availableSessions.length === 0}
                    >
                      <option value="">
                        {!selectedNoteRecipient 
                          ? "Primero selecciona un destinatario" 
                          : availableSessions.length === 0 
                            ? "No hay sesiones disponibles" 
                            : "Seleccionar sesión"}
                      </option>
                      {availableSessions.map((session) => (
                        <option key={session._id} value={session._id}>
                          {new Date(session.date).toLocaleDateString()} - {session.time}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="note-title">Título *</Label>
                  <Input 
                    id="note-title" 
                    placeholder="Título de la nota"
                    value={noteForm.titulo}
                    onChange={(e) => handleNoteFormChange('titulo', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="note-content">Contenido *</Label>
                  <Textarea 
                    id="note-content" 
                    placeholder="Escribe tu nota aquí..." 
                    className="min-h-[120px]"
                    value={noteForm.contenido}
                    onChange={(e) => handleNoteFormChange('contenido', e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter className="flex justify-end gap-2">
                <Button 
                  variant="outlined" 
                  onClick={() => {
                    setShowNoteDialog(false)
                    setNoteForm({ destinatario: '', sesion: '', titulo: '', contenido: '' })
                    setNoteRecipientSearch("")
                    setSelectedNoteRecipient(null)
                    setShowNoteRecipientSuggestions(false)
                    setNoteSearchResults([])
                    setAvailableSessions([])
                  }}
                  disabled={isSendingNote}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreateNote}
                  disabled={isSendingNote}
                >
                  {isSendingNote ? 'Guardando...' : 'Guardar Nota'}
                </Button>
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
