"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Mail, MessageSquare, Phone, FileText, ClipboardMinus, CalendarIcon, BarChart, Pencil, Sparkles, Target, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { GoalsModal } from "./ui/goals-modal"
import { ConfigFormModal } from "./ui/config-form-modal"
import { AIGoalsGenerator } from "./ui/ai-goals-generator"
import { ObjectiveDetailModal } from "./ui/objective-detail-modal"
import { useAppSelector } from "@/lib/redux/hooks"
import { formatDate } from "@/utils/validatesInputs"
import { toast } from "sonner"

import { Goal, NextSession, ClientDetailProps, Objective } from "@/types"

export function ClientDetail({ client, isOpen, onClose, onUpdateClient }: ClientDetailProps) {
  const [activeTab, setActiveTab] = useState("info")
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false)
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false)
  const [objectives, setObjectives] = useState<Objective[]>([])
  const [loadingObjectives, setLoadingObjectives] = useState(false)
  const [selectedObjectiveData, setSelectedObjectiveData] = useState<any>(null)
  const [isObjectiveDetailModalOpen, setIsObjectiveDetailModalOpen] = useState(false)

  const user = useAppSelector(state => state.auth.user)

  const handleGoalsUpdate = (updatedGoals: Goal[]) => {
    if (client) {
      onUpdateClient(client._id, updatedGoals)
    }
    setIsGoalsModalOpen(false)
  }

  const handleConfigFormOpen = () => {
    if (!client?.activeObjectiveId) {
      // Mostrar mensaje de que el cliente no tiene un objetivo activo
      return;
    }
    setIsConfigModalOpen(true)
  }

  const handleAIGeneratorOpen = () => {
    if (!client?.activeObjectiveId) {
      // Mostrar mensaje de que el cliente no tiene un objetivo activo
      return;
    }
    setIsAIGeneratorOpen(true)
  }

  const handleAIGoalsGenerated = (generatedGoals: Goal[]) => {
    if (client) {
      onUpdateClient(client._id, generatedGoals)
    }
  }

  // Función para cargar los objetivos del cliente
  const fetchObjectives = async () => {
    if (!client?._id) return;
    
    try {
      setLoadingObjectives(true);
      const response = await fetch(`/api/client/objectives?clientId=${client._id}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener los objetivos');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setObjectives(data.objectives);
      } else {
        throw new Error(data.error || 'Error desconocido');
      }
    } catch (err) {
      console.error('Error al cargar objetivos:', err);
      toast.error('Error al cargar los objetivos del cliente');
    } finally {
      setLoadingObjectives(false);
    }
  };

  // Función para obtener detalles de un objetivo específico
  const handleObjectiveSelect = async (objectiveId: string) => {
    try {
      const response = await fetch(`/api/client/objectives/${objectiveId}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener los detalles del objetivo');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSelectedObjectiveData(data.data);
        setIsObjectiveDetailModalOpen(true);
      } else {
        throw new Error(data.error || 'Error desconocido');
      }
    } catch (err) {
      console.error('Error al cargar detalles del objetivo:', err);
      toast.error('Error al cargar los detalles del objetivo');
    }
  };

  // Cargar objetivos cuando se abre la pestaña de objetivos
  useEffect(() => {
    if (activeTab === "objectives" && client?._id && objectives.length === 0) {
      fetchObjectives();
    }
  }, [activeTab, client?._id]);

  if (!isOpen && activeTab !== "info") {
     setActiveTab("info");
  }

  if (!client) {
    return null;
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-2xl">Detalle del Cliente</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-auto p-6">
            <div className="flex flex-col items-center space-y-3 text-center">
              <Image src={client.avatar || "/placeholder.svg"} alt={client.name} width={86} height={86} className="rounded-full" />
              <div>
                <h3 className="text-xl font-bold">{client.name}</h3>
                <p className="text-sm text-muted-foreground">{client.focus}</p>
              </div>
              <Badge
                variant={
                  client.status === "active" ? "active" : client.status === "pending" ? "pending" : "inactive"
                }
              >
                {client.status === "active" ? "Activo" : client.status === "pending" ? "Pendiente" : "Inactivo"}
              </Badge>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <Button variant="outline" size="sm" className="gap-1">
                <Calendar className="h-4 w-4" />
                Programar
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <MessageSquare className="h-4 w-4" />
                Mensaje
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <FileText className="h-4 w-4" />
                Ver PDA
              </Button>
              {/* <Button 
                variant="outline" 
                size="sm" 
                className="gap-1"
                onClick={handleConfigFormOpen}
                disabled={!client.activeObjectiveId}
                title={!client.activeObjectiveId ? "El cliente no tiene un objetivo activo" : "Ver formulario de configuración"}
              >
                <ClipboardMinus className="h-4 w-4" />
                Ver Formulario de configuración
              </Button> */}
            </div>

            <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
              <TabsList className="grid w-full grid-cols-2 border-solid border-2 border-border rounded-md bg-card p-1 h-auto">
                <TabsTrigger value="info" className="data-[state=active]:bg-accent">Info</TabsTrigger>
                <TabsTrigger value="objectives" className="data-[state=active]:bg-accent">Objetivos</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{client.email || "Sin correo"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{client.phone || "Sin teléfono"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span>Cliente desde {client.startDate || "Sin fecha"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                    <span>{client.sessions || 0} sesiones completadas</span>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-medium">Última Sesión</h4>
                  {client.lastSession.date ? (
                    <div className="rounded-lg border p-3">
                    <div className="flex justify-between">
                      <div className="font-medium">
                        {`${formatDate(new Date(client.lastSession.date))} - ${client.lastSession.objective.title}`}
                      </div>
                      <Badge variant="outline">Programada</Badge>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline" className="w-full gap-1">
                        <Clock className="h-3 w-3" />
                        Reprogramar
                      </Button>
                      <Button size="sm" className="w-full gap-1">
                        <Calendar className="h-3 w-3" />
                        Iniciar
                      </Button>
                    </div>
                  </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No existen sesiones previas</p>
                  )}
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-medium">Biografía</h4>
                  <p className="text-sm text-muted-foreground">{client.bio || "Sin biografía"}</p>
                </div>
              </TabsContent>

              <TabsContent value="objectives" className="space-y-4 mt-4">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium">Objetivos del Cliente</h4>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1" 
                        onClick={handleAIGeneratorOpen}
                        disabled={!client.activeObjectiveId}
                        title={!client.activeObjectiveId ? "El cliente no tiene un objetivo activo" : "Generar objetivos con IA"}
                      >
                        <Sparkles className="h-4 w-4" />
                        Generar con IA
                      </Button>
                    </div>
                  </div>
                  
                  {loadingObjectives ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-sm text-muted-foreground">Cargando objetivos...</p>
                      </div>
                    </div>
                  ) : objectives.length > 0 ? (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                      {objectives.map((objective) => (
                        <div key={objective._id} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => handleObjectiveSelect(objective._id)}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4 text-primary" />
                              <h5 className="font-medium">{objective.title}</h5>
                            </div>
                                                         <div className="flex items-center gap-2">
                               <Badge variant={objective.active ? "active" : "inactive"}>
                                 {objective.active ? "Activo" : "Inactivo"}
                               </Badge>
                               <Badge variant={objective.isCompleted ? "active" : "outline"}>
                                 {objective.isCompleted ? "Completado" : "En Progreso"}
                               </Badge>
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progreso: {objective.progress}%</span>
                              <span>{objective.completedGoals} de {objective.totalGoals} metas</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-muted">
                              <div 
                                className="h-full rounded-full bg-primary transition-all duration-300" 
                                style={{ width: `${objective.progress}%` }}
                              ></div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Creado: {formatDate(new Date(objective.createdAt))}</span>
                              <span>Coach: {objective.coach}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No hay objetivos definidos para este cliente</p>
                      <p className="text-sm text-muted-foreground mt-1">Haz clic en "Generar con IA" para crear nuevos objetivos</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="notes" className="space-y-4 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium">Notas de Sesiones</h4>
                  <Button variant="outline" size="sm" className="gap-1">
                    <FileText className="h-4 w-4" />
                    Nueva Nota
                  </Button>
                </div>
                <div className="space-y-3">
                  {client.notes?.length > 0 ? (
                      client.notes.map((note) => (
                        <div key={note._id} className="rounded-lg border p-3">
                          <div className="mb-1 text-xs text-muted-foreground">{formatDate(new Date(note.createdAt))}</div>
                          <p className="text-sm">{note.content}</p>
                        </div>
                      ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No hay notas registradas.</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <GoalsModal
            isOpen={isGoalsModalOpen}
            onClose={() => setIsGoalsModalOpen(false)}
            goals={client.goals || []}
            onSave={handleGoalsUpdate}
          />
        </DialogContent>
      </Dialog>

      <ConfigFormModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        clientId={client._id}
        coachId={user?._id || ''}
        objectiveId={client.activeObjectiveId}
      />

      <AIGoalsGenerator
        isOpen={isAIGeneratorOpen}
        onClose={() => setIsAIGeneratorOpen(false)}
        objective={{ _id: client.activeObjectiveId || '', title: client.activeObjectiveId || '', progress: 0, totalGoals: 0, completedGoals: 0, hasGoals: false, isCompleted: false, active: true, createdAt: '', coach: '' }}
        onGoalsGenerated={handleAIGoalsGenerated}
      />

      <ObjectiveDetailModal
        objectiveData={selectedObjectiveData}
        isOpen={isObjectiveDetailModalOpen}
        onClose={() => setIsObjectiveDetailModalOpen(false)}
        clientId={client._id}
        coachId={user?._id}
      />
    </>
  )
}
