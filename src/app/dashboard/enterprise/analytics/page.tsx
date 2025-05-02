import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { AnalyticsComponent } from "@/components/report-analytics"
import { ReportGraphics } from "@/components/report-graphics"
import { BarChart3 } from "lucide-react"

// Podrías pasar estos datos como props en el futuro
const analyticsData = [
  { metric: "Cantidad de usuarios", value: "19", change: "+2", positive: true, period: "Ayer" },
  { metric: "Cantidad de coaches", value: "35", change: "+5", positive: true, period: "Ayer" },
  { metric: "Cantidad de usuarios activos", value: "17", change: "+5", positive: true, period: "Ayer" },
  { metric: "Cantidad de coaches activos", value: "17", change: "+5", positive: true, period: "Ayer" },
  { metric: "Cantidad de sesiones semanales", value: "17", change: "+5", positive: true, period: "Ayer" },
];

export default function AdminAnalyticsPage() {
  return (
    <div className="grid h-screen w-full md:grid-cols-[auto_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <DashboardSidebar userType="enterprise" className="h-full" />
      </div>
      <div className="flex flex-col overflow-hidden">
        <DashboardHeader userType="enterprise" />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-y-auto">
          <div className="flex items-center gap-4">
            <BarChart3 className="h-6 w-6" />
            <h1 className="text-lg font-semibold md:text-2xl">Analíticas de la Plataforma</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Visualiza métricas clave sobre el rendimiento, uso y crecimiento de la plataforma.
          </p>
          <AnalyticsComponent analyticsData={analyticsData} />
          <ReportGraphics />
        </main>
      </div>
    </div>
  )
}
