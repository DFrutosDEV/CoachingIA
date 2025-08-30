"use client"

import Link from "next/link"
import { Button } from "@mui/material"
import { Menu, UserCircle } from "lucide-react"
import { NotificationsModal } from "@/components/ui/notifications-modal"
import { useState } from "react"

interface HeaderProps {
  userType: "client" | "coach" | "admin" | "enterprise"
  onToggleSidebar?: () => void
}

export function DashboardHeader({ userType, onToggleSidebar }: HeaderProps) {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <div className="md:hidden">
        <Button 
          variant="text" 
          onClick={onToggleSidebar}
          className="p-2"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <NotificationsModal userType={userType} />
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
