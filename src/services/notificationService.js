import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc,
  deleteDoc,
  Timestamp
} from './firebase';
import * as Notifications from 'expo-notifications';

export const sendNotification = async (userId, title, body, data = {}) => {
  try {
    const notificationRef = doc(collection(db, 'notifications'));
    await setDoc(notificationRef, {
      userId,
      title,
      body,
      data,
      read: false,
      createdAt: new Date().toISOString(),
      type: data.type || 'general'
    });
    
    // Send push notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null,
    });
    
    return { success: true };
  } catch (error) {
    console.error('Notification error:', error);
    return { success: false };
  }
};

export const getNotifications = async (userId) => {
  const notificationsQuery = query(
    collection(db, 'notifications'),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(notificationsQuery);
  const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getUnreadCount = async (userId) => {
  const notificationsQuery = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('read', '==', false)
  );
  const snapshot = await getDocs(notificationsQuery);
  return snapshot.size;
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, { read: true });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    await deleteDoc(doc(db, 'notifications', notificationId));
    return { success: true };
  } catch (error) {
    return { success: false };
  }
};

export const markAllAsRead = async (userId) => {
  const notificationsQuery = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('read', '==', false)
  );
  const snapshot = await getDocs(notificationsQuery);
  
  snapshot.forEach(async (doc) => {
    await updateDoc(doc.ref, { read: true });
  });
};