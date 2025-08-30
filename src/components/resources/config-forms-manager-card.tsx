"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@mui/material"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Settings, Plus, Edit, Trash2, ArrowRight, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { useSelector } from "react-redux"
import { RootState } from "@/lib/redux/store"

interface ConfigForm {
  _id: string
  title: string
  active: boolean
  isObligatory: boolean
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export function ConfigFormsManagerCard() {
  const [configForms, setConfigForms] = useState<ConfigForm[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { user } = useSelector((state: RootState) => state.auth)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingForm, setEditingForm] = useState<ConfigForm | null>(null)
  const [deletingForm, setDeletingForm] = useState<ConfigForm | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    isObligatory: false,
    active: true,
    createdBy: user?.profile._id || ""
  })
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Cargar formularios de configuración
  const loadConfigForms = async () => {
    try {
      const response = await fetch('/api/config-forms/admin')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setConfigForms(data.data)
        }
      }
    } catch (error) {
      console.error('Error al cargar formularios:', error)
      toast.error('Error al cargar los formularios')
    }
  }

  useEffect(() => {
    loadConfigForms()
  }, [])

  // Abrir modal para crear nuevo formulario
  const handleCreateNew = () => {
    setEditingForm(null)
    setFormData({ title: "", isObligatory: false, active: true, createdBy: user?.profile._id || "" })
    setIsEditDialogOpen(true)
    console.log('Modal abierto para crear nuevo formulario')
  }

  // Abrir modal para editar formulario
  const handleEdit = (form: ConfigForm) => {
    setEditingForm(form)
    setFormData({
      title: form.title,
      isObligatory: form.isObligatory,
      active: form.active,
      createdBy: user?.profile._id || ""
    })
    setIsEditDialogOpen(true)
    console.log('Modal abierto para editar formulario:', form.title)
  }

  // Abrir modal de confirmación de borrado
  const handleDeleteClick = (form: ConfigForm) => {
    setDeletingForm(form)
    setIsDeleteDialogOpen(true)
  }

  // Guardar formulario (crear o actualizar)
  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('El título es requerido')
      return
    }

    setLoading(true)
    try {
      const url = editingForm
        ? `/api/config-forms/${editingForm._id}`
        : '/api/config-forms'

      const method = editingForm ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          toast.success(editingForm ? 'Formulario actualizado' : 'Formulario creado')
          setIsEditDialogOpen(false)
          loadConfigForms()
        }
      } else {
        throw new Error('Error en la respuesta')
      }
    } catch (error) {
      console.error('Error al guardar formulario:', error)
      toast.error('Error al guardar el formulario')
    } finally {
      setLoading(false)
    }
  }

  // Eliminar formulario
  const handleDelete = async () => {
    if (!deletingForm) return

    setDeleteLoading(true)
    try {
      const response = await fetch(`/api/config-forms/${deletingForm._id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          toast.success('Pregunta eliminada correctamente')
          setIsDeleteDialogOpen(false)
          setDeletingForm(null)
          loadConfigForms()
        }
      }
    } catch (error) {
      console.error('Error al eliminar formulario:', error)
      toast.error('Error al eliminar la pregunta')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Settings className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="mt-4">Gestionar Formularios de Configuración</CardTitle>
          <CardDescription>
            Administra las preguntas de configuración del sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span>Crear nuevas preguntas de configuración</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span>Marcar preguntas como obligatorias</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span>Activar/desactivar formularios</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outlined" className="w-full">
                Gestionar Formulario
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] z-[9999]">
              <DialogHeader>
                <DialogTitle>
                  Revisar Formulario de Configuración
                </DialogTitle>
                <DialogDescription>
                  Aquí puedes ver y gestionar todas las preguntas de configuración del sistema.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium">Total: {configForms.length} formularios</h4>
                  <Button onClick={handleCreateNew} size="small" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Agregar Nueva Pregunta
                  </Button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {configForms.length === 0 ? (
                    <div className="text-center py-8">
                      <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No hay formularios de configuración</p>
                      <p className="text-sm text-gray-400">Crea la primera pregunta para comenzar</p>
                    </div>
                  ) : (
                    configForms.map((form, index) => (
                      <div key={form._id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                              <h3 className="font-medium">{form.title}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                              {form.isObligatory && (
                                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                                  Obligatorio
                                </span>
                              )}
                              {form.active ? (
                                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                                  Activo
                                </span>
                              ) : (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  Inactivo
                                </span>
                              )}
                              <span className="text-xs text-gray-500">
                                Creado: {new Date(form.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="text"
                              size="small"
                              onClick={() => handleEdit(form)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="text"
                              size="small"
                              onClick={() => handleDeleteClick(form)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outlined" onClick={() => setIsDialogOpen(false)}>
                  Cerrar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>

      {/* Modal para crear/editar formulario */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] z-[9999]">
          <DialogHeader>
            <DialogTitle>
              {editingForm ? 'Editar pregunta' : 'Nueva pregunta'}
            </DialogTitle>
            <DialogDescription>
              {editingForm
                ? 'Modifica los detalles de la pregunta.'
                : 'Crea una nueva pregunta para el sistema.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título de la pregunta</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej: ¿Cuál es tu objetivo principal?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="isObligatory">Pregunta obligatoria</Label>
              <Select
                value={formData.isObligatory ? "obligatory" : "optional"}
                onValueChange={(value) => setFormData({ ...formData, isObligatory: value === "obligatory" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background z-[9999]">
                  <SelectItem className="bg-background-hover" value="obligatory">Obligatorio</SelectItem>
                  <SelectItem className="bg-background-hover" value="optional">Opcional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado de la pregunta</Label>
              <Select
                value={formData.active ? "active" : "inactive"}
                onValueChange={(value) => setFormData({ ...formData, active: value === "active" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background z-[9999]">
                  <SelectItem className="bg-background-hover" value="active">Activa</SelectItem>
                  <SelectItem className="bg-background-hover" value="inactive">Inactiva</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outlined" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={handleSave} disabled={loading}>
              {loading ? 'Guardando...' : (editingForm ? 'Actualizar' : 'Crear')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación de borrado */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] z-[9999]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <DialogTitle>Confirmar eliminación</DialogTitle>
                <DialogDescription>
                  ¿Estás seguro de que quieres eliminar esta pregunta?
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Pregunta a eliminar:</h4>
              <p className="text-gray-700">{deletingForm?.title}</p>
              <div className="flex items-center gap-2 mt-2">
                {deletingForm?.isObligatory && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                    Obligatorio
                  </span>
                )}
                {deletingForm?.active ? (
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                    Activo
                  </span>
                ) : (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    Inactivo
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Esta acción no se puede deshacer. La pregunta será eliminada permanentemente.
            </p>
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button 
              variant="outlined" 
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setDeletingForm(null)
              }}
              disabled={deleteLoading}
            >
              Cancelar
            </Button>
            <Button 
              variant="contained" 
              onClick={handleDelete} 
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? 'Eliminando...' : 'Eliminar pregunta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 