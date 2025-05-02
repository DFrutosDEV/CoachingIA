import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import ClientProgress from "@/components/client-progress"

const ejemploObjetivos = [
  { id: 1, name: 'Completar el módulo de bienvenida', progress: 100 },
  { id: 2, name: 'Establecer metas SMART', progress: 65 },
  { id: 3, name: 'Realizar primera sesión de seguimiento', progress: 20 },
  { id: 4, name: 'Leer artículo sobre gestión del tiempo', progress: 80 },
];

const ejemploNotas = [
  { id: 1, content: 'Primera sesión de seguimiento exitosa', timestamp: new Date() },
  { id: 2, content: 'Reunión con el coach para revisar objetivos', timestamp: new Date() },
];

export default function ResourcesPage() {
  return (
    <div className="grid h-screen w-full md:grid-cols-[auto_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <DashboardSidebar userType="client" className="h-full" />
      </div>
      <div className="flex flex-col overflow-hidden">
        <DashboardHeader userType="client" />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-y-auto">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-bold">Progreso</h1>
              <p className="text-muted-foreground">Progreso de tus objetivos y notas del coach.</p>
            </div>
            <ClientProgress objectives={ejemploObjetivos} />
          </div>
        </main>
      </div>
    </div>
  )
}
