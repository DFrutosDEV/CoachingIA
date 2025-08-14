"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ServicesGrid } from "@/components/services-grid-enterprises"
import { Building2, TrendingUp, CheckCircle, XCircle, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface EnterpriseStats {
  total: number;
  active: number;
  inactive: number;
  newEnterprises: number;
  totalEmployees: number;
  averageEmployeesPerEnterprise: number;
}

export default function EnterprisesPage() {
  const [stats, setStats] = useState<EnterpriseStats>({
    total: 0,
    active: 0,
    inactive: 0,
    newEnterprises: 0,
    totalEmployees: 0,
    averageEmployeesPerEnterprise: 0
  });

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/enterprises/stats');
      const data = await response.json();
      
      if (response.ok && data.data) {
        setStats({
          total: data.data.total,
          active: data.data.active,
          inactive: data.data.inactive,
          newEnterprises: data.data.newEnterprises,
          totalEmployees: data.data.totalEmployees,
          averageEmployeesPerEnterprise: data.data.averageEmployeesPerEnterprise
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
            <Building2 className="h-6 w-6" />
            <h1 className="text-lg font-semibold md:text-2xl">Empresas</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Gestiona y supervisa a las empresas registradas en la plataforma.
          </p>
          
          {/* Estadísticas */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Empresas</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  Empresas registradas
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Empresas Activas</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                <p className="text-xs text-muted-foreground">
                  Activas en la plataforma
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Empresas Inactivas</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.inactive}</div>
                <p className="text-xs text-muted-foreground">
                  Inactivas temporalmente
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nuevas Empresas</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.newEnterprises}</div>
                <p className="text-xs text-muted-foreground">
                  Registradas recientemente
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Empleados</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.totalEmployees}</div>
                <p className="text-xs text-muted-foreground">
                  Promedio: {stats.averageEmployeesPerEnterprise} por empresa
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
