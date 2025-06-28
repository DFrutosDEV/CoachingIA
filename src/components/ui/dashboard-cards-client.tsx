'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, BarChart3, ArrowRight } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/utils/validatesInputs"

// Interfaces para los datos
interface NextSessionData {
  date: string;
  link: string;
  time: string;
  coach: string;
  topic: string;
}

interface GoalProgress {
  goal: string;
  progress: number;
  objectiveTitle?: string;
}

interface ClientGoal {
  description: string;
  isCompleted: boolean;
  objectiveTitle: string;
}

interface ObjectiveProgress {
  title: string;
  progress: number;
  totalGoals: number;
  completedGoals: number;
  hasGoals: boolean;
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
          <p className="text-xs text-muted-foreground">No tienes sesiones próximas</p>
        </CardContent>
      </Card>
    )
  }

  const sessionDate = new Date(data.date);
  const isToday = sessionDate.toDateString() === new Date().toDateString();
  const displayDate = isToday ? 'Hoy' : formatDate(sessionDate, {
    weekday: 'short', 
    day: 'numeric', 
    month: 'short' 
  });

  return (
    <Card data-swapy-item="next-session">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Próxima Sesión</CardTitle>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{displayDate}, {data.time}</div>
        <p className="text-xs text-muted-foreground">Con {data.coach}</p>
        <p className="text-xs text-muted-foreground mb-4">{data.topic}</p>
        <div className="mt-4">
          <Button size="sm" className="w-full" asChild>
            <a href={data.link} target="_blank" rel="noopener noreferrer">
              <Clock className="mr-2 h-4 w-4" />
              Unirse a la sesión
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Card 2: Sesiones Completadas
export function CompletedSessionsCard({ 
  totalSessions, 
  sessionsThisMonth 
}: { 
  totalSessions: number;
  sessionsThisMonth: number;
}) {
  return (
    <Card data-swapy-item="completed-sessions">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Sesiones Completadas</CardTitle>
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{totalSessions}</div>
        <p className="text-xs text-muted-foreground">+{sessionsThisMonth} este mes</p>
        <div className="mt-4">
          <div className="h-2 w-full rounded-full bg-muted">
            <div 
              className="h-full rounded-full bg-primary" 
              style={{ width: `${Math.min((sessionsThisMonth / 4) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {Math.min((sessionsThisMonth / 4) * 100, 100).toFixed(0)}% de tu plan mensual
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Card 3: Objetivos (Goals)
export function GoalsCard({ 
  goals = [],
  hasGoals = false
}: { 
  goals: ClientGoal[];
  hasGoals?: boolean;
}) {
  const completedGoals = goals.filter(goal => goal.isCompleted).length;
  const totalGoals = goals.length;
  const completionPercentage = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  return (
    <Card data-swapy-item="goals">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Metas</CardTitle>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          className="h-4 w-4 text-muted-foreground"
        >
          <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83" />
        </svg>
      </CardHeader>
      <CardContent>
        {!hasGoals ? (
          <>
            <div className="text-2xl font-bold">0/0</div>
            <p className="text-xs text-muted-foreground">Sin metas asignadas</p>
            <p className="text-xs text-muted-foreground mt-2">
              Tu coach te asignará metas específicas
            </p>
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{completedGoals}/{totalGoals}</div>
            <p className="text-xs text-muted-foreground">Metas completadas</p>
            
            <div className="mt-4">
              <div className="h-2 w-full rounded-full bg-muted">
                <div 
                  className="h-full rounded-full bg-primary" 
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {completionPercentage.toFixed(0)}% completado
              </p>
            </div>

            {/* Lista de metas recientes */}
            {goals.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Metas recientes:</p>
                {goals.slice(0, 3).map((goal, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${goal.isCompleted ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <p className="text-xs text-muted-foreground truncate">
                      {goal.description}
                    </p>
                  </div>
                ))}
                {goals.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{goals.length - 3} más metas
                  </p>
                )}
              </div>
            )}
          </>
        )}
        
        <Button size="sm" variant="outline" className="w-full mt-4">
          Ver metas
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}

// Card 4: Próximas Sesiones (Lista)
export function UpcomingSessionsCard({ 
  sessions 
}: { 
  sessions: Array<{
    date: string;
    coach: string;
    topic: string;
  }>;
}) {
  return (
    <Card data-swapy-item="upcoming-sessions">
      <CardHeader>
        <CardTitle>Próximas Sesiones</CardTitle>
        <CardDescription>Tus sesiones programadas para los próximos días.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No tienes sesiones programadas
            </p>
          ) : (
            sessions.map((session, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">{session.date}</p>
                  <p className="text-sm text-muted-foreground">Con {session.coach}</p>
                  <p className="text-xs text-muted-foreground">{session.topic}</p>
                </div>
                <Button size="sm" variant="outline">
                  Detalles
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Card 5: Tu Progreso (Objectives)
export function ProgressCard({ 
  objectives 
}: { 
  objectives: ObjectiveProgress[];
}) {
  return (
    <Card data-swapy-item="progress">
      <CardHeader>
        <CardTitle>Tu Progreso</CardTitle>
        <CardDescription>Seguimiento de tus objetivos y metas.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {objectives.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No tienes objetivos asignados
            </p>
          ) : (
            objectives.map((objective, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{objective.title}</p>
                  <p className="text-sm font-medium">{objective.progress}%</p>
                </div>
                {objective.hasGoals ? (
                  <>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div 
                        className="h-full rounded-full bg-primary" 
                        style={{ width: `${objective.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {objective.completedGoals}/{objective.totalGoals} metas completadas
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Sin metas asignadas aún
                  </p>
                )}
              </div>
            ))
          )}
        </div>
        <div className="mt-6">
          <Link href="/dashboard/client/progress">
            <Button className="w-full">
              Ver informe completo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
} 