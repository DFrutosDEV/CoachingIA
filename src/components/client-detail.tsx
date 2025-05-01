"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Calendar, Clock, Mail, MessageSquare, Phone, FileText, ClipboardMinus, CalendarIcon, BarChart, Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { GoalsModal } from "./ui/goals-modal"

interface Goal {
  id: string;
  title: string;
  progress: number;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  startDate: string;
  sessions: number;
  nextSession: string;
  progress: number;
  status: "active" | "pending" | "inactive";
  focus: string;
  avatar: string;
  bio: string;
  goals: Goal[];
  upcomingSessions: { id: string; date: string; topic: string }[];
  notes: { id: string; date: string; content: string }[];
}

interface ClientDetailProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateClient: (clientId: string, updatedGoals: Goal[]) => void;
}

export function ClientDetail({ client, isOpen, onClose, onUpdateClient }: ClientDetailProps) {
  const [activeTab, setActiveTab] = useState("info")
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false)

  const handleGoalsUpdate = (updatedGoals: Goal[]) => {
    if (client) {
      onUpdateClient(client.id, updatedGoals)
    }
    setIsGoalsModalOpen(false)
  }

  if (!isOpen && activeTab !== "info") {
     setActiveTab("info");
  }

  if (!client) {
    return null;
  }

  return (
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
            <Button variant="outline" size="sm" className="gap-1">
              <ClipboardMinus className="h-4 w-4" />
              Ver Formulario de configuración
            </Button>
          </div>

          <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
            <TabsList className="grid w-full grid-cols-3 border-solid border-2 border-border rounded-md bg-card p-1 h-auto">
              <TabsTrigger value="info" className="data-[state=active]:bg-accent">Info</TabsTrigger>
              <TabsTrigger value="goals" className="data-[state=active]:bg-accent">Objetivos</TabsTrigger>
              <TabsTrigger value="notes" className="data-[state=active]:bg-accent">Notas</TabsTrigger>
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
                <h4 className="mb-2 text-sm font-medium">Próxima Sesión</h4>
                <div className="rounded-lg border p-3">
                  <div className="flex justify-between">
                    <div className="font-medium">{client.nextSession || "Sin próxima sesión"}</div>
                    <Badge variant="outline">Programada</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{client.upcomingSessions[0]?.topic || "Sin tema"}</p>
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
              </div>

              <div>
                <h4 className="mb-2 text-sm font-medium">Biografía</h4>
                <p className="text-sm text-muted-foreground">{client.bio || "Sin biografía"}</p>
              </div>
            </TabsContent>

            <TabsContent value="goals" className="space-y-4 mt-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">Objetivos y Progreso</h4>
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => setIsGoalsModalOpen(true)}>
                    <Pencil className="h-4 w-4" />
                    Editar
                  </Button>
                </div>
                <div className="space-y-3">
                  {client.goals?.length > 0 ? (
                     client.goals.map((goal) => (
                      <div key={goal.id} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{goal.title}</p>
                          <span className="text-xs">{goal.progress}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${goal.progress}%` }}></div>
                        </div>
                      </div>
                     ))
                  ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No hay objetivos definidos.</p>
                  )}
                </div>
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
                      <div key={note.id} className="rounded-lg border p-3">
                        <div className="mb-1 text-xs text-muted-foreground">{note.date}</div>
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
  )
}
