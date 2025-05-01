"use client" // Necesario ya que usaremos hooks como useState y event handlers

import React, { useState } from "react"
import { Calendar, dayjsLocalizer, Event, ToolbarProps } from "react-big-calendar"
import dayjs from "dayjs"
import localizedFormat from "dayjs/plugin/localizedFormat"
import "dayjs/locale/es"
import "react-big-calendar/lib/css/react-big-calendar.css"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

// Extiende dayjs con el plugin y configura el locale
dayjs.extend(localizedFormat)
dayjs.locale("es")

// Crea el localizador usando dayjs
const localizer = dayjsLocalizer(dayjs)

// Define la interfaz para tus eventos de sesión
interface SessionEvent extends Event {
  id: string
  description?: string
  client: string
  // Puedes añadir más campos específicos de la sesión aquí
}

// Datos de ejemplo para las sesiones (en una app real, vendrían de una API)
const sampleSessions: SessionEvent[] = [
  {
    id: "1",
    title: "Sesión con Cliente A",
    start: dayjs().add(1, "day").set("hour", 10).set("minute", 0).toDate(),
    end: dayjs().add(1, "day").set("hour", 11).set("minute", 0).toDate(),
    description: "Revisión de progreso semanal.",
    client: "Cliente A (Empresa X)"
  },
  {
    id: "2",
    title: "Sesión con Cliente B",
    start: dayjs().add(3, "days").set("hour", 14).set("minute", 30).toDate(),
    end: dayjs().add(3, "days").set("hour", 15).set("minute", 30).toDate(), 
    client: "Cliente B (Particular)"
  },
  // Agrega más sesiones aquí
]

const CustomToolbar = (toolbar: ToolbarProps<SessionEvent, object>) => {
  
  const goToBack = () => {
    toolbar.onNavigate('PREV');
  };

  const goToNext = () => {
    toolbar.onNavigate('NEXT');
  };

  const goToCurrent = () => {
    toolbar.onNavigate('TODAY');
  };

  const label = () => {
    const date = dayjs(toolbar.date);
    // Capitaliza la primera letra del mes y devuelve "Mes Año"
    const month = date.format('MMMM');
    const year = date.format('YYYY');
    return (
      <span className="rbc-toolbar-label">
        {month.charAt(0).toUpperCase() + month.slice(1)} {year}
      </span>
    );
  };

  // Si quieres que la navegación siga funcionando pero sin los botones
  // podrías añadir gestos o botones externos que llamen a estas funciones.
  // console.log("Toolbar Props:", toolbar); // Descomenta para ver todas las props disponibles

  return (
    <div className="rbc-toolbar">
      <span className="rbc-btn-group">
         {/* Puedes añadir botones personalizados aquí si quieres */}
         {/* Por ejemplo: <button onClick={goToBack}>&lt;</button> */}
         {/* <button onClick={goToCurrent}>Hoy</button> */}
         {/* <button onClick={goToNext}>&gt;</button> */}
      </span>
      {/* Renderiza solo la etiqueta (Mes Año) */}
      {label()} 
       <span className="rbc-btn-group">
         {/* Aquí es donde estaban los botones de vista (Mes, Semana, etc.) */}
         {/* Los dejamos vacíos porque ya filtramos con la prop 'views' */}
      </span>
    </div>
  );
};

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionEvent[]>(sampleSessions)
  const [selectedSession, setSelectedSession] = useState<SessionEvent | null>(
    null
  )

  const handleSelectEvent = (event: SessionEvent) => {
    console.log("Sesión seleccionada:", event)
    setSelectedSession(event)
  }

  const handleCloseModal = () => {
    setSelectedSession(null)
  }

  const handleSelectSlot = (slotInfo: {
    start: Date
    end: Date
    slots: Date[] | string[]
    action: "select" | "click" | "doubleClick"
  }) => {
    console.log("Slot seleccionado:", slotInfo)
    // Aquí podrías permitir crear una nueva sesión en el slot seleccionado
    // Por ejemplo: abrir otro modal con un formulario de creación
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-semibold mb-4">Calendario de Sesiones</h1>
      <div style={{ height: "calc(100vh - 150px)" }}>
        {/* Ajusta la altura según necesites */}
        <Calendar
          localizer={localizer}
          events={sessions}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          views={['month']} 
          components={{
            toolbar: CustomToolbar,
          }}
          onSelectEvent={handleSelectEvent} // Se dispara al hacer clic en una sesión existente
          onSelectSlot={handleSelectSlot} // Se dispara al hacer clic/seleccionar un espacio vacío
          selectable // Permite seleccionar slots vacíos
          messages={{ // Opcional: traducir mensajes del calendario
            next: "Siguiente",
            previous: "Anterior",
            today: "Hoy",
            month: "Mes",
            week: "Semana",
            day: "Día",
            agenda: "Agenda",
            date: "Fecha",
            time: "Hora",
            event: "Sesión", // Cambia 'event' por 'Sesión' o lo que prefieras
            noEventsInRange: "No hay sesiones en este rango.",
            showMore: total => `+ Ver más (${total})`
          }}
        />
      </div>

      <Dialog 
        open={selectedSession !== null} 
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            handleCloseModal() // Cierra el modal si onOpenChange se llama con false
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
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
                      Sin descripción adicional.
                    </DialogDescription>
                 )}
              </DialogHeader>
              <div className="grid gap-4 py-4">
                 {/* Cliente */}
                 <div className="grid grid-cols-4 items-center gap-4">
                   <span className="text-right font-medium col-span-1">Cliente:</span>
                   <span className="col-span-3">{selectedSession.client}</span>
                </div>
                {/* Inicio */}
                <div className="grid grid-cols-4 items-center gap-4">
                   <span className="text-right font-medium col-span-1">Inicio:</span>
                   {/* Usa dayjs para formatear */}
                   <span className="col-span-3">{dayjs(selectedSession.start).format("LLLL")}</span> 
                </div>
                {/* Fin */}
                 <div className="grid grid-cols-4 items-center gap-4">
                   <span className="text-right font-medium col-span-1">Fin:</span>
                    {/* Usa dayjs para formatear */}
                    <span className="col-span-3">{dayjs(selectedSession.end).format("LLLL")}</span>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseModal}>Cerrar</Button>
                {/* Podrías añadir botones de acción como "Editar" o "Cancelar Sesión" */}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}