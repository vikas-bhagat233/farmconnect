import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { markNotificationAsRead } from '../services/notificationService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const unsubscribeRef = useRef(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    // Real-time listener — fires instantly when a new notification is written
    const { db, collection, query, where, onSnapshot } = require('../services/firebase');
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid)
    );

    unsubscribeRef.current = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const unread = data.filter(n => !n.read).length;

      // On subsequent updates (not first load), show an in-app alert for new notifications
      if (!isFirstLoad.current) {
        snapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            const n = change.doc.data();
            // Show local push so the buyer sees it immediately on their device
            Notifications.scheduleNotificationAsync({
              content: {
                title: n.title,
                body: n.body,
                sound: true,
              },
              trigger: null,
            }).catch(() => {});
          }
        });
      }

      isFirstLoad.current = false;
      setNotifications(data);
      setUnreadCount(unread);
      setLoading(false);
    }, (error) => {
      console.error('Notification listener error:', error.code);
      setLoading(false);
    });

    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
      isFirstLoad.current = true;
    };
  }, [user?.uid]);

  useEffect(() => {
    // Request notification permissions on mount
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted' && Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
        });
      }
    })();
  }, []);

  const loadNotifications = async () => {
    // No-op — data comes from the real-time listener above
    // Kept for backward compatibility with any screen that calls it
  };

  const markAsRead = async (notificationId) => {
    await markNotificationAsRead(notificationId);
    // Listener will auto-update the list
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      loadNotifications,
      markAsRead,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
