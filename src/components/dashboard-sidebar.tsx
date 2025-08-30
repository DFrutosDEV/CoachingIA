"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Home, Users, Calendar, Building, FileText, Settings, BarChart, LogOut, UserCircle, File, BookOpenCheck, X } from "lucide-react"
import { useAuthService } from "@/lib/services/auth-service"

interface SidebarProps {
  userType: "client" | "coach" | "admin" | "enterprise"
  className?: string
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export function DashboardSidebar({ userType, className = "", isMobileOpen = false, onMobileClose }: SidebarProps) {
  const router = useRouter()
  const { logout } = useAuthService()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
  }

  const handleLogout = async () => {
    try {
      await logout()
      setShowLogoutModal(false)
      router.push('/login')
    } catch (error) {
      console.error('Error durante logout:', error)
    }
  }

  const handleCancelLogout = () => {
    setShowLogoutModal(false)
  }

  const handleLinkClick = () => {
    // Cerrar el sidebar móvil cuando se hace clic en un enlace
    if (onMobileClose) {
      onMobileClose()
    }
  }

  const sidebarContent = (
    <div className={`border-r bg-muted/40 ${className}`}>
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 min-h-15 justify-between">
          <Link href={`/dashboard/${userType}`} className="flex items-center gap-2 font-semibold">
            <span className="text-primary font-bold">CoachingIA</span>
          </Link>
          {/* Botón de cerrar para móvil */}
          {onMobileClose && (
            <Button
              variant="text"
              size="sm"
              onClick={onMobileClose}
              className="md:hidden p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <ScrollArea className="flex-1 px-2">
          <div className="flex flex-col gap-1 py-2">
            <Link href={`/dashboard/${userType}`} passHref onClick={handleLinkClick}>
              <Button variant="text" className="w-full justify-start gap-2">
                <Home className="h-4 w-4" />
                Inicio
              </Button>
            </Link>

            {userType === "client" && (
              <>
                <Link href={`/dashboard/${userType}/services`} passHref onClick={handleLinkClick}>
                  <Button variant="text" className="w-full justify-start gap-2">
                    <Users className="h-4 w-4" />
                    Mis Servicios
                  </Button>
                </Link>
                <Link href={`/dashboard/${userType}/calendar`} passHref onClick={handleLinkClick}>
                  <Button variant="text" className="w-full justify-start gap-2">
                    <Calendar className="h-4 w-4" />
                    Próximas Sesiones
                  </Button>
                </Link>
                <Link href={`/dashboard/${userType}/progress`} passHref onClick={handleLinkClick}>
                  <Button variant="text" className="w-full justify-start gap-2">
                    <BarChart className="h-4 w-4" />
                    En qué estoy trabajando
                  </Button>
                </Link>
                <Link href={`/dashboard/${userType}/tasks`} passHref onClick={handleLinkClick}>
                  <Button variant="text" className="w-full justify-start gap-2">
                    <BookOpenCheck className="h-4 w-4" />
                    Tareas a realizar
                  </Button>
                </Link>
                <Link href={`/dashboard/${userType}/resources`} passHref onClick={handleLinkClick}>
                  <Button variant="text" className="w-full justify-start gap-2">
                    <FileText className="h-4 w-4" />
                    Recursos
                  </Button>
                </Link>
              </>
            )}

            {userType === "coach" && (
              <>
                <Link href={`/dashboard/${userType}/clients`} passHref onClick={handleLinkClick}>
                  <Button variant="text" className="w-full justify-start gap-2">
                    <Users className="h-4 w-4" />
                    Mis Clientes
                  </Button>
                </Link>
                <Link href={`/dashboard/${userType}/calendar`} passHref onClick={handleLinkClick}>
                  <Button variant="text" className="w-full justify-start gap-2">
                    <Calendar className="h-4 w-4" />
                    Sesiones
                  </Button>
                </Link>
                <Link href={`/dashboard/${userType}/resources`} passHref onClick={handleLinkClick}>
                  <Button variant="text" className="w-full justify-start gap-2">
                    <FileText className="h-4 w-4" />
                    Recursos
                  </Button>
                </Link>
              </>
            )}

            {userType === "admin" && (
              <>
                <Link href={`/dashboard/${userType}/clients`} passHref onClick={handleLinkClick}>
                  <Button variant="text" className="w-full justify-start gap-2">
                    <Users className="h-4 w-4" />
                    Clientes
                  </Button>
                </Link>
                <Link href={`/dashboard/${userType}/coaches`} passHref onClick={handleLinkClick}>
                  <Button variant="text" className="w-full justify-start gap-2">
                    <UserCircle className="h-4 w-4" />
                    Coaches
                  </Button>
                </Link>
                <Link href={`/dashboard/${userType}/enterprises`} passHref onClick={handleLinkClick}>
                  <Button variant="text" className="w-full justify-start gap-2">
                    <Building className="h-4 w-4" />
                    Empresas
                  </Button>
                </Link>
                <Link href={`/dashboard/${userType}/analytics`} passHref onClick={handleLinkClick}>
                  <Button variant="text" className="w-full justify-start gap-2">
                    <BarChart className="h-4 w-4" />
                    Analíticas
                  </Button>
                </Link>
                <Link href={`/dashboard/${userType}/reports`} passHref onClick={handleLinkClick}>
                  <Button variant="text" className="w-full justify-start gap-2">
                    <File className="h-4 w-4" />
                    Reportes
                  </Button>
                </Link>
                <Link href={`/dashboard/${userType}/resources`} passHref onClick={handleLinkClick}>
                  <Button variant="text" className="w-full justify-start gap-2">
                    <FileText className="h-4 w-4" />
                    Recursos
                  </Button>
                </Link>
              </>
            )}

            {userType === "enterprise" && (
              <>
                <Link href={`/dashboard/${userType}/clients`} passHref onClick={handleLinkClick}>
                  <Button variant="text" className="w-full justify-start gap-2">
                    <Users className="h-4 w-4" />
                    Mis Clientes
                  </Button>
                </Link>
                <Link href={`/dashboard/${userType}/coaches`} passHref onClick={handleLinkClick}>
                  <Button variant="text" className="w-full justify-start gap-2">
                    <UserCircle className="h-4 w-4" />
                    Mis Coaches
                  </Button>
                </Link>
                <Link href={`/dashboard/${userType}/analytics`} passHref onClick={handleLinkClick}>
                  <Button variant="text" className="w-full justify-start gap-2">
                    <BarChart className="h-4 w-4" />
                    Analíticas
                  </Button>
                </Link>
                <Link href={`/dashboard/${userType}/reports`} passHref onClick={handleLinkClick}>
                  <Button variant="text" className="w-full justify-start gap-2">
                    <File className="h-4 w-4" />
                    Reportes
                  </Button>
                </Link>
                <Link href={`/dashboard/${userType}/resources`} passHref onClick={handleLinkClick}>
                  <Button variant="text" className="w-full justify-start gap-2">
                    <FileText className="h-4 w-4" />
                    Recursos
                  </Button>
                </Link>
              </>
            )}

            <Link href={`/dashboard/${userType}/settings`} passHref onClick={handleLinkClick}>
              <Button variant="text" className="w-full justify-start gap-2">
                <Settings className="h-4 w-4" />
                Configuración
              </Button>
            </Link>
          </div>
        </ScrollArea>
        <div className="p-2 pt-8">
          <Button 
            variant="text" 
            className="w-full justify-start gap-2"
            onClick={handleLogoutClick}
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {/* Modal de confirmación de logout */}
      <Dialog open={showLogoutModal} onOpenChange={setShowLogoutModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar cierre de sesión</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres cerrar sesión? Tendrás que volver a iniciar sesión para acceder a tu cuenta.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelLogout}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )

  // Renderizado condicional para móvil vs desktop
  if (onMobileClose) {
    // Versión móvil con overlay
    return (
      <>
        {/* Overlay para cerrar el sidebar */}
        {isMobileOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onMobileClose}
          />
        )}
        
        {/* Sidebar móvil */}
        <div 
          className={`fixed left-0 top-0 z-50 h-full w-64 transform transition-transform duration-300 ease-in-out md:hidden ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </div>
      </>
    )
  }

  // Versión desktop (sin cambios)
  return sidebarContent
}
