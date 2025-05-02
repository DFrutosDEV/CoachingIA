import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ServicesGrid } from "@/components/services-grid"
import { Users } from "lucide-react"

export default function CoachsPage() {
  return (
    <div className="grid h-screen w-full md:grid-cols-[auto_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <DashboardSidebar userType="admin" className="h-full" />
      </div>
      <div className="flex flex-col overflow-hidden">
        <DashboardHeader userType="admin" />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-y-auto">
          <div className="flex items-center gap-4">
            <Users className="h-6 w-6" />
            <h1 className="text-lg font-semibold md:text-2xl">Coaches</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Gestiona y supervisa a los coaches registrados en la plataforma.
          </p>
          <ServicesGrid />
        </main>
      </div>
    </div>
  )
}
