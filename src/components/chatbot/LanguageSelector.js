import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList
} from 'react-native';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', nativeName: 'हिन्दी' },
  { code: 'mr', name: 'Marathi', flag: '🇮🇳', nativeName: 'मराठी' }
];

export default function LanguageSelector({ language, setLanguage, variant = 'button' }) {
  const [modalVisible, setModalVisible] = useState(false);

  const currentLanguage = languages.find(l => l.code === language);

  const selectLanguage = (langCode) => {
    setLanguage(langCode);
    setModalVisible(false);
  };

  if (variant === 'inline') {
    return (
      <View style={styles.inlineContainer}>
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={[
              styles.inlineChip,
              language === lang.code && styles.inlineChipActive
            ]}
            onPress={() => selectLanguage(lang.code)}
          >
            <Text style={styles.inlineFlag}>{lang.flag}</Text>
            <Text style={[
              styles.inlineName,
              language === lang.code && styles.inlineNameActive
            ]}>
              {lang.nativeName}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <Text style={styles.flag}>{currentLanguage?.flag}</Text>
        <Text style={styles.buttonText}>{currentLanguage?.nativeName}</Text>
        <Text style={styles.dropdownIcon}>▼</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Language</Text>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageOption,
                  language === lang.code && styles.languageOptionActive
                ]}
                onPress={() => selectLanguage(lang.code)}
              >
                <Text style={styles.languageFlag}>{lang.flag}</Text>
                <View style={styles.languageInfo}>
                  <Text style={styles.languageName}>{lang.name}</Text>
                  <Text style={styles.languageNative}>{lang.nativeName}</Text>
                </View>
                {language === lang.code && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  flag: {
    fontSize: 16,
    marginRight: 5,
  },
  buttonText: {
    fontSize: 12,
    color: '#333',
    marginRight: 3,
  },
  dropdownIcon: {
    fontSize: 10,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  languageOptionActive: {
    backgroundColor: '#E8F5E9',
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  languageNative: {
    fontSize: 12,
    color: '#666',
  },
  checkmark: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  inlineContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  inlineChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  inlineChipActive: {
    backgroundColor: '#4CAF50',
  },
  inlineFlag: {
    fontSize: 14,
    marginRight: 5,
  },
  inlineName: {
    fontSize: 12,
    color: '#333',
  },
  inlineNameActive: {
    color: '#fff',
  },
});