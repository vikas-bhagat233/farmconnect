import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Header({
  title,
  showBack = false,
  showNotification = false,
  rightComponent = null,
  onBackPress,
  onNotificationPress
}) {
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  const handleNotification = () => {
    if (onNotificationPress) {
      onNotificationPress();
    } else {
      navigation.navigate('Notifications');
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <View style={styles.leftContainer}>
          {showBack && (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        
        <View style={styles.rightContainer}>
          {showNotification && (
            <TouchableOpacity onPress={handleNotification} style={styles.notificationButton}>
              <Text style={styles.notificationIcon}>🔔</Text>
            </TouchableOpacity>
          )}
          {rightComponent}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  leftContainer: {
    width: 50,
  },
  rightContainer: {
    width: 50,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  backButton: {
    padding: 5,
  },
  backIcon: {
    fontSize: 24,
    color: '#333',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  notificationButton: {
    padding: 5,
  },
  notificationIcon: {
    fontSize: 20,
  },
});