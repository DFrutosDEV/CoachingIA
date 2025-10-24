'use client';

import { DashboardHeader } from '@/components/dashboard-header';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { ServicesGrid } from '@/components/services-grid-coachs';
import { Users } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function EnterpriseCoachesPage() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const t = useTranslations('text.dashboardEnterprise.coachesPage');

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
            <Users className="h-6 w-6" />
            <h1 className="text-lg font-semibold md:text-2xl">{t('title')}</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('subtitle')}
          </p>
          <ServicesGrid isEnterprise={true} />
        </main>
      </div>
    </div>
  );
}
