import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert
} from 'react-native';
import { getNotifications, markNotificationAsRead, deleteNotification } from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';

export default function NotificationScreen({ navigation }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    const data = await getNotifications(user.uid);
    setNotifications(data);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handlePress = async (item) => {
    await markNotificationAsRead(item.id);
    if (item.type === 'contract' && item.contractId) {
      navigation.navigate('ContractDetails', { contractId: item.contractId });
    } else if (item.type === 'message' && item.senderId) {
      navigation.navigate('Chat', {
        userId: item.senderId,
        userName: item.senderName,
        userRole: item.senderRole
      });
    } else if (item.type === 'payment' && item.contractId) {
      navigation.navigate('Payment', { contractId: item.contractId });
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteNotification(id);
            loadNotifications();
          }
        }
      ]
    );
  };

  const getIcon = (type) => {
    switch(type) {
      case 'contract': return '📄';
      case 'message': return '💬';
      case 'payment': return '💰';
      case 'negotiation': return '🤝';
      default: return '🔔';
    }
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity 
      style={[styles.notificationCard, !item.read && styles.unreadCard]}
      onPress={() => handlePress(item)}
      onLongPress={() => handleDelete(item.id)}
    >
      <View style={styles.notificationIcon}>
        <Text style={styles.iconText}>{getIcon(item.type)}</Text>
      </View>
      <View style={styles.notificationContent}>
        <Text style={[styles.notificationTitle, !item.read && styles.unreadTitle]}>
          {item.title}
        </Text>
        <Text style={styles.notificationBody}>{item.body}</Text>
        <Text style={styles.notificationTime}>
          {new Date(item.timestamp).toLocaleString()}
        </Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyText}>No notifications</Text>
            <Text style={styles.emptySubtext}>
              You're all caught up!
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: '#E8F5E9',
  },
  notificationIcon: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 30,
  },
  notificationContent: {
    flex: 1,
    marginLeft: 10,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  unreadTitle: {
    color: '#4CAF50',
  },
  notificationBody: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  notificationTime: {
    fontSize: 10,
    color: '#999',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    alignSelf: 'center',
    marginLeft: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 50,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
});