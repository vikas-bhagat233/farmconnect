import { useState } from 'react';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

// Simple XOR encryption (demo purposes - use proper crypto for production)
const encryptXOR = (text, key) => {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(result);
};

const decryptXOR = (encrypted, key) => {
  const text = atob(encrypted);
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
};

export const useEncryption = () => {
  const [encryptionKey, setEncryptionKey] = useState(null);

  const generateKey = async () => {
    const key = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      Date.now().toString() + Math.random().toString()
    );
    return key.slice(0, 32);
  };

  const saveKey = async (key, userId) => {
    await SecureStore.setItemAsync(`encryption_key_${userId}`, key);
    setEncryptionKey(key);
  };

  const getKey = async (userId) => {
    const key = await SecureStore.getItemAsync(`encryption_key_${userId}`);
    if (!key && userId) {
      const newKey = await generateKey();
      await saveKey(newKey, userId);
      return newKey;
    }
    setEncryptionKey(key);
    return key;
  };

  const encryptMessage = async (message, userId) => {
    let key = encryptionKey;
    if (!key) {
      key = await getKey(userId);
    }
    return encryptXOR(message, key);
  };

  const decryptMessage = async (encryptedMessage, userId) => {
    let key = encryptionKey;
    if (!key) {
      key = await getKey(userId);
    }
    return decryptXOR(encryptedMessage, key);
  };

  const hashPassword = async (password) => {
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password
    );
  };

  const generateSecureId = async () => {
    const randomBytes = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      Date.now().toString() + Math.random().toString() + Math.random().toString()
    );
    return randomBytes.slice(0, 16);
  };

  return {
    encryptMessage,
    decryptMessage,
    hashPassword,
    generateSecureId,
    generateKey,
    saveKey,
    getKey
  };
};

export const useSecureStorage = () => {
  const saveSecure = async (key, value) => {
    await SecureStore.setItemAsync(key, value);
  };

  const getSecure = async (key) => {
    return await SecureStore.getItemAsync(key);
  };

  const deleteSecure = async (key) => {
    await SecureStore.deleteItemAsync(key);
  };

  return { saveSecure, getSecure, deleteSecure };
};