'use client'

import React from 'react'
import { useUIStore } from '../lib/stores'
import { toast } from 'sonner'

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { notifications, removeNotification } = useUIStore()
  const processedNotifications = React.useRef<Set<string>>(new Set())

  React.useEffect(() => {
    notifications.forEach((notification) => {
      const { id, type, message, duration } = notification
      
      // Solo procesar notificaciones que no hemos procesado antes
      if (!processedNotifications.current.has(id)) {
        processedNotifications.current.add(id)
        
        toast[type](message, {
          duration: duration || 4000,
          onDismiss: () => {
            removeNotification(id)
            processedNotifications.current.delete(id)
          },
        })
      }
    })
  }, [notifications, removeNotification])

  return <>{children}</>
} 