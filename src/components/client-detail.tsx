'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Clock,
  Mail,
  MessageSquare,
  Phone,
  FileText,
  CalendarIcon,
  BarChart,
  Target,
  Eye,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { GoalsModal } from './ui/goals-modal';
import { ObjectiveDetailModal } from './ui/objective-detail-modal';
import { FinalizeObjectiveModal } from './ui/finalize-objective-modal';
import { RescheduleSessionModal } from './ui/reschedule-session-modal';
import { useAppSelector } from '@/lib/redux/hooks';
import { formatDate } from '@/utils/validatesInputs';
import { toast } from 'sonner';
import { Goal, ClientDetailProps, Objective } from '@/types';
import { sendMessage } from '@/utils/wpp-methods';
import { sendEmail } from '@/utils/sendEmail';

export function ClientDetail({
  client,
  isOpen,
  onClose,
  onUpdateClient,
  isAdmin,
}: ClientDetailProps) {
  const [activeTab, setActiveTab] = useState('info');
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loadingObjectives, setLoadingObjectives] = useState(false);
  const [selectedObjectiveData, setSelectedObjectiveData] = useState<any>(null);
  const [isObjectiveDetailModalOpen, setIsObjectiveDetailModalOpen] =
    useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);

  const user = useAppSelector(state => state.auth.user);

  const handleGoalsUpdate = (updatedGoals: Goal[]) => {
    if (client) {
      onUpdateClient(client._id, updatedGoals);
    }
    setIsGoalsModalOpen(false);
  };

  const fetchObjectives = async () => {
    if (!client?._id) return;

    try {
      setLoadingObjectives(true);
      const response = await fetch(
        `/api/client/objectives?clientId=${client.profileId}`
      );

      if (!response.ok) {
        throw new Error('Error al obtener los objetivos');
      }

      const data = await response.json();

      if (data.success) {
        setObjectives(data.objectives);
      } else {
        throw new Error(data.error || 'Error desconocido');
      }
    } catch (err) {
      console.error('Error al cargar objetivos:', err);
      toast.error('Error al cargar los objetivos del cliente');
    } finally {
      setLoadingObjectives(false);
    }
  };

  const handleObjectiveSelect = async (objectiveId: string) => {
    try {
      const response = await fetch(`/api/client/objectives/${objectiveId}`);

      if (!response.ok) {
        throw new Error('Error al obtener los detalles del objetivo');
      }

      const data = await response.json();

      if (data.success) {
        setSelectedObjectiveData(data.data);
        setIsObjectiveDetailModalOpen(true);
      } else {
        throw new Error(data.error || 'Error desconocido');
      }
    } catch (err) {
      console.error('Error al cargar detalles del objetivo:', err);
      toast.error('Error al cargar los detalles del objetivo');
    }
  };

  const handleRescheduleSession = (session: any) => {
    // Extraer fecha y hora del campo date
    const sessionDate = new Date(session.date);
    const dateString = sessionDate.toISOString().split('T')[0];
    const timeString = sessionDate.toTimeString().slice(0, 5);

    setSelectedSession({
      id: session._id || session.id,
      date: dateString,
      time: timeString,
    });
    setIsRescheduleModalOpen(true);
  };

  const handleSessionRescheduled = () => {
    // Recargar los datos del cliente para mostrar la sesión actualizada
    if (onUpdateClient && client) {
      // Forzar una recarga de los datos del cliente
      onUpdateClient(client._id, []);
    }
  };

  useEffect(() => {
    if (activeTab === 'objectives' && client?._id && objectives.length === 0) {
      fetchObjectives();
    }
  }, [activeTab, client?._id]);

  if (!isOpen && activeTab !== 'info') {
    setActiveTab('info');
  }

  if (!client) {
    return null;
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-2xl">Detalle del Cliente</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-auto p-6">
            <div className="flex flex-col items-center space-y-3 text-center">
              {client.avatar && (
                <Image
                  src={client.avatar}
                  alt={client.name}
                  width={86}
                  height={86}
                  className="rounded-full"
                />
              )}
              <div>
                <h3 className="text-xl font-bold">{client.name}</h3>
                <p className="text-sm text-muted-foreground">{client.focus}</p>
              </div>
              <Badge
                variant={
                  client.status === 'active'
                    ? 'active'
                    : client.status === 'pending'
                      ? 'pending'
                      : 'inactive'
                }
              >
                {client.status === 'active'
                  ? 'Activo'
                  : client.status === 'pending'
                    ? 'Pendiente'
                    : 'Inactivo'}
              </Badge>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() =>
                  client.phone
                    ? sendMessage({ phone: client.phone })
                    : sendEmail({ email: client.email })
                }
              >
                <MessageSquare className="h-4 w-4" />
                Mensaje
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <FileText className="h-4 w-4" />
                Ver PDA
              </Button>
            </div>

            <Tabs
              defaultValue="info"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full mt-6"
            >
              <TabsList className="grid w-full grid-cols-2 border-solid border-2 border-border rounded-md bg-card p-1 h-auto">
                <TabsTrigger
                  value="info"
                  className="data-[state=active]:bg-accent"
                >
                  Info
                </TabsTrigger>
                <TabsTrigger
                  value="objectives"
                  className="data-[state=active]:bg-accent"
                >
                  Objetivos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{client.email || 'Sin correo'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{client.phone || 'Sin teléfono'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span>Cliente desde {client.startDate || 'Sin fecha'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                    <span>{client.sessions || 0} sesiones completadas</span>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-medium">Próxima Sesión</h4>
                  {client.nextSession.date ? (
                    <div className="rounded-lg border p-3">
                      <div className="flex justify-between">
                        <div className="font-medium">
                          {`${formatDate(new Date(client.nextSession.date))} - ${client.nextSession.objective.title}`}
                        </div>
                        <Badge variant="outline">Programada</Badge>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full gap-1"
                          onClick={() =>
                            handleRescheduleSession(client.nextSession)
                          }
                        >
                          <Clock className="h-3 w-3" />
                          Reprogramar
                        </Button>
                        <Button
                          size="sm"
                          className="w-full gap-1"
                          onClick={() => {
                            window.open(client.nextSession.link, '_blank');
                          }}
                        >
                          <Calendar className="h-3 w-3" />
                          Iniciar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No existen sesiones programadas
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-medium">Última Sesión</h4>
                  {client.lastSession.date ? (
                    <div className="rounded-lg border p-3">
                      <div className="flex justify-between">
                        <div className="font-medium">
                          {`${formatDate(new Date(client.lastSession.date))} - ${client.lastSession.objective.title}`}
                        </div>
                        <Badge variant="outline">Programada</Badge>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No existen sesiones previas
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-medium">Biografía</h4>
                  <p className="text-sm text-muted-foreground">
                    {client.bio || 'Sin biografía'}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="objectives" className="space-y-4 mt-4">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium">
                      Objetivos del Cliente
                    </h4>
                  </div>

                  {loadingObjectives ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-sm text-muted-foreground">
                          Cargando objetivos...
                        </p>
                      </div>
                    </div>
                  ) : objectives.length > 0 ? (
                    <div
                      className="space-y-3 max-h-[400px] overflow-y-auto pr-2"
                      onClick={e => {
                        e.stopPropagation();
                        handleObjectiveSelect(objectives[0]._id);
                      }}
                    >
                      {objectives.map(objective => (
                        <div
                          key={objective._id}
                          className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4 text-primary" />
                              <h5 className="font-medium">{objective.title}</h5>
                            </div>
                            <div className="flex items-center gap-2">
                              {objective.active && (
                                <Badge variant="active">Activo</Badge>
                              )}
                              <Badge
                                variant={
                                  objective.isCompleted ? 'active' : 'outline'
                                }
                              >
                                {objective.isCompleted
                                  ? 'Completado'
                                  : 'En Progreso'}
                              </Badge>
                              <div className="flex items-center gap-1">
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {objective.active && !objective.isCompleted && (
                                  <FinalizeObjectiveModal
                                    objectiveId={objective._id}
                                    objectiveTitle={objective.title}
                                    onObjectiveFinalized={fetchObjectives}
                                  />
                                )}
                              </div>
                            </div>
                          </div>

                          <div
                            className="space-y-2 cursor-pointer"
                            onClick={() => handleObjectiveSelect(objective._id)}
                          >
                            <div className="flex justify-between text-sm">
                              <span>Progreso: {objective.progress}%</span>
                              <span>
                                {objective.completedGoals} de{' '}
                                {objective.totalGoals} metas
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary transition-all duration-300"
                                style={{ width: `${objective.progress}%` }}
                              ></div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>
                                Creado:{' '}
                                {formatDate(new Date(objective.createdAt))}
                              </span>
                              <span>Coach: {objective.coach}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">
                        No hay objetivos definidos para este cliente
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="notes" className="space-y-4 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium">Notas de Sesiones</h4>
                  <Button variant="outline" size="sm" className="gap-1">
                    <FileText className="h-4 w-4" />
                    Nueva Nota
                  </Button>
                </div>
                <div className="space-y-3">
                  {client.notes?.length > 0 ? (
                    client.notes.map(note => (
                      <div key={note._id} className="rounded-lg border p-3">
                        <div className="mb-1 text-xs text-muted-foreground">
                          {formatDate(new Date(note.createdAt))}
                        </div>
                        <p className="text-sm">{note.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay notas registradas.
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <GoalsModal
            isOpen={isGoalsModalOpen}
            onClose={() => setIsGoalsModalOpen(false)}
            goals={client.goals || []}
            onSave={handleGoalsUpdate}
          />
        </DialogContent>
      </Dialog>

      <ObjectiveDetailModal
        objectiveData={selectedObjectiveData}
        isOpen={isObjectiveDetailModalOpen}
        onClose={() => setIsObjectiveDetailModalOpen(false)}
        clientId={client?.profileId}
        coachId={user?.profile?._id}
      />

      <RescheduleSessionModal
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        sessionId={selectedSession?.id || ''}
        currentDate={selectedSession?.date || ''}
        currentTime={selectedSession?.time || ''}
        onSessionRescheduled={handleSessionRescheduled}
      />
    </>
  );
}
