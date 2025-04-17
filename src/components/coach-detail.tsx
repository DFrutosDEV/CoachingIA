"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Mail, MessageSquare, Phone, Star, Award, Globe, BookOpen, CalendarIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

// Datos de ejemplo para el coach seleccionado
const coachData = {
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
  avatar: "https://via.placeholder.com/150",
  languages: ["Español", "Inglés"],
  price: "€80/sesión",
  bio: "Coach certificada con más de 8 años de experiencia en desarrollo personal y profesional. Especializada en técnicas de mindfulness, gestión del estrés y desarrollo de liderazgo.",
  certifications: [
    "Certificación Internacional en Coaching (ICF)",
    "Máster en Psicología Positiva",
    "Especialista en Mindfulness y Reducción del Estrés",
  ],
  availability: [
    { id: "1", day: "Lunes", slots: ["09:00", "11:00", "15:00", "17:00"] },
    { id: "2", day: "Martes", slots: ["10:00", "12:00", "16:00", "18:00"] },
    { id: "3", day: "Miércoles", slots: ["09:00", "11:00", "15:00", "17:00"] },
    { id: "4", day: "Jueves", slots: ["10:00", "12:00", "16:00", "18:00"] },
    { id: "5", day: "Viernes", slots: ["09:00", "11:00", "15:00"] },
  ],
  upcomingSessions: [
    { id: "1", date: "Hoy, 15:00", topic: "Desarrollo personal" },
    { id: "2", date: "Viernes, 16:00", topic: "Seguimiento semanal" },
  ],
  reviewDetails: [
    {
      id: "1",
      author: "Carlos R.",
      rating: 5,
      comment: "Excelente coach. Ha transformado mi forma de abordar los desafíos profesionales.",
      date: "15/05/2023",
    },
    {
      id: "2",
      author: "Laura G.",
      rating: 5,
      comment: "María es increíble. Sus técnicas de mindfulness me han ayudado enormemente.",
      date: "02/04/2023",
    },
    {
      id: "3",
      author: "Miguel T.",
      rating: 4,
      comment: "Muy profesional y atenta. Recomendable para desarrollo personal.",
      date: "18/03/2023",
    },
  ],
}

export function CoachDetail() {
  const [activeTab, setActiveTab] = useState("info")

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Detalle del Coach</CardTitle>
        <CardDescription>Información detallada y programación</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center space-y-3 text-center">
          <Image 
            src={coachData.avatar || "/placeholder.svg"} 
            alt={coachData.name} 
            className="h-24 w-24 rounded-full"
            width={96}
            height={96}
          />
          <div>
            <h3 className="text-xl font-bold">{coachData.name}</h3>
            <p className="text-sm text-muted-foreground">{coachData.specialty}</p>
          </div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(coachData.rating) ? "fill-primary text-primary" : "text-muted-foreground"
                }`}
              />
            ))}
            <span className="ml-1 text-sm font-medium">{coachData.rating}</span>
            <span className="text-xs text-muted-foreground">({coachData.reviewDetails.length} reseñas)</span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Calendar className="h-4 w-4" />
            Programar
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <MessageSquare className="h-4 w-4" />
            Mensaje
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Phone className="h-4 w-4" />
            Llamar
          </Button>
        </div>

        <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="schedule">Horarios</TabsTrigger>
            <TabsTrigger value="reviews">Reseñas</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{coachData.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{coachData.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Award className="h-4 w-4 text-muted-foreground" />
                <span>{coachData.experience} de experiencia</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span>{coachData.languages.join(", ")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>{coachData.price}</span>
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-medium">Próxima Sesión</h4>
              <div className="rounded-lg border p-3">
                <div className="flex justify-between">
                  <div className="font-medium">{coachData.nextSession}</div>
                  <Badge variant="outline">Programada</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{coachData.upcomingSessions[0].topic}</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" className="w-full gap-1">
                    <Clock className="h-3 w-3" />
                    Reprogramar
                  </Button>
                  <Button size="sm" className="w-full gap-1">
                    <Calendar className="h-3 w-3" />
                    Unirse
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-medium">Biografía</h4>
              <p className="text-sm text-muted-foreground">{coachData.bio}</p>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-medium">Certificaciones</h4>
              <ul className="space-y-1">
                {coachData.certifications.map((cert, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <BookOpen className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <div>
              <h4 className="mb-2 text-sm font-medium">Disponibilidad</h4>
              <div className="space-y-3">
                {coachData.availability.map((day) => (
                  <div key={day.id} className="rounded-lg border p-3">
                    <h5 className="font-medium">{day.day}</h5>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {day.slots.map((slot, index) => (
                        <Button key={index} variant="outline" size="sm">
                          {slot}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <div>
              <h4 className="mb-2 text-sm font-medium">Reseñas de Clientes</h4>
              <div className="space-y-3">
                {coachData.reviewDetails.map((review) => (
                  <div key={review.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{review.author}</div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < review.rating ? "fill-primary text-primary" : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-2 text-sm">{review.comment}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{review.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Ver Todos los Coaches</Button>
        <Button>Programar Sesión</Button>
      </CardFooter>
    </Card>
  )
}
