import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image
} from 'react-native';

export default function NotificationItem({ notification, onPress, onDelete }) {
  const getIcon = () => {
    switch(notification.type) {
      case 'contract': return '📄';
      case 'message': return '💬';
      case 'payment': return '💰';
      case 'negotiation': return '🤝';
      default: return '🔔';
    }
  };

  const getBackgroundColor = () => {
    if (!notification.read) return '#E8F5E9';
    return '#fff';
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: getBackgroundColor() }]}
      onPress={() => onPress(notification)}
      onLongPress={() => onDelete(notification.id)}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{getIcon()}</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.title, !notification.read && styles.unreadTitle]}>
          {notification.title}
        </Text>
        <Text style={styles.body}>{notification.body}</Text>
        <Text style={styles.time}>{formatTime(notification.timestamp)}</Text>
      </View>
      
      {!notification.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 30,
  },
  content: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  unreadTitle: {
    color: '#333',
  },
  body: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  time: {
    fontSize: 10,
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginLeft: 10,
  },
});