import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { addCrop } from '../../services/cropService';
import { uploadToCloudinary } from '../../services/cloudinaryService';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const CROP_CATEGORIES = ['Vegetables', 'Fruits', 'Grains', 'Spices', 'Others'];

export default function AddCropScreen({ navigation }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [cropData, setCropData] = useState({
    name: '',
    category: '',
    quantity: '',
    price: '',
    quality: 'A',
    description: '',
    location: ''
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages([...images, ...result.assets]);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0]]);
    }
  };

  const handleSubmit = async () => {
    if (!cropData.name || !cropData.quantity || !cropData.price) {
      Alert.alert(t('error') || 'Error', t('fillRequiredFields') || 'Please fill all required fields');
      return;
    }

    setLoading(true);
    
    // Upload images to Cloudinary
    const imageUrls = [];
    for (let image of images) {
      const url = await uploadToCloudinary(image.uri);
      imageUrls.push(url);
    }

    const result = await addCrop({
      ...cropData,
      farmerId: user.uid,
      farmerName: user.displayName || (t('farmer') || 'Farmer'),
      images: imageUrls,
      quantity: parseInt(cropData.quantity),
      price: parseInt(cropData.price)
    });

    setLoading(false);

    if (result.success) {
      Alert.alert(t('success') || 'Success', t('cropAddedSuccessfully') || 'Crop added successfully');
      navigation.goBack();
    } else {
      Alert.alert(t('error') || 'Error', result.error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder={t('cropNameRequired') || 'Crop Name *'}
          value={cropData.name}
          onChangeText={(text) => setCropData({...cropData, name: text})}
        />

        <View style={styles.categoryContainer}>
          {CROP_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                cropData.category === cat && styles.categoryChipSelected
              ]}
              onPress={() => setCropData({...cropData, category: cat})}
            >
              <Text style={cropData.category === cat ? styles.categoryTextSelected : styles.categoryText}>
                {t(`category_${cat.toLowerCase()}`) || cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.input}
          placeholder={t('quantityRequiredKg') || 'Quantity (in kg) *'}
          value={cropData.quantity}
          onChangeText={(text) => setCropData({...cropData, quantity: text})}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder={t('pricePerKgRequired') || 'Price per kg (₹) *'}
          value={cropData.price}
          onChangeText={(text) => setCropData({...cropData, price: text})}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.textArea}
          placeholder={t('description') || 'Description'}
          value={cropData.description}
          onChangeText={(text) => setCropData({...cropData, description: text})}
          multiline
          numberOfLines={4}
        />

        <TextInput
          style={styles.input}
          placeholder={t('location') || 'Location'}
          value={cropData.location}
          onChangeText={(text) => setCropData({...cropData, location: text})}
        />

        <View style={styles.imageSection}>
          <Text style={styles.imageLabel}>{t('cropImages') || 'Crop Images'}</Text>
          <View style={styles.imageButtons}>
            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
              <Text style={styles.imageButtonText}>📷 {t('gallery') || 'Gallery'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
              <Text style={styles.imageButtonText}>📸 {t('camera') || 'Camera'}</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal style={styles.imageList}>
            {images.map((img, idx) => (
              <Image key={idx} source={{ uri: img.uri }} style={styles.previewImage} />
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>{t('addCrop') || 'Add Crop'}</Text>
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
  formContainer: {
    padding: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    height: 100,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  categoryChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 10,
    marginBottom: 10,
  },
  categoryChipSelected: {
    backgroundColor: '#4CAF50',
  },
  categoryText: {
    color: '#333',
  },
  categoryTextSelected: {
    color: '#fff',
  },
  imageSection: {
    marginBottom: 20,
  },
  imageLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  imageButtons: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  imageButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  imageButtonText: {
    color: '#fff',
  },
  imageList: {
    flexDirection: 'row',
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});