"use client" // Necesario ya que usaremos hooks como useState y event handlers

import React, { useState } from "react"
import { Calendar, momentLocalizer, Event } from "react-big-calendar"
import moment from "moment"
import "react-big-calendar/lib/css/react-big-calendar.css" // Importa los estilos del calendario
import "moment/locale/es" // Opcional: para localizar moment en español

// Configura el localizador de moment en español
moment.locale("es")
const localizer = momentLocalizer(moment)

// Define la interfaz para tus eventos de sesión
interface SessionEvent extends Event {
  id: string
  description?: string
  // Puedes añadir más campos específicos de la sesión aquí
}

// Datos de ejemplo para las sesiones (en una app real, vendrían de una API)
const sampleSessions: SessionEvent[] = [
  {
    id: "1",
    title: "Sesión con Cliente A",
    start: moment().add(1, "day").set({ hour: 10, minute: 0 }).toDate(), // Mañana a las 10:00
    end: moment().add(1, "day").set({ hour: 11, minute: 0 }).toDate(), // Mañana a las 11:00
    description: "Revisión de progreso semanal.",
  },
  {
    id: "2",
    title: "Sesión con Cliente B",
    start: moment().add(3, "days").set({ hour: 14, minute: 30 }).toDate(), // En 3 días a las 14:30
    end: moment().add(3, "days").set({ hour: 15, minute: 30 }).toDate(), // En 3 días a las 15:30
  },
  // Agrega más sesiones aquí
]

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionEvent[]>(sampleSessions)
  const [selectedSession, setSelectedSession] = useState<SessionEvent | null>(
    null
  )

  const handleSelectEvent = (event: SessionEvent) => {
    console.log("Sesión seleccionada:", event)
    setSelectedSession(event)
    // Aquí podrías abrir un modal o mostrar detalles en un panel lateral
    // Por ejemplo: setShowModal(true);
  }

  const handleSelectSlot = (slotInfo: {
    start: Date
    end: Date
    slots: Date[] | string[]
    action: "select" | "click" | "doubleClick"
  }) => {
    console.log("Slot seleccionado:", slotInfo)
    // Aquí podrías permitir crear una nueva sesión en el slot seleccionado
    // Por ejemplo: abrir un formulario de creación
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-semibold mb-4">Calendario de Sesiones</h1>
      <div style={{ height: "calc(100vh - 150px)" }}>
        {" "}
        {/* Ajusta la altura según necesites */}
        <Calendar
          localizer={localizer}
          events={sessions}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
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

      {/* Ejemplo básico para mostrar detalles (podría ser un Modal) */}
      {selectedSession && (
        <div className="mt-4 p-4 border rounded bg-gray-100">
          <h2 className="text-xl font-semibold mb-2">
            Detalles de la Sesión
          </h2>
          <p>
            <strong>Título:</strong> {selectedSession.title}
          </p>
          <p>
            <strong>Inicio:</strong>{" "}
            {moment(selectedSession.start).format("LLL")}
          </p>
          <p>
            <strong>Fin:</strong> {moment(selectedSession.end).format("LLL")}
          </p>
          {selectedSession.description && (
            <p>
              <strong>Descripción:</strong> {selectedSession.description}
            </p>
          )}
          <button
            onClick={() => setSelectedSession(null)}
            className="mt-2 text-blue-600 hover:underline"
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  )
}