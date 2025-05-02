import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ResourcesGrid } from "@/components/resources-grid"

export default function ResourcesEnterprisePage() {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
      <div className="hidden md:block">
        <DashboardSidebar userType="enterprise" className="h-full" />
      </div>
      <div className="flex flex-col">
        <DashboardHeader userType="enterprise" />
        <main className="flex-1 p-6">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-bold">Recursos</h1>
              <p className="text-muted-foreground">Herramientas y recursos para gestionar tu empresa.</p>
            </div>

            <ResourcesGrid userType="enterprise"/>
          </div>
        </main>
      </div>
    </div>
  )
}
