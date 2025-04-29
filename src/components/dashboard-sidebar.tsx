import Link from "next/link"
import { Button } from "@mui/material"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Home, Users, Calendar, Building, FileText, Settings, BarChart, LogOut, UserCircle } from "lucide-react"

interface SidebarProps {
  userType: "client" | "coach" | "admin" | "enterprise"
  className?: string
}

export function DashboardSidebar({ userType, className = "" }: SidebarProps) {
  return (
    <div className={`border-r bg-muted/40 ${className}`}>
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 min-h-15">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="text-primary font-bold">CoachingIA</span>
          </Link>
        </div>
        <ScrollArea className="flex-1 px-2">
          <div className="flex flex-col gap-1 py-2">
            <Link href={`/dashboard/${userType}`} passHref>
              <Button variant="text" className="w-full justify-start gap-2" sx={{ justifyContent: "flex-start" }}>
                <Home className="h-4 w-4" />
                Inicio
              </Button>
            </Link>

            {userType === "client" && (
              <>
                <Link href={`/dashboard/${userType}/coaches`} passHref>
                  <Button variant="text" className="w-full justify-start gap-2" sx={{ justifyContent: "flex-start" }}>
                    <Users className="h-4 w-4" />
                    Mis Servicios
                  </Button>
                </Link>
                <Link href={`/dashboard/${userType}/sessions`} passHref>
                  <Button variant="text" className="w-full justify-start gap-2" sx={{ justifyContent: "flex-start" }}>
                    <Calendar className="h-4 w-4" />
                    Próximas Sesiones
                  </Button>
                </Link>
                <Link href={`/dashboard/${userType}/progress`} passHref>
                  <Button variant="text" className="w-full justify-start gap-2" sx={{ justifyContent: "flex-start" }}>
                    <BarChart className="h-4 w-4" />
                    En qué estoy trabajando
                  </Button>
                </Link>
                <Link href={`/dashboard/${userType}/resources`} passHref>
                  <Button variant="text" className="w-full justify-start gap-2" sx={{ justifyContent: "flex-start" }}>
                    <FileText className="h-4 w-4" />
                    Recursos
                  </Button>
                </Link>
              </>
            )}

            {userType === "coach" && (
              <>
                <Link href={`/dashboard/${userType}/clients`} passHref>
                  <Button variant="text" className="w-full justify-start gap-2" sx={{ justifyContent: "flex-start" }}>
                    <Users className="h-4 w-4" />
                    Mis Clientes
                  </Button>
                </Link>
                <Link href={`/dashboard/${userType}/sessions`} passHref>
                  <Button variant="text" className="w-full justify-start gap-2" sx={{ justifyContent: "flex-start" }}>
                    <Calendar className="h-4 w-4" />
                    Sesiones
                  </Button>
                </Link>
                <Link href={`/dashboard/${userType}/resources`} passHref>
                  <Button variant="text" className="w-full justify-start gap-2" sx={{ justifyContent: "flex-start" }}>
                    <FileText className="h-4 w-4" />
                    Recursos
                  </Button>
                </Link>
              </>
            )}

            {userType === "admin" && (
              <>
                <Link href={`/dashboard/${userType}/users`} passHref>
                  <Button variant="text" className="w-full justify-start gap-2" sx={{ justifyContent: "flex-start" }}>
                    <Users className="h-4 w-4" />
                    Usuarios
                  </Button>
                </Link>
                <Link href={`/dashboard/${userType}/coaches`} passHref>
                  <Button variant="text" className="w-full justify-start gap-2" sx={{ justifyContent: "flex-start" }}>
                    <UserCircle className="h-4 w-4" />
                    Coaches
                  </Button>
                </Link>
                <Link href={`/dashboard/${userType}/enterprises`} passHref>
                  <Button variant="text" className="w-full justify-start gap-2" sx={{ justifyContent: "flex-start" }}>
                    <Building className="h-4 w-4" />
                    Empresas
                  </Button>
                </Link>
                <Link href={`/dashboard/${userType}/analytics`} passHref>
                  <Button variant="text" className="w-full justify-start gap-2" sx={{ justifyContent: "flex-start" }}>
                    <BarChart className="h-4 w-4" />
                    Analíticas
                  </Button>
                </Link>
                <Link href={`/dashboard/${userType}/reports`} passHref>
                  <Button variant="text" className="w-full justify-start gap-2" sx={{ justifyContent: "flex-start" }}>
                    <FileText className="h-4 w-4" />
                    Reportes
                  </Button>
                </Link>
              </>
            )}

            {userType === "enterprise" && (
              <>
                <Link href={`/dashboard/${userType}/users`} passHref>
                  <Button variant="text" className="w-full justify-start gap-2" sx={{ justifyContent: "flex-start" }}>
                    <Users className="h-4 w-4" />
                    Mis Clientes
                  </Button>
                </Link>
                <Link href={`/dashboard/${userType}/coaches`} passHref>
                  <Button variant="text" className="w-full justify-start gap-2" sx={{ justifyContent: "flex-start" }}>
                    <UserCircle className="h-4 w-4" />
                    Mis Coaches
                  </Button>
                </Link>
                <Link href={`/dashboard/${userType}/analytics`} passHref>
                  <Button variant="text" className="w-full justify-start gap-2" sx={{ justifyContent: "flex-start" }}>
                    <BarChart className="h-4 w-4" />
                    Analíticas
                  </Button>
                </Link>
                <Link href={`/dashboard/${userType}/reports`} passHref>
                  <Button variant="text" className="w-full justify-start gap-2" sx={{ justifyContent: "flex-start" }}>
                    <FileText className="h-4 w-4" />
                    Reportes
                  </Button>
                </Link>
              </>
            )}

            <Link href={`/dashboard/${userType}/settings`} passHref>
              <Button variant="text" className="w-full justify-start gap-2" sx={{ justifyContent: "flex-start" }}>
                <Settings className="h-4 w-4" />
                Configuración
              </Button>
            </Link>
          </div>
        </ScrollArea>
        <div className="p-4">
          <Link href="/login">
            <Button variant="text" className="w-full justify-start gap-2" sx={{ justifyContent: "flex-start" }}>
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
