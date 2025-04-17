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
import { Search, Calendar, MessageSquare, Star, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Datos de ejemplo para los coaches
const coachesData = [
  {
    id: "1",
    name: "María González",
    email: "maria.gonzalez@ejemplo.com",
    phone: "+34 612 345 678",
    specialty: "Desarrollo personal",
    experience: "8 años",
    rating: 4.9,
    reviews: 124,
    nextSession: "Hoy, 15:00",
    status: "active",
    avatar: "https://via.placeholder.com/40",
    languages: ["Español", "Inglés"],
    price: "€80/sesión",
  },
  {
    id: "2",
    name: "Juan Pérez",
    email: "juan.perez@ejemplo.com",
    phone: "+34 623 456 789",
    specialty: "Gestión del estrés",
    experience: "5 años",
    rating: 4.7,
    reviews: 98,
    nextSession: "Mañana, 10:30",
    status: "active",
    avatar: "https://via.placeholder.com/40",
    languages: ["Español", "Francés"],
    price: "€75/sesión",
  },
  {
    id: "3",
    name: "Ana Martínez",
    email: "ana.martinez@ejemplo.com",
    phone: "+34 634 567 890",
    specialty: "Liderazgo",
    experience: "12 años",
    rating: 4.8,
    reviews: 156,
    nextSession: "Viernes, 16:00",
    status: "active",
    avatar: "https://via.placeholder.com/40",
    languages: ["Español", "Inglés", "Alemán"],
    price: "€90/sesión",
  },
  {
    id: "4",
    name: "Carlos Rodríguez",
    email: "carlos.rodriguez@ejemplo.com",
    phone: "+34 645 678 901",
    specialty: "Desarrollo profesional",
    experience: "7 años",
    rating: 4.6,
    reviews: 87,
    nextSession: "Lunes, 11:00",
    status: "inactive",
    avatar: "https://via.placeholder.com/40",
    languages: ["Español"],
    price: "€70/sesión",
  },
  {
    id: "5",
    name: "Laura Gómez",
    email: "laura.gomez@ejemplo.com",
    phone: "+34 656 789 012",
    specialty: "Equilibrio vida-trabajo",
    experience: "6 años",
    rating: 4.5,
    reviews: 76,
    nextSession: "Martes, 17:30",
    status: "active",
    avatar: "https://via.placeholder.com/40",
    languages: ["Español", "Inglés", "Italiano"],
    price: "€85/sesión",
  },
]

export function CoachesList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [specialtyFilter, setSpecialtyFilter] = useState("all")
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null)

  // Filtrar coaches basado en la búsqueda y el filtro de especialidad
  const filteredCoaches = coachesData.filter((coach) => {
    const matchesSearch =
      coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coach.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coach.specialty.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesSpecialty =
      specialtyFilter === "all" || coach.specialty.toLowerCase().includes(specialtyFilter.toLowerCase())

    return matchesSearch && matchesSpecialty
  })

  // Obtener especialidades únicas para el filtro
  const specialties = Array.from(new Set(coachesData.map((coach) => coach.specialty)))

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Mis Coaches</CardTitle>
        <CardDescription>Explora tus coaches y programa sesiones</CardDescription>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nombre o especialidad..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1">
                <Filter className="h-4 w-4" />
                Especialidad
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filtrar por especialidad</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSpecialtyFilter("all")}>Todas las especialidades</DropdownMenuItem>
              {specialties.map((specialty, index) => (
                <DropdownMenuItem key={index} onClick={() => setSpecialtyFilter(specialty)}>
                  {specialty}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {filteredCoaches.map((coach) => (
            <div
              key={coach.id}
              className={`rounded-lg border p-4 transition-colors ${
                selectedCoach === coach.id ? "bg-muted/50" : "hover:bg-muted/30"
              }`}
              onClick={() => setSelectedCoach(coach.id)}
            >
              <div className="flex gap-4">
                <img src={coach.avatar || "/placeholder.svg"} alt={coach.name} className="h-12 w-12 rounded-full" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{coach.name}</h3>
                    <div className="flex items-center">
                      <Star className="mr-1 h-3 w-3 fill-primary text-primary" />
                      <span className="text-sm">{coach.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{coach.specialty}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {coach.languages.map((language, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span>{coach.price}</span>
                <span>{coach.experience} de experiencia</span>
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-1">
                  <MessageSquare className="h-3 w-3" />
                  Mensaje
                </Button>
                <Button variant="outline" size="sm" className="flex-1 gap-1">
                  <Calendar className="h-3 w-3" />
                  Sesión
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
