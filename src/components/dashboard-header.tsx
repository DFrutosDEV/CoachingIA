'use client';

import Link from 'next/link';
import { Button } from '@mui/material';
import { Menu, UserCircle } from 'lucide-react';
import { NotificationsModal } from '@/components/ui/notifications-modal';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useAppSelector } from '@/lib/redux/hooks';

interface HeaderProps {
  userType: 'client' | 'coach' | 'admin' | 'enterprise';
  onToggleSidebar?: () => void;
}

export function DashboardHeader({ userType, onToggleSidebar }: HeaderProps) {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'es';
  const user = useAppSelector(state => state.auth.user);

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      {user?.enterprise?.logo && (
        <div className="flex items-center justify-center w-[100px] h-[100px] shrink-0 bg-muted/30 rounded-lg overflow-hidden">
          <Image src={user?.enterprise?.logo} alt="Logo" width={50} height={50} className="object-contain w-full h-full" />
        </div>
      )}
      <div className="md:hidden">
        <Button variant="text" onClick={onToggleSidebar} className="p-2">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <NotificationsModal userType={userType} />
        <Link href={`/${locale}/dashboard/${userType}/profile`}>
          <Button variant="text" className="rounded-full">
            <UserCircle className="h-6 w-6" />
            <span className="sr-only">Perfil</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
