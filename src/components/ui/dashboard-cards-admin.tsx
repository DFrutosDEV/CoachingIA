'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  UserCircle,
  BarChart3,
  ArrowRight,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

// Interfaces para los tipos de datos
interface RecentUser {
  name: string;
  email: string;
  type: string;
  date: string;
}

interface PlatformStat {
  value: string;
  change: string;
  positive: boolean;
}

interface PlatformStats {
  conversionRate: PlatformStat;
  avgSessionsPerUser: PlatformStat;
  avgSessionTime: PlatformStat;
  churnRate: PlatformStat;
  monthlyRevenue: PlatformStat;
}

// Card 1: Total Usuarios
export function TotalUsersCard({ totalUsers = 0, newUsersThisMonth = 0 }) {
  const t = useTranslations('common.dashboard.adminCards.totalUsers');
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'es';

  return (
    <Card data-swapy-item="total-users">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{t('title')}</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">
          {t('thisMonth', { count: newUsersThisMonth })}
        </p>
        <div className="mt-4">
          <Link href={`/${locale}/dashboard/admin/users`}>
            <Button size="sm" variant="outline" className="w-full">
              {t('viewUsers')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// Card 2: Coaches Activos
export function ActiveCoachesCard({
  activeCoaches = 0,
  newCoachesThisMonth = 0,
}) {
  const t = useTranslations('common.dashboard.adminCards.activeCoaches');
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'es';

  return (
    <Card data-swapy-item="active-coaches">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{t('title')}</CardTitle>
        <UserCircle className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{activeCoaches}</div>
        <p className="text-xs text-muted-foreground">
          {t('thisMonth', { count: newCoachesThisMonth })}
        </p>
        <div className="mt-4">
          <Link href={`/${locale}/dashboard/admin/coaches`}>
            <Button size="sm" variant="outline" className="w-full">
              {t('viewCoaches')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// Card 3: Sesiones Realizadas
export function CompletedSessionsCard({
  completedSessions = 0,
  completedSessionsThisMonth = 0,
}) {
  const t = useTranslations('common.dashboard.adminCards.completedSessions');
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'es';

  return (
    <Card data-swapy-item="completed-sessions">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          {t('title')}
        </CardTitle>
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {completedSessions.toLocaleString()}
        </div>
        <p className="text-xs text-muted-foreground">
          {t('thisMonth', { count: completedSessionsThisMonth })}
        </p>
        <div className="mt-4">
          <Link href={`/${locale}/dashboard/admin/analytics`}>
            <Button size="sm" variant="outline" className="w-full">
              {t('viewAnalytics')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// Card 4: Reportes
export function ReportsCard({ pendingReports = 0 }) {
  const t = useTranslations('common.dashboard.adminCards.reports');
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'es';

  return (
    <Card data-swapy-item="reports">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{t('title')}</CardTitle>
        <FileText className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{pendingReports}</div>
        <p className="text-xs text-muted-foreground">{t('pendingReview')}</p>
        <div className="mt-4">
          <Link href={`/${locale}/dashboard/admin/reports`}>
            <Button size="sm" variant="outline" className="w-full">
              {t('viewReports')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// Card 5: Nuevos Usuarios
export function NewUsersCard({
  recentUsers = [],
}: {
  recentUsers?: RecentUser[];
}) {
  const t = useTranslations('common.dashboard.adminCards.newUsers');
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'es';

  return (
    <Card data-swapy-item="new-users">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>
          {t('description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentUsers.length > 0 ? (
            recentUsers.map((user, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${user.type === 'Coach'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                        }`}
                    >
                      {user.type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {user.date}
                    </span>
                  </div>
                </div>
                <Link href={`/${locale}/dashboard/admin/clients`}>
                  <Button size="sm" variant="outline">
                    {t('viewProfile')}
                  </Button>
                </Link>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                {t('noNewUsers')}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Card 6: Rendimiento de la Plataforma
export function PlatformPerformanceCard({
  platformStats,
}: {
  platformStats?: PlatformStats;
}) {
  const t = useTranslations('common.dashboard.adminCards.platformPerformance');
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'es';

  const stats = [
    { metric: t('metrics.conversionRate'), ...platformStats?.conversionRate },
    {
      metric: t('metrics.avgSessionsPerUser'),
      ...platformStats?.avgSessionsPerUser,
    },
    { metric: t('metrics.avgSessionTime'), ...platformStats?.avgSessionTime },
    { metric: t('metrics.churnRate'), ...platformStats?.churnRate },
    { metric: t('metrics.monthlyRevenue'), ...platformStats?.monthlyRevenue },
  ];

  return (
    <Card data-swapy-item="platform-performance">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium">{stat.metric}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
              <div
                className={`flex items-center ${stat.positive ? 'text-green-600' : 'text-red-600'}`}
              >
                <span>{stat.change}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className={`ml-1 h-4 w-4 ${stat.positive ? 'rotate-0' : 'rotate-180'}`}
                >
                  <path d="m5 15 7-7 7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Link href={`/${locale}/dashboard/admin/analytics`}>
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
