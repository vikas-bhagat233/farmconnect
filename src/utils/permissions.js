import { Platform, Alert, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

export const requestCameraPermission = async () => {
  if (Platform.OS === 'web') return true;
  
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Camera Permission Required',
      'Camera access is needed to take photos of your crops',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]
    );
    return false;
  }
  return true;
};

export const requestGalleryPermission = async () => {
  if (Platform.OS === 'web') return true;
  
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Gallery Permission Required',
      'Gallery access is needed to select crop images',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]
    );
    return false;
  }
  return true;
};

export const requestLocationPermission = async () => {
  if (Platform.OS === 'web') return true;
  
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Location Permission Required',
      'Location access helps find nearby buyers/farmers and markets',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]
    );
    return false;
  }
  return true;
};

export const requestNotificationPermission = async () => {
  if (Platform.OS === 'web') return true;
  
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Notification Permission Required',
      'Notifications keep you updated about contracts, messages, and payments',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]
    );
    return false;
  }
  return true;
};

export const getCurrentLocation = async () => {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) return null;
  
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      address: await getAddressFromCoords(location.coords.latitude, location.coords.longitude),
    };
  } catch (error) {
    console.error('Location error:', error);
    return null;
  }
};

export const getAddressFromCoords = async (latitude, longitude) => {
  try {
    const response = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (response.length > 0) {
      const addr = response[0];
      return `${addr.city || addr.region || ''}, ${addr.country || ''}`;
    }
    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};

export const checkAllPermissions = async () => {
  const results = {
    camera: await requestCameraPermission(),
    gallery: await requestGalleryPermission(),
    location: await requestLocationPermission(),
    notifications: await requestNotificationPermission(),
  };
  
  const allGranted = Object.values(results).every(v => v === true);
  return { allGranted, results };
};

export const getPermissionStatus = async () => {
  const cameraStatus = await ImagePicker.getCameraPermissionsAsync();
  const galleryStatus = await ImagePicker.getMediaLibraryPermissionsAsync();
  const locationStatus = await Location.getForegroundPermissionsAsync();
  const notificationStatus = await Notifications.getPermissionsAsync();
  
  return {
    camera: cameraStatus.status === 'granted',
    gallery: galleryStatus.status === 'granted',
    location: locationStatus.status === 'granted',
    notifications: notificationStatus.status === 'granted',
  };
};