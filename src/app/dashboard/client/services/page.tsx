import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ServicesGrid } from "@/components/services-grid"

export default function ServicesPage() {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
      <div className="hidden md:block">
        <DashboardSidebar userType="client" className="h-full" />
      </div>
      <div className="flex flex-col">
        <DashboardHeader userType="client" />
        <main className="flex-1 p-6">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-bold">Servicios</h1>
              <p className="text-muted-foreground">Aca encontraras los servicios que tienes contratados.</p>
            </div>
            <ServicesGrid />
          </div>
        </main>
      </div>
    </div>
  )
}
