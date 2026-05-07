import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { updateUserProfile } from '../../services/firestoreService';

export default function EditProfileScreen({ navigation }) {

  const { user, userRole, updateUser } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    phone: '',
    location: '',
    farmName: '',
    farmSize: '',
    bio: ''
  });
  const [profileImage, setProfileImage] = useState(user?.photoURL);

  React.useEffect(() => {
    const loadProfile = async () => {
      if (user?.uid) {
        const { getUserProfile } = require('../../services/firestoreService');
        const profile = await getUserProfile(user.uid);
        if (profile) {
          setFormData(prev => ({
            ...prev,
            phone: profile.phone || '',
            location: profile.location || '',
            farmName: profile.farmName || '',
            farmSize: profile.farmSize || '',
            bio: profile.bio || ''
          }));
        }
      }
      setFetching(false);
    };
    loadProfile();
  }, [user?.uid]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!formData.name) {
      Alert.alert(t('error') || 'Error', t('nameRequired') || 'Name is required');
      return;
    }

    setLoading(true);
    
    let photoURL = user?.photoURL;
    if (profileImage && profileImage !== user?.photoURL) {
      photoURL = await uploadToCloudinary(profileImage);
    }
    
    const result = await updateUserProfile(user.uid, {
      ...formData,
      photoURL
    });
    
    if (result.success) {
      await updateUser({ displayName: formData.name, photoURL });
      Alert.alert(t('success') || 'Success', t('profileUpdated') || 'Profile updated successfully');
      navigation.goBack();
    } else {
      Alert.alert(t('error') || 'Error', result.error);
    }
    
    setLoading(false);
  };

  if (fetching) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <TouchableOpacity onPress={pickImage}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profileImage, { backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={{ fontSize: 40, color: '#fff' }}>{user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}</Text>
            </View>
          )}
          <View style={styles.cameraIcon}>
            <Text style={styles.cameraIconText}>📷</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>{t('fullName') || 'Full Name'} *</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(text) => setFormData({...formData, name: text})}
          placeholder={t('enterFullName') || 'Enter your full name'}
        />

        <Text style={styles.label}>{t('phoneNumber') || 'Phone Number'}</Text>
        <TextInput
          style={styles.input}
          value={formData.phone}
          onChangeText={(text) => setFormData({...formData, phone: text})}
          placeholder={t('enterPhoneNumber') || 'Enter your phone number'}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>{t('location') || 'Location'}</Text>
        <TextInput
          style={styles.input}
          value={formData.location}
          onChangeText={(text) => setFormData({...formData, location: text})}
          placeholder={t('enterLocation') || 'Enter your location'}
        />

        <Text style={styles.label}>{t('bio') || 'Bio'}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.bio}
          onChangeText={(text) => setFormData({...formData, bio: text})}
          placeholder={t('enterBio') || 'Tell us about yourself'}
          multiline
          numberOfLines={4}
        />

        {userRole === 'farmer' && (
          <>
            <Text style={styles.label}>{t('farmName') || 'Farm Name'}</Text>
            <TextInput
              style={styles.input}
              value={formData.farmName}
              onChangeText={(text) => setFormData({...formData, farmName: text})}
              placeholder={t('enterFarmName') || 'Enter your farm name'}
            />

            <Text style={styles.label}>{t('farmSize') || 'Farm Size'}</Text>
            <TextInput
              style={styles.input}
              value={formData.farmSize}
              onChangeText={(text) => setFormData({...formData, farmSize: text})}
              placeholder={t('enterFarmSize') || 'e.g., 5 acres'}
            />
          </>
        )}

        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>{t('saveChanges') || 'Save Changes'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    padding: 8,
  },
  cameraIconText: {
    fontSize: 16,
  },
  formContainer: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 14,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});