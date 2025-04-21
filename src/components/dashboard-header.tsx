import Link from "next/link"
import { Button } from "@mui/material"
import { Bell, Menu, MessageSquare, Search, UserCircle } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { DashboardSidebar } from "./dashboard-sidebar"

interface HeaderProps {
  userType: "client" | "coach" | "admin"
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
          <SheetContent side="left" className="w-64 p-0 bg-white">
            <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
            <DashboardSidebar userType={userType} />
          </SheetContent>
        </Sheet>
      </div>
      <div className="w-full flex-1">
        <form className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar..."
            className="w-full rounded-lg border border-input bg-background pl-8 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:w-2/5 lg:w-1/3"
          />
        </form>
      </div>
      <div className="flex items-center gap-2">
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
