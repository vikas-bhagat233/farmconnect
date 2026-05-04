import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function ChatInput({
  onSend,
  onSendImage,
  loading = false,
  placeholder = "Type a message..."
}) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && onSendImage) {
      onSendImage(result.assets[0]);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.attachButton} onPress={pickImage}>
        <Text style={styles.attachIcon}>📎</Text>
      </TouchableOpacity>
      
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={message}
        onChangeText={setMessage}
        multiline
        maxLength={500}
      />
      
      <TouchableOpacity
        style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
        onPress={handleSend}
        disabled={!message.trim() || loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.sendIcon}>➤</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  attachButton: {
    padding: 8,
  },
  attachIcon: {
    fontSize: 24,
    color: '#666',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 14,
    marginHorizontal: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendIcon: {
    fontSize: 18,
    color: '#fff',
  },
});