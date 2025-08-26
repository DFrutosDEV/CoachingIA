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
  _id: string;
  title: string;
  progress: number;
  totalGoals: number;
  completedGoals: number;
  hasGoals: boolean;
  isCompleted: boolean;
  active: boolean;
  createdAt: string;
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
  nextSession: NextSession;
  lastSession: NextSession;
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
  role: Role;
  profile: Profile;
  enterprise: Enterprise | null;
  name: string;
  lastName: string;
  email: string;
  roles: string[];
  age?: number;
}

export interface Role {
  _id: string;
  name: string;
  client: string;
}

export interface Profile {
  _id: string;
  user: string;
  role: string;
  profilePicture: string;
  bio: string;
  phone: string;
  address: string;
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
  enterprise?: Enterprise;
  specialties: string[];
  rating: number;
  clientsCount: number;
  createdAt: string;
  updatedAt: string;
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

// Tipos para reportes
export interface Report {
  _id: string;
  title: string;
  description: string;
  category: 'bug' | 'suggestion' | 'complaint' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  reporterUser: string;
  reporterName: string;
  reporterEmail: string;
  reporterPhone?: string;
  assignedTo?: string;
  assignedToName?: string;
  response?: string;
  responseBy?: string;
  responseByName?: string;
  responseDate?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  closedBy?: string;
  closedByName?: string;
}

export interface ReportResponse {
  _id: string;
  response: string;
  responseBy: string;
  responseDate: string;
} 