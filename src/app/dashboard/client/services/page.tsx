'use client';

import { DashboardHeader } from '@/components/dashboard-header';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { ServicesGrid } from '@/components/services-grid-coachs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState } from 'react';

export default function ServicesPage() {
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
        <DashboardSidebar userType="client" className="h-full" />
      </div>
      <DashboardSidebar
        userType="client"
        className="h-full bg-background"
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={closeMobileSidebar}
      />
      <div className="flex flex-col overflow-hidden">
        <DashboardHeader
          userType="client"
          onToggleSidebar={toggleMobileSidebar}
        />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-y-auto">
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Servicios</h1>
                <p className="text-muted-foreground">
                  Aca encontraras los servicios que tienes contratados.
                </p>
              </div>
            </div>
            <ServicesGrid />
          </div>
        </main>
      </div>
    </div>
  );
}
