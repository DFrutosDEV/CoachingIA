"use client"

import {
  NotificationCard,
  NotesCard,
  NewObjectiveCard,
  CoachCard,
  TicketCard,
  PdaCard,
  ConfigFormCard
} from "@/components/resources"

export function ResourcesGrid({ userType }: { userType: "client" | "coach" | "admin" }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {/* Notificaciones */}
      {(userType === "coach" || userType === "admin") && (
        <NotificationCard userType={userType} />
      )}

      {/* Notas */}
      {userType === "coach" && <NotesCard />}

      {/* Agregar Cliente */}
      {(userType === "coach" || userType === "admin") && (
        <NewObjectiveCard userType={userType} />
      )}

      {/* Agregar Coach */}
      {(userType === "admin") && <CoachCard />}

      {/* Generar Ticket */}
      {(userType === "coach") && <TicketCard />}

      {/* Visualiza PDA */}
      {userType === "client" && <PdaCard />}

      {/* Visualiza tu formulario de configuración */}
      {userType === "client" && <ConfigFormCard />}
    </div>
  )
}
