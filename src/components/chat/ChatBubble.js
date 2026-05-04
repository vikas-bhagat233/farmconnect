import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity
} from 'react-native';

export default function ChatBubble({
  message,
  isMyMessage,
  senderName,
  timestamp,
  image,
  onLongPress,
  showReadReceipt = true
}) {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isMyMessage ? styles.myMessage : styles.theirMessage
      ]}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      {!isMyMessage && image && (
        <Image source={{ uri: image }} style={styles.avatar} />
      )}
      
      <View style={[
        styles.bubble,
        isMyMessage ? styles.myBubble : styles.theirBubble
      ]}>
        {!isMyMessage && senderName && (
          <Text style={styles.senderName}>{senderName}</Text>
        )}
        
        <Text style={styles.messageText}>{message}</Text>
        
        <View style={styles.footer}>
          <Text style={styles.timestamp}>{formatTime(timestamp)}</Text>
          {isMyMessage && showReadReceipt && (
            <Text style={styles.readReceipt}>✓✓</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-end',
  },
  myMessage: {
    justifyContent: 'flex-end',
  },
  theirMessage: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  bubble: {
    maxWidth: '75%',
    padding: 10,
    borderRadius: 18,
  },
  myBubble: {
    backgroundColor: '#4CAF50',
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    elevation: 1,
  },
  senderName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 3,
  },
  messageText: {
    fontSize: 14,
    color: '#333',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
    marginRight: 4,
  },
  readReceipt: {
    fontSize: 10,
    color: '#ccc',
  },
});