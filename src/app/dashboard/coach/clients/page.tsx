import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ClientsList } from "../../../../components/clients-list"
import { ClientDetail } from "../../../../components/client-detail"

export default function ClientsPage() {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
      <DashboardSidebar userType="coach" />
      <div className="flex flex-col h-screen">
        <DashboardHeader userType="coach" />
        <main className="flex-1 p-6 overflow-hidden">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_500px] h-full">
            <div className="flex flex-col h-full">
              <div className="mb-4">
                <h1 className="text-3xl font-bold">Mis Clientes</h1>
                <p className="text-muted-foreground">Gestiona tus clientes y su progreso en el programa de coaching.</p>
              </div>
              <div className="flex-1 overflow-hidden">
                <ClientsList />
              </div>
            </div>
            <div className="h-full overflow-hidden">
              <ClientDetail />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
