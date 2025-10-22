'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, BarChart3, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/utils/validatesInputs';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

// Interfaces para los datos
interface NextSessionData {
  date: string;
  link: string;
  time: string;
  coach: string;
  topic: string;
}

interface GoalProgress {
  goal: string;
  progress: number;
  objectiveTitle?: string;
}

interface ClientGoal {
  description: string;
  isCompleted: boolean;
  objectiveTitle: string;
}

interface ObjectiveProgress {
  title: string;
  progress: number;
  totalGoals: number;
  completedGoals: number;
  hasGoals: boolean;
}

// Card 1: Próxima Sesión
export function NextSessionCard({ data }: { data?: NextSessionData | null }) {
  const t = useTranslations('common.dashboard.clientCards.nextSession');

  if (!data) {
    return (
      <Card data-swapy-item="next-session">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{t('title')}</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{t('noSessions')}</div>
          <p className="text-xs text-muted-foreground">
            {t('noSessionsDescription')}
          </p>
        </CardContent>
      </Card>
    );
  }

  const sessionDate = new Date(data.date);
  const isToday = sessionDate.toDateString() === new Date().toDateString();
  const displayDate = isToday
    ? t('today')
    : formatDate(sessionDate, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });

  return (
    <Card data-swapy-item="next-session">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{t('title')}</CardTitle>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {displayDate}, {data.time}
        </div>
        <p className="text-xs text-muted-foreground">{t('withCoach', { coach: data.coach })}</p>
        <p className="text-xs text-muted-foreground mb-4">{data.topic}</p>
        <div className="mt-4">
          <Button size="sm" className="w-full" asChild>
            <a href={data.link} target="_blank" rel="noopener noreferrer">
              <Clock className="mr-2 h-4 w-4" />
              {t('joinSession')}
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Card 2: Sesiones Completadas
export function CompletedSessionsCard({
  totalSessions,
  sessionsThisMonth,
}: {
  totalSessions: number;
  sessionsThisMonth: number;
}) {
  const t = useTranslations('common.dashboard.clientCards.completedSessions');

  return (
    <Card data-swapy-item="completed-sessions">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          {t('title')}
        </CardTitle>
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{totalSessions}</div>
        <p className="text-xs text-muted-foreground">
          {t('thisMonth', { sessionsThisMonth })}
        </p>
        <div className="mt-4">
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{
                width: `${Math.min((sessionsThisMonth / 4) * 100, 100)}%`,
              }}
            ></div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {t('monthlyPlan', { percentage: Math.min((sessionsThisMonth / 4) * 100, 100).toFixed(0) })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Card 3: Objetivos (Goals)
export function GoalsCard({
  goals = [],
  hasGoals = false,
}: {
  goals: ClientGoal[];
  hasGoals?: boolean;
}) {
  const t = useTranslations('common.dashboard.clientCards.goals');

  const completedGoals = goals.filter(goal => goal.isCompleted).length;
  const totalGoals = goals.length;
  const completionPercentage =
    totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  return (
    <Card data-swapy-item="goals">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{t('title')}</CardTitle>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          className="h-4 w-4 text-muted-foreground"
        >
          <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83" />
        </svg>
      </CardHeader>
      <CardContent>
        {!hasGoals ? (
          <>
            <div className="text-2xl font-bold">0/0</div>
            <p className="text-xs text-muted-foreground">{t('noGoals')}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {t('noGoalsDescription')}
            </p>
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">
              {completedGoals}/{totalGoals}
            </div>
            <p className="text-xs text-muted-foreground">{t('completed')}</p>

            <div className="mt-4">
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {t('completionPercentage', { percentage: completionPercentage.toFixed(0) })}
              </p>
            </div>

            {/* Lista de metas recientes */}
            {goals.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  {t('recentGoals')}
                </p>
                {goals.slice(0, 3).map((goal, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${goal.isCompleted ? 'bg-green-500' : 'bg-gray-300'}`}
                    ></div>
                    <p className="text-xs text-muted-foreground truncate">
                      {goal.description}
                    </p>
                  </div>
                ))}
                {goals.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    {t('moreGoals', { count: goals.length - 3 })}
                  </p>
                )}
              </div>
            )}
          </>
        )}

        <Button size="sm" variant="outline" className="w-full mt-4">
          {t('viewGoals')}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

// Card 4: Próximas Sesiones (Lista)
export function UpcomingSessionsCard({
  sessions,
}: {
  sessions: Array<{
    date: string;
    coach: string;
    topic: string;
  }>;
}) {
  const t = useTranslations('common.dashboard.clientCards.upcomingSessions');

  return (
    <Card data-swapy-item="upcoming-sessions">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>
          {t('description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t('noSessions')}
            </p>
          ) : (
            sessions.map((session, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">{session.date}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('withCoach', { coach: session.coach })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {session.topic}
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  {t('details')}
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Card 5: Tu Progreso (Objectives)
export function ProgressCard({
  objectives,
}: {
  objectives: ObjectiveProgress[];
}) {
  const t = useTranslations('common.dashboard.clientCards.progress');
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'es';

  return (
    <Card data-swapy-item="progress">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {objectives.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t('noObjectives')}
            </p>
          ) : (
            objectives.map((objective, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{objective.title}</p>
                  <p className="text-sm font-medium">{objective.progress}%</p>
                </div>
                {objective.hasGoals ? (
                  <>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${objective.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('goalsCompleted', { completedGoals: objective.completedGoals, totalGoals: objective.totalGoals })}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {t('noGoalsAssigned')}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
        <div className="mt-6">
          <Link href={`/${locale}/dashboard/client/progress`}>
            <Button className="w-full">
              {t('viewFullReport')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
