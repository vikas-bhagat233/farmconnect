import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal
} from 'react-native';
import * as Crypto from 'expo-crypto';

export default function EncryptedMessage({
  message,
  isMyMessage,
  timestamp,
  encrypted = false
}) {
  const [showDecrypt, setShowDecrypt] = useState(false);
  const [decrypted, setDecrypted] = useState(false);

  const handleDecrypt = () => {
    // Simulate decryption
    setDecrypted(true);
    setShowDecrypt(false);
  };

  if (!encrypted) {
    return (
      <View style={[styles.container, isMyMessage ? styles.myMessage : styles.theirMessage]}>
        <Text style={styles.messageText}>{message}</Text>
        <Text style={styles.timestamp}>{timestamp}</Text>
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={[styles.container, styles.encryptedContainer]}
        onPress={() => setShowDecrypt(true)}
      >
        <Text style={styles.lockIcon}>🔒</Text>
        <Text style={styles.encryptedText}>Encrypted Message</Text>
        <Text style={styles.tapText}>Tap to decrypt</Text>
      </TouchableOpacity>

      <Modal visible={showDecrypt} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🔐 Encrypted Message</Text>
            <Text style={styles.modalMessage}>
              {decrypted ? message : "This message is end-to-end encrypted. Tap decrypt to view."}
            </Text>
            
            {!decrypted && (
              <TouchableOpacity style={styles.decryptButton} onPress={handleDecrypt}>
                <Text style={styles.decryptButtonText}>Decrypt Message</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowDecrypt(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 15,
    marginBottom: 10,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4CAF50',
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
  },
  encryptedContainer: {
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  messageText: {
    fontSize: 14,
    color: '#333',
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  lockIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  encryptedText: {
    fontSize: 12,
    color: '#666',
  },
  tapText: {
    fontSize: 10,
    color: '#999',
    marginTop: 3,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '85%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  decryptButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  decryptButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
  },
});