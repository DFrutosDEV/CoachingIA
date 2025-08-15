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
import { Bell, ArrowRight } from "lucide-react"
import { useAppSelector } from "@/lib/redux/hooks"

import { toast } from "sonner"

interface NotificationCardProps {
  userType: "coach" | "enterprise" | "admin"
}

export function NotificationCard({ userType }: NotificationCardProps) {
  const [showNotificationDialog, setShowNotificationDialog] = useState(false)
  
  // Estados para el autocompletado de notificaciones
  const [recipientSearch, setRecipientSearch] = useState("")
  const [selectedRecipient, setSelectedRecipient] = useState<{id: string, name: string} | null>(null)
  const [showRecipientSuggestions, setShowRecipientSuggestions] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  
  // Obtener usuario autenticado y datos del estado global
  const user = useAppSelector(state => state.auth.user)
  
  // Estados para el formulario de notificación
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: ''
  })
  
  const [isSendingNotification, setIsSendingNotification] = useState(false)

  // Función para buscar usuarios en el endpoint
  const searchUsers = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([])
      setShowRecipientSuggestions(false)
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/coach/search?search=${encodeURIComponent(query)}&coachId=${user?.profile?._id}`, {
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

  return (
    <Card className="flex flex-col">
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
    </Card>
  )
} 