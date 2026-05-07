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
    // Save notification to Firestore — the recipient reads it from their device
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

    // Only schedule a local push notification if this notification is FOR the
    // currently logged-in user on this device. We cannot send push to other
    // devices from the client — that requires a backend with FCM tokens.
    // Scheduling for a different userId here would show the notification on
    // the wrong device (the sender's phone), which is the bug being fixed.
    // The recipient will see their notifications when they open the app via
    // the Notifications screen which reads from Firestore by userId.

    return { success: true };
  } catch (error) {
    console.error('Notification error:', error);
    return { success: false };
  }
};

export const getNotifications = async (userId) => {
  try {
    if (!userId) return [];
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(notificationsQuery);
    const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    return [];
  }
};

export const getUnreadCount = async (userId) => {
  try {
    if (!userId) return 0;
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    const snapshot = await getDocs(notificationsQuery);
    return snapshot.size;
  } catch (error) {
    return 0;
  }
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