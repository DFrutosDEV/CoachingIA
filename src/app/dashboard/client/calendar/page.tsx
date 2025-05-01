import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import SessionsPage from "@/components/ui/calendar"

export default function ClientsPage() {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
      <div className="hidden md:block">
        <DashboardSidebar userType="client" className="h-full" />
      </div>
      <div className="flex flex-col h-screen">
        <DashboardHeader userType="client" />
        <main className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 gap-6 h-full">
            <SessionsPage />
          </div>
        </main>
      </div>
    </div>
  )
}
