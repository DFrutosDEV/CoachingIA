'use client';

import {
  NotificationCard,
  NotesCard,
  NewObjectiveCard,
  AddUserCard,
  TicketCard,
  PdaCard,
  ConfigFormCard,
  ConfigFormsManagerCard,
  PointsManagerCard,
} from '@/components/resources';

export function ResourcesGrid({
  userType,
}: {
  userType: 'client' | 'coach' | 'admin' | 'enterprise';
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 h-full overflow-y-auto pr-2">
      {/* Notificaciones */}
      {(userType === 'coach' || userType === 'admin' || userType === 'enterprise') && (
        <NotificationCard userType={userType} />
      )}

      {/* Agregar Cliente */}
      {userType === 'coach' && <NewObjectiveCard userType={userType} />}

      {/* Agregar Usuario */}
      {userType === 'admin' || userType === 'enterprise' && <AddUserCard />}

      {/* Generar Ticket */}
      {userType === 'coach' && <TicketCard />}

      {/* Visualiza PDA */}
      {/* //! TODO: Implementar el PDA en la pantalla de objetivos y tareas del cliente. */}
      {/* {userType === 'client' && <PdaCard />} */}

      {/* Gestionar Formularios de Configuración */}
      {/* {userType === 'admin' && <ConfigFormsManagerCard />} */}

      {/* Gestionar puntos */}
      {userType === 'admin' || userType === 'enterprise' && <PointsManagerCard />}
    </div>
  );
}
