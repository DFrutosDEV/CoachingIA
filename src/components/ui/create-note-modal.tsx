"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Calendar } from "lucide-react"
import { toast } from "sonner"
import { formatDate } from "@/utils/validatesInputs"

interface Meet {
  _id: string;
  date: string;
  link: string;
  isCancelled: boolean;
}

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  objectiveId: string;
  clientId: string;
  coachId: string;
  onNoteCreated: () => void;
}

export function CreateNoteModal({ 
  isOpen, 
  onClose, 
  objectiveId, 
  clientId, 
  coachId,
  onNoteCreated 
}: CreateNoteModalProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedSessionId, setSelectedSessionId] = useState<string>("none")
  const [sessions, setSessions] = useState<Meet[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Cargar sesiones disponibles para este objetivo
  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/meets?objectiveId=${objectiveId}&clientId=${clientId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSessions(data.meets.filter((meet: Meet) => !meet.isCancelled));
        }
      }
    } catch (error) {
      console.error('Error al cargar sesiones:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen, objectiveId, clientId]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('El título es requerido');
      return;
    }

    if (!content.trim()) {
      toast.error('El contenido es requerido');
      return;
    }

    try {
      setSaving(true);
      
        const noteData = {
         title: title.trim(),
         content: content.trim(),
         objectiveId,
         clientId,
         coachId,
         sessionId: selectedSessionId && selectedSessionId !== "none" ? selectedSessionId : undefined
       };

      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear la nota');
      }

      toast.success('Nota creada correctamente');
      onNoteCreated();
      handleClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al crear la nota');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setContent("");
    setSelectedSessionId("none");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Crear Nueva Nota
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Ingresa el título de la nota..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              {title.length}/100 caracteres
            </p>
          </div>

          {/* Contenido */}
          <div className="space-y-2">
            <Label htmlFor="content">Contenido *</Label>
            <Textarea
              id="content"
              placeholder="Escribe el contenido de la nota..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px]"
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground">
              {content.length}/2000 caracteres
            </p>
          </div>

          {/* Sesión opcional */}
          <div className="space-y-2">
            <Label htmlFor="session">Sesión (opcional)</Label>
                         <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
               <SelectTrigger className="w-full bg-background border border-input hover:bg-accent hover:text-accent-foreground">
                 <SelectValue placeholder="Selecciona una sesión (opcional)" />
               </SelectTrigger>
               <SelectContent className="bg-background border border-input">
                 <SelectItem value="none" className="hover:bg-accent hover:text-accent-foreground">Sin sesión</SelectItem>
                 {loading ? (
                   <SelectItem value="loading" disabled className="text-muted-foreground">
                     Cargando sesiones...
                   </SelectItem>
                 ) : sessions.length > 0 ? (
                   sessions.map((session) => (
                     <SelectItem key={session._id} value={session._id} className="hover:bg-accent hover:text-accent-foreground">
                       <div className="flex items-center gap-2">
                         <Calendar className="h-3 w-3" />
                         {formatDate(new Date(session.date))}
                       </div>
                     </SelectItem>
                   ))
                 ) : (
                   <SelectItem value="no-sessions" disabled className="text-muted-foreground">
                     No hay sesiones disponibles
                   </SelectItem>
                 )}
               </SelectContent>
             </Select>
          </div>

                     {/* Vista previa de la sesión seleccionada */}
           {selectedSessionId && selectedSessionId !== "none" && (
             <Card>
               <CardContent className="p-3">
                 <div className="flex items-center gap-2 text-sm">
                   <Calendar className="h-3 w-3 text-muted-foreground" />
                   <span className="font-medium">Sesión seleccionada:</span>
                 </div>
                 <div className="mt-1 text-sm text-muted-foreground">
                   {sessions.find(s => s._id === selectedSessionId)?.date && 
                     formatDate(new Date(sessions.find(s => s._id === selectedSessionId)!.date))
                   }
                 </div>
               </CardContent>
             </Card>
           )}

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} disabled={saving}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={saving || !title.trim() || !content.trim()}
              className="gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creando...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Crear Nota
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
