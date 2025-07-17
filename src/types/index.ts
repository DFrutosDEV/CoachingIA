// Tipos base para sesiones
export interface NextSession {
  _id: string;
  date: Date;
  time: string;
  link: string;
  objective: Objective;
}

export interface UpcomingSession {
  _id: string;
  date: Date;
  link: string;
  objective: Objective;
}

export interface Note {
  _id: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

// Tipos para objetivos y metas
export interface Goal {
  _id: string;
  description: string;
  isCompleted: boolean;
  day: string;
}

export interface GoalWithProgress {
  title: string;
  progress: number;
}

export interface Objective {
  title: string;
  totalGoals: number;
  completedGoals: number;
  hasGoals: boolean;
  isCompleted: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;	
  coach: string;
}

export interface ObjectiveProgress {
  title: string;
  progress: number;
  totalGoals: number;
  completedGoals: number;
  hasGoals: boolean;
}

// Tipos para clientes
export interface ClientResponse {
  _id: string;
  name: string;
  email: string;
  phone: string;
  startDate: string;
  sessions: number;
  nextSession: NextSession | {};
  lastSession: NextSession | {};
  progress: number;
  status: "active" | "pending" | "inactive";
  focus: string;
  avatar: string;
  bio: string;
  goals: Goal[];
  upcomingSessions: UpcomingSession[];
  notes: Note[];
  activeObjectiveId: string | null;
}

// Tipo para datos básicos del cliente
export interface ClientBasicData {
  nextSession: {
    date: string;
    link: string;
    time: string;
    coach: string;
    topic: string;
  } | null;
  completedSessions: number;
  completedSessionsThisMonth: number;
  totalObjectives: number;
  completedObjectives: number;
  upcomingSessions: Array<{
    date: string;
    coach: string;
    topic: string;
  }>;
  goalsWithProgress: Array<{
    goal: string;
    progress: number;
    objectiveTitle?: string;
  }>;
  clientGoals: Array<{
    description: string;
    isCompleted: boolean;
    objectiveTitle: string;
  }>;
  hasGoals: boolean;
  objectivesWithProgress: Array<{
    title: string;
    progress: number;
    totalGoals: number;
    completedGoals: number;
    hasGoals: boolean;
  }>;
}

// Tipos para usuarios y perfiles
export interface User {
  _id: string;
  role: string;
  profile: Profile;
  enterprise: Enterprise | null;
  name: string;
  lastName: string;
  email: string;
  roles: string[];
  age?: number;
}

export interface Profile {
  _id: string;
  user: string;
  role: string;
  profilePicture: string;
  bio: string;
  phone: string;
  indexDashboard: number[];
  clients: string[];
  enterprise: string;
}

export interface Enterprise {
  _id: string;
  name: string;
  description: string;
  logo: string;
}

// Tipos para coaches
export interface Coach {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  specialties: string[];
  rating: number;
  clientsCount: number;
}

// Tipos para props de componentes
export interface ClientDetailProps {
  client: ClientResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateClient: (clientId: string, updatedGoals: Goal[]) => void;
}

export interface GoalProgress {
  goal: string;
  progress: number;
  objectiveTitle?: string;
}

export interface ClientGoal {
  description: string;
  isCompleted: boolean;
  objectiveTitle: string;
} 