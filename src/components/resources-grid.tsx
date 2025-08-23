"use client"

import {
  NotificationCard,
  NotesCard,
  NewObjectiveCard,
  CoachCard,
  TicketCard,
  PdaCard,
  ConfigFormCard,
  ConfigFormsManagerCard
} from "@/components/resources"

export function ResourcesGrid({ userType }: { userType: "client" | "coach" | "admin" | "enterprise" }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {/* Notificaciones */}
      {(userType === "coach" || userType === "admin") && (
        <NotificationCard userType={userType} />
      )}

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

      {/* Gestionar Formularios de Configuración */}
      {userType === "admin" && <ConfigFormsManagerCard />}
    </div>
  )
}
