'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@mui/material"
import { Calendar, Clock, Users, ArrowRight, MessageSquare, Video } from "lucide-react"
import Link from "next/link"

// Interfaces para los datos
interface NextSessionData {
  date: string;
  link: string;
  time: string;
  client: string;
  topic: string;
}

interface TodaySession {
  time: string;
  client: string;
  topic: string;
}

interface RecentClient {
  id: string;
  name: string;
  sessions: number;
  progress: number;
}

// Card 1: Próxima Sesión
export function NextSessionCard({ data }: { data?: NextSessionData | null }) {
  if (!data) {
    return (
      <Card data-swapy-item="next-session">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Próxima Sesión</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Sin sesiones programadas</div>
          <p className="text-xs text-muted-foreground">No hay sesiones próximas</p>
          <div className="mt-4">
            <Button variant="outlined" className="w-full" disabled>
              <Clock className="mr-2 h-4 w-4" />
              Sin sesiones
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const sessionDate = new Date(data.date)
  const isToday = sessionDate.toDateString() === new Date().toDateString()
  const displayDate = isToday ? 'Hoy' : sessionDate.toLocaleDateString('es-ES', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  })

  return (
    <Card data-swapy-item="next-session">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Próxima Sesión</CardTitle>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{displayDate}, {data.time}</div>
        <p className="text-xs text-muted-foreground">Con {data.client}</p>
        <p className="text-xs text-muted-foreground mt-1">{data.topic}</p>
        <div className="mt-4">
          <Button variant="outlined" className="w-full" onClick={() => window.open(data.link, '_blank')}>
            <Clock className="mr-2 h-4 w-4" />
            Iniciar sesión
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Card 2: Clientes Activos
export function ActiveClientsCard({ count }: { count: number }) {
  return (
    <Card data-swapy-item="active-clients">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count}</div>
        <p className="text-xs text-muted-foreground">Clientes asignados</p>
        <div className="mt-4">
          <Link href="/dashboard/coach/clients">
            <Button variant="outlined" className="w-full">
              Ver clientes
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

// Card 3: Sesiones Programadas
export function ScheduledSessionsCard({ count }: { count: number }) {
  return (
    <Card data-swapy-item="scheduled-sessions">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Sesiones Programadas</CardTitle>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count}</div>
        <p className="text-xs text-muted-foreground">Para esta semana</p>
        <div className="mt-4">
          <Link href="/dashboard/coach/calendar">
            <Button variant="outlined" className="w-full">
              Ver calendario
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

// Card 4: Sesiones de Hoy
export function TodaySessionsCard({ sessions }: { sessions: TodaySession[] }) {
  if (sessions.length === 0) {
    return (
      <Card data-swapy-item="today-sessions" className="flex flex-col h-full">
        <CardHeader>
          <CardTitle>Sesiones de Hoy</CardTitle>
          <CardDescription>No tienes sesiones programadas para hoy.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Sin sesiones programadas</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card data-swapy-item="today-sessions" className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Sesiones de Hoy</CardTitle>
        <CardDescription>Tus sesiones programadas para hoy.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="space-y-4 pr-2">
          {sessions.map((session, index) => (
            <div
              key={index}
              className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium">{session.time}</p>
                <p className="text-sm text-muted-foreground">{session.client}</p>
                <p className="text-xs text-muted-foreground">{session.topic}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outlined" size="small">
                  Notas
                </Button>
                <Button variant="outlined" size="small">
                  <Video className="mr-1 h-3 w-3" />
                  Jitsi
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Card 5: Clientes Recientes
export function RecentClientsCard({ clients }: { clients: RecentClient[] }) {
  if (clients.length === 0) {
    return (
      <Card data-swapy-item="recent-clients" className="flex flex-col">
        <CardHeader>
          <CardTitle>Clientes Recientes</CardTitle>
          <CardDescription>No tienes clientes asignados.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Sin clientes asignados</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card data-swapy-item="recent-clients" className="flex flex-col">
      <CardHeader>
        <CardTitle>Clientes Recientes</CardTitle>
        <CardDescription>Tus clientes más recientes y su progreso.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto" style={{ maxHeight: "320px" }}>
        <div className="space-y-4">
          {clients.map((client, index) => (
            <div
              key={client.id}
              className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium">{client.name}</p>
                <p className="text-xs text-muted-foreground">{client.sessions} sesiones</p>
                <div className="h-2 w-32 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${client.progress}%` }}
                  ></div>
                </div>
              </div>
              <Button variant="outlined" size="small">
                Perfil
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4">
        <Link href="/dashboard/coach/clients">
          <Button className="w-full">
            Ver todos los clientes
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
} 