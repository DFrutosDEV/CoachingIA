"use client"

import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bell, Check, CheckCircle, Circle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationBadge } from '@/components/ui/notification-badge';
import { Notification } from '@/types/notification';

interface NotificationsModalProps {
  userType: "client" | "coach" | "admin" | "enterprise";
}

type NotificationWithRead = Notification & { read: boolean };

export function NotificationsModal({ userType }: NotificationsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead,
    refreshNotifications 
  } = useNotifications(userType);

  // Cargar notificaciones cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      refreshNotifications();
    }
  }, [isOpen, refreshNotifications]);

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Hace unos minutos';
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    }
  };

  return (
    <>
      <NotificationBadge 
        unreadCount={unreadCount}
        onClick={() => setIsOpen(true)}
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex mt-4 items-center justify-between">
              <span>Notificaciones</span>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Leer todas
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tienes notificaciones</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification: NotificationWithRead) => (
                  <div
                    key={notification._id}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-colors",
                      notification.read 
                        ? "bg-muted/50 hover:bg-muted" 
                        : "bg-background hover:bg-muted border-primary/20"
                    )}
                    onClick={() => !notification.read && markAsRead(notification._id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {notification.read ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Circle className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className={cn(
                          "text-sm font-medium",
                          notification.read ? "text-muted-foreground" : "text-foreground"
                        )}>
                          {notification.title}
                        </h4>
                        <p className={cn(
                          "text-xs mt-1",
                          notification.read ? "text-muted-foreground" : "text-muted-foreground"
                        )}>
                          {notification.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(notification.createdAt)}
                          </span>
                          {!notification.read && (
                            <span className="text-xs text-primary font-medium">
                              Nuevo
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
