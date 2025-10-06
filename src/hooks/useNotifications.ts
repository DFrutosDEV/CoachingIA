import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import { Notification } from '@/types/notification';

interface UseNotificationsReturn {
  notifications: (Notification & { read: boolean })[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => void;
}

export const useNotifications = (
  userType: 'client' | 'coach' | 'admin' | 'enterprise'
): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<
    (Notification & { read: boolean })[]
  >([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, token } = useSelector((state: RootState) => state.auth);

  const fetchNotifications = useCallback(async () => {
    if (!user?._id || !token) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/notification?userId=${user.profile?._id}&userType=${userType}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unreadCount);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al obtener notificaciones');
      }
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  }, [user?._id, token, userType]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!token || !user?._id) return;

      try {
        const response = await fetch('/api/notification', {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ notificationId, userId: user.profile?._id }),
        });

        if (response.ok) {
          setNotifications(prev =>
            prev.map(notification =>
              notification._id === notificationId
                ? { ...notification, read: true }
                : notification
            )
          );
          setUnreadCount(prev => Math.max(0, prev - 1));
        } else {
          console.error('Error al marcar como leída');
        }
      } catch (error) {
        console.error('Error al marcar como leída:', error);
      }
    },
    [token, user?._id]
  );

  const markAllAsRead = useCallback(async () => {
    if (!user?._id || !token) return;

    try {
      const response = await fetch('/api/notification', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.profile?._id,
        }),
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notification => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
      } else {
        console.error('Error al marcar todas como leídas');
      }
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
    }
  }, [user?._id, token]);

  const refreshNotifications = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Cargar notificaciones iniciales
  useEffect(() => {
    if (user?._id && token) {
      fetchNotifications();
    }
  }, [user?._id, token, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  };
};
