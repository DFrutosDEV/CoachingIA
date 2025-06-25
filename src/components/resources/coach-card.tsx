"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@mui/material"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus, ArrowRight } from "lucide-react"

export function CoachCard() {
  const [showCoachDialog, setShowCoachDialog] = useState(false)

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <UserPlus className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="mt-4">Agregar Coach</CardTitle>
        <CardDescription>
          Añade nuevos coaches a tu lista y configura sus perfiles, objetivos y planes de coaching.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            <span>Crea perfiles de coaches</span>
          </li>
          <li className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            <span>Empieza a programar sesiones</span>
          </li>
          <li className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            <span>Programa sesiones con tus clientes</span>
          </li>
        </ul>
      </CardContent>
      <CardFooter>
        <Dialog open={showCoachDialog} onOpenChange={setShowCoachDialog}>
          <DialogTrigger asChild>
            <Button variant="outlined" className="w-full">
              Añadir Coach
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Añadir Nuevo Coach</DialogTitle>
              <DialogDescription>Completa la información para crear un nuevo perfil de coach.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="first-name">Nombre</Label>
                  <Input id="first-name" placeholder="Nombre" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="last-name">Apellidos</Label>
                  <Input id="last-name" placeholder="Apellidos" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="email@ejemplo.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" placeholder="+34 600 000 000" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="focus">Enfoque principal</Label>
                <Input id="focus" placeholder="Ej: Desarrollo personal, Liderazgo..." />
              </div>
            </div>
            <DialogFooter className="flex justify-end gap-2">
              <Button variant="outlined" onClick={() => setShowCoachDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setShowCoachDialog(false)}>Crear Coach</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
} 