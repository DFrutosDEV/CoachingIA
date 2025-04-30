"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, MoreVertical, Calendar, MessageSquare, FileText, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

// Datos de ejemplo para los clientes
const clientsData = [
  {
    id: "1",
    name: "Carlos Rodríguez",
    email: "carlos.rodriguez@ejemplo.com",
    phone: "+34 612 345 678",
    startDate: "15/01/2023",
    sessions: 12,
    nextSession: "Hoy, 15:00",
    progress: 75,
    status: "active",
    plan: "Profesional",
    focus: "Desarrollo personal",
    avatar: "https://unavatar.io/1",
  },
  {
    id: "2",
    name: "Laura Gómez",
    email: "laura.gomez@ejemplo.com",
    phone: "+34 623 456 789",
    startDate: "03/03/2023",
    sessions: 8,
    nextSession: "Mañana, 10:30",
    progress: 60,
    status: "active",
    plan: "Profesional",
    focus: "Gestión del estrés",
    avatar: "https://unavatar.io/2",
  },
  {
    id: "3",
    name: "Miguel Torres",
    email: "miguel.torres@ejemplo.com",
    phone: "+34 634 567 890",
    startDate: "22/04/2023",
    sessions: 5,
    nextSession: "Viernes, 16:00",
    progress: 40,
    status: "active",
    plan: "Básico",
    focus: "Productividad",
    avatar: "https://unavatar.io/3",
  },
  {
    id: "4",
    name: "Ana Martínez",
    email: "ana.martinez@ejemplo.com",
    phone: "+34 645 678 901",
    startDate: "10/05/2023",
    sessions: 3,
    nextSession: "Lunes, 11:00",
    progress: 25,
    status: "active",
    plan: "Empresas",
    focus: "Liderazgo",
    avatar: "https://unavatar.io/4",
  },
  {
    id: "5",
    name: "Pedro Sánchez",
    email: "pedro.sanchez@ejemplo.com",
    phone: "+34 656 789 012",
    startDate: "05/06/2023",
    sessions: 2,
    nextSession: "Martes, 17:30",
    progress: 15,
    status: "pending",
    plan: "Básico",
    focus: "Comunicación",
    avatar: "https://unavatar.io/5",
  },
  {
    id: "6",
    name: "Elena Castro",
    email: "elena.castro@ejemplo.com",
    phone: "+34 667 890 123",
    startDate: "20/02/2023",
    sessions: 9,
    nextSession: "Jueves, 09:00",
    progress: 65,
    status: "active",
    plan: "Profesional",
    focus: "Equilibrio vida-trabajo",
    avatar: "https://unavatar.io/6",
  },
  {
    id: "7",
    name: "Javier Moreno",
    email: "javier.moreno@ejemplo.com",
    phone: "+34 678 901 234",
    startDate: "12/03/2023",
    sessions: 7,
    nextSession: "Miércoles, 18:00",
    progress: 50,
    status: "inactive",
    plan: "Básico",
    focus: "Desarrollo profesional",
    avatar: "https://unavatar.io/7",
  },
]

export function ClientsList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(0)
  const [selectedClient, setSelectedClient] = useState<string | null>(null)

  // Filtrar clientes basado en la búsqueda y el filtro de estado
  const filteredClients = clientsData.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.focus.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || client.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Lista de Clientes</CardTitle>
        <CardDescription>Gestiona tus clientes y su información</CardDescription>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nombre, email o enfoque..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1">
                <Filter className="h-4 w-4" />
                Filtrar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-accent" align="end">
              <DropdownMenuLabel>Estado</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>Todos</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("active")}>Activos</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Pendientes</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>Inactivos</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Próxima Sesión</TableHead>
                <TableHead>Progreso</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.slice(currentPage * 5, (currentPage + 1) * 5).map((client) => (
                <TableRow
                  key={client.id}
                  className={selectedClient === client.id ? "bg-muted/50" : ""}
                  onClick={() => setSelectedClient(client.id)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Image
                        src={client.avatar || "/placeholder.svg"}
                        alt={client.name}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-xs text-muted-foreground">{client.focus}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        client.status === "active" ? "active" : client.status === "pending" ? "pending" : "inactive"
                      }
                    >
                      {client.status === "active" ? "Activo" : client.status === "pending" ? "Pendiente" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>{client.nextSession}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${client.progress}%` }}></div>
                      </div>
                      <span className="text-xs">{client.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Abrir menú</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>Programar sesión</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          <span>Enviar mensaje</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          <span>Ver notas</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {currentPage * 5 + 1} a {Math.min((currentPage + 1) * 5, filteredClients.length)} de {filteredClients.length} clientes
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 0}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={(currentPage + 1) * 5 >= filteredClients.length}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
