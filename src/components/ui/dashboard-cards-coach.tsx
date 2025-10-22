'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@mui/material';
import {
  Calendar,
  Clock,
  Users,
  ArrowRight,
  MessageSquare,
  Video,
} from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/utils/validatesInputs';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

// Interfaces para los datos
interface NextSessionData {
  date: string;
  link: string;
  time: string;
  client: string;
  topic: string;
}

interface TodaySession {
  time: string;
  client: string;
  topic: string;
}

interface RecentClient {
  id: string;
  name: string;
  sessions: number;
  progress: number;
}

// Card 1: Próxima Sesión
export function NextSessionCard({ data }: { data?: NextSessionData | null }) {
  const t = useTranslations('common.dashboard.coach.nextSession');

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
          <div className="mt-4">
            <Button variant="outlined" className="w-full" disabled>
              <Clock className="mr-2 h-4 w-4" />
              {t('noSessionsButton')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sessionDate = new Date(data.date);
  const isToday = sessionDate.toDateString() === new Date().toDateString();
  const displayDate = isToday
    ? t('today')
    : formatDate(sessionDate, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
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
        <p className="text-xs text-muted-foreground">{t('withClient', { client: data.client })}</p>
        <p className="text-xs text-muted-foreground mt-1">{data.topic}</p>
        <div className="mt-4">
          <Button
            variant="outlined"
            className="w-full"
            onClick={() => window.open(data.link, '_blank')}
          >
            <Clock className="mr-2 h-4 w-4" />
            {t('startVideoCall')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Card 2: Clientes Activos
export function ActiveClientsCard({ count }: { count: number }) {
  const t = useTranslations('common.dashboard.coach.activeClients');
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'es';

  return (
    <Card data-swapy-item="active-clients">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{t('title')}</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count}</div>
        <p className="text-xs text-muted-foreground">{t('assignedClients')}</p>
        <div className="mt-4">
          <Link href={`/${locale}/dashboard/coach/clients`}>
            <Button variant="outlined" className="w-full">
              {t('viewClients')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// Card 3: Sesiones Programadas
export function ScheduledSessionsCard({ count }: { count: number }) {
  const t = useTranslations('common.dashboard.coach.scheduledSessions');
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'es';

  return (
    <Card data-swapy-item="scheduled-sessions">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          {t('title')}
        </CardTitle>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count}</div>
        <p className="text-xs text-muted-foreground">{t('thisWeek')}</p>
        <div className="mt-4">
          <Link href={`/${locale}/dashboard/coach/calendar`}>
            <Button variant="outlined" className="w-full">
              {t('viewCalendar')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// Card 4: Sesiones de Hoy
export function TodaySessionsCard({ sessions }: { sessions: TodaySession[] }) {
  const t = useTranslations('common.dashboard.coach.todaySessions');

  if (sessions.length === 0) {
    return (
      <Card data-swapy-item="today-sessions" className="flex flex-col h-full">
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>
            {t('noSessionsToday')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>{t('noSessionsScheduled')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-swapy-item="today-sessions" className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('todaySessionsDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="space-y-4 pr-2">
          {sessions.map((session, index) => (
            <div
              key={index}
              className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium">{session.time}</p>
                <p className="text-sm text-muted-foreground">
                  {session.client}
                </p>
                <p className="text-xs text-muted-foreground">{session.topic}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outlined" size="small">
                  {t('notes')}
                </Button>
                <Button variant="outlined" size="small">
                  <Video className="mr-1 h-3 w-3" />
                  {t('jitsi')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Card 5: Clientes Recientes
export function RecentClientsCard({ clients }: { clients: RecentClient[] }) {
  const t = useTranslations('common.dashboard.coach.recentClients');
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'es';

  if (clients.length === 0) {
    return (
      <Card data-swapy-item="recent-clients" className="flex flex-col">
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('noClientsAssigned')}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>{t('noClientsMessage')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-swapy-item="recent-clients" className="flex flex-col">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>
          {t('description')}
        </CardDescription>
      </CardHeader>
      <CardContent
        className="flex-1 overflow-y-auto"
        style={{ maxHeight: '320px' }}
      >
        <div className="space-y-4">
          {clients.map((client, index) => (
            <div
              key={client.id}
              className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium">{client.name}</p>
                <p className="text-xs text-muted-foreground">
                  {t('sessionsCount', { sessions: client.sessions })}
                </p>
                <div className="h-2 w-32 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${client.progress}%` }}
                  ></div>
                </div>
              </div>
              <Button variant="outlined" size="small">
                {t('profile')}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4">
        <Link href={`/${locale}/dashboard/coach/clients`}>
          <Button className="w-full">
            {t('viewAllClients')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
