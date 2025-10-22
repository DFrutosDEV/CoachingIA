'use client'; // Necesario ya que usaremos hooks como useState y event handlers

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  dayjsLocalizer,
  Event,
  ToolbarProps,
} from 'react-big-calendar';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CalendarService } from '@/lib/services/calendar-service';
import RescheduleModal from './reschedule-modal';
import { useAppSelector } from '@/lib/redux/hooks';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

// Extiende dayjs con el plugin
dayjs.extend(localizedFormat);

// Crea el localizador usando dayjs
const localizer = dayjsLocalizer(dayjs);

// Toolbar simplificado que funciona correctamente
const CustomToolbar = (toolbar: ToolbarProps<SessionEvent, object>) => {
  const t = useTranslations('common.dashboard.calendar');
  const pathname = usePathname();

  // Extraer el locale del path
  const locale = pathname.split('/')[1] || 'es';

  // Configurar dayjs con el locale del path
  dayjs.locale(locale);

  const label = () => {
    const date = dayjs(toolbar.date);
    const month = date.format('MMMM');
    const year = date.format('YYYY');
    return (
      <span className="rbc-toolbar-label">
        {month.charAt(0).toUpperCase() + month.slice(1)} {year}
      </span>
    );
  };

  return (
    <div className="rbc-toolbar">
      {label()}
      <span className="rbc-btn-group">
        <button
          type="button"
          className={toolbar.view === 'month' ? 'rbc-active' : ''}
          onClick={() => toolbar.onView('month')}
        >
          {t('month')}
        </button>
      </span>
    </div>
  );
};

// Definición local del tipo para evitar conflictos
interface SessionEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  client: string;
  coach: string;
  link: string;
  time: string;
  objectiveTitle: string;
}

