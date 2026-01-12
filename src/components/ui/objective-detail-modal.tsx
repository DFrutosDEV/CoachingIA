'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Calendar,
  CheckCircle,
  Circle,
  FileText,
  User,
  Clock,
  BarChart3,
  Target,
  Sparkles,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Eye,
} from 'lucide-react';
import { ObjectiveConfigForm } from './objective-config-form';
import { CreateNoteModal } from './create-note-modal';
import { CreateGoalModal } from './create-goal-modal';
import { AIGoalsGenerator } from './ai-goals-generator';
import { toast } from 'sonner';
import { FinalizeObjectiveModal } from './finalize-objective-modal';
import { GenerateSessionsModal } from './generate-sessions-modal';
import { Goal, Note, Objective, Session } from '@/types';
import { useTranslations } from 'next-intl';
import { localeMap, useDateFormatter } from '@/utils/date-formatter';
import { usePathname } from 'next/navigation';

interface ObjectiveDetailData {
  objective: Objective;
  goals: Goal[];
  notes: Note[];
  sessions: Session[];
}

interface ObjectiveDetailModalProps {
  objectiveData: ObjectiveDetailData | null;
  isOpen: boolean;
  onClose: () => void;
  clientId?: string;
  coachId?: string;
}

export function ObjectiveDetailModal({
  objectiveData,
  isOpen,
  onClose,
  clientId,
  coachId,
}: ObjectiveDetailModalProps) {
  const t = useTranslations('common.dashboard.objectiveDetail');
  const { formatDate: formatDateWithLocale, formatTime: formatTimeWithLocale } = useDateFormatter();
  const [isCreateNoteModalOpen, setIsCreateNoteModalOpen] = useState(false);
  const [isCreateGoalModalOpen, setIsCreateGoalModalOpen] = useState(false);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [isGenerateSessionsModalOpen, setIsGenerateSessionsModalOpen] =
    useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [loadingGoals, setLoadingGoals] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [isFormCompleted, setIsFormCompleted] = useState(false);
  const pathname = usePathname();
  const locale = localeMap[pathname.split('/')[1]];

  // Estados para gestión de metas
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Estados para gestión de sesiones
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState({ date: '', time: '' });
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(
    null
  );

  // Cargar notas del objetivo
  const loadNotes = async () => {
    if (!objectiveData?.objective._id) return;

    try {
      setLoadingNotes(true);
      const response = await fetch(
        `/api/notes?objectiveId=${objectiveData.objective._id}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotes(data.notes);
        }
      }
    } catch (error) {
      console.error('Error al cargar notas:', error);
    } finally {
      setLoadingNotes(false);
    }
  };

  // Cargar metas del objetivo
  const loadGoals = async () => {
    if (!objectiveData?.objective._id) return;

    try {
      setLoadingGoals(true);
      const response = await fetch(
        `/api/goals?objectiveId=${objectiveData.objective._id}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setGoals(data.goals);
          console.log('Metas cargadas:', JSON.stringify(data.goals, null, 2));
        }
      }
    } catch (error) {
      console.error('Error al cargar metas:', error);
    } finally {
      setLoadingGoals(false);
    }
  };

  // Cargar sesiones del objetivo
  const loadSessions = async () => {
    if (!objectiveData?.objective._id) return;

    try {
      setLoadingSessions(true);
      const response = await fetch(
        `/api/meets?objectiveId=${objectiveData.objective._id}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSessions(data.meets);
        }
      }
    } catch (error) {
      console.error('Error al cargar sesiones:', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen && objectiveData?.objective._id) {
      loadNotes();
      loadGoals();
      loadSessions();
    }
  }, [isOpen, objectiveData?.objective._id]);

  const handleNoteCreated = () => {
    loadNotes(); // Recargar notas después de crear una nueva
  };

  const handleAIGoalsGenerated = async (generatedGoals: any[]) => {
    if (!objectiveData?.objective._id || !clientId || !coachId) {
      toast.error(t('errors.missingData'));
      return;
    }

    try {
      // Preparar las metas para enviar al servidor
      const goalsToCreate = generatedGoals.map((goal: any) => ({
        description: goal.description || goal.title,
        date: goal.date || new Date().toISOString(), // Usar la fecha del goal generado
        aforism: goal.aforism || '',
        tiempoEstimado: goal.tiempoEstimado || '',
        ejemplo: goal.ejemplo || '',
        indicadorExito: goal.indicadorExito || '',
      }));

      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          objectiveId: objectiveData.objective._id,
          clientId: clientId,
          coachId: coachId,
          goals: goalsToCreate,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Actualizar el estado local con las nuevas metas
          setGoals(prevGoals => [...prevGoals, ...data.goals]);
          setIsAIGeneratorOpen(false);
          toast.success(
            `${data.goals.length} metas generadas con IA exitosamente`
          );
        } else {
          toast.error(t('errors.saveGoals'));
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || t('errors.saveGoals'));
      }
    } catch (error) {
      console.error('Error al crear metas generadas por IA:', error);
      toast.error(t('errors.saveGoals'));
    }
  };

  const handleSessionsGenerated = async (generatedSessions: Session[]) => {
    // Actualizar el estado local con las nuevas sesiones
    setSessions(prevSessions => [...prevSessions, ...generatedSessions]);
    setIsGenerateSessionsModalOpen(false);
  };

  // Funciones para gestión de metas
  const handleGoalCreated = () => {
    loadGoals(); // Recargar goals después de crear o editar uno
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm(t('confirmations.deleteGoal'))) return;

    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setGoals(prevGoals => prevGoals.filter(goal => goal._id !== goalId));
          toast.success(t('success.goalDeleted'));
        }
      }
    } catch (error) {
      console.error('Error al eliminar meta:', error);
      toast.error(t('errors.deleteGoal'));
    }
  };

  //! EL COACH NO PUEDE MARCAR COMO COMPLETADO MAS DESAFIOS SOLO EL CLIENTE PUEDE MARCARLOS
  // const handleToggleGoalCompletion = async (
  //   goalId: string,
  //   currentStatus: boolean
  // ) => {
  //   try {
  //     const response = await fetch(`/api/goals/${goalId}`, {
  //       method: 'PUT',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         isCompleted: !currentStatus,
  //       }),
  //     });

  //     if (response.ok) {
  //       const data = await response.json();
  //       if (data.success) {
  //         setGoals(prevGoals =>
  //           prevGoals.map(goal =>
  //             goal._id === goalId
  //               ? { ...goal, isCompleted: !currentStatus }
  //               : goal
  //           )
  //         );
  //         toast.success(
  //           currentStatus
  //             ? t('success.goalMarkedPending')
  //             : t('success.goalMarkedCompleted')
  //         );
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error al actualizar estado de meta:', error);
  //     toast.error(t('errors.updateGoalStatus'));
  //   }
  // };

  const startEditingGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setIsCreateGoalModalOpen(true);
  };

  // Funciones para gestión de sesiones
  const handleEditSession = (session: Session) => {
    setEditingSessionId(session._id);
    // Extraer fecha y hora del campo date
    const sessionDate = new Date(session.date);
    const dateString = sessionDate.toISOString().split('T')[0];
    const timeString = sessionDate.toTimeString().slice(0, 5);
    setEditingSession({ date: dateString, time: timeString });
  };

  const handleUpdateSession = async (sessionId: string) => {
    if (!editingSession.date.trim() || !editingSession.time.trim()) {
      toast.error(t('errors.completeFields'));
      return;
    }

    try {
      const response = await fetch(`/api/meets/${sessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: editingSession.date,
          time: editingSession.time,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Recargar las sesiones para obtener los datos actualizados
          loadSessions();
          setEditingSessionId(null);
          setEditingSession({ date: '', time: '' });
          toast.success(t('success.sessionUpdated'));
        }
      }
    } catch (error) {
      console.error('Error al actualizar sesión:', error);
      toast.error(t('errors.updateSession'));
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/meets/${sessionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSessions(prevSessions =>
            prevSessions.filter(session => session._id !== sessionId)
          );
          toast.success(t('success.sessionDeleted'));
        }
      }
    } catch (error) {
      console.error('Error al eliminar sesión:', error);
      toast.error(t('errors.deleteSession'));
    } finally {
      setDeletingSessionId(null);
    }
  };

  const startDeletingSession = (sessionId: string) => {
    setDeletingSessionId(sessionId);
  };

  const cancelDeletingSession = () => {
    setDeletingSessionId(null);
  };

  const handleToggleSessionCompletion = async (
    sessionId: string,
    currentStatus: boolean
  ) => {
    try {
      const response = await fetch(`/api/meets/${sessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isCancelled: !currentStatus,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Recargar las sesiones para obtener los datos actualizados
          loadSessions();
          toast.success(
            currentStatus
              ? t('success.sessionMarkedActive')
              : t('success.sessionMarkedCancelled')
          );
        }
      }
    } catch (error) {
      console.error('Error al actualizar estado de sesión:', error);
      toast.error(t('errors.updateSessionStatus'));
    }
  };

  const cancelEditingSession = () => {
    setEditingSessionId(null);
    setEditingSession({ date: '', time: '' });
  };

  // Función para validar si el formulario de configuración está completado
  const isConfigFormCompleted = () => {
    return (
      (objectiveData?.objective.configFile &&
        objectiveData.objective.configFile.length > 0) ||
      isFormCompleted
    );
  };

  // Función para manejar el clic en "Generar con IA"
  const handleAIGeneratorClick = () => {
    if (!isConfigFormCompleted()) {
      toast.error(t('errors.configRequired'));
      return;
    }
    setIsAIGeneratorOpen(true);
  };

  if (!objectiveData) return null;

  const { objective } = objectiveData;
  console.log('objective', objective);
  const completedGoals = goals.filter(goal => goal.isCompleted).length;
  const totalGoals = goals.length;
  const progress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-4 mt-4 flex flex-row justify-between items-center">
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Target className="h-6 w-6" />
            {objective.title}
          </DialogTitle>
          {objective.active && !objective.isCompleted && (
            <DialogDescription>
              <FinalizeObjectiveModal
                objectiveId={objective._id}
                objectiveTitle={objective.title}
              />
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6">
          {/* Header con información del objetivo */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {t('header.title')}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant={objective.active ? 'active' : 'inactive'}>
                    {objective.active ? t('header.status.active') : t('header.status.inactive')}
                  </Badge>
                  <Badge variant={objective.isCompleted ? 'active' : 'outline'}>
                    {objective.isCompleted ? t('header.status.completed') : t('header.status.inProgress')}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {t('header.created')} {formatDateWithLocale(new Date(objective.createdAt), 'long')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {t('header.progress')} {Math.round(progress)}%
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {t('header.startDate')} {formatDateWithLocale(new Date(objective.startDate), 'long')}
                  </span>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t('header.generalProgress')}</span>
                  <span>
                    {completedGoals} de {totalGoals} {t('header.goalsCompleted')}
                  </span>
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

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-4 border-solid border-2 border-border rounded-md bg-card p-1 h-auto">
              <TabsTrigger
                value="details"
                className="data-[state=active]:bg-accent"
              >
                {t('tabs.details')}
              </TabsTrigger>
              <TabsTrigger
                value="config"
                className="data-[state=active]:bg-accent"
              >
                {t('tabs.config')}
              </TabsTrigger>
              <TabsTrigger
                value="notes"
                className="data-[state=active]:bg-accent"
              >
                {t('tabs.notes')}
              </TabsTrigger>
              <TabsTrigger
                value="sessions"
                className="data-[state=active]:bg-accent"
              >
                {t('tabs.sessions')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sección de Desafíos */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        {t('goals.title', { count: totalGoals })}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => setIsCreateGoalModalOpen(true)}
                        >
                          <Plus className="h-4 w-4" />
                          {t('goals.newGoal')}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {loadingGoals ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                            <p className="text-sm text-muted-foreground">
                              {t('goals.loading')}
                            </p>
                          </div>
                        </div>
                      ) : goals.length > 0 ? (
                        goals.map(goal => (
                          <div
                            key={goal._id}
                            className="flex items-start gap-3 p-3 rounded-lg border"
                            style={{
                              borderColor:
                                goal.surveyRating === 'excellent' ? '#22c55e' : // green-500  
                                  goal.surveyRating === 'so-so' ? '#eab308' : // yellow-500
                                    goal.surveyRating === 'bad' ? '#ef4444' : // red-500
                                      '#6b7280', // gray-500
                            }}
                          >
                            <button
                              className="mt-1 flex-shrink-0"
                            >
                              {goal.isCompleted ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <Circle className="h-4 w-4 text-muted-foreground hover:text-primary" />
                              )}
                            </button>

                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm ${goal.isCompleted ? 'line-through text-muted-foreground' : ''}`}
                              >
                                {goal.description}
                              </p>
                              <div className="flex items-center justify-between mt-1">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    {goal.date ? new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(goal.date)) : ''}
                                  </span>
                                </div>
                                <div className="flex gap-1">
                                  {!goal.isCompleted && <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => startEditingGoal(goal)}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>}
                                  {!goal.isCompleted && <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleDeleteGoal(goal._id)
                                    }
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>}
                                </div>
                              </div>
                              {goal.surveyComment && (
                                <div className="text-left text-xs text-muted-foreground border border-muted-foreground rounded-md p-2 mt-2">
                                  {goal.surveyComment}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            {t('goals.empty')}
                          </p>

                          {/* Mensaje de configuración requerida */}
                          {!isConfigFormCompleted() && (
                            <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                              <p className="text-xs text-yellow-700">
                                ⚠️ {t('goals.configWarning')}
                              </p>
                            </div>
                          )}

                          <div className="flex gap-2 justify-center mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleAIGeneratorClick}
                              disabled={
                                !objective.active || !isConfigFormCompleted()
                              }
                              title={
                                !isConfigFormCompleted()
                                  ? t('goals.configRequired')
                                  : t('goals.aiGenerate')
                              }
                            >
                              <Sparkles className="h-3 w-3 mr-1" />
                              {t('goals.aiGenerate')}
                              {!isConfigFormCompleted() && (
                                <span className="ml-1 text-xs bg-yellow-100 text-yellow-800 px-1 rounded">
                                  ⚠️
                                </span>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => setIsCreateGoalModalOpen(true)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              {t('goals.createManually')}
                            </Button>
                          </div>
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
                      {t('notes.title', { count: notes.length })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {notes.length > 0 ? (
                        notes.map(note => (
                          <div key={note._id} className="p-3 rounded-lg border">
                            <div className="flex items-center gap-2 mb-2">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs font-medium">
                                {note.createdBy}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDateWithLocale(new Date(note.createdAt), 'short')}
                              </span>
                            </div>
                            <p className="text-sm">{note.content}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            {t('notes.empty')}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="config" className="space-y-4 mt-4">
              <ObjectiveConfigForm
                objectiveId={objective._id}
                handleConfigFormCompleted={setIsFormCompleted}
              />
            </TabsContent>

            <TabsContent value="notes" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {t('notes.title', { count: notes.length })}
                    </CardTitle>
                    <button
                      onClick={() => setIsCreateNoteModalOpen(true)}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      {t('notes.newNote')}
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {loadingNotes ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-sm text-muted-foreground">
                            {t('notes.loading')}
                          </p>
                        </div>
                      </div>
                    ) : notes.length > 0 ? (
                      notes.map(note => (
                        <div key={note._id} className="p-3 rounded-lg border">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs font-medium">
                              {note.createdBy}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDateWithLocale(new Date(note.createdAt), 'short')}
                            </span>
                          </div>
                          <h4 className="text-sm font-medium mb-1">
                            {note.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {note.content}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {t('notes.empty')}
                        </p>
                        <button
                          onClick={() => setIsCreateNoteModalOpen(true)}
                          className="mt-2 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3"
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          {t('notes.createFirst')}
                        </button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="sessions" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        {t('sessions.title', { count: sessions.length })}
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => setIsGenerateSessionsModalOpen(true)}
                      >
                        <Plus className="h-4 w-4" />
                        {t('sessions.generate')}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {loadingSessions ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                            <p className="text-sm text-muted-foreground">
                              {t('sessions.loading')}
                            </p>
                          </div>
                        </div>
                      ) : sessions.length > 0 ? (
                        sessions.map(session => (
                          <div
                            key={session._id}
                            className="p-3 rounded-lg border"
                          >
                            {editingSessionId === session._id ? (
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                  <Input
                                    type="date"
                                    value={editingSession.date}
                                    onChange={e =>
                                      setEditingSession(prev => ({
                                        ...prev,
                                        date: e.target.value,
                                      }))
                                    }
                                  />
                                  <Input
                                    type="time"
                                    value={editingSession.time}
                                    onChange={e =>
                                      setEditingSession(prev => ({
                                        ...prev,
                                        time: e.target.value,
                                      }))
                                    }
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleUpdateSession(session._id)
                                    }
                                  >
                                    <Save className="h-3 w-3 mr-1" />
                                    {t('buttons.save')}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={cancelEditingSession}
                                  >
                                    <X className="h-3 w-3 mr-1" />
                                    {t('buttons.cancel')}
                                  </Button>
                                </div>
                              </div>
                            ) : deletingSessionId === session._id ? (
                              <div className="space-y-3">
                                <div className="p-3 rounded-lg border border-red-200 bg-red-50">
                                  <h4 className="text-sm font-medium text-red-800 mb-1">
                                    {t('sessions.confirmDelete.title')}
                                  </h4>
                                  <p className="text-xs text-red-600">
                                    {t('sessions.confirmDelete.message')}{' '}
                                    {formatDateWithLocale(session.date, 'full')}{' '}
                                    a las{' '}
                                    {formatTimeWithLocale(session.date, 'time-24')}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                      handleDeleteSession(session._id)
                                    }
                                  >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    {t('sessions.confirmDelete.yes')}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={cancelDeletingSession}
                                  >
                                    <X className="h-3 w-3 mr-1" />
                                    {t('sessions.confirmDelete.no')}
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-2 mb-2">
                                  <Calendar className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs font-medium">
                                    {formatDateWithLocale(session.date, 'full')}
                                  </span>
                                </div>
                                {(session.link && new Date(session.date) > new Date()) && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">
                                      {t('sessions.link')}
                                    </span>
                                    <a
                                      href={session.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-600 hover:underline"
                                    >
                                      {t('sessions.joinSession')}
                                    </a>
                                  </div>
                                )}
                                <div className="flex items-center justify-between mt-2">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">
                                      {formatTimeWithLocale(session.date, 'time-24')}
                                    </span>
                                  </div>
                                  {!session.isCancelled &&
                                    new Date(session.date) > new Date() && (
                                      <div className="flex gap-1">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() =>
                                            handleEditSession(session)
                                          }
                                          title={t('sessions.editSession')}
                                        >
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() =>
                                            startDeletingSession(session._id)
                                          }
                                          title={t('sessions.deleteSession')}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    )}
                                </div>
                              </>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            {t('sessions.empty')}
                          </p>
                          <Button
                            onClick={() => setIsGenerateSessionsModalOpen(true)}
                            className="mt-3"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            {t('sessions.generateFirst')}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>

      <CreateNoteModal
        isOpen={isCreateNoteModalOpen}
        onClose={() => setIsCreateNoteModalOpen(false)}
        objectiveId={objective._id}
        clientId={clientId || ''}
        coachId={coachId || ''}
        onNoteCreated={handleNoteCreated}
      />

      <CreateGoalModal
        isOpen={isCreateGoalModalOpen}
        onClose={() => {
          setIsCreateGoalModalOpen(false);
          setEditingGoal(null);
        }}
        objectiveId={objective._id}
        clientId={clientId}
        coachId={coachId}
        onGoalCreated={handleGoalCreated}
        editingGoal={editingGoal}
      />

      <AIGoalsGenerator
        isOpen={isAIGeneratorOpen}
        onClose={() => setIsAIGeneratorOpen(false)}
        objectiveId={objective._id}
        objectiveTitle={objective.title}
        onGoalsGenerated={handleAIGoalsGenerated}
      />

      <GenerateSessionsModal
        isOpen={isGenerateSessionsModalOpen}
        onClose={() => setIsGenerateSessionsModalOpen(false)}
        objectiveId={objective._id}
        onSessionsGenerated={handleSessionsGenerated}
        clientId={clientId || ''}
        coachId={coachId || ''}
      />
    </Dialog>
  );
}
