"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useEffect, useRef } from "react"
import { createSwapy } from "swapy"
import {
  NextSessionCard,
  ActiveClientsCard,
  ScheduledSessionsCard,
  TodaySessionsCard,
  RecentClientsCard
} from "@/components/ui/dashboard-cards-coach"

export default function CoachDashboard() {
  const { user } = useAuthStore()
  
  // Referencias para los contenedores
  const smallCardsRef = useRef<HTMLDivElement>(null)
  const largeCardsRef = useRef<HTMLDivElement>(null)
  const swapySmallRef = useRef<any>(null)
  const swapyLargeRef = useRef<any>(null)

  useEffect(() => {
    // Configurar swapy después de que el DOM esté listo
    const timer = setTimeout(() => {
      // Configurar swapy para las cards pequeñas
      if (smallCardsRef.current && !swapySmallRef.current) {
        try {
          swapySmallRef.current = createSwapy(smallCardsRef.current, {
            animation: 'dynamic'
          })
          
          swapySmallRef.current.onSwap((event: any) => {
            console.log('Coach small cards swapped:', event.newSlotItemMap.asObject)
            localStorage.setItem('coachSmallCardsLayout', JSON.stringify(event.newSlotItemMap.asObject))
          })
        } catch (error) {
          console.warn('Error inicializando swapy para cards pequeñas:', error)
        }
      }

      // Configurar swapy para las cards grandes
      if (largeCardsRef.current && !swapyLargeRef.current) {
        try {
          swapyLargeRef.current = createSwapy(largeCardsRef.current, {
            animation: 'dynamic'
          })
          
          swapyLargeRef.current.onSwap((event: any) => {
            console.log('Coach large cards swapped:', event.newSlotItemMap.asObject)
            localStorage.setItem('coachLargeCardsLayout', JSON.stringify(event.newSlotItemMap.asObject))
          })
        } catch (error) {
          console.warn('Error inicializando swapy para cards grandes:', error)
        }
      }
    }, 500)

    return () => {
      clearTimeout(timer)
      // Limpiar swapy al desmontar
      if (swapySmallRef.current) {
        try {
          swapySmallRef.current.destroy?.()
        } catch (error) {
          console.warn('Error destruyendo swapy pequeño:', error)
        }
        swapySmallRef.current = null
      }
      if (swapyLargeRef.current) {
        try {
          swapyLargeRef.current.destroy?.()
        } catch (error) {
          console.warn('Error destruyendo swapy grande:', error)
        }
        swapyLargeRef.current = null
      }
    }
  }, [])

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
              <h1 className="text-4xl font-bold">Bienvenido, {user?.name} {user?.lastName}</h1>
              <p className="text-muted-foreground pt-2">Aquí tienes un resumen de tus sesiones y clientes.</p>
            </div>

            {/* Zona de drag and drop para cards pequeñas (3 cards arriba - 33.33% cada una) */}
            <div ref={smallCardsRef} className="small-cards-container grid gap-6 md:grid-cols-3">
              <div data-swapy-slot="1" className="w-full">
                <NextSessionCard />
              </div>
              <div data-swapy-slot="2" className="w-full">
                <ActiveClientsCard />
              </div>
              <div data-swapy-slot="3" className="w-full">
                <ScheduledSessionsCard />
              </div>
            </div>

            {/* Zona de drag and drop para cards grandes (2 cards abajo - 50% cada una) */}
            <div ref={largeCardsRef} className="large-cards-container grid gap-6 md:grid-cols-2">
              <div data-swapy-slot="4" className="w-full">
                <TodaySessionsCard />
              </div>
              <div data-swapy-slot="5" className="w-full">
                <RecentClientsCard />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
