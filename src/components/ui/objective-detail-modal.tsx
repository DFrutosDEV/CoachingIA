"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, 
  CheckCircle, 
  Circle, 
  FileText, 
  User, 
  Clock,
  BarChart3,
  Target,
} from "lucide-react"
import { formatDate } from "@/utils/validatesInputs"
import { ObjectiveConfigForm } from "./objective-config-form"
import { CreateNoteModal } from "./create-note-modal"

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
  const [notes, setNotes] = useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);

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

  // Cargar notas cuando se abre el modal
  useEffect(() => {
    if (isOpen && objectiveData?.objective.id) {
      loadNotes();
    }
  }, [isOpen, objectiveData?.objective.id]);

  const handleNoteCreated = () => {
    loadNotes(); // Recargar notas después de crear una nueva
  };

  if (!objectiveData) return null;

  const { objective, goals } = objectiveData;
  const completedGoals = goals.filter(goal => goal.isCompleted).length;
  const totalGoals = goals.length;
  const progress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Target className="h-6 w-6" />
            {objective.title}
          </DialogTitle>
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
                     <CardTitle className="text-lg flex items-center gap-2">
                       <Target className="h-5 w-5" />
                       Metas ({totalGoals})
                     </CardTitle>
                   </CardHeader>
                   <CardContent>
                     <div className="space-y-3 max-h-[400px] overflow-y-auto">
                       {goals.length > 0 ? (
                         goals.map((goal) => (
                           <div key={goal._id} className="flex items-start gap-3 p-3 rounded-lg border">
                             <div className="mt-1">
                               {goal.isCompleted ? (
                                 <CheckCircle className="h-4 w-4 text-green-600" />
                               ) : (
                                 <Circle className="h-4 w-4 text-muted-foreground" />
                               )}
                             </div>
                             <div className="flex-1 min-w-0">
                               <p className={`text-sm ${goal.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                 {goal.description}
                               </p>
                               <div className="flex items-center gap-2 mt-1">
                                 <Clock className="h-3 w-3 text-muted-foreground" />
                                 <span className="text-xs text-muted-foreground">
                                   {goal.day} • {formatDate(new Date(goal.createdAt))}
                                 </span>
                               </div>
                             </div>
                           </div>
                         ))
                       ) : (
                         <div className="text-center py-8">
                           <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                           <p className="text-sm text-muted-foreground">No hay metas definidas para este objetivo</p>
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
               <ObjectiveConfigForm objectiveId={objective.id} />
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
     </Dialog>
   )
 }
