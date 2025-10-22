'use client';

import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { SettingsForm } from '@/components/settings-options';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

type UserType = 'client' | 'coach' | 'admin' | 'enterprise';

interface SettingsClientProps {
  userType: UserType;
}

export function SettingsClient({ userType }: SettingsClientProps) {
  const t = useTranslations('common.dashboard.settings');

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="grid h-screen w-full md:grid-cols-[auto_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <DashboardSidebar userType={userType} className="h-full" />
      </div>
      <DashboardSidebar
        userType={userType}
        className="h-full bg-background"
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={closeMobileSidebar}
      />
      <div className="flex flex-col overflow-hidden">
        <DashboardHeader
          userType={userType}
          onToggleSidebar={toggleMobileSidebar}
        />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-y-auto">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-bold">{t('title')}</h1>
              <p className="text-muted-foreground">
                {t('description', { userType })}
              </p>
            </div>
            <SettingsForm userType={userType} />
          </div>
        </main>
      </div>
    </div>
  );
}
