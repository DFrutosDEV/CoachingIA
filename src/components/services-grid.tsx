"use client"

import { CoachCard } from "./coach-card";

// TODO: Reemplazar con datos reales de los coaches contratados
const exampleCoaches = [
  {
    firstName: "Juan",
    lastName: "Pérez",
    email: "juan.perez@example.com",
    phoneNumber: "+1234567890",
    service: "Entrenamiento Personalizado",
    profilePictureUrl: "/placeholder-user.jpg" // Cambiar por URL real o dejar undefined
  },
  {
    firstName: "Ana",
    lastName: "Gómez",
    email: "ana.gomez@example.com",
    phoneNumber: "+0987654321",
    service: "Nutrición Deportiva",
    // Sin foto de perfil
  },
  {
    firstName: "Carlos",
    lastName: "Rodríguez",
    email: "carlos.r@example.com",
    phoneNumber: "+1122334455",
    service: "Coaching Mental",
    profilePictureUrl: "/placeholder-user.jpg"
  },
];

export function ServicesGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {exampleCoaches.map((coach, index) => (
        <CoachCard 
          key={index} 
          firstName={coach.firstName}
          lastName={coach.lastName}
          email={coach.email}
          phoneNumber={coach.phoneNumber}
          service={coach.service}
          profilePictureUrl={coach.profilePictureUrl}
        />
      ))}
    </div>
  );
}
