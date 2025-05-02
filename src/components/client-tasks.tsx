'use client'

import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { toast } from 'sonner';

const ClientTasks: React.FC = () => {
  const theme = useTheme();
  const [isDailyTaskCompleted, setIsDailyTaskCompleted] = useState(false);

  const handleDailyTaskClick = () => {
    setIsDailyTaskCompleted(!isDailyTaskCompleted);
    if (!isDailyTaskCompleted) {
      toast.success('¡Tarea diaria completada!', {
        position: 'bottom-center',
      });
    }
  };

  return (
    <div className="flex flex-col h-full" style={{
      backgroundColor: theme.palette.background.default
    }}>
      {/* Fila superior */}
      <div className="flex flex-1 mb-4">
        {/* Sección Tareas (Superior Izquierda) */}
        <div className="flex-1 rounded-lg p-6 mr-4" style={{
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[1]
        }}>
          <h2 className="text-center mt-0 mb-4" style={{
            color: theme.palette.text.primary
          }}>
            Tareas Diarias y Pasadas
          </h2>
          {/* Sección Tarea Diaria */}
          <div 
            onClick={handleDailyTaskClick}
            className={`h-1/2 rounded p-4 mb-4 cursor-pointer transition-all duration-200 hover:opacity-90 ${isDailyTaskCompleted ? 'ring-2 ring-green-500' : ''}`}
            style={{
              border: `1px dashed ${theme.palette.divider}`,
              backgroundColor: theme.palette.action.hover
            }}
          >
            <div className="flex justify-between items-center">
              <h3 className="mt-0 mb-2" style={{ color: theme.palette.text.primary }}>Tarea Diaria</h3>
              {isDailyTaskCompleted && (
                <span className="text-green-500 text-sm">✓ Completada</span>
              )}
            </div>
            <p className="m-0" style={{ color: theme.palette.text.secondary }}>Descripción de la tarea diaria aquí...</p>
          </div>

          {/* Sección Tareas Pasadas (dividida) */}
          <div className="flex gap-4">
            {/* Columna Tareas Completadas */}
            <div className="flex-1">
              <h4 className="mt-0" style={{ color: theme.palette.text.primary }}>Completadas</h4>
              <ul className="pl-5 m-0" style={{ color: theme.palette.text.secondary }}>
                <li>Tarea A (Completada)</li>
                <li>Tarea B (Completada)</li>
              </ul>
            </div>
            {/* Columna Tareas Incompletas */}
            <div className="flex-1">
              <h4 className="mt-0" style={{ color: theme.palette.text.primary }}>Incompletas</h4>
              <ul className="pl-5 m-0" style={{ color: theme.palette.text.secondary }}>
                <li>Tarea C (Incompleta)</li>
                <li>Tarea D (Incompleta)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sección Notas (Derecha) */}
        <div className="flex-1 rounded-lg p-6" style={{
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[1]
        }}>
          <h2 className="text-center mt-0 mb-4" style={{
            color: theme.palette.text.primary
          }}>
            Notas del Coach
          </h2>
          <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[calc(100%-4rem)]">
            {/* Card 1 */}
            <div className="rounded-lg p-4" style={{
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.default
            }}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold" style={{ color: theme.palette.text.primary }}>15 Marzo 2024</h3>
                <span className="text-xs px-2 py-1 rounded-full" style={{
                  backgroundColor: theme.palette.info.main,
                  color: theme.palette.info.contrastText
                }}>Importante</span>
              </div>
              <p className="text-sm mb-2" style={{ color: theme.palette.text.secondary }}>
                Mejorar la técnica de respiración durante los ejercicios de cardio.
              </p>
            </div>

            <div className="rounded-lg p-4" style={{
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.default
            }}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold" style={{ color: theme.palette.text.primary }}>14 Marzo 2024</h3>
                <span className="text-xs px-2 py-1 rounded-full" style={{
                  backgroundColor: theme.palette.info.main,
                  color: theme.palette.info.contrastText
                }}>Progreso</span>
              </div>
              <p className="text-sm mb-2" style={{ color: theme.palette.text.secondary }}>
                Excelente progreso en los ejercicios de peso muerto. Aumentar peso gradualmente.
              </p>
            </div>

            <div className="rounded-lg p-4" style={{
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.default
            }}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold" style={{ color: theme.palette.text.primary }}>13 Marzo 2024</h3>
                <span className="text-xs px-2 py-1 rounded-full" style={{
                  backgroundColor: theme.palette.warning.main,
                  color: theme.palette.warning.contrastText
                }}>Recordatorio</span>
              </div>
              <p className="text-sm mb-2" style={{ color: theme.palette.text.secondary }}>
                Mantener el control de la dieta durante los fines de semana. Seguir el plan de comidas establecido.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fila inferior */}
      <div className="flex flex-1">
        {/* Sección Feedback (Inferior Izquierda) */}
        <div className="flex-1 rounded-lg p-6" style={{
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[1]
        }}>
          <h2 className="text-center mt-0 mb-4" style={{
            color: theme.palette.text.primary
          }}>
            Feedback
          </h2>
          {/* Contenido de feedback aquí */}
          <p style={{ color: theme.palette.text.secondary }}>Feedback general sobre el proceso...</p>
        </div>
      </div>
    </div>
  );
};

export default ClientTasks;
