import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, BarChart3, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function ClientDashboard() {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
      <DashboardSidebar userType="client" />
      <div className="flex flex-col">
        <DashboardHeader userType="client" />
        <main className="flex-1 p-6">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-bold">Bienvenido, Carlos</h1>
              <p className="text-muted-foreground">Aquí tienes un resumen de tu progreso y próximas sesiones.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Próxima Sesión</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Hoy, 15:00</div>
                  <p className="text-xs text-muted-foreground">Con María González</p>
                  <div className="mt-4">
                    <Button size="sm" className="w-full">
                      <Clock className="mr-2 h-4 w-4" />
                      Unirse a la sesión
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Sesiones Completadas</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">+3 este mes</p>
                  <div className="mt-4">
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-full w-3/4 rounded-full bg-primary"></div>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">75% de tu plan mensual</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Objetivos</CardTitle>
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
                  <div className="text-2xl font-bold">3/5</div>
                  <p className="text-xs text-muted-foreground">Objetivos completados</p>
                  <div className="mt-4">
                    <Button size="sm" variant="outline" className="w-full">
                      Ver objetivos
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Próximas Sesiones</CardTitle>
                  <CardDescription>Tus sesiones programadas para los próximos días.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { date: "Hoy, 15:00", coach: "María González", topic: "Desarrollo personal" },
                      { date: "Mañana, 10:30", coach: "Juan Pérez", topic: "Gestión del estrés" },
                      { date: "Viernes, 16:00", coach: "María González", topic: "Seguimiento semanal" },
                    ].map((session, index) => (
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
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tu Progreso</CardTitle>
                  <CardDescription>Seguimiento de tus objetivos y metas.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { goal: "Mejorar habilidades de comunicación", progress: 80 },
                      { goal: "Reducir niveles de estrés", progress: 65 },
                      { goal: "Establecer rutina matutina", progress: 90 },
                      { goal: "Mejorar productividad laboral", progress: 40 },
                      { goal: "Desarrollar habilidades de liderazgo", progress: 25 },
                    ].map((goal, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{goal.goal}</p>
                          <p className="text-sm font-medium">{goal.progress}%</p>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${goal.progress}%` }}></div>
                        </div>
                      </div>
                    ))}
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
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
