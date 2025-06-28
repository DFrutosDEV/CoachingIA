"use client"

import React, { useState, useEffect } from "react"
import dayjs from "dayjs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthService } from "@/lib/services/auth-service"

interface SessionEvent {
  id: string
  title: string
  start: Date
  end: Date
  description?: string
  client: string
  coach: string
  link: string
  time: string
  objectiveTitle: string
}

interface RescheduleModalProps {
  session: SessionEvent | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function RescheduleModal({ 
  session, 
  isOpen, 
  onClose, 
  onSuccess 
}: RescheduleModalProps) {
  const [newDate, setNewDate] = useState("")
  const [newTime, setNewTime] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [canReschedule, setCanReschedule] = useState(false)

  // Validar si se puede reprogramar (máximo 1 mes de atraso)
  useEffect(() => {
    if (session) {
      const sessionDate = dayjs(session.start)
      const currentDate = dayjs()
      const oneMonthAgo = currentDate.subtract(1, 'month')
      
      // Se puede reprogramar si la sesión no es más antigua de 1 mes
      const canRescheduleSession = sessionDate.isAfter(oneMonthAgo)
      setCanReschedule(canRescheduleSession)

      // Establecer valores iniciales
      setNewDate(sessionDate.format('YYYY-MM-DD'))
      setNewTime(session.time)
      setError(null)
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session || !newDate || !newTime) {
      setError('Por favor completa todos los campos')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Validar que la nueva fecha no sea en el pasado
      const selectedDateTime = dayjs(`${newDate} ${newTime}`)
      const tomorrow = dayjs().add(1, 'day').startOf('day')
      if (selectedDateTime.isBefore(tomorrow)) {
        setError('No puedes programar una sesión para hoy o en el pasado')
        return
      }

      // Validar que la nueva fecha no sea más de 6 meses en el futuro
      const sixMonthsFromNow = dayjs().add(6, 'months')
      if (selectedDateTime.isAfter(sixMonthsFromNow)) {
        setError('No puedes programar una sesión más de 6 meses en el futuro')
        return
      }

      // Llamar al API para actualizar la sesión
      const response = await fetch(`/api/meets/${session.id}`, {
        method: 'PATCH',
        headers: {
          ...AuthService.getAuthHeaders(),
          'Content-Type': 'application/json',
          'x-timezone': Intl.DateTimeFormat().resolvedOptions().timeZone // Enviar zona horaria en header
        },
        body: JSON.stringify({
          date: newDate,
          time: newTime
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al reprogramar la sesión')
      }

      const data = await response.json()
      
      if (data.success) {
        onSuccess()
        onClose()
      } else {
        throw new Error(data.error || 'Error al reprogramar la sesión')
      }

    } catch (err) {
      console.error('Error reprogramando sesión:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setError(null)
    setLoading(false)
    onClose()
  }

  if (!session) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reprogramar Sesión</DialogTitle>
          <DialogDescription>
            Modifica la fecha y hora de la videoconsulta
          </DialogDescription>
        </DialogHeader>

        {!canReschedule && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              ⚠️ Esta sesión no se puede reprogramar porque es más antigua de 1 mes.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Información de la sesión actual */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">
              Información de la sesión:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Cliente:</span>
                <p className="font-medium">{session.client}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Objetivo:</span>
                <p className="font-medium">{session.objectiveTitle}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Fecha actual:</span>
                <p className="font-medium">{dayjs(session.start).format('DD/MM/YYYY')}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Hora actual:</span>
                <p className="font-medium">{session.time}</p>
              </div>
            </div>
          </div>

          {/* Campos de edición */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newDate">Nueva fecha</Label>
              <Input
                id="newDate"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                disabled={!canReschedule || loading}
                min={dayjs().add(1, 'day').format('YYYY-MM-DD')}
                max={dayjs().add(6, 'months').format('YYYY-MM-DD')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newTime">Nueva hora</Label>
              <Input
                id="newTime"
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                disabled={!canReschedule || loading}
              />
            </div>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Información adicional */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              💡 La nueva fecha debe ser desde mañana y no más de 6 meses en el futuro.
            </p>
          </div>
        </form>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!canReschedule || loading}
          >
            {loading ? 'Reprogramando...' : 'Reprogramar Sesión'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 