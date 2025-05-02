import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ResourcesGrid } from "@/components/resources-grid"

export default function ResourcesPage() {
  return (
    <div className="grid h-screen w-full md:grid-cols-[auto_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <DashboardSidebar userType="coach" className="h-full" />
      </div>
      <div className="flex flex-col overflow-hidden">
        <DashboardHeader userType="coach" />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-y-auto">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-bold">Recursos</h1>
              <p className="text-muted-foreground">Herramientas y recursos para gestionar tu práctica de coaching.</p>
            </div>

            <ResourcesGrid userType="coach"/>
          </div>
        </main>
      </div>
    </div>
  )
}
