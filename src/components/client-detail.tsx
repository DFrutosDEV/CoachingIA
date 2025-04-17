"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Mail, MessageSquare, Phone, FileText, User, CalendarIcon, BarChart } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Datos de ejemplo para el cliente seleccionado
const clientData = {
  id: "1",
  name: "Carlos Rodríguez",
  email: "carlos.rodriguez@ejemplo.com",
  phone: "+34 612 345 678",
  startDate: "15/01/2023",
  sessions: 12,
  nextSession: "Hoy, 15:00",
  progress: 75,
  status: "active",
  plan: "Profesional",
  focus: "Desarrollo personal",
  avatar: "https://via.placeholder.com/150",
  bio: "Profesional de marketing digital buscando mejorar habilidades de liderazgo y gestión del estrés en entornos de alta presión.",
  goals: [
    { id: "1", title: "Mejorar habilidades de comunicación", progress: 80 },
    { id: "2", title: "Reducir niveles de estrés", progress: 65 },
    { id: "3", title: "Establecer rutina matutina", progress: 90 },
    { id: "4", title: "Mejorar productividad laboral", progress: 40 },
  ],
  upcomingSessions: [
    { id: "1", date: "Hoy, 15:00", topic: "Desarrollo personal" },
    { id: "2", date: "Viernes, 16:00", topic: "Seguimiento semanal" },
    { id: "3", date: "Lunes, 10:30", topic: "Gestión del estrés" },
  ],
  notes: [
    { id: "1", date: "10/06/2023", content: "Avance significativo en técnicas de respiración y mindfulness." },
    { id: "2", date: "03/06/2023", content: "Dificultades con la gestión del tiempo. Establecer nuevas estrategias." },
    {
      id: "3",
      date: "27/05/2023",
      content: "Mejora en la comunicación con su equipo. Continuar practicando asertividad.",
    },
  ],
}

export function ClientDetail() {
  const [activeTab, setActiveTab] = useState("info")

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Detalle del Cliente</CardTitle>
        <CardDescription>Información detallada y acciones</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center space-y-3 text-center">
          <img src={clientData.avatar || "/placeholder.svg"} alt={clientData.name} className="h-24 w-24 rounded-full" />
          <div>
            <h3 className="text-xl font-bold">{clientData.name}</h3>
            <p className="text-sm text-muted-foreground">{clientData.focus}</p>
          </div>
          <Badge
            variant={
              clientData.status === "active" ? "default" : clientData.status === "pending" ? "outline" : "secondary"
            }
          >
            {clientData.status === "active" ? "Activo" : clientData.status === "pending" ? "Pendiente" : "Inactivo"}
          </Badge>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Calendar className="h-4 w-4" />
            Programar
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <MessageSquare className="h-4 w-4" />
            Mensaje
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Phone className="h-4 w-4" />
            Llamar
          </Button>
        </div>

        <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="goals">Objetivos</TabsTrigger>
            <TabsTrigger value="notes">Notas</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{clientData.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{clientData.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Plan {clientData.plan}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>Cliente desde {clientData.startDate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BarChart className="h-4 w-4 text-muted-foreground" />
                <span>{clientData.sessions} sesiones completadas</span>
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-medium">Próxima Sesión</h4>
              <div className="rounded-lg border p-3">
                <div className="flex justify-between">
                  <div className="font-medium">{clientData.nextSession}</div>
                  <Badge variant="outline">Programada</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{clientData.upcomingSessions[0].topic}</p>
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
              <p className="text-sm text-muted-foreground">{clientData.bio}</p>
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
            <div>
              <h4 className="mb-2 text-sm font-medium">Objetivos y Progreso</h4>
              <div className="space-y-3">
                {clientData.goals.map((goal) => (
                  <div key={goal.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{goal.title}</p>
                      <span className="text-xs">{goal.progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${goal.progress}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-medium">Próximas Sesiones</h4>
              <div className="space-y-2">
                {clientData.upcomingSessions.map((session) => (
                  <div key={session.id} className="flex justify-between rounded-lg border p-2">
                    <div>
                      <p className="text-sm font-medium">{session.date}</p>
                      <p className="text-xs text-muted-foreground">{session.topic}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <div className="flex justify-between">
              <h4 className="text-sm font-medium">Notas de Sesiones</h4>
              <Button variant="outline" size="sm" className="gap-1">
                <FileText className="h-4 w-4" />
                Nueva Nota
              </Button>
            </div>
            <div className="space-y-3">
              {clientData.notes.map((note) => (
                <div key={note.id} className="rounded-lg border p-3">
                  <div className="mb-1 text-xs text-muted-foreground">{note.date}</div>
                  <p className="text-sm">{note.content}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Exportar Datos</Button>
        <Button>Editar Perfil</Button>
      </CardFooter>
    </Card>
  )
}
