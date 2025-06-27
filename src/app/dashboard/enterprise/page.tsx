'use client'

import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { useEffect, useRef, useState } from "react"
import { createSwapy } from "swapy"
import {
  TotalClientsCard,
  ActiveCoachesCard,
  CompletedSessionsCard,
  ReportsCard,
  NewUsersCard,
  CompanyPerformanceCard
} from "@/components/ui/dashboard-cards-enterprise"

export default function EnterpriseDashboard() {
  const [isReady, setIsReady] = useState(false)
  
  // Referencias para los contenedores
  const smallCardsRef = useRef<HTMLDivElement>(null)
  const largeCardsRef = useRef<HTMLDivElement>(null)
  const swapySmallRef = useRef<any>(null)
  const swapyLargeRef = useRef<any>(null)

  useEffect(() => {
    // Marcar como listo después de que el componente se monte
    const timer = setTimeout(() => {
      setIsReady(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Solo inicializar swapy cuando esté listo
    if (!isReady) return

    // Configurar swapy después de que el DOM esté listo
    const timer = setTimeout(() => {
      // Configurar swapy para las cards pequeñas
      if (smallCardsRef.current && !swapySmallRef.current) {
        try {
          swapySmallRef.current = createSwapy(smallCardsRef.current, {
            animation: 'dynamic'
          })
          
          swapySmallRef.current.onSwap((event: any) => {
            console.log('Enterprise small cards swapped:', event.newSlotItemMap.asObject)
            localStorage.setItem('enterpriseSmallCardsLayout', JSON.stringify(event.newSlotItemMap.asObject))
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
            console.log('Enterprise large cards swapped:', event.newSlotItemMap.asObject)
            localStorage.setItem('enterpriseLargeCardsLayout', JSON.stringify(event.newSlotItemMap.asObject))
          })
        } catch (error) {
          console.warn('Error inicializando swapy para cards grandes:', error)
        }
      }
    }, 100)

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
  }, [isReady])

  return (
    <div className="grid h-screen w-full md:grid-cols-[auto_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <DashboardSidebar userType="enterprise" className="h-full" />
      </div>
      <div className="flex flex-col overflow-hidden">
        <DashboardHeader userType="enterprise" />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-y-auto">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-bold">Panel de Empresa</h1>
              <p className="text-muted-foreground">
                Gestiona usuarios, coaches y analiza el rendimiento de tu Empresa.
              </p>
            </div>

            {/* Zona de drag and drop para cards pequeñas (4 cards arriba - 25% cada una) */}
            <div ref={smallCardsRef} className="small-cards-container grid gap-6 md:grid-cols-4">
              <div data-swapy-slot="1" className="w-full">
                <TotalClientsCard />
              </div>
              <div data-swapy-slot="2" className="w-full">
                <ActiveCoachesCard />
              </div>
              <div data-swapy-slot="3" className="w-full">
                <CompletedSessionsCard />
              </div>
              <div data-swapy-slot="4" className="w-full">
                <ReportsCard />
              </div>
            </div>

            {/* Zona de drag and drop para cards grandes (2 cards abajo - 50% cada una) */}
            <div ref={largeCardsRef} className="large-cards-container grid gap-6 md:grid-cols-2">
              <div data-swapy-slot="5" className="w-full">
                <NewUsersCard />
              </div>
              <div data-swapy-slot="6" className="w-full">
                <CompanyPerformanceCard />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
