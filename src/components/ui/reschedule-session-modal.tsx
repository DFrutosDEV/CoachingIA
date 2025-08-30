"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Clock, Save, X } from "lucide-react"
import { toast } from "sonner"

interface RescheduleSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  currentDate: string;
  currentTime: string;
  onSessionRescheduled: () => void;
}

export function RescheduleSessionModal({
  isOpen,
  onClose,
  sessionId,
  currentDate,
  currentTime,
  onSessionRescheduled
}: RescheduleSessionModalProps) {
  const [newDate, setNewDate] = useState(currentDate)
  const [newTime, setNewTime] = useState(currentTime)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleReschedule = async () => {
    if (!newDate.trim() || !newTime.trim()) {
      toast.error("Por favor completa todos los campos")
      return
    }

    // Validar que la nueva fecha no sea en el pasado
    const newDateTime = new Date(`${newDate}T${newTime}`)
    if (newDateTime <= new Date()) {
      toast.error("La nueva fecha y hora deben ser en el futuro")
      return
    }

    setIsUpdating(true)
    
    try {
      const response = await fetch(`/api/meets/${sessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: newDate,
          time: newTime,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          toast.success('Sesión reprogramada exitosamente')
          onSessionRescheduled()
          onClose()
        } else {
          toast.error(data.error || 'Error al reprogramar la sesión')
        }
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Error al reprogramar la sesión')
      }
    } catch (error) {
      console.error('Error al reprogramar sesión:', error)
      toast.error('Error al reprogramar la sesión')
    } finally {
      setIsUpdating(false)
    }
  }

  const formatCurrentDateTime = () => {
    const date = new Date(currentDate)
    const time = currentTime
    return `${date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })} a las ${time}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Reprogramar Sesión
          </DialogTitle>
          <DialogDescription>
            Cambia la fecha y hora de la sesión programada
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información actual */}
          <div className="p-4 rounded-lg border bg-muted/50">
            <h4 className="text-sm font-medium mb-2">Sesión Actual</h4>
            <p className="text-sm text-muted-foreground">
              {formatCurrentDateTime()}
            </p>
          </div>

          {/* Formulario de reprogramación */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newDate">Nueva fecha</Label>
                <Input
                  id="newDate"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newTime">Nueva hora</Label>
                <Input
                  id="newTime"
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                />
              </div>
            </div>

            {/* Información de la nueva fecha */}
            {newDate && newTime && (
              <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
                <h4 className="text-sm font-medium mb-1">Nueva sesión programada para:</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(`${newDate}T${newTime}`).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })} a las {newTime}
                </p>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3">
            <Button 
              onClick={handleReschedule}
              disabled={isUpdating || !newDate || !newTime}
              className="flex-1"
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Reprogramando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Reprogramar Sesión
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isUpdating}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
