import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ReportUsers } from "@/components/report-users"
import { FileText } from "lucide-react"
// Datos de ejemplo para los reportes (se mantienen aquí por ahora, idealmente vendrían de una API)
const sampleReports = [
  { id: 1, title: "Problema de inicio de sesión", reporterName: "Laura Gómez", reporterEmail: "laura.g@ejemplo.com", reportDate: "Hace 2 días", status: "Pendiente" },
  { id: 2, title: "Error en la plataforma de video", reporterName: "Carlos Ruiz", reporterEmail: "carlos.r@ejemplo.com", reportDate: "Hace 1 día", status: "En progreso" },
  { id: 3, title: "Sugerencia: Mejorar interfaz de calendario", reporterName: "Ana Martínez", reporterEmail: "ana.m@ejemplo.com", reportDate: "Hace 5 horas", status: "Pendiente" },
  { id: 4, title: "Pago duplicado", reporterName: "Javier Soler", reporterEmail: "javier.s@ejemplo.com", reportDate: "Hace 3 días", status: "Resuelto" },
  { id: 5, title: "Dificultad para encontrar coach compatible", reporterName: "Elena Fernández", reporterEmail: "elena.f@ejemplo.com", reportDate: "Hace 6 días", status: "Pendiente" },
  { id: 6, title: "Problema con notificación push en iOS", reporterName: "Roberto Sanz", reporterEmail: "roberto.s@ejemplo.com", reportDate: "Hace 1 semana", status: "Resuelto" },
  { id: 7, title: "Contenido inapropiado en perfil de usuario", reporterName: "Admin System", reporterEmail: "system@ejemplo.com", reportDate: "Hace 4 horas", status: "En progreso" },
  { id: 8, title: "No se puede actualizar la foto de perfil", reporterName: "Sofia Castillo", reporterEmail: "sofia.c@ejemplo.com", reportDate: "Hace 2 días", status: "Pendiente" },
];

export default function AdminReportsPage() {
  return (
    <div className="grid h-screen w-full md:grid-cols-[auto_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <DashboardSidebar userType="admin" className="h-full" />
      </div>
      <div className="flex flex-col overflow-hidden">
        <DashboardHeader userType="admin" />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-y-auto">
          <div className="flex items-center gap-4">
            <FileText className="h-6 w-6" />
            <h1 className="text-lg font-semibold md:text-2xl">Gestión de Reportes</h1>
          </div>
           <p className="text-sm text-muted-foreground">
              Revisa y gestiona los reportes enviados por usuarios y coaches.
           </p>
          <Card>
            <CardContent className="pt-7">
              <ReportUsers reports={sampleReports} />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
