"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ServicesGrid } from "@/components/services-grid-coachs"
import { Users, TrendingUp, UserCheck, UserX } from "lucide-react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CoachStats {
  total: number;
  active: number;
  inactive: number;
  newCoaches: number;
  totalClients: number;
  averageClientsPerCoach: number;
}

export default function CoachsPage() {
  const [stats, setStats] = useState<CoachStats>({
    total: 0,
    active: 0,
    inactive: 0,
    newCoaches: 0,
    totalClients: 0,
    averageClientsPerCoach: 0
  });

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/coaches/stats');
      const data = await response.json();
      
      if (response.ok && data.data) {
        setStats({
          total: data.data.total,
          active: data.data.active,
          inactive: data.data.inactive,
          newCoaches: data.data.newCoaches,
          totalClients: data.data.totalClients,
          averageClientsPerCoach: data.data.averageClientsPerCoach
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="grid h-screen w-full md:grid-cols-[auto_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <DashboardSidebar userType="admin" className="h-full" />
      </div>
      <div className="flex flex-col overflow-hidden">
        <DashboardHeader userType="admin" />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-y-auto">
          <div className="flex items-center gap-4">
            <Users className="h-6 w-6" />
            <h1 className="text-lg font-semibold md:text-2xl">Coaches</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Gestiona y supervisa a los coaches registrados en la plataforma.
          </p>
          
          {/* Estadísticas */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Coaches</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  Coaches registrados
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Coaches Activos</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                <p className="text-xs text-muted-foreground">
                  Activos en la plataforma
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Coaches Inactivos</CardTitle>
                <UserX className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.inactive}</div>
                <p className="text-xs text-muted-foreground">
                  Inactivos temporalmente
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nuevos Coaches</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.newCoaches}</div>
                <p className="text-xs text-muted-foreground">
                  Registrados recientemente
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.totalClients}</div>
                <p className="text-xs text-muted-foreground">
                  Promedio: {stats.averageClientsPerCoach} por coach
                </p>
              </CardContent>
            </Card>
          </div>
          
          <ServicesGrid />
        </main>
      </div>
    </div>
  )
}
