import Link from "next/link"
import { Button } from "@mui/material"
import { Bell, Menu, UserCircle } from "lucide-react"

interface HeaderProps {
  userType: "client" | "coach" | "admin" | "enterprise"
}

export function DashboardHeader({ userType }: HeaderProps) {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <div className="md:hidden">
        <Button variant="text">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <Button variant="text">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notificaciones</span>
        </Button>
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
