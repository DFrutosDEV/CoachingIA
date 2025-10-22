'use client';

import { DashboardHeader } from '@/components/dashboard-header';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { AnalyticsComponent } from '@/components/report-analytics';
import { ReportGraphics } from '@/components/report-graphics';
import { BarChart3 } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

// Podrías pasar estos datos como props en el futuro
// Los datos de analytics se crearán dinámicamente usando las traducciones
const createAnalyticsData = (t: any) => [
  {
    metric: t('userCount'),
    value: '19',
    change: '+2',
    positive: true,
    period: t('yesterday'),
  },
  {
    metric: t('coachCount'),
    value: '35',
    change: '+5',
    positive: true,
    period: t('yesterday'),
  },
  {
    metric: t('activeUsers'),
    value: '17',
    change: '+5',
    positive: true,
    period: t('yesterday'),
  },
  {
    metric: t('activeCoaches'),
    value: '17',
    change: '+5',
    positive: true,
    period: t('yesterday'),
  },
  {
    metric: t('weeklySessions'),
    value: '17',
    change: '+5',
    positive: true,
    period: t('yesterday'),
  },
];

export default function EnterpriseAnalyticsPage() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const t = useTranslations('dashboardEnterprise.analyticsPage');

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };
  return (
    <div className="grid h-screen w-full md:grid-cols-[auto_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <DashboardSidebar userType="enterprise" className="h-full" />
      </div>
      <DashboardSidebar
        userType="enterprise"
        className="h-full bg-background"
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={closeMobileSidebar}
      />
      <div className="flex flex-col overflow-hidden">
        <DashboardHeader
          userType="enterprise"
          onToggleSidebar={toggleMobileSidebar}
        />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-y-auto">
          <div className="flex items-center gap-4">
            <BarChart3 className="h-6 w-6" />
            <h1 className="text-lg font-semibold md:text-2xl">
              {t('title')}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('subtitle')}
          </p>
          <AnalyticsComponent analyticsData={createAnalyticsData(t)} />
          <ReportGraphics />
        </main>
      </div>
    </div>
  );
}
