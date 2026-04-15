'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { DEFAULT_LOCALE, useDateFormatter } from '@/utils/date-formatter';
import { GOAL_SURVEY_COMMENT_MAX_LENGTH } from '@/lib/constants/goal';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Circle, Clock, Target } from 'lucide-react';

interface Goal {
  _id: string;
  description: string;
  day: number;
  date: string; // Fecha completa del goal
  isCompleted: boolean;
  createdAt: string;
  surveyRating?: 'excellent' | 'so-so' | 'bad';
  surveyComment?: string;
}

interface Note {
  _id: string;
  title: string;
  content: string;
  createdBy: string;
  createdAt: string;
  sessionInfo?: {
    date: string;
    link: string;
  };
}

interface Objective {
  _id: string;
  title: string;
  isCompleted: boolean;
  active: boolean;
  createdAt: string;
  coach: string;
}

interface Feedback {
  _id: string;
  feedback: string;
  createdAt: string;
}

interface TasksData {
  currentObjective: Objective | null;
  goals: Goal[];
  notes: Note[];
  feedback: Feedback | null;
  hasData: boolean;
}

const ClientTasks: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const t = useTranslations('common.dashboard.clientTasks');
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || DEFAULT_LOCALE;
  const { formatDate } = useDateFormatter();
  const [tasksData, setTasksData] = useState<TasksData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingGoal, setUpdatingGoal] = useState<string | null>(null);
  const [surveyOpen, setSurveyOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [selectedRating, setSelectedRating] = useState<'excellent' | 'so-so' | 'bad' | null>(null);
  const [surveyComment, setSurveyComment] = useState('');

  // Cargar datos de tareas
  const loadTasksData = async () => {
    if (!user?._id) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/client/tasks?profileId=${user.profile._id}`
      );
      const result = await response.json();

      if (result.success) {
        const filteredData = {
          ...result.data,
          goals: result.data.goals.filter((goal: Goal) => {
            if (!goal.date) return false;
            const goalDate = new Date(goal.date);
            return goalDate <= new Date();
          }),
        };

        setTasksData(filteredData);
      } else {
        toast.error(t('errors.loadTasks'));
      }
    } catch (error) {
      console.error('Error al cargar tareas:', error);
      toast.error(t('errors.loadTasks'));
    } finally {
      setLoading(false);
    }
  };

  // Verificar si un goal es del día actual
  const isToday = (goalDate: string): boolean => {
    if (!goalDate) return false;
    const today = new Date();
    const goalDateObj = new Date(goalDate);

    // Comparar año, mes y día
    return (
      today.getUTCFullYear() === goalDateObj.getUTCFullYear() &&
      today.getUTCMonth() === goalDateObj.getUTCMonth() &&
      today.getUTCDate() === goalDateObj.getUTCDate()
    );
  };

  // Abrir modal de encuesta cuando se hace clic en un goal
  const handleGoalClick = (goal: Goal) => {
    if (goal.surveyRating) {
      toast.error(t('survey.alreadyCompleted'));
      return;
    }

    // Si ya está completado, no hacer nada
    if (goal.isCompleted) {
      return;
    }

    // Verificar si es del día actual
    if (!isToday(goal.date) && new Date(goal.date) > new Date()) {
      toast.error(t('errors.cannotCompleteTask'));
      return;
    }

    // Abrir el modal de encuesta
    setSelectedGoal(goal);
    setSelectedRating(null);
    setSurveyComment('');
    setSurveyOpen(true);
  };

  // Confirmar y enviar la encuesta
  const handleConfirmSurvey = async () => {
    if (!selectedGoal || !selectedRating) {
      return;
    }

    try {
      setUpdatingGoal(selectedGoal._id);
      const response = await fetch(`/api/client/tasks/goals/${selectedGoal._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isCompleted: true,
          surveyRating: selectedRating,
          surveyComment: surveyComment.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Actualizar el estado local
        setTasksData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            goals: prev.goals.map(goal =>
              goal._id === selectedGoal._id
                ? { ...goal, isCompleted: true, surveyRating: selectedRating, surveyComment: surveyComment.trim() }
                : goal
            ),
          };
        });

        toast.success(result.message);
        setSurveyOpen(false);
        setSelectedGoal(null);
        setSelectedRating(null);
        setSurveyComment('');
      } else {
        if (result.status === 'already_answered') {
          setTasksData(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              goals: prev.goals.map(goal =>
                goal._id === selectedGoal._id
                  ? {
                    ...goal,
                    isCompleted: true,
                    surveyRating:
                      goal.surveyRating ?? selectedGoal.surveyRating ?? undefined,
                    surveyComment:
                      goal.surveyComment ?? selectedGoal.surveyComment ?? '',
                  }
                  : goal
              ),
            };
          });
          handleCloseSurvey();
          toast.error(result.error || t('survey.alreadyCompleted'));
          return;
        }

        toast.error(result.error || t('errors.updateTask'));
      }
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      toast.error(t('errors.updateTask'));
    } finally {
      setUpdatingGoal(null);
    }
  };

  // Cerrar el modal sin confirmar
  const handleCloseSurvey = () => {
    setSurveyOpen(false);
    setSelectedGoal(null);
    setSelectedRating(null);
    setSurveyComment('');
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadTasksData();
  }, [user?._id]);

  // Separar tareas completadas e incompletas
  const completedGoals =
    tasksData?.goals.filter(goal => goal.isCompleted) || [];
  const incompleteGoals =
    tasksData?.goals.filter(goal => !goal.isCompleted) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4"
            style={{ borderColor: theme.palette.primary.main }}
          ></div>
          <p style={{ color: theme.palette.text.secondary }}>
            {t('loading')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{
        backgroundColor: theme.palette.background.default,
      }}
    >
      {/* Fila superior */}
      <div className="flex flex-col lg:flex-row flex-1 mb-4 gap-4">
        {/* Sección Tareas (Superior Izquierda) */}
        <div
          className="flex-1 rounded-lg p-6"
          style={{
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[1],
          }}
        >
          {tasksData?.currentObjective && (
            <div
              className="mb-4 p-3 rounded"
              style={{
                backgroundColor: theme.palette.info.light,
                color: theme.palette.info.contrastText,
              }}
            >
              <h3 className="text-sm font-semibold mb-1">
                {t('currentObjective', { title: tasksData.currentObjective.title })}
              </h3>
              <p className="text-xs">
                {t('coach', { coach: tasksData.currentObjective.coach })}
              </p>
            </div>
          )}

          {/* Sección Desafíos (estilo modal) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                {t('title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {tasksData?.goals && tasksData.goals.length > 0 ? (
                  tasksData.goals.map(goal => (
                    <div
                      key={goal._id}
                      onClick={() => handleGoalClick(goal)}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 ${goal.isCompleted || goal.surveyRating ? '' : 'cursor-pointer hover:opacity-90'}`}
                      style={{
                        borderColor:
                          goal.surveyRating === 'excellent'
                            ? '#22c55e'
                            : goal.surveyRating === 'so-so'
                              ? '#eab308'
                              : goal.surveyRating === 'bad'
                                ? '#ef4444'
                                : '#6b7280',
                      }}
                    >
                      <div className="mt-1 flex-shrink-0">
                        {updatingGoal === goal._id ? (
                          <div
                            className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"
                          />
                        ) : goal.isCompleted ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground hover:text-primary" />
                        )}
                      </div>

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
                              {goal.date
                                ? formatDate(goal.date, 'custom', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    timeZone: 'UTC',
                                  })
                                : ''}
                            </span>
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
                      {t('noTasks')}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resumen de tareas */}
          {tasksData?.goals && tasksData.goals.length > 0 && (
            <div
              className="mt-4 p-3 rounded"
              style={{
                backgroundColor: theme.palette.background.default,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <h4
                className="text-sm font-semibold mb-2"
                style={{ color: theme.palette.text.primary }}
              >
                {t('summary')}
              </h4>
              <div className="flex gap-4 text-xs">
                <span style={{ color: theme.palette.success.main }}>
                  {t('completed', { count: completedGoals.length })}
                </span>
                <span style={{ color: theme.palette.warning.main }}>
                  {t('pending', { count: incompleteGoals.length })}
                </span>
                <span style={{ color: theme.palette.text.secondary }}>
                  {t('total', { count: tasksData?.goals?.length || 0 })}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Sección Notas (Derecha) */}
        <div
          className="flex-1 rounded-lg p-6"
          style={{
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[1],
          }}
        >
          <h2
            className="text-center mt-0 mb-4"
            style={{
              color: theme.palette.text.primary,
            }}
          >
            {t('coachNotes')}
          </h2>
          <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[calc(100%-4rem)]">
            {tasksData?.notes && tasksData.notes.length > 0 ? (
              tasksData.notes.map(note => (
                <div
                  key={note._id}
                  className="rounded-lg p-4"
                  style={{
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor: theme.palette.background.default,
                  }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: theme.palette.info.main,
                        color: theme.palette.info.contrastText,
                      }}
                    >
                      {note.title || t('note')}
                    </span>
                    <h3
                      className="text-sm font-semibold"
                      style={{ color: theme.palette.text.primary }}
                    >
                      {formatDate(note.createdAt, 'short')}
                    </h3>
                  </div>
                  <p
                    className="text-sm mb-2"
                    style={{ color: theme.palette.text.secondary }}
                  >
                    {note.content}
                  </p>
                  {note.sessionInfo && (
                    <div
                      className="text-xs"
                      style={{ color: theme.palette.text.secondary }}
                    >
                      <p>
                        {t('session', {
                          date: formatDate(note.sessionInfo.date, 'short'),
                        })}
                      </p>
                    </div>
                  )}
                  <p
                    className="text-xs mt-1"
                    style={{ color: theme.palette.text.secondary }}
                  >
                    {t('by', { createdBy: note.createdBy })}
                  </p>
                </div>
              ))
            ) : (
              <div
                className="text-center py-8"
                style={{ color: theme.palette.text.secondary }}
              >
                <p>{t('noNotes')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fila inferior */}
      <div className="flex flex-col lg:flex-row flex-1">
        {/* Sección Feedback (Inferior Izquierda) */}
        <div
          className="flex-1 rounded-lg p-6"
          style={{
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[1],
          }}
        >
          <h2
            className="text-center mt-0 mb-4"
            style={{
              color: theme.palette.text.primary,
            }}
          >
            {t('feedback')}
          </h2>
          {tasksData?.feedback ? (
            <div
              className="p-4 rounded"
              style={{
                backgroundColor: theme.palette.background.default,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <div className="mb-2">
                <span
                  className="text-xs px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: theme.palette.success.main,
                    color: theme.palette.success.contrastText,
                  }}
                >
                  {formatDate(tasksData.feedback.createdAt, 'short')}
                </span>
              </div>
              <p
                className="text-sm"
                style={{ color: theme.palette.text.secondary }}
              >
                {tasksData.feedback.feedback}
              </p>
            </div>
          ) : (
            <div
              className="text-center py-8"
              style={{ color: theme.palette.text.secondary }}
            >
              <p>{t('noFeedback')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Encuesta */}
      <Dialog open={surveyOpen} onOpenChange={handleCloseSurvey}>
        <DialogContent
          style={{
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: theme.palette.text.primary }}>
              {t('survey.title')}
            </DialogTitle>
            <DialogDescription style={{ color: theme.palette.text.secondary }}>
              {selectedGoal?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Opciones del semáforo */}
            <div className="space-y-3">
              {(['excellent', 'so-so', 'bad'] as const).map((rating) => {
                const isSelected = selectedRating === rating;
                const emoji = t(`survey.options.${rating}.emoji`);
                const label = t(`survey.options.${rating}.label`);
                const description = t(`survey.options.${rating}.description`);

                let borderColor = theme.palette.divider;
                let backgroundColor = theme.palette.background.default;
                if (isSelected) {
                  if (rating === 'excellent') {
                    borderColor = '#22c55e'; // green-500
                    backgroundColor = theme.palette.success.light;
                  } else if (rating === 'so-so') {
                    borderColor = '#eab308'; // yellow-500
                    backgroundColor = theme.palette.warning.light;
                  } else {
                    borderColor = '#ef4444'; // red-500
                    backgroundColor = theme.palette.error.light;
                  }
                }

                return (
                  <div
                    key={rating}
                    onClick={() => setSelectedRating(rating)}
                    className="p-4 rounded-lg cursor-pointer transition-all duration-200 hover:opacity-90"
                    style={{
                      border: `2px solid ${borderColor}`,
                      backgroundColor,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{emoji}</span>
                      <div className="flex-1">
                        <h4
                          className="font-semibold mb-1"
                          style={{ color: theme.palette.text.primary }}
                        >
                          {label}
                        </h4>
                        <p
                          className="text-sm"
                          style={{ color: theme.palette.text.secondary }}
                        >
                          {description}
                        </p>
                      </div>
                      {isSelected && (
                        <span className="text-lg">✓</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Campo de comentarios */}
            <div className="space-y-2">
              <label
                className="text-sm font-medium"
                style={{ color: theme.palette.text.primary }}
              >
                {t('survey.commentLabel')}
              </label>
              <textarea
                value={surveyComment}
                onChange={(e) => setSurveyComment(e.target.value)}
                placeholder={t('survey.commentPlaceholder')}
                rows={4}
                maxLength={GOAL_SURVEY_COMMENT_MAX_LENGTH}
                className="w-full p-3 rounded-lg resize-none"
                style={{
                  backgroundColor: theme.palette.background.default,
                  border: `1px solid ${theme.palette.divider}`,
                  color: theme.palette.text.primary,
                }}
              />
              <p
                className="text-xs"
                style={{ color: theme.palette.text.secondary }}
              >
                {surveyComment.length}/{GOAL_SURVEY_COMMENT_MAX_LENGTH}
              </p>
            </div>
          </div>

          <DialogFooter>
            <button
              onClick={handleCloseSurvey}
              className="px-4 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: theme.palette.action.hover,
                color: theme.palette.text.primary,
              }}
            >
              {t('survey.cancelButton')}
            </button>
            <button
              onClick={handleConfirmSurvey}
              disabled={!selectedRating || updatingGoal === selectedGoal?._id}
              className="px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: selectedRating
                  ? theme.palette.primary.main
                  : theme.palette.action.disabled,
                color: selectedRating
                  ? theme.palette.primary.contrastText
                  : theme.palette.action.disabledBackground,
              }}
            >
              {updatingGoal === selectedGoal?._id ? (
                <div className="flex items-center gap-2">
                  <div
                    className="animate-spin rounded-full h-4 w-4 border-b-2"
                    style={{ borderColor: theme.palette.primary.contrastText }}
                  />
                  {t('loading')}
                </div>
              ) : (
                t('survey.confirmButton')
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientTasks;
