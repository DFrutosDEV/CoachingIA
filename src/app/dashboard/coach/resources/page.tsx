import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ResourcesGrid } from "@/components/resources-grid"

export default function ResourcesPage() {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
      <DashboardSidebar userType="coach" />
      <div className="flex flex-col">
        <DashboardHeader userType="coach" />
        <main className="flex-1 p-6">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-bold">Recursos</h1>
              <p className="text-muted-foreground">Herramientas y recursos para gestionar tu práctica de coaching.</p>
            </div>

            <ResourcesGrid />
          </div>
        </main>
      </div>
    </div>
  )
}
