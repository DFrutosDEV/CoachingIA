"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface DeleteClientModalProps {
  isOpen: boolean
  onClose: () => void
  clientId: string
  clientName: string
  onClientDeleted: () => void
}

export function DeleteClientModal({
  isOpen,
  onClose,
  clientId,
  clientName,
  onClientDeleted
}: DeleteClientModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDeleteClient = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/users/${clientId}/delete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Error al dar de baja al cliente')
      }

      toast.success('Cliente dado de baja exitosamente')
      onClientDeleted()
      onClose()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al dar de baja al cliente')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Dar de baja cliente
          </DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que quieres dar de baja a <strong>{clientName}</strong>?
            Esta acción marcará al cliente como eliminado pero no borrará sus datos permanentemente.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteClient}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              'Dar de baja'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
