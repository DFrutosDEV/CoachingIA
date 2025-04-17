import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { CoachesList } from "@/components/coaches-list"
import { CoachDetail } from "@/components/coach-detail"

export default function CoachesPage() {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
      <DashboardSidebar userType="client" />
      <div className="flex flex-col">
        <DashboardHeader userType="client" />
        <main className="flex-1 p-6">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-bold">Mis Coaches</h1>
              <p className="text-muted-foreground">Explora tus coaches actuales y su información detallada.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
              <CoachesList />
              <CoachDetail />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
