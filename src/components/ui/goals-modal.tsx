import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Plus } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"

interface Goal {
  id: string;
  title: string;
  progress: number;
}

interface GoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals: Goal[];
  onSave: (updatedGoals: Goal[]) => void;
}

export function GoalsModal({ isOpen, onClose, goals: initialGoals, onSave }: GoalsModalProps) {
  const [goals, setGoals] = useState<Goal[]>([]);

  // Sincronizar el estado interno con las props cuando se abre el modal o cambian los objetivos iniciales
  useEffect(() => {
    if (isOpen) {
      // Crear copias profundas para evitar mutaciones directas del estado padre
      setGoals(initialGoals.map(goal => ({ ...goal })));
    }
  }, [isOpen, initialGoals]);

  const handleGoalChange = (id: string, field: keyof Goal, value: string | number) => {
    setGoals(currentGoals =>
      currentGoals.map(goal =>
        goal.id === id ? { ...goal, [field]: value } : goal
      )
    );
  };

  const handleAddGoal = () => {
    const newGoal: Goal = {
      id: Date.now().toString(), // ID simple basado en timestamp
      title: "Nuevo Objetivo",
      progress: 0,
    };
    setGoals(currentGoals => [...currentGoals, newGoal]);
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(currentGoals => currentGoals.filter(goal => goal.id !== id));
    toast.error("Objetivo eliminado.");
  };

  const handleSaveChanges = () => {
    // Asegurarse de que el progreso es un número
    const validatedGoals = goals.map(goal => ({ ...goal, progress: Number(goal.progress) || 0 }));
    onSave(validatedGoals);
    toast.success("Objetivos guardados correctamente.");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Editar Objetivos</DialogTitle>
          <DialogDescription>
            Modifica, añade o elimina los objetivos del cliente.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[400px] p-1">
          <div className="grid gap-4 py-4 pr-4">
            {goals.map((goal) => (
              <div key={goal.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor={`title-${goal.id}`} className="sr-only">
                    Título
                  </Label>
                  <Input
                    id={`title-${goal.id}`}
                    value={goal.title}
                    onChange={(e) => handleGoalChange(goal.id, "title", e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor={`progress-${goal.id}`} className="sr-only">
                    Progreso (%)
                  </Label>
                  <Input
                    id={`progress-${goal.id}`}
                    type="number"
                    value={goal.progress}
                    onChange={(e) => handleGoalChange(goal.id, "progress", parseInt(e.target.value, 10) || 0)}
                    className="w-[80px] text-center"
                    min="0"
                    max="100"
                  />
                </div>
                <Button variant="outline" size="icon" onClick={() => handleDeleteGoal(goal.id)} aria-label="Eliminar objetivo">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
        <Button variant="outline" onClick={handleAddGoal} className="mt-4 w-full">
          <Plus className="mr-2 h-4 w-4" /> Añadir Objetivo
        </Button>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSaveChanges}>Guardar Cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 