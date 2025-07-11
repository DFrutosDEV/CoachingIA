"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Plus, Calendar, Clock } from "lucide-react"
import { toast } from "sonner"
import { formatTime } from "@/utils/validatesInputs"

interface Goal {
  id: string;
  title: string;
  day: string;
}

interface Meet {
  date: Date;
}

interface ConfigFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  coachId: string;
  objectiveId: string | null;
}

const CONFIG_QUESTIONS = [
  "¿Cuál es tu objetivo principal en este programa de coaching?",
  "¿En qué área de tu vida te gustaría enfocarte más?",
  "¿Cuántas horas a la semana puedes dedicar a trabajar en tus objetivos?",
  "¿Prefieres trabajar en objetivos a corto plazo (1-3 meses) o largo plazo (6-12 meses)?",
  "¿Qué tipo de apoyo necesitas más del coach?",
  "¿Tienes alguna experiencia previa con coaching o desarrollo personal?",
  "¿Cuál es tu nivel de motivación actual (1-10)?",
  "¿Qué obstáculos crees que pueden impedirte alcanzar tus objetivos?",
  "¿Prefieres sesiones más estructuradas o flexibles?",
  "¿Hay algún tema específico que te gustaría abordar en las sesiones?"
];

const FIXED_GOALS = [
  "Establecer una rutina matutina de 30 minutos",
  "Practicar meditación diaria durante 10 minutos",
  "Leer 20 páginas de un libro de desarrollo personal",
  "Escribir en un diario de gratitud",
  "Hacer ejercicio físico 3 veces por semana",
  "Establecer límites saludables en relaciones",
  "Practicar técnicas de respiración",
  "Organizar el espacio de trabajo",
  "Establecer metas semanales específicas",
  "Practicar la escucha activa",
  "Desarrollar habilidades de comunicación",
  "Trabajar en la gestión del tiempo",
  "Practicar la autocompasión",
  "Establecer una rutina de sueño saludable",
  "Trabajar en la resolución de conflictos",
  "Desarrollar la confianza en sí mismo",
  "Practicar la toma de decisiones consciente",
  "Trabajar en la gestión del estrés",
  "Establecer relaciones más profundas",
  "Desarrollar la resiliencia emocional",
  "Practicar la gratitud diaria",
  "Trabajar en la autodisciplina",
  "Desarrollar la creatividad",
  "Establecer metas financieras",
  "Practicar la empatía",
  "Trabajar en la superación de miedos",
  "Desarrollar la paciencia",
  "Establecer una rutina de autocuidado",
  "Practicar la aceptación",
  "Trabajar en el perdón"
];

