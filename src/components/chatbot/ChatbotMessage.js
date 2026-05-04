import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image
} from 'react-native';

export default function ChatbotMessage({ message, language }) {
  const isUser = message.isUser;
  
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.botContainer]}>
      {!isUser && (
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>🤖</Text>
        </View>
      )}
      
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
        <Text style={[styles.message, isUser ? styles.userMessage : styles.botMessage]}>
          {message.text}
        </Text>
        <Text style={styles.time}>{formatTime(message.timestamp)}</Text>
      </View>
      
      {isUser && (
        <View style={styles.userAvatarContainer}>
          <Text style={styles.userAvatar}>👤</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-end',
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  botContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
  },
  avatar: {
    fontSize: 32,
  },
  userAvatarContainer: {
    marginLeft: 8,
  },
  userAvatar: {
    fontSize: 32,
  },
  bubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: '#4CAF50',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    elevation: 1,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMessage: {
    color: '#fff',
  },
  botMessage: {
    color: '#333',
  },
  time: {
    fontSize: 10,
    color: '#999',
    marginTop: 5,
    alignSelf: 'flex-end',
  },
});