import { useState, useEffect, useCallback } from 'react';
import { Notification } from '@/types';
import { notificationsApi } from '@/services/domain.service';

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await notificationsApi.list();
      setNotifications(data.items);
      setUnreadCount(data.unread);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [userId]);

  useEffect(() => {
    loadNotifications();
    
    // Polling toutes les 30 secondes pour simuler les mises à jour en temps réel
    const interval = setInterval(() => {
      void loadNotifications();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [userId, loadNotifications]);

  const markAsRead = async (notificationId: string) => {
    await notificationsApi.markAsRead(notificationId);
    await loadNotifications();
  };

  const markAllAsRead = async () => {
    if (userId) {
      await notificationsApi.markAllAsRead();
      await loadNotifications();
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refresh: loadNotifications,
  };
}
