import Link from "next/link"
import { Button } from "@mui/material"
import { Bell, Menu, MessageSquare, Search, UserCircle } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { DashboardSidebar } from "./dashboard-sidebar"

interface HeaderProps {
  userType: "client" | "coach" | "admin" | "enterprise"
}

export function DashboardHeader({ userType }: HeaderProps) {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="text">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
            <DashboardSidebar userType={userType} />
          </SheetContent>
        </Sheet>
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <Button variant="text">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notificaciones</span>
        </Button>
        {/* <Button variant="text">
          <MessageSquare className="h-5 w-5" />
          <span className="sr-only">Mensajes</span>
        </Button> */}
        <Link href={`/dashboard/${userType}/profile`}>
          <Button variant="text" className="rounded-full">
            <UserCircle className="h-6 w-6" />
            <span className="sr-only">Perfil</span>
          </Button>
        </Link>
      </div>
    </header>
  )
}
