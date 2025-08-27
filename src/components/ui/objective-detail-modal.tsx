"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Calendar, 
  CheckCircle, 
  Circle, 
  FileText, 
  User, 
  Clock,
  BarChart3,
  Target,
  Sparkles,
  Plus,
  Edit,
  Trash2,
  Save,
  X
} from "lucide-react"
import { formatDate } from "@/utils/validatesInputs"
import { ObjectiveConfigForm } from "./objective-config-form"
import { CreateNoteModal } from "./create-note-modal"
import { AIGoalsGenerator } from "./ai-goals-generator"
import { toast } from "sonner"
import { FinalizeObjectiveModal } from "./finalize-objective-modal"

interface Goal {
  _id: string;
  description: string;
  isCompleted: boolean;
  day: string;
  createdAt: string;
}

interface Note {
  _id: string;
  title: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

interface Objective {
  id: string;
  title: string;
  isCompleted: boolean;
  active: boolean;
  createdAt: string;
  configFile?: {
    question: string;
    answer: string;
  }[];
}

interface ObjectiveDetailData {
  objective: Objective;
  goals: Goal[];
  notes: Note[];
}

interface ObjectiveDetailModalProps {
  objectiveData: ObjectiveDetailData | null;
  isOpen: boolean;
  onClose: () => void;
  clientId?: string;
  coachId?: string;
}

export function ObjectiveDetailModal({ 
  objectiveData, 
  isOpen, 
  onClose,
  clientId,
  coachId
}: ObjectiveDetailModalProps) {
  const [isCreateNoteModalOpen, setIsCreateNoteModalOpen] = useState(false);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [loadingGoals, setLoadingGoals] = useState(false);
  const [isFormCompleted, setIsFormCompleted] = useState(false);
  
  // Estados para gestión de metas
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState({ description: '', day: '' });
  const [editingGoal, setEditingGoal] = useState({ description: '', day: '' });

  // Cargar notas del objetivo
  const loadNotes = async () => {
    if (!objectiveData?.objective.id) return;
    
    try {
      setLoadingNotes(true);
      const response = await fetch(`/api/notes?objectiveId=${objectiveData.objective.id}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotes(data.notes);
        }
      }
    } catch (error) {
      console.error('Error al cargar notas:', error);
    } finally {
      setLoadingNotes(false);
    }
  };

  // Cargar metas del objetivo
  const loadGoals = async () => {
    if (!objectiveData?.objective.id) return;
    
    try {
      setLoadingGoals(true);
      const response = await fetch(`/api/goals?objectiveId=${objectiveData.objective.id}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setGoals(data.goals);
        }
      }
    } catch (error) {
      console.error('Error al cargar metas:', error);
    } finally {
      setLoadingGoals(false);
    }
  };

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen && objectiveData?.objective.id) {
      loadNotes();
      loadGoals();
    }
  }, [isOpen, objectiveData?.objective.id]);

  const handleNoteCreated = () => {
    loadNotes(); // Recargar notas después de crear una nueva
  };

  const handleAIGoalsGenerated = async (generatedGoals: any[]) => {
    if (!objectiveData?.objective.id || !clientId || !coachId) {
      toast.error('Faltan datos necesarios para crear las metas');
      return;
    }

    try {
      // Preparar las metas para enviar al servidor
      const goalsToCreate = generatedGoals.map((goal: any) => ({
        title: goal.description || goal.title,
        day: goal.day || 'Lunes'
      }));

      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          objectiveId: objectiveData.objective.id,
          clientId: clientId,
          coachId: coachId,
          goals: goalsToCreate,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Actualizar el estado local con las nuevas metas
          setGoals(prevGoals => [...prevGoals, ...data.goals]);
          setIsAIGeneratorOpen(false);
          toast.success(`${data.goals.length} metas generadas con IA exitosamente`);
        } else {
          toast.error('Error al guardar las metas generadas');
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Error al guardar las metas generadas');
      }
    } catch (error) {
      console.error('Error al crear metas generadas por IA:', error);
      toast.error('Error al guardar las metas generadas');
    }
  };

  // Funciones para gestión de metas
  const handleCreateGoal = async () => {
    if (!newGoal.description.trim() || !newGoal.day.trim()) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          objectiveId: objectiveData?.objective.id,
          description: newGoal.description,
          day: newGoal.day,
          clientId: clientId,
          createdBy: coachId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setGoals(prevGoals => [...prevGoals, data.goal]);
          setNewGoal({ description: '', day: '' });
          setIsCreatingGoal(false);
          toast.success('Meta creada exitosamente');
        }
      }
    } catch (error) {
      console.error('Error al crear meta:', error);
      toast.error('Error al crear la meta');
    }
  };

  const handleUpdateGoal = async (goalId: string) => {
    if (!editingGoal.description.trim() || !editingGoal.day.trim()) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: editingGoal.description,
          day: editingGoal.day,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setGoals(prevGoals => 
            prevGoals.map(goal => 
              goal._id === goalId 
                ? { ...goal, description: editingGoal.description, day: editingGoal.day }
                : goal
            )
          );
          setEditingGoalId(null);
          setEditingGoal({ description: '', day: '' });
          toast.success('Meta actualizada exitosamente');
        }
      }
    } catch (error) {
      console.error('Error al actualizar meta:', error);
      toast.error('Error al actualizar la meta');
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta meta?')) return;

    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setGoals(prevGoals => prevGoals.filter(goal => goal._id !== goalId));
          toast.success('Meta eliminada exitosamente');
        }
      }
    } catch (error) {
      console.error('Error al eliminar meta:', error);
      toast.error('Error al eliminar la meta');
    }
  };

  const handleToggleGoalCompletion = async (goalId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isCompleted: !currentStatus,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setGoals(prevGoals => 
            prevGoals.map(goal => 
              goal._id === goalId 
                ? { ...goal, isCompleted: !currentStatus }
                : goal
            )
          );
          toast.success(currentStatus ? 'Meta marcada como pendiente' : 'Meta marcada como completada');
        }
      }
    } catch (error) {
      console.error('Error al actualizar estado de meta:', error);
      toast.error('Error al actualizar el estado de la meta');
    }
  };

  const startEditingGoal = (goal: Goal) => {
    setEditingGoalId(goal._id);
    setEditingGoal({ description: goal.description, day: goal.day });
  };

  const cancelEditing = () => {
    setEditingGoalId(null);
    setEditingGoal({ description: '', day: '' });
  };

  // Función para validar si el formulario de configuración está completado
  const isConfigFormCompleted = () => {
    return (objectiveData?.objective.configFile && objectiveData.objective.configFile.length > 0) || isFormCompleted;
  };

  // Función para manejar el clic en "Generar con IA"
  const handleAIGeneratorClick = () => {
    if (!isConfigFormCompleted()) {
      toast.error('Debes completar el formulario de configuración antes de generar metas con IA');
      return;
    }
    setIsAIGeneratorOpen(true);
  };

  if (!objectiveData) return null;

  const { objective } = objectiveData;
  const completedGoals = goals.filter(goal => goal.isCompleted).length;
  const totalGoals = goals.length;
  const progress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-4 mt-4 flex flex-row justify-between items-center">
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Target className="h-6 w-6" />
            {objective.title}
          </DialogTitle>
          {objective.active && !objective.isCompleted && (
          <DialogDescription>
            <FinalizeObjectiveModal
              objectiveId={objective.id}
              objectiveTitle={objective.title}
            />
          </DialogDescription>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6">
          {/* Header con información del objetivo */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Información del Objetivo</CardTitle>
                <div className="flex gap-2">
                  <Badge variant={objective.active ? "active" : "inactive"}>
                    {objective.active ? "Activo" : "Inactivo"}
                  </Badge>
                  <Badge variant={objective.isCompleted ? "active" : "outline"}>
                    {objective.isCompleted ? "Completado" : "En Progreso"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Creado: {formatDate(new Date(objective.createdAt))}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Progreso: {Math.round(progress)}%</span>
                </div>
              </div>
              
              {/* Barra de progreso */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progreso general</span>
                  <span>{completedGoals} de {totalGoals} metas completadas</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div 
                    className="h-full rounded-full bg-primary transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3 border-solid border-2 border-border rounded-md bg-card p-1 h-auto">
              <TabsTrigger value="details" className="data-[state=active]:bg-accent">Detalles</TabsTrigger>
              <TabsTrigger value="config" className="data-[state=active]:bg-accent">Configuración</TabsTrigger>
              <TabsTrigger value="notes" className="data-[state=active]:bg-accent">Notas</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sección de Metas */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Metas ({totalGoals})
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1"
                          onClick={() => setIsCreatingGoal(true)}
                        >
                          <Plus className="h-4 w-4" />
                          Nueva Meta
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {/* Formulario para crear nueva meta */}
                      {isCreatingGoal && (
                        <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
                          <div className="space-y-3">
                            <Input
                              placeholder="Descripción de la meta"
                              value={newGoal.description}
                              onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                            />
                            <Input
                              placeholder="Día (ej: Lunes, Martes, etc.)"
                              value={newGoal.day}
                              onChange={(e) => setNewGoal(prev => ({ ...prev, day: e.target.value }))}
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={handleCreateGoal}>
                                <Save className="h-3 w-3 mr-1" />
                                Guardar
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => {
                                setIsCreatingGoal(false);
                                setNewGoal({ description: '', day: '' });
                              }}>
                                <X className="h-3 w-3 mr-1" />
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {loadingGoals ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                            <p className="text-sm text-muted-foreground">Cargando metas...</p>
                          </div>
                        </div>
                      ) : goals.length > 0 ? (
                        goals.map((goal) => (
                          <div key={goal._id} className="flex items-start gap-3 p-3 rounded-lg border">
                            <button
                              onClick={() => handleToggleGoalCompletion(goal._id, goal.isCompleted)}
                              className="mt-1 flex-shrink-0"
                            >
                              {goal.isCompleted ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <Circle className="h-4 w-4 text-muted-foreground hover:text-primary" />
                              )}
                            </button>
                            
                            <div className="flex-1 min-w-0">
                              {editingGoalId === goal._id ? (
                                <div className="space-y-2">
                                  <Input
                                    value={editingGoal.description}
                                    onChange={(e) => setEditingGoal(prev => ({ ...prev, description: e.target.value }))}
                                  />
                                  <Input
                                    value={editingGoal.day}
                                    onChange={(e) => setEditingGoal(prev => ({ ...prev, day: e.target.value }))}
                                  />
                                  <div className="flex gap-2">
                                    <Button size="sm" onClick={() => handleUpdateGoal(goal._id)}>
                                      <Save className="h-3 w-3 mr-1" />
                                      Guardar
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={cancelEditing}>
                                      <X className="h-3 w-3 mr-1" />
                                      Cancelar
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className={`text-sm ${goal.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                    {goal.description}
                                  </p>
                                  <div className="flex items-center justify-between mt-1">
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-xs text-muted-foreground">
                                        {goal.day} • {formatDate(new Date(goal.createdAt))}
                                      </span>
                                    </div>
                                                                         <div className="flex gap-1">
                                       <Button
                                         size="sm"
                                         variant="outline"
                                         onClick={() => startEditingGoal(goal)}
                                       >
                                         <Edit className="h-3 w-3" />
                                       </Button>
                                       <Button
                                         size="sm"
                                         variant="outline"
                                         onClick={() => handleDeleteGoal(goal._id)}
                                       >
                                         <Trash2 className="h-3 w-3" />
                                       </Button>
                                     </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No hay metas definidas para este objetivo</p>
                          
                          {/* Mensaje de configuración requerida */}
                          {!isConfigFormCompleted() && (
                            <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                              <p className="text-xs text-yellow-700">
                                ⚠️ Completa el formulario de configuración en la pestaña "Configuración" para generar metas con IA
                              </p>
                            </div>
                          )}
                          
                          <div className="flex gap-2 justify-center mt-3">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={handleAIGeneratorClick}
                              disabled={!objective.active || !isConfigFormCompleted()}
                              title={!isConfigFormCompleted() ? 'Completa el formulario de configuración primero' : 'Generar metas con IA'}
                            >
                              <Sparkles className="h-3 w-3 mr-1" />
                              Generar con IA
                              {!isConfigFormCompleted() && (
                                <span className="ml-1 text-xs bg-yellow-100 text-yellow-800 px-1 rounded">
                                  ⚠️
                                </span>
                              )}
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => setIsCreatingGoal(true)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Crear Manualmente
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Sección de Notas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Notas ({notes.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {notes.length > 0 ? (
                        notes.map((note) => (
                          <div key={note._id} className="p-3 rounded-lg border">
                            <div className="flex items-center gap-2 mb-2">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs font-medium">{note.createdBy}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(new Date(note.createdAt))}
                              </span>
                            </div>
                            <p className="text-sm">{note.content}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No hay notas registradas para este objetivo</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="config" className="space-y-4 mt-4">
              <ObjectiveConfigForm objectiveId={objective.id} handleConfigFormCompleted={setIsFormCompleted} />
            </TabsContent>

            <TabsContent value="notes" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Notas del Objetivo ({notes.length})
                    </CardTitle>
                    <button
                      onClick={() => setIsCreateNoteModalOpen(true)}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Nueva Nota
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {loadingNotes ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-sm text-muted-foreground">Cargando notas...</p>
                        </div>
                      </div>
                    ) : notes.length > 0 ? (
                      notes.map((note) => (
                        <div key={note._id} className="p-3 rounded-lg border">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs font-medium">{note.createdBy}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(new Date(note.createdAt))}
                            </span>
                          </div>
                          <h4 className="text-sm font-medium mb-1">{note.title}</h4>
                          <p className="text-sm text-muted-foreground">{note.content}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No hay notas registradas para este objetivo</p>
                        <button
                          onClick={() => setIsCreateNoteModalOpen(true)}
                          className="mt-2 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3"
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Crear Primera Nota
                        </button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>

      <CreateNoteModal
        isOpen={isCreateNoteModalOpen}
        onClose={() => setIsCreateNoteModalOpen(false)}
        objectiveId={objective.id}
        clientId={clientId || ''}
        coachId={coachId || ''}
        onNoteCreated={handleNoteCreated}
      />

      <AIGoalsGenerator
        isOpen={isAIGeneratorOpen}
        onClose={() => setIsAIGeneratorOpen(false)}
        objectiveId={objective.id}
        objectiveTitle={objective.title}
        onGoalsGenerated={handleAIGoalsGenerated}
      />
    </Dialog>
  )
}
