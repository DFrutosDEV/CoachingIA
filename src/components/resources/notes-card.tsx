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
import { FileText, ArrowRight } from "lucide-react"
import { useAppSelector } from "@/lib/redux/hooks"
import { RootState } from "@/lib/redux/store"
import { toast } from "sonner"

export function NotesCard() {
  const [showNoteDialog, setShowNoteDialog] = useState(false)
  
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
  
  // Obtener usuario autenticado y datos del estado global
  const user = useAppSelector((state: RootState) => state.auth.user)

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
      const response = await fetch(`/api/coach/search?search=${encodeURIComponent(query)}&coachId=${user?._id}`, {
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
    <Card className="flex flex-col">
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
    </Card>
  )
} 