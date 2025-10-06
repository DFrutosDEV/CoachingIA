'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Clock, Plus, Edit, X, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Session } from '@/types';

interface GeneratedSession {
  _id: string;
  date: string;
  time: string;
  isEditable?: boolean;
}

interface GenerateSessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  objectiveId: string;
  onSessionsGenerated: (sessions: Session[]) => void;
  clientId: string;
  coachId: string;
}

export function GenerateSessionsModal({
  isOpen,
  onClose,
  objectiveId,
  onSessionsGenerated,
  clientId,
  coachId,
}: GenerateSessionsModalProps) {
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [periodicity, setPeriodicity] = useState('weekly');
  const [sessionCount, setSessionCount] = useState('4');
  const [generatedSessions, setGeneratedSessions] = useState<
    GeneratedSession[]
  >([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingDate, setEditingDate] = useState('');
  const [editingTime, setEditingTime] = useState('');

  const generateSessions = () => {
    if (!startDate || !startTime || !sessionCount) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    const count = parseInt(sessionCount);
    if (count <= 0 || count > 52) {
      toast.error('La cantidad de sesiones debe estar entre 1 y 52');
      return;
    }

    setIsGenerating(true);

    try {
      const sessions: GeneratedSession[] = [];
      const start = new Date(startDate);

      for (let i = 0; i < count; i++) {
        const sessionDate = new Date(start);

        // Calcular la fecha según la periodicidad
        switch (periodicity) {
          case 'daily':
            sessionDate.setDate(start.getDate() + i);
            break;
          case 'weekly':
            sessionDate.setDate(start.getDate() + i * 7);
            break;
          case 'biweekly':
            sessionDate.setDate(start.getDate() + i * 14);
            break;
          case 'monthly':
            sessionDate.setMonth(start.getMonth() + i);
            break;
          default:
            sessionDate.setDate(start.getDate() + i * 7);
        }

        sessions.push({
          _id: `temp-${i}`,
          date: sessionDate.toISOString().split('T')[0],
          time: startTime,
          isEditable: true,
        } as GeneratedSession);
      }

      setGeneratedSessions(sessions);
      toast.success(`${count} sesiones generadas`);
    } catch (error) {
      console.error('Error al generar sesiones:', error);
      toast.error('Error al generar las sesiones');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditSession = (
    sessionId: string,
    currentDate: string,
    currentTime: string
  ) => {
    setEditingSessionId(sessionId);
    setEditingDate(currentDate);
    setEditingTime(currentTime);
  };

  const handleSaveEdit = (sessionId: string) => {
    if (!editingDate || !editingTime) {
      toast.error('Por favor ingresa una fecha y hora válidas');
      return;
    }

    setGeneratedSessions(prev =>
      prev.map(session =>
        session._id === sessionId
          ? { ...session, date: editingDate, time: editingTime }
          : session
      )
    );
    setEditingSessionId(null);
    setEditingDate('');
    setEditingTime('');
    toast.success('Sesión actualizada');
  };

  const handleCreateSessions = async () => {
    if (generatedSessions.length === 0) {
      toast.error('No hay sesiones para crear');
      return;
    }

    setIsCreating(true);

    try {
      console.log('objectiveId', objectiveId);
      const response = await fetch('/api/meets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          objectiveId,
          meets: generatedSessions.map(session => ({
            date: session.date,
            time: session.time,
          })),
          clientId: clientId,
          coachId: coachId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          onSessionsGenerated(data.meets);
          onClose();
          toast.success(`${data.meets.length} sesiones creadas exitosamente`);

          // Resetear el formulario
          setStartDate('');
          setStartTime('');
          setPeriodicity('weekly');
          setSessionCount('4');
          setGeneratedSessions([]);
        } else {
          toast.error(data.error || 'Error al crear las sesiones');
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Error al crear las sesiones');
      }
    } catch (error) {
      console.error('Error al crear sesiones:', error);
      toast.error('Error al crear las sesiones');
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Generar Sesiones
          </DialogTitle>
          <DialogDescription>
            Configura los parámetros para generar las sesiones del objetivo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Formulario de configuración */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Fecha de inicio</Label>
                <Input
                  id="startDate"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">Hora de inicio</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sessionCount">Cantidad de sesiones</Label>
                <Input
                  id="sessionCount"
                  type="number"
                  min="1"
                  max="30"
                  value={sessionCount}
                  onChange={e => setSessionCount(e.target.value)}
                  placeholder="Ej: 4"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="periodicity">Periodicidad</Label>
                <Select value={periodicity} onValueChange={setPeriodicity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la periodicidad" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem className="bg-background-hover" value="daily">
                      Diaria
                    </SelectItem>
                    <SelectItem className="bg-background-hover" value="weekly">
                      Semanal
                    </SelectItem>
                    <SelectItem
                      className="bg-background-hover"
                      value="biweekly"
                    >
                      Quincenal
                    </SelectItem>
                    <SelectItem className="bg-background-hover" value="monthly">
                      Mensual
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={generateSessions}
              disabled={
                isGenerating || !startDate || !startTime || !sessionCount
              }
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Generar Sesiones
                </>
              )}
            </Button>
          </div>

          {/* Lista de sesiones generadas */}
          {generatedSessions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  Sesiones Generadas ({generatedSessions.length})
                </h3>
                <Button
                  onClick={handleCreateSessions}
                  disabled={isCreating}
                  className="gap-2"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Crear Sesiones
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {generatedSessions.map((session, index) => (
                  <div
                    key={session._id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          Sesión {index + 1}
                        </span>
                      </div>

                      {editingSessionId === session._id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="date"
                            value={editingDate}
                            onChange={e => setEditingDate(e.target.value)}
                            className="w-auto"
                          />
                          <Input
                            type="time"
                            value={editingTime}
                            onChange={e => setEditingTime(e.target.value)}
                            className="w-auto"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSaveEdit(session._id)}
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingSessionId(null);
                              setEditingDate('');
                              setEditingTime('');
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">
                            {formatDate(session.date)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(session.time)}
                          </span>
                        </div>
                      )}
                    </div>

                    {editingSessionId !== session._id && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleEditSession(
                            session._id,
                            session.date,
                            session.time
                          )
                        }
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
