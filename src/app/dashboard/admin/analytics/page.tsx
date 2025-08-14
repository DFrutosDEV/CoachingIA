import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { BarChart3 } from "lucide-react"

export default function AdminAnalyticsPage() {
  return (
    <div className="grid h-screen w-full md:grid-cols-[auto_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <DashboardSidebar userType="admin" className="h-full" />
      </div>
      <div className="flex flex-col overflow-hidden">
        <DashboardHeader userType="admin" />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-y-auto">
          <div className="flex items-center gap-4">
            <BarChart3 className="h-6 w-6" />
            <h1 className="text-lg font-semibold md:text-2xl">Analíticas de la Plataforma</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Visualiza métricas clave sobre el rendimiento, uso y crecimiento de la plataforma.
          </p>
          <div className="p-4 border rounded">
            <p>Contenido de analytics temporal</p>
          </div>
        </main>
      </div>
    </div>
  )
}
