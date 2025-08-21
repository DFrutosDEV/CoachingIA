"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  Calendar, 
  CheckCircle, 
  Circle, 
  FileText, 
  User, 
  Clock,
  BarChart3,
  Target
} from "lucide-react"
import { formatDate } from "@/utils/validatesInputs"

interface Goal {
  _id: string;
  description: string;
  isCompleted: boolean;
  day: string;
  createdAt: string;
}

interface Note {
  _id: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

interface Objective {
  id: string;
  title: string;
  isCompleted: boolean;
  active: boolean;
  createdAt: string;
}

interface ObjectiveDetailData {
  objective: Objective;
  goals: Goal[];
  notes: Note[];
}

interface ObjectiveDetailModalProps {
  objectiveData: ObjectiveDetailData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ObjectiveDetailModal({ 
  objectiveData, 
  isOpen, 
  onClose 
}: ObjectiveDetailModalProps) {
  if (!objectiveData) return null;

  const { objective, goals, notes } = objectiveData;
  const completedGoals = goals.filter(goal => goal.isCompleted).length;
  const totalGoals = goals.length;
  const progress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Target className="h-6 w-6" />
            {objective.title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6">
          {/* Header con información del objetivo */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Información del Objetivo</CardTitle>
                <div className="flex gap-2">
                  <Badge variant={objective.active ? "default" : "secondary"}>
                    {objective.active ? "Activo" : "Inactivo"}
                  </Badge>
                  <Badge variant={objective.isCompleted ? "default" : "outline"}>
                    {objective.isCompleted ? "Completado" : "En Progreso"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Creado: {formatDate(new Date(objective.createdAt))}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Progreso: {Math.round(progress)}%</span>
                </div>
              </div>
              
              {/* Barra de progreso */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progreso general</span>
                  <span>{completedGoals} de {totalGoals} metas completadas</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div 
                    className="h-full rounded-full bg-primary transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sección de Metas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Metas ({totalGoals})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {goals.length > 0 ? (
                    goals.map((goal) => (
                      <div key={goal._id} className="flex items-start gap-3 p-3 rounded-lg border">
                        <div className="mt-1">
                          {goal.isCompleted ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${goal.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                            {goal.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {goal.day} • {formatDate(new Date(goal.createdAt))}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No hay metas definidas para este objetivo</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sección de Notas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notas ({notes.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {notes.length > 0 ? (
                    notes.map((note) => (
                      <div key={note._id} className="p-3 rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-medium">{note.createdBy}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(new Date(note.createdAt))}
                          </span>
                        </div>
                        <p className="text-sm">{note.content}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No hay notas registradas para este objetivo</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
