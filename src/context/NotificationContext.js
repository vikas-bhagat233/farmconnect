import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { getNotifications, getUnreadCount, markNotificationAsRead } from '../services/notificationService';
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
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    if (user) {
      loadNotifications();
      registerForPushNotifications();
      
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    notificationListener.current = Notifications.addNotificationReceivedListener(handleNotification);
    responseListener.current = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
    
    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const registerForPushNotifications = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') return;
    
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Push token:', token);
    
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  };

  const loadNotifications = async () => {
    if (!user) return;
    const data = await getNotifications(user.uid);
    setNotifications(data);
    const count = await getUnreadCount(user.uid);
    setUnreadCount(count);
    setLoading(false);
  };

  const handleNotification = (notification) => {
    loadNotifications();
  };

  const handleNotificationResponse = (response) => {
    const { data } = response.notification.request.content;
    // Navigation handled in AppNavigator
  };

  const markAsRead = async (notificationId) => {
    await markNotificationAsRead(notificationId);
    loadNotifications();
  };

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      loadNotifications,
      markAsRead,
      addNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};