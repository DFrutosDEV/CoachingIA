'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

interface Goal {
  _id: string;
  description: string;
  day: number;
  date: string; // Fecha completa del goal
  isCompleted: boolean;
  createdAt: string;
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
  const locale = pathname.split('/')[1] || 'es';
  const [tasksData, setTasksData] = useState<TasksData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingGoal, setUpdatingGoal] = useState<string | null>(null);

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
        setTasksData(result.data);
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
      today.getFullYear() === goalDateObj.getFullYear() &&
      today.getMonth() === goalDateObj.getMonth() &&
      today.getDate() === goalDateObj.getDate()
    );
  };

  // Actualizar estado de una tarea
  const updateGoalStatus = async (goalId: string, isCompleted: boolean) => {
    // Buscar el goal para verificar si es del día actual
    const goal = tasksData?.goals.find(g => g._id === goalId);

    if (goal && !isToday(goal.date)) {
      toast.error(t('errors.cannotCompleteTask'));
      return;
    }

    try {
      setUpdatingGoal(goalId);
      const response = await fetch(`/api/client/tasks/goals/${goalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isCompleted }),
      });

      const result = await response.json();

      if (result.success) {
        // Actualizar el estado local
        setTasksData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            goals: prev.goals.map(goal =>
              goal._id === goalId ? { ...goal, isCompleted } : goal
            ),
          };
        });

        toast.success(result.message);
      } else {
        toast.error(t('errors.updateTask'));
      }
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      toast.error(t('errors.updateTask'));
    } finally {
      setUpdatingGoal(null);
    }
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
      <div className="flex flex-1 mb-4">
        {/* Sección Tareas (Superior Izquierda) */}
        <div
          className="flex-1 rounded-lg p-6 mr-4"
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
            {t('title')}
          </h2>

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

          {/* Sección Tareas por Día */}
          {tasksData?.goals && tasksData.goals.length > 0 ? (
            <div className="space-y-3 max-h-76 overflow-y-auto pr-2 scrollbar-thin">
              {tasksData.goals.map(goal => {
                return (
                  <div
                    key={goal._id}
                    onClick={() => updateGoalStatus(goal._id, !goal.isCompleted)}
                    className={`p-3 rounded transition-all duration-200 cursor-pointer hover:opacity-90 ${goal.isCompleted ? 'ring-2 ring-green-500' : ''}`}
                    style={{
                      border: `1px dashed ${theme.palette.divider}`,
                      backgroundColor: goal.isCompleted
                        ? theme.palette.success.light
                        : theme.palette.action.hover,
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h3
                          className="text-sm font-medium mb-1"
                          style={{ color: theme.palette.text.primary }}
                        >
                          {t('day', { day: goal.day })}
                        </h3>
                        <p
                          className="text-xs"
                          style={{ color: theme.palette.text.secondary }}
                        >
                          {goal.description}
                        </p>
                      </div>
                      <div className="flex items-center ml-2">
                        {updatingGoal === goal._id ? (
                          <div
                            className="animate-spin rounded-full h-4 w-4 border-b-2"
                            style={{ borderColor: theme.palette.primary.main }}
                          ></div>
                        ) : (
                          <>
                            {goal.isCompleted && (
                              <span className="text-green-500 text-sm mr-2">
                                ✓
                              </span>
                            )}
                            <span
                              className="text-xs px-2 py-1 rounded-full"
                              style={{
                                backgroundColor: goal.isCompleted
                                  ? theme.palette.success.main
                                  : theme.palette.warning.main,
                                color: goal.isCompleted
                                  ? theme.palette.success.contrastText
                                  : theme.palette.warning.contrastText,
                              }}
                            >
                              {goal.isCompleted ? t('status.completed') : t('status.pending')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className="text-center py-8"
              style={{ color: theme.palette.text.secondary }}
            >
              <p>{t('noTasks')}</p>
            </div>
          )}

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
                      {/* //! TODO: Implementar una solucion mas general llevando esta logica a un hook/archivo de utilidades. */}
                      {new Date(note.createdAt).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US')}
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
                        {t('session', { date: new Date(note.sessionInfo.date).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US') })}
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
      <div className="flex flex-1">
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
                  {new Date(tasksData.feedback.createdAt).toLocaleDateString(
                    locale === 'es' ? 'es-ES' : 'en-US'
                  )}
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
    </div>
  );
};

export default ClientTasks;
