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
import { useAppSelector } from '@/lib/redux/hooks'

// Interfaces para los tipos de datos
interface DashboardData {
  totalClients: {
    count: number;
    changeText: string;
  };
  activeCoaches: {
    count: number;
    changeText: string;
  };
  completedSessions: {
    count: number;
    changeText: string;
  };
  reports: {
    count: number;
    changeText: string;
  };
  newUsers: {
    name: string;
    email: string;
    type: string;
    date: string;
  }[];
  performanceStats: {
    metric: string;
    value: string;
    change: string;
    positive: boolean;
  }[];
}

export default function EnterpriseDashboard() {
  const [isReady, setIsReady] = useState(false)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Redux para obtener el usuario logueado
  const user = useAppSelector(state => state.auth.user)
  
  // Referencias para los contenedores
  const smallCardsRef = useRef<HTMLDivElement>(null)
  const largeCardsRef = useRef<HTMLDivElement>(null)
  const swapySmallRef = useRef<any>(null)
  const swapyLargeRef = useRef<any>(null)

  // Función para cargar datos del dashboard
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/enterprise/dashboard?enterpriseId=${user?.enterprise?._id}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar los datos del dashboard')
      }
      
      const data = await response.json()
      setDashboardData(data)
      setError(null)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Error al cargar los datos del dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Marcar como listo después de que el componente se monte
    const timer = setTimeout(() => {
      setIsReady(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Cargar datos cuando el usuario esté disponible
    if (user?.enterprise?._id) {
      fetchDashboardData()
    } else {
      setError('No se encontró información de la empresa')
      setLoading(false)
    }
  }, [user])

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

            {/* Mostrar loading o error */}
            {loading && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Cargando datos del dashboard...</p>
              </div>
            )}
            
            {error && (
              <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
                <button 
                  onClick={fetchDashboardData}
                  className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Reintentar
                </button>
              </div>
            )}

            {/* Zona de drag and drop para cards pequeñas (4 cards arriba - 25% cada una) */}
            {dashboardData && !loading && !error && (
              <>
                <div ref={smallCardsRef} className="small-cards-container grid gap-6 md:grid-cols-4">
                  <div data-swapy-slot="1" className="w-full">
                    <TotalClientsCard data={dashboardData.totalClients} />
                  </div>
                  <div data-swapy-slot="2" className="w-full">
                    <ActiveCoachesCard data={dashboardData.activeCoaches} />
                  </div>
                  <div data-swapy-slot="3" className="w-full">
                    <CompletedSessionsCard data={dashboardData.completedSessions} />
                  </div>
                  <div data-swapy-slot="4" className="w-full">
                    <ReportsCard data={dashboardData.reports} />
                  </div>
                </div>

                {/* Zona de drag and drop para cards grandes (2 cards abajo - 50% cada una) */}
                <div ref={largeCardsRef} className="large-cards-container grid gap-6 md:grid-cols-2">
                  <div data-swapy-slot="5" className="w-full">
                    <NewUsersCard data={dashboardData.newUsers} />
                  </div>
                  <div data-swapy-slot="6" className="w-full">
                    <CompanyPerformanceCard data={dashboardData.performanceStats} />
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
