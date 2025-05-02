"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ClientsList } from "../../../../components/clients-list"
import { ClientDetail } from "../../../../components/client-detail"

interface Goal {
  id: string;
  title: string;
  progress: number;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  startDate: string;
  sessions: number;
  nextSession: string;
  progress: number;
  status: "active" | "pending" | "inactive";
  focus: string;
  avatar: string;
  bio: string;
  goals: Goal[];
  upcomingSessions: { id: string; date: string; topic: string }[];
  notes: { id: string; date: string; content: string }[];
}

const initialClientsData: Client[] = [
  {
    id: "1",
    name: "Carlos Rodríguez",
    email: "carlos.rodriguez@ejemplo.com",
    phone: "+34 612 345 678",
    startDate: "15/01/2023",
    sessions: 12,
    nextSession: "Hoy, 15:00",
    progress: 75,
    status: "active",
    focus: "Desarrollo personal",
    avatar: "https://ui-avatars.com/api/?background=random&name=Carlos Rodríguez",
    bio: "Profesional de marketing digital buscando mejorar habilidades de liderazgo y gestión del estrés en entornos de alta presión.",
    goals: [
      { id: "1", title: "Mejorar habilidades de comunicación", progress: 80 },
      { id: "2", title: "Reducir niveles de estrés", progress: 65 },
      { id: "3", title: "Establecer rutina matutina", progress: 90 },
      { id: "4", title: "Mejorar productividad laboral", progress: 40 },
    ],
    upcomingSessions: [
      { id: "1", date: "Hoy, 15:00", topic: "Desarrollo personal" },
      { id: "2", date: "Viernes, 16:00", topic: "Seguimiento semanal" },
      { id: "3", date: "Lunes, 10:30", topic: "Gestión del estrés" },
    ],
    notes: [
      { id: "1", date: "10/06/2023", content: "Avance significativo en técnicas de respiración y mindfulness." },
      { id: "2", date: "03/06/2023", content: "Dificultades con la gestión del tiempo. Establecer nuevas estrategias." },
      {
        id: "3",
        date: "27/05/2023",
        content: "Mejora en la comunicación con su equipo. Continuar practicando asertividad.",
      },
    ],
  },
   {
    id: "2",
    name: "Laura Gómez",
    email: "laura.gomez@ejemplo.com",
    phone: "+34 623 456 789",
    startDate: "03/03/2023",
    sessions: 8,
    nextSession: "Mañana, 10:30",
    progress: 60,
    status: "active",
    focus: "Gestión del estrés",
    avatar: "https://ui-avatars.com/api/?background=random&name=Laura Gomez",
     bio: "Diseñadora gráfica freelance en busca de equilibrio entre trabajo y vida personal.",
    goals: [
      { id: "1", title: "Definir límites laborales", progress: 70 },
      { id: "2", title: "Incorporar actividad física regular", progress: 50 },
    ],
    upcomingSessions: [{ id: "1", date: "Mañana, 10:30", topic: "Gestión del estrés" }],
    notes: [{ id: "1", date: "08/06/2023", content: "Explorando estrategias para decir 'no' a nuevos proyectos." }],
  },
   {
    id: "3",
    name: "Miguel Torres",
    email: "miguel.torres@ejemplo.com",
    phone: "+34 634 567 890",
    startDate: "22/04/2023",
    sessions: 5,
    nextSession: "Viernes, 16:00",
    progress: 40,
    status: "active",
    focus: "Productividad",
    avatar: "https://ui-avatars.com/api/?background=random&name=Miguel Torres",
     bio: "Emprendedor iniciando un nuevo negocio, necesita mejorar su organización y enfoque.",
    goals: [
      { id: "1", title: "Implementar método GTD", progress: 45 },
      { id: "2", title: "Delegar tareas no esenciales", progress: 30 },
    ],
    upcomingSessions: [{ id: "1", date: "Viernes, 16:00", topic: "Productividad" }],
    notes: [{ id: "1", date: "05/06/2023", content: "Revisión de herramientas de gestión de tareas." }],
  },
  {
    id: "4",
    name: "Ana Martínez",
    email: "ana.martinez@ejemplo.com",
    phone: "+34 645 678 901",
    startDate: "10/05/2023",
    sessions: 3,
    nextSession: "Lunes, 11:00",
    progress: 25,
    status: "active",
    focus: "Liderazgo",
    avatar: "https://ui-avatars.com/api/?background=random&name=Ana Martínez",
    bio: "Gerente de equipo buscando desarrollar un estilo de liderazgo más inspirador.",
    goals: [
      { id: "1", title: "Mejorar feedback constructivo", progress: 30 },
      { id: "2", title: "Fomentar la colaboración en el equipo", progress: 20 },
    ],
    upcomingSessions: [{ id: "1", date: "Lunes, 11:00", topic: "Liderazgo" }],
    notes: [{ id: "1", date: "12/06/2023", content: "Primeros pasos en la identificación de estilos de comunicación del equipo." }],
  },
  {
    id: "5",
    name: "Pedro Sánchez",
    email: "pedro.sanchez@ejemplo.com",
    phone: "+34 656 789 012",
    startDate: "05/06/2023",
    sessions: 2,
    nextSession: "Martes, 17:30",
    progress: 15,
    status: "pending",
    focus: "Comunicación",
    avatar: "https://ui-avatars.com/api/?background=random&name=Pedro Sánchez",
    bio: "Estudiante universitario preparándose para presentaciones importantes.",
    goals: [
      { id: "1", title: "Reducir miedo escénico", progress: 10 },
      { id: "2", title: "Estructurar presentaciones de forma clara", progress: 20 },
    ],
    upcomingSessions: [{ id: "1", date: "Martes, 17:30", topic: "Comunicación" }],
    notes: [{ id: "1", date: "06/06/2023", content: "Introducción a técnicas de lenguaje corporal." }],
  },
    {
    id: "6",
    name: "Elena Castro",
    email: "elena.castro@ejemplo.com",
    phone: "+34 667 890 123",
    startDate: "20/02/2023",
    sessions: 9,
    nextSession: "Jueves, 09:00",
    progress: 65,
    status: "active",
    focus: "Equilibrio vida-trabajo",
    avatar: "https://ui-avatars.com/api/?background=random&name=Elena Castro",
    bio: "Abogada con alta carga de trabajo buscando estrategias para desconectar.",
    goals: [
      { id: "1", title: "Establecer horarios de trabajo fijos", progress: 70 },
      { id: "2", title: "Encontrar hobbies relajantes", progress: 55 },
    ],
    upcomingSessions: [{ id: "1", date: "Jueves, 09:00", topic: "Equilibrio vida-trabajo" }],
    notes: [{ id: "1", date: "09/06/2023", content: "Avances en la delegación de tareas menores." }],
  },
  {
    id: "7",
    name: "Javier Moreno",
    email: "javier.moreno@ejemplo.com",
    phone: "+34 678 901 234",
    startDate: "12/03/2023",
    sessions: 7,
    nextSession: "Miércoles, 18:00",
    progress: 50,
    status: "inactive",
    focus: "Desarrollo profesional",
    avatar: "https://ui-avatars.com/api/?background=random&name=Javier Moreno",
    bio: "Ingeniero de software considerando un cambio de carrera.",
    goals: [
      { id: "1", title: "Explorar nuevas opciones profesionales", progress: 60 },
      { id: "2", title: "Actualizar CV y perfil de LinkedIn", progress: 40 },
    ],
    upcomingSessions: [{ id: "1", date: "Miércoles, 18:00", topic: "Desarrollo profesional" }],
    notes: [{ id: "1", date: "07/06/2023", content: "Discusión sobre intereses y habilidades transferibles." }],
  },
];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(initialClientsData);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
  };

   const handleUpdateClient = (clientId: string, updatedGoals: Goal[]) => {
    setClients(prevClients =>
      prevClients.map(client =>
        client.id === clientId ? { ...client, goals: updatedGoals } : client
      )
    );
  };

  const selectedClient = clients.find(client => client.id === selectedClientId) || null;

  return (
    <div className="grid h-screen w-full md:grid-cols-[auto_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <DashboardSidebar userType="coach" className="h-full" />
      </div>
      <div className="flex flex-col overflow-hidden">
        <DashboardHeader userType="coach" />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-y-auto">
          <div className="flex flex-col h-full">
            <div className="mb-4">
              <h1 className="text-3xl font-bold">Mis Clientes</h1>
              <p className="text-muted-foreground">Gestiona tus clientes y su progreso en el programa de coaching.</p>
            </div>
            <div className="flex-1 overflow-hidden">
              <ClientsList clients={clients} onClientSelect={handleClientSelect} />
            </div>
          </div>
        </main>
      </div>
      <ClientDetail
        client={selectedClient}
        isOpen={isDetailModalOpen}
        onClose={handleCloseModal}
        onUpdateClient={handleUpdateClient}
      />
    </div>
  )
}
