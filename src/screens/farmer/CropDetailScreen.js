import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Share,
  ActivityIndicator
} from 'react-native';
import { getCropById, updateCropStatus } from '../../services/cropService';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function CropDetailScreen({ navigation, route }) {
  const { cropId } = route.params;
  const { user } = useAuth();
  const { t } = useLanguage();
  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    loadCropDetails();
  }, []);

  const loadCropDetails = async () => {
    setLoading(true);
    const cropData = await getCropById(cropId);
    setCrop(cropData);
    setLoading(false);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${t('shareMyCropPrefix') || 'Check out my'} ${crop.name} - ${crop.quantity}kg ${t('shareCropAt') || 'at'} ₹${crop.price}/kg`,
        title: t('cropDetails') || 'Crop Details'
      });
    } catch (error) {
      Alert.alert(t('error') || 'Error', t('failedToShare') || 'Failed to share');
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditCrop', { cropId: crop.id, cropData: crop });
  };

  const handleToggleStatus = async () => {
    const newStatus = crop.status === 'available' ? 'unavailable' : 'available';
    Alert.alert(
      t('updateStatus') || 'Update Status',
      `${t('markCropAs') || 'Do you want to mark this crop as'} ${newStatus}?`,
      [
        { text: t('cancel') || 'Cancel', style: 'cancel' },
        {
          text: t('yes') || 'Yes',
          onPress: async () => {
            await updateCropStatus(cropId, newStatus);
            loadCropDetails();
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!crop) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{t('cropNotFound') || 'Crop not found'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Image Gallery */}
      <View style={styles.imageContainer}>
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {crop.images?.map((img, idx) => (
            <Image key={idx} source={{ uri: img }} style={styles.mainImage} />
          ))}
        </ScrollView>
        <View style={styles.imageDots}>
          {crop.images?.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.imageDot,
                selectedImage === idx && styles.imageDotActive
              ]}
            />
          ))}
        </View>
      </View>

      {/* Crop Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.cropName}>{crop.name}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>{t('price') || 'Price'}</Text>
          <Text style={styles.priceValue}>₹{crop.price}/kg</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{crop.quantity}</Text>
            <Text style={styles.statLabel}>{t('quantityKg') || 'Quantity (kg)'}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{crop.category}</Text>
            <Text style={styles.statLabel}>{t('category') || 'Category'}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{crop.quality}</Text>
            <Text style={styles.statLabel}>{t('qualityGrade') || 'Quality Grade'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('description') || 'Description'}</Text>
          <Text style={styles.description}>
            {crop.description || (t('noDescription') || 'No description provided')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('location') || 'Location'}</Text>
          <Text style={styles.location}>{crop.location || (t('locationNotSpecified') || 'Location not specified')}</Text>
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>{t('status') || 'Status'}:</Text>
          <View style={[styles.statusBadge, crop.status === 'available' ? styles.availableBadge : styles.unavailableBadge]}>
            <Text style={styles.statusText}>
              {crop.status === 'available' ? (t('available') || 'Available') : (t('notAvailable') || 'Not Available')}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.editButtonText}>✏️ {t('editCrop') || 'Edit Crop'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareButtonText}>📤 {t('share') || 'Share'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.statusButton, crop.status === 'available' ? styles.makeUnavailable : styles.makeAvailable]}
            onPress={handleToggleStatus}
          >
            <Text style={styles.statusButtonText}>
              {crop.status === 'available' ? (t('makeUnavailable') || 'Make Unavailable') : (t('makeAvailable') || 'Make Available')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
  imageContainer: {
    backgroundColor: '#000',
    height: 300,
  },
  mainImage: {
    width: 400,
    height: 300,
    resizeMode: 'cover',
  },
  imageDots: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  imageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  imageDotActive: {
    backgroundColor: '#fff',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  infoContainer: {
    padding: 20,
  },
  cropName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    backgroundColor: '#e8f5e9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 16,
    color: '#666',
  },
  priceValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
    elevation: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  location: {
    fontSize: 14,
    color: '#666',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  availableBadge: {
    backgroundColor: '#4CAF50',
  },
  unavailableBadge: {
    backgroundColor: '#f44336',
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  actionButtons: {
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  shareButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  makeAvailable: {
    backgroundColor: '#4CAF50',
  },
  makeUnavailable: {
    backgroundColor: '#f44336',
  },
  statusButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});