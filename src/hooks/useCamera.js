import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export const useCamera = () => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const requestPermissions = async (type) => {
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera access is required');
        return false;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Gallery access is required');
        return false;
      }
    }
    return true;
  };

  const pickImage = async (options = {}) => {
    const hasPermission = await requestPermissions('library');
    if (!hasPermission) return null;

    setLoading(true);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: options.allowsEditing || true,
      aspect: options.aspect || [1, 1],
      quality: options.quality || 0.8,
      allowsMultipleSelection: options.allowsMultiple || false,
    });

    setLoading(false);

    if (!result.canceled) {
      if (options.allowsMultiple) {
        setImage(result.assets);
        return result.assets;
      } else {
        setImage(result.assets[0]);
        return result.assets[0];
      }
    }
    return null;
  };

  const takePhoto = async (options = {}) => {
    const hasPermission = await requestPermissions('camera');
    if (!hasPermission) return null;

    setLoading(true);
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: options.allowsEditing || true,
      aspect: options.aspect || [1, 1],
      quality: options.quality || 0.8,
    });

    setLoading(false);

    if (!result.canceled) {
      setImage(result.assets[0]);
      return result.assets[0];
    }
    return null;
  };

  const clearImage = () => {
    setImage(null);
  };

  return {
    image,
    loading,
    pickImage,
    takePhoto,
    clearImage
  };
};

export const useMultipleImages = (maxImages = 5) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const pickMultiple = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Gallery access is required');
      return;
    }

    setLoading(true);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    setLoading(false);

    if (!result.canceled) {
      const newImages = [...images, ...result.assets].slice(0, maxImages);
      setImages(newImages);
      return newImages;
    }
    return null;
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return {
    images,
    loading,
    pickMultiple,
    removeImage,
    setImages
  };
};