import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Button } from "@mui/material"
import { Calendar, Clock, Users, ArrowRight, MessageSquare } from "lucide-react"
import Link from "next/link"

export default function CoachDashboard() {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
      <DashboardSidebar userType="coach" />
      <div className="flex flex-col">
        <DashboardHeader userType="coach" />
        <main className="flex-1 p-6">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-4xl font-bold">Bienvenido, María</h1>
              <p className="text-muted-foreground pt-2">Aquí tienes un resumen de tus sesiones y clientes.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Próxima Sesión</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Hoy, 15:00</div>
                  <p className="text-xs text-muted-foreground">Con Carlos Rodríguez</p>
                  <div className="mt-4">
                    <Button variant="outlined" className="w-full">
                      <Clock className="mr-2 h-4 w-4" />
                      Iniciar sesión
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">+3 este mes</p>
                  <div className="mt-4">
                    <Button variant="outlined" className="w-full">
                      Ver clientes
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Sesiones Programadas</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">Para esta semana</p>
                  <div className="mt-4">
                    <Button variant="outlined" className="w-full">
                      Ver calendario
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Mensajes</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">Sin leer</p>
                  <div className="mt-4">
                    <Button variant="outlined" className="w-full">
                      Ver mensajes
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Sesiones de Hoy</CardTitle>
                  <CardDescription>Tus sesiones programadas para hoy.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { time: "10:00 - 11:00", client: "Ana Martínez", topic: "Desarrollo profesional" },
                      { time: "12:30 - 13:30", client: "Pedro Sánchez", topic: "Gestión del tiempo" },
                      { time: "15:00 - 16:00", client: "Carlos Rodríguez", topic: "Desarrollo personal" },
                      { time: "17:30 - 18:30", client: "Laura Gómez", topic: "Liderazgo" },
                    ].map((session, index) => (
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
                          <Button variant="outlined">
                            Notas
                          </Button>
                          <Button variant="outlined">Iniciar</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Clientes Recientes</CardTitle>
                  <CardDescription>Tus clientes más recientes y su progreso.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Carlos Rodríguez", sessions: 12, progress: 75 },
                      { name: "Laura Gómez", sessions: 8, progress: 60 },
                      { name: "Miguel Torres", sessions: 5, progress: 40 },
                      { name: "Ana Martínez", sessions: 3, progress: 25 },
                      { name: "Pedro Sánchez", sessions: 2, progress: 15 },
                    ].map((client, index) => (
                      <div
                        key={index}
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
                        <Button variant="outlined">
                          Perfil
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <Link href="/dashboard/coach/clients">
                      <Button className="w-full">
                        Ver todos los clientes
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
