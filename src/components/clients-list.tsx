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
import { formatDate, formatTime } from "@/utils/validatesInputs"

// Definir tipos (importar si están en archivo compartido)
interface Goal {
  _id: string;
  description: string;
  isCompleted: boolean;
  day: string;
}

interface UpcomingSession {
  _id: string;
  date: Date;
  link: string;
  objectiveId: string;
}

interface NextSession {
  _id: string;
  date: Date;
  link: string;
  objectiveId: string;
}

interface Note {
  _id: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

interface Client {
  _id: string;
  name: string;
  email: string;
  phone: string;
  startDate: string;
  sessions: number;
  nextSession: NextSession | {};
  lastSession: NextSession | {};
  progress: number;
  status: "active" | "pending" | "inactive";
  focus: string;
  avatar: string;
  bio: string;
  goals: Goal[];
  upcomingSessions: UpcomingSession[];
  notes: Note[];
  activeObjectiveId: string | null;
}

// Definir props para ClientsList
interface ClientsListProps {
  clients: Client[];
  onClientSelect: (clientId: string) => void;
}

export function ClientsList({ clients, onClientSelect }: ClientsListProps) { // Recibir props
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(0)

  // Filtrar clientes basado en la búsqueda y el filtro de estado, usando la prop 'clients'
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.focus.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || client.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Resetear página si el filtro cambia y la página actual queda vacía
  if (currentPage * 5 >= filteredClients.length && currentPage > 0) {
    setCurrentPage(0);
  }

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
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(0); // Reset page on search
              }}
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
              <DropdownMenuItem className="bg-accent-hover" onClick={() => { setStatusFilter("all"); setCurrentPage(0); }}>Todos</DropdownMenuItem>
              <DropdownMenuItem className="bg-accent-hover" onClick={() => { setStatusFilter("active"); setCurrentPage(0); }}>Activos</DropdownMenuItem>
              <DropdownMenuItem className="bg-accent-hover" onClick={() => { setStatusFilter("pending"); setCurrentPage(0); }}>Pendientes</DropdownMenuItem>
              <DropdownMenuItem className="bg-accent-hover" onClick={() => { setStatusFilter("inactive"); setCurrentPage(0); }}>Inactivos</DropdownMenuItem>
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
              {filteredClients.length > 0 ? (
                filteredClients.slice(currentPage * 5, (currentPage + 1) * 5).map((client) => (
                  <TableRow
                    key={client._id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onClientSelect(client._id)}
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
                    <TableCell>
                      {Object.keys(client.nextSession).length > 0 
                        ? `${formatDate(new Date((client.nextSession as NextSession).date))} - ${formatTime(new Date((client.nextSession as NextSession).date), { hour: '2-digit', minute: '2-digit' })}`
                        : 'Por programar'
                      }
                    </TableCell>
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
                          <Button variant="text" size="icon" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Abrir menú</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-accent" align="end">
                          <DropdownMenuLabel>Acciones Rápidas</DropdownMenuLabel>
                          <DropdownMenuItem className="bg-accent-hover" onClick={(e) => { e.stopPropagation(); console.log("Programar", client._id); }}>
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>Programar sesión</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="bg-accent-hover" onClick={(e) => { e.stopPropagation(); console.log("Mensaje", client._id); }}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            <span>Enviar mensaje</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="bg-accent-hover" onClick={(e) => { e.stopPropagation(); console.log("PDA", client._id); }}>
                            <FileText className="mr-2 h-4 w-4" />
                            <span>Ver PDA</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No se encontraron clientes.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {filteredClients.length > 5 && (
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
        )}
      </CardContent>
    </Card>
  )
}
