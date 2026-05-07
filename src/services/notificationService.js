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
  Timestamp,
  getDoc
} from './firebase';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const registerForPushNotificationsAsync = async (userId) => {
  let token;
  try {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return null;

      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (projectId) {
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      } else {
        token = (await Notifications.getExpoPushTokenAsync()).data;
      }

      if (token && userId) {
        await updateDoc(doc(db, 'users', userId), { pushToken: token });
      }
    }
  } catch (error) {
    console.log('Push notifications not fully configured (EAS project ID missing). Continuing without push.');
  }
  return token;
};

export const sendNotification = async (userId, title, body, data = {}) => {
  try {
    if (!userId) return { success: false, error: 'Missing userId' };
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

    // 2. Send Expo Push Notification if user has a token
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const pushToken = userDoc.exists() ? userDoc.data().pushToken : null;
      
      if (pushToken) {
        await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: pushToken,
            sound: 'default',
            title: title,
            body: body,
            data: data,
          }),
        });
      }
    } catch (pushErr) {
      console.log('Failed to send push notification API:', pushErr);
    }

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