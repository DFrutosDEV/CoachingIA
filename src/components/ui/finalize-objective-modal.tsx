"use client"

import { useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface FinalizeObjectiveModalProps {
  objectiveId: string
  objectiveTitle: string
  onObjectiveFinalized?: () => void
}

export function FinalizeObjectiveModal({ 
  objectiveId, 
  objectiveTitle, 
  onObjectiveFinalized 
}: FinalizeObjectiveModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFinalizeObjective = async () => {
    if (!feedback.trim()) {
      toast.error("Por favor ingresa un feedback antes de finalizar el objetivo")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/objective/finalize', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          objectiveId,
          feedback: feedback.trim()
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Objetivo finalizado exitosamente')
        setIsOpen(false)
        setFeedback("")
        onObjectiveFinalized?.()
      } else {
        toast.error(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error finalizando objetivo:', error)
      toast.error('Error interno del servidor')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outlined" 
          color="success"
          startIcon={<CheckCircle />}
          size="small"
        >
          Finalizar Objetivo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Finalizar Objetivo</DialogTitle>
          <DialogDescription>
            Proporciona un feedback final para el objetivo: <strong>"{objectiveTitle}"</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="feedback">Feedback Final *</Label>
            <Textarea
              id="feedback"
              placeholder="Describe el progreso del cliente, logros alcanzados, áreas de mejora y recomendaciones para el futuro..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={6}
              maxLength={500}
            />
            <small className="text-sm text-muted-foreground">
              {feedback.length}/500 caracteres
            </small>
          </div>
        </div>
        <DialogFooter className="flex justify-end gap-2">
          <Button 
            variant="outlined" 
            onClick={() => {
              setIsOpen(false)
              setFeedback("")
            }}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleFinalizeObjective}
            disabled={isSubmitting || !feedback.trim()}
            startIcon={isSubmitting ? <Loader2 className="animate-spin" /> : <CheckCircle />}
          >
            {isSubmitting ? 'Finalizando...' : 'Finalizar Objetivo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
