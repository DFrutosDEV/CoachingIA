'use client'

import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { useAppSelector } from "@/lib/redux/hooks"
import { useEffect, useState } from "react"
import { HttpClient } from "@/lib/utils/http-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Circle, Clock, FileText, User } from "lucide-react"
import { formatDate } from "@/utils/validatesInputs"

interface Objective {
  _id: string;
  title: string;
  progress: number;
  totalGoals: number;
  completedGoals: number;
  hasGoals: boolean;
  isCompleted: boolean;
  active: boolean;
  createdAt: string;
  coach: string;
}

interface Goal {
  _id: string;
  description: string;
  isCompleted: boolean;
  day: string;
}

interface Note {
  _id: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

interface ObjectiveDetails {
  objective: {
    _id: string;
    title: string;
    isCompleted: boolean;
    active: boolean;
    createdAt: string;
  };
  goals: Goal[];
  notes: Note[];
}

export default function ProgressPage() {
  const user = useAppSelector(state => state.auth.user)
  const [objectives, setObjectives] = useState<Objective[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedObjective, setSelectedObjective] = useState<ObjectiveDetails | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)

  // Función para obtener todos los objetivos
  const fetchObjectives = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await HttpClient.get(`/api/client/objectives?clientId=${user?._id}`)
      
      if (!response.ok) {
        throw new Error('Error al obtener los objetivos')
      }
      
      const result = await response.json()
      
      if (result.success) {
        setObjectives(result.objectives)
      } else {
        throw new Error(result.error || 'Error desconocido')
      }
    } catch (err) {
      console.error('Error fetching objectives:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  // Función para obtener detalles de un objetivo
  const fetchObjectiveDetails = async (objectiveId: string) => {
    try {
      setLoadingDetails(true)
      
      const response = await HttpClient.get(`/api/client/objectives/${objectiveId}`)
      
      if (!response.ok) {
        throw new Error('Error al obtener los detalles del objetivo')
      }
      
      const result = await response.json()
      
      if (result.success) {
        setSelectedObjective(result.data)
        setShowModal(true)
      } else {
        throw new Error(result.error || 'Error desconocido')
      }
    } catch (err) {
      console.error('Error fetching objective details:', err)
      alert('Error al cargar los detalles del objetivo')
    } finally {
      setLoadingDetails(false)
    }
  }

  useEffect(() => {
    if (user?._id) {
      fetchObjectives()
    }
  }, [user?._id])

  if (loading) {
    return (
      <div className="grid h-screen w-full md:grid-cols-[auto_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
          <DashboardSidebar userType="client" className="h-full" />
        </div>
        <div className="flex flex-col overflow-hidden">
          <DashboardHeader userType="client" />
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-y-auto">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Cargando objetivos...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid h-screen w-full md:grid-cols-[auto_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
          <DashboardSidebar userType="client" className="h-full" />
        </div>
        <div className="flex flex-col overflow-hidden">
          <DashboardHeader userType="client" />
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-y-auto">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-red-500 mb-4">Error: {error}</p>
                <button 
                  onClick={fetchObjectives}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="grid h-screen w-full md:grid-cols-[auto_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <DashboardSidebar userType="client" className="h-full" />
      </div>
      <div className="flex flex-col overflow-hidden">
        <DashboardHeader userType="client" />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-y-auto">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-bold">Progreso</h1>
              <p className="text-muted-foreground">Progreso de tus objetivos y metas.</p>
            </div>
            
            <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {objectives.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <p className="text-muted-foreground">No tienes objetivos asignados aún</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Tu coach te asignará objetivos específicos
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                objectives.map((objective) => (
                  <Card 
                    key={objective._id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => fetchObjectiveDetails(objective._id)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{objective.title}</CardTitle>
                        <div className="flex items-center gap-2">
                          {objective.active && (
                            <Badge variant="pending" className="bg-blue-500">
                              Activo
                            </Badge>
                          )}
                          {objective.isCompleted && (
                            <Badge variant="active" className="bg-green-500">
                              Completado
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {objective.coach}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDate(new Date(objective.createdAt))}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Progreso</span>
                          <span className="text-sm font-medium">{objective.progress}%</span>
                        </div>
                        
                        {objective.hasGoals ? (
                          <>
                            <div className="h-2 w-full rounded-full bg-muted">
                              <div 
                                className="h-full rounded-full bg-primary transition-all duration-300" 
                                style={{ width: `${objective.progress}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {objective.completedGoals} de {objective.totalGoals} metas completadas
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            Sin metas asignadas aún
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal de detalles del objetivo */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedObjective && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedObjective.objective.title}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Metas */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Metas ({selectedObjective.goals.length})
                  </h3>
                  
                  {selectedObjective.goals.length === 0 ? (
                    <p className="text-muted-foreground">No hay metas asignadas a este objetivo</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedObjective.goals.map((goal) => (
                        <div key={goal._id} className="flex items-center gap-3 p-3 border rounded-lg">
                          {goal.isCompleted ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-400" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{goal.description}</p>
                            <p className="text-sm text-muted-foreground">Día: {goal.day}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notas */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Notas ({selectedObjective.notes.length})
                  </h3>
                  
                  {selectedObjective.notes.length === 0 ? (
                    <p className="text-muted-foreground">No hay notas para este objetivo</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedObjective.notes.map((note) => (
                        <div key={note._id} className="p-3 border rounded-lg">
                          <p className="text-sm">{note.content}</p>
                          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                            <span>Por: {note.createdBy}</span>
                            <span>{formatDate(new Date(note.createdAt))}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
