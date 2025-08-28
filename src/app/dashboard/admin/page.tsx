'use client'

import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { useAppSelector } from "@/lib/redux/hooks"
import { useEffect, useRef, useState } from "react"
import { createSwapy } from "swapy"
import {
  TotalUsersCard,
  ActiveCoachesCard,
  CompletedSessionsCard,
  ReportsCard,
  NewUsersCard,
  PlatformPerformanceCard
} from "@/components/ui/dashboard-cards-admin"
import { HttpClient } from "@/lib/utils/http-client"
import { Button } from "@/components/ui/button"
import { Move, X } from "lucide-react"

// Interfaces para los datos
interface AdminBasicData {
  totalUsers: number;
  newUsersThisMonth: number;
  activeCoaches: number;
  newCoachesThisMonth: number;
  completedSessions: number;
  completedSessionsThisMonth: number;
  recentUsers: Array<{
    name: string;
    email: string;
    type: string;
    date: string;
  }>;
  platformStats: {
    conversionRate: { value: string; change: string; positive: boolean };
    avgSessionsPerUser: { value: string; change: string; positive: boolean };
    avgSessionTime: { value: string; change: string; positive: boolean };
    churnRate: { value: string; change: string; positive: boolean };
    monthlyRevenue: { value: string; change: string; positive: boolean };
  };
  pendingReports: number;
}

export default function AdminDashboard() {
  const user = useAppSelector(state => state.auth.user)
  const [basicData, setBasicData] = useState<AdminBasicData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [dragEnabled, setDragEnabled] = useState(false)
  
  // Referencias para los contenedores
  const smallCardsRef = useRef<HTMLDivElement>(null)
  const largeCardsRef = useRef<HTMLDivElement>(null)
  const swapySmallRef = useRef<any>(null)
  const swapyLargeRef = useRef<any>(null)

  // Función para obtener los datos básicos
  const fetchBasicData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await HttpClient.get(`/api/admin/getBasicData?adminId=${user?._id}`)
      
      if (!response.ok) {
        throw new Error('Error al obtener los datos del dashboard')
      }
      
      const result = await response.json()
      
      if (result.success) {
        setBasicData(result.data)
      } else {
        throw new Error(result.error || 'Error desconocido')
      }
    } catch (err) {
      console.error('Error fetching basic data:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?._id) {
      fetchBasicData()
    } else {
      setError('No se encontró información del usuario')
      setLoading(false)
    }
  }, [user?._id])

  useEffect(() => {
    // Marcar como listo después de que el componente se monte
    const timer = setTimeout(() => {
      setIsReady(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Marcar como listo después de que el componente se monte
    const timer = setTimeout(() => {
      setIsReady(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // Función para alternar el estado del drag-and-drop
  const toggleDragMode = () => {
    setDragEnabled(!dragEnabled)
  }

  useEffect(() => {
    // Solo inicializar swapy cuando esté listo y el drag esté habilitado
    if (!isReady || !dragEnabled) return

    // Configurar swapy después de que el DOM esté listo
    const timer = setTimeout(() => {
      // Configurar swapy para las cards pequeñas
      if (smallCardsRef.current && !swapySmallRef.current) {
        try {
          swapySmallRef.current = createSwapy(smallCardsRef.current, {
            animation: 'dynamic'
          })
          
          swapySmallRef.current.onSwap((event: any) => {
            console.log('Admin small cards swapped:', event.newSlotItemMap.asObject)
            localStorage.setItem('adminSmallCardsLayout', JSON.stringify(event.newSlotItemMap.asObject))
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
            console.log('Admin large cards swapped:', event.newSlotItemMap.asObject)
            localStorage.setItem('adminLargeCardsLayout', JSON.stringify(event.newSlotItemMap.asObject))
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
  }, [isReady, dragEnabled])

  if (loading) {
    return (
      <div className="grid h-screen w-full md:grid-cols-[auto_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
          <DashboardSidebar userType="admin" className="h-full" />
        </div>
        <div className="flex flex-col overflow-hidden">
          <DashboardHeader userType="admin" />
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-y-auto">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Cargando datos del dashboard...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid h-screen w-full md:grid-cols-[auto_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
          <DashboardSidebar userType="admin" className="h-full" />
        </div>
        <div className="flex flex-col overflow-hidden">
          <DashboardHeader userType="admin" />
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-y-auto">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-red-500 mb-4">Error: {error}</p>
                <button 
                  onClick={fetchBasicData}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="grid h-screen w-full md:grid-cols-[auto_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <DashboardSidebar userType="admin" className="h-full" />
      </div>
      <div className="flex flex-col overflow-hidden">
        <DashboardHeader userType="admin" />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-y-auto">
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold">Bienvenido, {user?.profile?.name} {user?.profile?.lastName}</h1>
                  <p className="text-muted-foreground pt-2">Gestiona usuarios, coaches y analiza el rendimiento de la plataforma.</p>
                </div>
                <Button
                  onClick={toggleDragMode}
                  variant={dragEnabled ? "secondary" : "outline"}
                  size="sm"
                  className={`flex items-center gap-2 ${dragEnabled ? 'bg-red-500 hover:bg-red-600 text-white' : ''}`}
                >
                  {dragEnabled ? (
                    <>
                      <X className="h-4 w-4" />
                      Desactivar Drag
                    </>
                  ) : (
                    <>
                      <Move className="h-4 w-4" />
                      Activar Drag
                    </>
                  )}
                </Button>
              </div>
              {dragEnabled && (
                <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-md">
                  <p className="text-sm text-blue-700">
                    ✨ Modo de reorganización activado - Puedes arrastrar las cards para reorganizarlas
                  </p>
                </div>
              )}
            </div>

            {/* Zona de drag and drop para cards pequeñas (4 cards arriba - 25% cada una) */}
            <div ref={smallCardsRef} className="small-cards-container grid gap-6 md:grid-cols-4">
              <div data-swapy-slot="1" className="w-full">
                <TotalUsersCard 
                  totalUsers={basicData?.totalUsers || 0}
                  newUsersThisMonth={basicData?.newUsersThisMonth || 0}
                />
              </div>
              <div data-swapy-slot="2" className="w-full">
                <ActiveCoachesCard 
                  activeCoaches={basicData?.activeCoaches || 0}
                  newCoachesThisMonth={basicData?.newCoachesThisMonth || 0}
                />
              </div>
              <div data-swapy-slot="3" className="w-full">
                <CompletedSessionsCard 
                  completedSessions={basicData?.completedSessions || 0}
                  completedSessionsThisMonth={basicData?.completedSessionsThisMonth || 0}
                />
              </div>
              <div data-swapy-slot="4" className="w-full">
                <ReportsCard 
                  pendingReports={basicData?.pendingReports || 0}
                />
              </div>
            </div>

            {/* Zona de drag and drop para cards grandes (2 cards abajo - 50% cada una) */}
            <div ref={largeCardsRef} className="large-cards-container grid gap-6 md:grid-cols-2">
              <div data-swapy-slot="5" className="w-full">
                <NewUsersCard 
                  recentUsers={basicData?.recentUsers || []}
                />
              </div>
              <div data-swapy-slot="6" className="w-full">
                <PlatformPerformanceCard 
                  platformStats={basicData?.platformStats}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