export default function SessionsPage() {
  const t = useTranslations('common.dashboard.calendar');
  const pathname = usePathname();

  // Extraer el locale del path
  const locale = pathname.split('/')[1] || 'es';

  // Configurar dayjs con el locale del path
  dayjs.locale(locale);

  const [sessions, setSessions] = useState<SessionEvent[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionEvent | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const user = useAppSelector(state => state.auth.user);
  // Función para cargar las sesiones desde el API
  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await CalendarService.getSessions();

      if (result.success) {
        // Las fechas ya vienen correctamente formateadas del API
        console.log('Sesiones recibidas:', result.events);
        setSessions(result.events);
      } else {
        setError(result.error || 'Error al cargar las sesiones');
      }
    } catch (err) {
      console.error('Error cargando sesiones:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Cargar sesiones al montar el componente
  useEffect(() => {
    loadSessions();
  }, []);

  // Debug: Log cuando cambian las sesiones
  useEffect(() => {
    console.log('Renderizando calendario con sesiones:', sessions);
    console.log('Fecha actual:', new Date());
    console.log('Primera sesión:', sessions[0]);
  }, [sessions]);

  const handleSelectEvent = (event: SessionEvent) => {
    console.log('Sesión seleccionada:', event);
    setSelectedSession(event);
  };

  const handleCloseModal = () => {
    setSelectedSession(null);
  };

  const handleSelectSlot = (slotInfo: {
    start: Date;
    end: Date;
    slots: Date[] | string[];
    action: 'select' | 'click' | 'doubleClick';
  }) => {
    console.log('Slot seleccionado:', slotInfo);
    // Aquí podrías permitir crear una nueva sesión en el slot seleccionado
  };

  // Función para recargar las sesiones
  const handleRefresh = () => {
    loadSessions();
  };

  // Función para abrir el modal de reprogramación
  const handleReschedule = () => {
    setShowRescheduleModal(true);
  };

  // Función para cerrar el modal de reprogramación
  const handleCloseRescheduleModal = () => {
    setShowRescheduleModal(false);
  };

  // Función que se ejecuta cuando se reprograma exitosamente
  const handleRescheduleSuccess = () => {
    loadSessions(); // Recargar las sesiones
    handleCloseModal(); // Cerrar el modal de detalles
  };

  if (loading) {
    return (
      <div
        className="p-2 flex items-center justify-center"
        style={{ height: 'calc(100vh - 150px)' }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p>{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="p-2 flex items-center justify-center"
        style={{ height: 'calc(100vh - 150px)' }}
      >
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={handleRefresh} variant="outline">
            {t('retry')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t('title')}</h2>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          {t('update')}
        </Button>
      </div>

      <div
        style={{ height: 'calc(100vh - 200px)' }}
        className="calendar-container"
      >
        <Calendar
          localizer={localizer}
          events={sessions}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          view="month"
          views={['month']}
          components={{
            toolbar: CustomToolbar,
          }}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          messages={{
            next: t('messages.next'),
            previous: t('messages.previous'),
            today: t('messages.today'),
            month: t('messages.month'),
            week: t('messages.week'),
            day: t('messages.day'),
            agenda: t('messages.agenda'),
            date: t('messages.date'),
            time: t('messages.time'),
            event: t('messages.event'),
            noEventsInRange: t('messages.noEventsInRange'),
            showMore: total => `+ ${t('messages.showMore', { total })}`,
          }}
        />
      </div>

      {/* Modal de detalles de la sesión */}
      <Dialog
        open={selectedSession !== null}
        onOpenChange={(isOpen: boolean) => {
          if (!isOpen) {
            handleCloseModal();
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          {selectedSession && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedSession.title}</DialogTitle>
                {selectedSession.description && (
                  <DialogDescription>
                    {selectedSession.description}
                  </DialogDescription>
                )}
                {!selectedSession.description && (
                  <DialogDescription className="italic text-gray-500">
                    {t('noDescription')}
                  </DialogDescription>
                )}
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Cliente */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-right font-medium col-span-1">
                    {t('sessionDetails.client')}
                  </span>
                  <span className="col-span-3">{selectedSession.client}</span>
                </div>
                {/* Coach */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-right font-medium col-span-1">
                    {t('sessionDetails.coach')}
                  </span>
                  <span className="col-span-3">{selectedSession.coach}</span>
                </div>
                {/* Objetivo */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-right font-medium col-span-1">
                    {t('sessionDetails.objective')}
                  </span>
                  <span className="col-span-3">
                    {selectedSession.objectiveTitle}
                  </span>
                </div>
                {/* Hora */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-right font-medium col-span-1">
                    {t('sessionDetails.time')}
                  </span>
                  <span className="col-span-3">{selectedSession.time}</span>
                </div>
                {/* Fecha */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-right font-medium col-span-1">
                    {t('sessionDetails.date')}
                  </span>
                  <span className="col-span-3">
                    {dayjs(selectedSession.start).format('LLLL')}
                  </span>
                </div>
                {/* Enlace */}
                {selectedSession.link && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <span className="text-right font-medium col-span-1">
                      {t('sessionDetails.link')}
                    </span>
                    <span className="col-span-3">
                      <a
                        href={selectedSession.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {t('sessionDetails.joinSession')}
                      </a>
                    </span>
                  </div>
                )}
              </div>
              <DialogFooter className="flex gap-2">
                <Button variant="outline" onClick={handleCloseModal}>
                  {t('actions.close')}
                </Button>

                {user?.role.name === 'coach' && (
                  <Button
                    variant="secondary"
                    onClick={handleReschedule}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {t('actions.reschedule')}
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de reprogramación */}
      <RescheduleModal
        session={selectedSession}
        isOpen={showRescheduleModal}
        onClose={handleCloseRescheduleModal}
        onSuccess={handleRescheduleSuccess}
      />

      <style jsx global>{`
        /* Estilos para mejorar el tema oscuro */
        .calendar-container .rbc-calendar {
          background: transparent;
        }

        .calendar-container .rbc-toolbar {
          background: transparent;
          border: none;
          margin-bottom: 1rem;
        }

        .calendar-container .rbc-toolbar button {
          background: hsl(var(--background));
          color: hsl(var(--foreground));
          border: 1px solid hsl(var(--border));
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .calendar-container .rbc-toolbar button:hover {
          background: hsl(var(--accent));
          color: hsl(var(--accent-foreground));
        }

        .calendar-container .rbc-toolbar button.rbc-active {
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          border-color: hsl(var(--primary));
        }

        .calendar-container .rbc-toolbar-label {
          font-size: 1.125rem;
          font-weight: 600;
          color: hsl(var(--foreground));
        }

        .calendar-container .rbc-month-view {
          background: hsl(var(--background));
          border: 1px solid hsl(var(--border));
          border-radius: 0.5rem;
        }

        .calendar-container .rbc-header {
          background: hsl(var(--muted));
          color: hsl(var(--muted-foreground));
          padding: 0.75rem;
          font-weight: 600;
          border-bottom: 1px solid hsl(var(--border));
        }

        .calendar-container .rbc-date-cell {
          padding: 0.25rem;
          color: hsl(var(--foreground));
        }

        .calendar-container .rbc-day-bg {
          background: hsl(var(--background));
          border: 1px solid hsl(var(--border));
        }

        .calendar-container .rbc-today {
          background: hsl(var(--accent)) !important;
          color: hsl(var(--accent-foreground)) !important;
          font-weight: 600;
        }

        .calendar-container .rbc-off-range-bg {
          background: hsl(var(--muted));
        }

        .calendar-container .rbc-off-range {
          color: hsl(var(--muted-foreground));
        }

        .calendar-container .rbc-event {
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          border: none;
          border-radius: 0.25rem;
          padding: 0.125rem 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .calendar-container .rbc-event:hover {
          background: hsl(var(--primary) / 0.9);
        }

        .calendar-container .rbc-show-more {
          background: hsl(var(--accent));
          color: hsl(var(--accent-foreground));
          border: none;
          border-radius: 0.25rem;
          padding: 0.125rem 0.5rem;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .calendar-container .rbc-show-more:hover {
          background: hsl(var(--accent) / 0.9);
        }
      `}</style>
    </div>
  );
}
