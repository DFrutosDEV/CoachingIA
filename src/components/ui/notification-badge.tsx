import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

interface NotificationBadgeProps {
  unreadCount: number;
  onClick: () => void;
  className?: string;
}

export function NotificationBadge({ 
  unreadCount, 
  onClick, 
  className 
}: NotificationBadgeProps) {
  return (
    <Button 
      variant="text" 
      onClick={onClick}
      className={cn("relative", className)}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
      <span className="sr-only">Notificaciones</span>
    </Button>
  );
}
