import { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';

export default function useNotificationHook() {
  const {
    notifications,
    unreadCount,
    loading,
    loadNotifications,
    markAsRead,
    addNotification
  } = useNotification();

  const [recentNotifications, setRecentNotifications] = useState([]);

  useEffect(() => {
    setRecentNotifications(notifications.slice(0, 5));
  }, [notifications]);

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    for (const notification of unread) {
      await markAsRead(notification.id);
    }
  };

  const getUnreadByType = (type) => {
    return notifications.filter(n => !n.read && n.type === type).length;
  };

  return {
    notifications,
    unreadCount,
    recentNotifications,
    loading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    addNotification,
    getUnreadByType
  };
}