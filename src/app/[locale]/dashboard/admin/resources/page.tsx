'use client';

import { DashboardHeader } from '@/components/dashboard-header';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { ResourcesGrid } from '@/components/resources-grid';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function ResourcesAdminPage() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const t = useTranslations('text.dashboardAdmin.resourcesPage');

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
      <div className="hidden md:block">
        <DashboardSidebar userType="admin" className="h-full" />
      </div>
      <DashboardSidebar
        userType="admin"
        className="h-full bg-background"
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={closeMobileSidebar}
      />
      <div className="flex flex-col">
        <DashboardHeader
          userType="admin"
          onToggleSidebar={toggleMobileSidebar}
        />
        <main className="flex-1 p-6">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-bold">{t('title')}</h1>
              <p className="text-muted-foreground">
                {t('subtitle')}
              </p>
            </div>
            <div className="h-[calc(100vh-200px)] overflow-hidden">
              <ResourcesGrid userType="admin" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
