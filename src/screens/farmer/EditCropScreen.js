import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { updateCrop } from '../../services/firestoreService';
import { uploadToCloudinary } from '../../services/cloudinaryService';

export default function EditCropScreen({ navigation, route }) {
  const { cropId, cropData } = route.params;
  const [crop, setCrop] = useState({
    name: cropData.name,
    category: cropData.category,
    quantity: cropData.quantity.toString(),
    price: cropData.price.toString(),
    quality: cropData.quality,
    description: cropData.description || '',
    location: cropData.location || ''
  });
  const [images, setImages] = useState(cropData.images || []);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setNewImages([...newImages, ...result.assets]);
    }
  };

  const removeImage = (index, isNew = false) => {
    if (isNew) {
      setNewImages(newImages.filter((_, i) => i !== index));
    } else {
      setImages(images.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    if (!crop.name || !crop.quantity || !crop.price) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    
    // Upload new images to Cloudinary
    const newImageUrls = [];
    for (let image of newImages) {
      const url = await uploadToCloudinary(image.uri);
      newImageUrls.push(url);
    }

    const allImages = [...images, ...newImageUrls];
    
    const result = await updateCrop(cropId, {
      ...crop,
      images: allImages,
      quantity: parseInt(crop.quantity),
      price: parseInt(crop.price)
    });

    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Crop updated successfully');
      navigation.goBack();
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Crop Name *"
          value={crop.name}
          onChangeText={(text) => setCrop({...crop, name: text})}
        />

        <TextInput
          style={styles.input}
          placeholder="Category"
          value={crop.category}
          onChangeText={(text) => setCrop({...crop, category: text})}
        />

        <TextInput
          style={styles.input}
          placeholder="Quantity (in kg) *"
          value={crop.quantity}
          onChangeText={(text) => setCrop({...crop, quantity: text})}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Price per kg (₹) *"
          value={crop.price}
          onChangeText={(text) => setCrop({...crop, price: text})}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.textArea}
          placeholder="Description"
          value={crop.description}
          onChangeText={(text) => setCrop({...crop, description: text})}
          multiline
          numberOfLines={4}
        />

        <TextInput
          style={styles.input}
          placeholder="Location"
          value={crop.location}
          onChangeText={(text) => setCrop({...crop, location: text})}
        />

        {/* Existing Images */}
        <Text style={styles.imageLabel}>Current Images</Text>
        <ScrollView horizontal style={styles.imageList}>
          {images.map((img, idx) => (
            <View key={idx} style={styles.imageContainer}>
              <Image source={{ uri: img }} style={styles.previewImage} />
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => removeImage(idx, false)}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {/* New Images */}
        {newImages.length > 0 && (
          <>
            <Text style={styles.imageLabel}>New Images</Text>
            <ScrollView horizontal style={styles.imageList}>
              {newImages.map((img, idx) => (
                <View key={idx} style={styles.imageContainer}>
                  <Image source={{ uri: img.uri }} style={styles.previewImage} />
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => removeImage(idx, true)}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </>
        )}

        <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
          <Text style={styles.addImageButtonText}>+ Add More Images</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Update Crop</Text>
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
  imageLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    marginTop: 10,
  },
  imageList: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 10,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addImageButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  addImageButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});