const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export function ConfigFormModal({ isOpen, onClose, clientId, coachId, objectiveId }: ConfigFormModalProps) {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<string[]>(new Array(10).fill(''));
  const [loading, setLoading] = useState(false);
  const [generatedGoals, setGeneratedGoals] = useState<Goal[]>([]);
  const [meets, setMeets] = useState<Meet[]>([]);
  const [meetDate, setMeetDate] = useState('');
  const [meetTime, setMeetTime] = useState('');
  const [meetCount, setMeetCount] = useState(4);

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const generateGoals = async () => {
    setLoading(true);

    // Simular procesamiento de IA
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Generar 30 objetivos de ejemplo basados en las respuestas
    const goals: Goal[] = FIXED_GOALS.map((goal, index) => ({
      id: `goal-${index}`,
      title: goal,
      day: DAYS_OF_WEEK[index % 7]
    }));

    setGeneratedGoals(goals);
    setStep(2);
    setLoading(false);
  };

  const handleGoalEdit = (id: string, newTitle: string) => {
    setGeneratedGoals(prev =>
      prev.map(goal =>
        goal.id === id ? { ...goal, title: newTitle } : goal
      )
    );
  };

  const handleGoalDelete = (id: string) => {
    setGeneratedGoals(prev => prev.filter(goal => goal.id !== id));
  };

  const handleGoalAdd = () => {
    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      title: "Nuevo objetivo",
      day: "Lunes"
    };
    setGeneratedGoals(prev => [...prev, newGoal]);
  };

  const handleSaveGoals = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId,
          coachId,
          objectiveId,
          goals: generatedGoals
        }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar los objetivos');
      }

      toast.success('Objetivos guardados correctamente');
      setStep(3);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar los objetivos');
    } finally {
      setLoading(false);
    }
  };

  const generateMeets = () => {
    if (!meetDate || !meetTime || meetCount <= 0) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    const meets: Meet[] = [];
    const startDate = new Date(meetDate);
    const [hours, minutes] = meetTime.split(':');

    for (let i = 0; i < meetCount; i++) {
      const meetDate = new Date(startDate);
      meetDate.setDate(startDate.getDate() + (i * 7)); // 1 semana de diferencia
      meetDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      meets.push({
        date: meetDate
      });
    }

    setMeets(meets);
  };

  const handleSaveMeets = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/meets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId,
          coachId,
          objectiveId,
          meets
        }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar las reuniones');
      }

      toast.success('Reuniones programadas correctamente');
      onClose();
      setStep(1);
      setAnswers(new Array(10).fill(''));
      setGeneratedGoals([]);
      setMeets([]);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar las reuniones');
    } finally {
      setLoading(false);
    }
  };

  const isFormComplete = answers.every(answer => answer.trim() !== '');
  const isObjectiveActive = objectiveId !== null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl">
            {step === 1 && "Formulario de Configuración"}
            {step === 2 && "Revisar Objetivos"}
            {step === 3 && "Programar Reuniones"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <p className="text-muted-foreground">
                  Responde estas 10 preguntas para que podamos generar objetivos personalizados para tu cliente.
                </p>
              </div>

              {CONFIG_QUESTIONS.map((question, index) => (
                <div key={index} className="space-y-2">
                  <Label htmlFor={`question-${index}`} className="text-sm font-medium">
                    Pregunta {index + 1}
                  </Label>
                  <p className="text-sm text-muted-foreground mb-2">{question}</p>
                  <Textarea
                    id={`question-${index}`}
                    value={answers[index]}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    placeholder="Escribe tu respuesta aquí..."
                    className="min-h-[80px]"
                  />
                </div>
              ))}

              <div className="flex justify-end pt-4">
                <Button
                  onClick={generateGoals}
                  disabled={!isFormComplete || loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generando objetivos...
                    </>
                  ) : (
                    "Generar Objetivos"
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Objetivos Generados ({generatedGoals.length})</h3>
                <Button onClick={handleGoalAdd} size="sm" className="gap-1">
                  <Plus className="h-4 w-4" />
                  Agregar
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2 gap-5 flex flex-col">
                {generatedGoals.map((goal) => (
                  <Card key={goal.id} className="border border-gray-200 hover:border-gray-300 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={goal.title}
                            onChange={(e) => handleGoalEdit(goal.id, e.target.value)}
                            className="w-full bg-transparent border-none outline-none text-sm font-medium"
                            placeholder="Escribe el objetivo aquí..."
                          />
                          <Badge variant="outline" className="mt-2 text-xs">{goal.day}</Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGoalDelete(goal.id)}
                          className="text-destructive hover:text-destructive flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-between pt-6 gap-4 border-t mt-6">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Atrás
                </Button>
                <Button onClick={handleSaveGoals} disabled={loading} className="flex-1">
                  {loading ? "Guardando..." : "Siguiente"}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col h-full">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="meet-date">Fecha de inicio</Label>
                    <Input
                      id="meet-date"
                      type="date"
                      value={meetDate}
                      onChange={(e) => setMeetDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meet-time">Hora</Label>
                    <Input
                      id="meet-time"
                      type="time"
                      value={meetTime}
                      onChange={(e) => setMeetTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meet-count">Cantidad de sesiones</Label>
                    <Input
                      id="meet-count"
                      type="number"
                      min="1"
                      max="12"
                      value={meetCount}
                      onChange={(e) => setMeetCount(parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <Button onClick={generateMeets} className="w-full">
                  Generar Reuniones
                </Button>

                {meets.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Reuniones Programadas</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {meets.map((meet, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                          <span className="text-sm font-medium">{meet.date.toLocaleDateString()}</span>
                          <span className="text-sm text-muted-foreground">{formatTime(meet.date, { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-6 gap-4 border-t mt-6">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Atrás
                </Button>
                <Button onClick={handleSaveMeets} disabled={loading || meets.length === 0} className="flex-1">
                  {loading ? "Guardando..." : "Finalizar"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 