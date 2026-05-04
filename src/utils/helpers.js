import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const calculateDiscount = (originalPrice, currentPrice) => {
  if (!originalPrice || originalPrice <= 0) return 0;
  const discount = ((originalPrice - currentPrice) / originalPrice) * 100;
  return Math.round(discount);
};

export const calculateTotal = (price, quantity) => {
  return price * quantity;
};

export const calculateAdvanceAmount = (totalAmount, percentage = 30) => {
  return (totalAmount * percentage) / 100;
};

export const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

export const downloadFile = async (url, fileName) => {
  try {
    const fileUri = FileSystem.documentDirectory + fileName;
    const downloadResumable = FileSystem.createDownloadResumable(
      url,
      fileUri
    );
    const { uri } = await downloadResumable.downloadAsync();
    
    if (Platform.OS === 'ios' || await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    }
    return uri;
  } catch (error) {
    console.error('Download error:', error);
    return null;
  }
};

export const copyToClipboard = async (text) => {
  if (Platform.OS === 'web') {
    await navigator.clipboard.writeText(text);
  } else {
    await Clipboard.setStringAsync(text);
  }
  return true;
};

export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

export const sortByDate = (array, dateKey = 'createdAt', ascending = false) => {
  return [...array].sort((a, b) => {
    const dateA = new Date(a[dateKey]);
    const dateB = new Date(b[dateKey]);
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

export const getStatusColor = (status) => {
  const colors = {
    pending: '#FFC107',
    active: '#4CAF50',
    completed: '#2196F3',
    cancelled: '#f44336',
    rejected: '#f44336',
    paid: '#4CAF50',
    processing: '#FF9800',
    failed: '#f44336',
  };
  return colors[status] || '#999';
};

export const showAlert = (title, message, onOk = null) => {
  if (Platform.OS === 'web') {
    alert(`${title}: ${message}`);
    if (onOk) onOk();
  } else {
    Alert.alert(title, message, [{ text: 'OK', onPress: onOk }]);
  }
};

export const parseError = (error) => {
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  return 'An unexpected error occurred';
};

export const isObjectEmpty = (obj) => {
  return !obj || Object.keys(obj).length === 0;
};

export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};