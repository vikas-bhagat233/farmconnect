import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

// Simple XOR encryption (for demo purposes)
// In production, use proper encryption libraries

export const generateKey = async () => {
  const key = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    Date.now().toString() + Math.random().toString() + Math.random().toString()
  );
  return key.slice(0, 32);
};

export const encryptXOR = (text, key) => {
  if (!text || !key) return text;
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(result);
};

export const decryptXOR = (encrypted, key) => {
  if (!encrypted || !key) return encrypted;
  try {
    const text = atob(encrypted);
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  } catch (error) {
    console.error('Decryption error:', error);
    return encrypted;
  }
};

export const hashPassword = async (password) => {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
};

export const hashMessage = async (message, salt) => {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    message + salt
  );
};

export const generateSecureId = async () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString();
  const combined = timestamp + random;
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    combined
  );
  return hash.slice(0, 16);
};

export const generateSessionToken = async () => {
  const randomBytes = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    Date.now().toString() + Math.random().toString() + Math.random().toString()
  );
  return randomBytes;
};

export const saveEncryptedData = async (key, data, encryptionKey) => {
  const encrypted = encryptXOR(JSON.stringify(data), encryptionKey);
  await SecureStore.setItemAsync(key, encrypted);
  return true;
};

export const getEncryptedData = async (key, encryptionKey) => {
  const encrypted = await SecureStore.getItemAsync(key);
  if (!encrypted) return null;
  try {
    const decrypted = decryptXOR(encrypted, encryptionKey);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Failed to decrypt data:', error);
    return null;
  }
};

export const generateIV = () => {
  const iv = Crypto.getRandomValues(new Uint8Array(12));
  return btoa(String.fromCharCode(...iv));
};

export const simpleEncrypt = (text) => {
  // Simple obfuscation for demo purposes
  if (!text) return '';
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) + 1);
  }
  return btoa(result);
};

export const simpleDecrypt = (encrypted) => {
  if (!encrypted) return '';
  try {
    const text = atob(encrypted);
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) - 1);
    }
    return result;
  } catch (error) {
    return encrypted;
  }
};