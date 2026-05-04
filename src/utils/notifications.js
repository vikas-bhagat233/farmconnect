import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';

export const registerForPushNotifications = async () => {
  let token = null;
  
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4CAF50',
    });
  }
  
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return null;
  }
  
  try {
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Push token:', token);
  } catch (error) {
    console.error('Error getting push token:', error);
  }
  
  return token;
};

export const sendLocalNotification = async (title, body, data = {}) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: null,
  });
};

export const sendContractNotification = async (contractId, cropName, buyerName, farmerName, status) => {
  const title = status === 'pending' ? 'New Contract Request' : `Contract ${status}`;
  const body = status === 'pending' 
    ? `${buyerName} requested contract for ${cropName}`
    : `Contract for ${cropName} is ${status}`;
  
  await sendLocalNotification(title, body, { type: 'contract', contractId });
};

export const sendPaymentNotification = async (contractId, amount, type, status) => {
  const title = status === 'paid' ? 'Payment Received' : 'Payment Failed';
  const body = status === 'paid'
    ? `₹${amount} ${type === 'advance' ? 'advance' : 'remaining'} payment received`
    : `Payment of ₹${amount} failed`;
  
  await sendLocalNotification(title, body, { type: 'payment', contractId });
};

export const sendMessageNotification = async (senderName, message, userId) => {
  await sendLocalNotification(
    `New message from ${senderName}`,
    message.length > 50 ? message.substring(0, 50) + '...' : message,
    { type: 'message', senderId: userId, senderName }
  );
};

export const sendNegotiationNotification = async (cropId, cropName, buyerName, offer) => {
  await sendLocalNotification(
    'New Negotiation Offer',
    `${buyerName} offered ₹${offer.price}/kg for ${offer.quantity}kg of ${cropName}`,
    { type: 'negotiation', cropId }
  );
};

export const sendSystemNotification = async (title, body, data = {}) => {
  await sendLocalNotification(title, body, { ...data, type: 'system' });
};

export const scheduleReminder = async (title, body, seconds, data = {}) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: { seconds },
  });
};

export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

export const getNotificationPermissions = async () => {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
};