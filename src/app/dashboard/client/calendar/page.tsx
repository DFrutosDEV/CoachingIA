import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import SessionsPage from "@/components/ui/calendar"

export default function ClientsPage() {
  return (
    <div className="grid h-screen w-full md:grid-cols-[auto_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <DashboardSidebar userType="client" className="h-full" />
      </div>
      <div className="flex flex-col overflow-hidden">
        <DashboardHeader userType="client" />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-y-auto">
          <div className="grid grid-cols-1 h-full">
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold">Calendario</h1>
            </div>
            <SessionsPage />
          </div>
        </main>
      </div>
    </div>
  )
}
