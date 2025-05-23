import ClientTasks from "@/components/client-tasks"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

export default function TasksPage() {
  return (
    <div className="grid h-screen w-full md:grid-cols-[auto_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <DashboardSidebar userType="client" className="h-full" />
      </div>
      <div className="flex flex-col overflow-hidden">
        <DashboardHeader userType="client" />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-y-auto">
          <div className="flex flex-col gap-6 h-full">
            <div>
              <h1 className="text-3xl font-bold">Tareas a realizar</h1>
              <p className="text-muted-foreground">Aca encontraras las tareas que tienes pendientes.</p>
            </div>
            <ClientTasks />
          </div>
        </main>
      </div>
    </div>
  )
}
