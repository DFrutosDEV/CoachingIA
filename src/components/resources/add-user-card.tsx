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
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"

export function AddUserCard() {
  const [showCoachDialog, setShowCoachDialog] = useState(false)
  const [profile, setProfile] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.lastName || !formData.email || !profile) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          lastName: formData.lastName,
          email: formData.email,
          profile: profile
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Usuario creado exitosamente')
        setFormData({ name: '', lastName: '', email: '' })
        setShowCoachDialog(false)
      } else {
        toast.error(data.error || 'Error al crear usuario')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al crear usuario')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <UserPlus className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="mt-4">Agregar nuevo usuario</CardTitle>
        <CardDescription>
          Añade nuevos usuarios a tu lista y configura sus perfiles, objetivos y planes de coaching.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            <span>Crea perfiles de usuarios</span>
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
              Añadir Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Añadir Nuevo Usuario</DialogTitle>
              <DialogDescription>Completa la información para crear un nuevo usuario.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="first-name">Nombre <span className="text-red-500">*</span></Label>
                  <Input 
                    id="first-name" 
                    placeholder="Nombre" 
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="last-name">Apellidos <span className="text-red-500">*</span></Label>
                  <Input 
                    id="last-name" 
                    placeholder="Apellidos" 
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="email@ejemplo.com" 
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              {/* <div className="grid gap-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" placeholder="+34 600 000 000" />
              </div> */}
              <div>
                <Label htmlFor="profile">Perfil <span className="text-red-500">*</span></Label>
                <Select
                  value={profile || ''}
                  onValueChange={setProfile}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el perfil" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem className="bg-background-hover" value="1">Admin</SelectItem>
                    <SelectItem className="bg-background-hover" value="2">Coach</SelectItem>
                    <SelectItem className="bg-background-hover" value="3">Cliente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="flex justify-end gap-2">
              <Button 
                variant="outlined" 
                onClick={() => setShowCoachDialog(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? 'Creando...' : 'Crear Usuario'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
} 