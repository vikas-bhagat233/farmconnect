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
  ActivityIndicator,
  TextInput,
  Modal
} from 'react-native';
import { getCropById, getFarmerById } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';

export default function CropDetailScreen({ navigation, route }) {
  const { cropId } = route.params;
  const { user } = useAuth();
  const [crop, setCrop] = useState(null);
  const [farmer, setFarmer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNegotiateModal, setShowNegotiateModal] = useState(false);
  const [negotiationPrice, setNegotiationPrice] = useState('');
  const [negotiationQuantity, setNegotiationQuantity] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    loadCropDetails();
  }, []);

  const loadCropDetails = async () => {
    setLoading(true);
    const cropData = await getCropById(cropId);
    setCrop(cropData);
    if (cropData.farmerId) {
      const farmerData = await getFarmerById(cropData.farmerId);
      setFarmer(farmerData);
    }
    setLoading(false);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this ${crop.name} - ${crop.quantity}kg at ₹${crop.price}/kg`,
        title: 'Crop Details'
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share');
    }
  };

  const handleNegotiate = () => {
    if (!negotiationPrice || !negotiationQuantity) {
      Alert.alert('Error', 'Please enter price and quantity');
      return;
    }
    
    navigation.navigate('Negotiation', {
      cropId: crop.id,
      cropName: crop.name,
      farmerId: crop.farmerId,
      farmerName: farmer?.name,
      originalPrice: crop.price,
      maxQuantity: crop.quantity,
      proposedPrice: parseInt(negotiationPrice),
      proposedQuantity: parseInt(negotiationQuantity)
    });
    setShowNegotiateModal(false);
  };

  const handleChat = () => {
    navigation.navigate('Chat', {
      userId: crop.farmerId,
      userName: farmer?.name,
      userRole: 'farmer'
    });
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
        <Text style={styles.errorText}>Crop not found</Text>
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
          <Text style={styles.priceLabel}>Price</Text>
          <Text style={styles.priceValue}>₹{crop.price}/kg</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{crop.quantity}</Text>
            <Text style={styles.statLabel}>Quantity (kg)</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{crop.category}</Text>
            <Text style={styles.statLabel}>Category</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{crop.quality}</Text>
            <Text style={styles.statLabel}>Quality Grade</Text>
          </View>
        </View>

        {/* Market Price Comparison */}
        <View style={styles.marketPriceContainer}>
          <Text style={styles.sectionTitle}>Market Price Comparison</Text>
          <View style={styles.priceComparison}>
            <View style={styles.priceItem}>
              <Text style={styles.priceItemLabel}>Seller Price</Text>
              <Text style={styles.priceItemValue}>₹{crop.price}</Text>
            </View>
            <View style={styles.priceItem}>
              <Text style={styles.priceItemLabel}>Market Avg</Text>
              <Text style={styles.priceItemValue}>₹{crop.marketPrice || crop.price + 5}</Text>
            </View>
            <View style={styles.priceItem}>
              <Text style={styles.priceItemLabel}>You Save</Text>
              <Text style={[styles.priceItemValue, { color: '#4CAF50' }]}>
                ₹{crop.marketPrice ? crop.marketPrice - crop.price : 5}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {crop.description || 'No description provided'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.location}>{crop.location || 'Location not specified'}</Text>
        </View>

        {/* Farmer Info */}
        {farmer && (
          <TouchableOpacity 
            style={styles.farmerSection}
            onPress={() => navigation.navigate('FarmerProfile', { farmerId: farmer.id })}
          >
            <Text style={styles.sectionTitle}>Seller Information</Text>
            <View style={styles.farmerCard}>
              <Image source={{ uri: farmer.photoURL }} style={styles.farmerImage} />
              <View style={styles.farmerInfo}>
                <Text style={styles.farmerName}>{farmer.name}</Text>
                <Text style={styles.farmerRating}>⭐ {farmer.rating || 4.5} (120 reviews)</Text>
                <Text style={styles.farmerLocation}>📍 {farmer.location || 'India'}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.negotiateButton}
            onPress={() => setShowNegotiateModal(true)}
          >
            <Text style={styles.negotiateButtonText}>💰 Negotiate</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.chatButton} onPress={handleChat}>
            <Text style={styles.chatButtonText}>💬 Chat with Farmer</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.contractButton}
            onPress={() => navigation.navigate('MakeContract', { cropId: crop.id })}
          >
            <Text style={styles.contractButtonText}>📄 Make Contract</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Negotiation Modal */}
      <Modal
        visible={showNegotiateModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Negotiate Price</Text>
            <Text style={styles.modalSubtitle}>Crop: {crop.name}</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Your offered price (₹/kg)"
              value={negotiationPrice}
              onChangeText={setNegotiationPrice}
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Quantity (kg)"
              value={negotiationQuantity}
              onChangeText={setNegotiationQuantity}
              keyboardType="numeric"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowNegotiateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.sendButton]}
                onPress={handleNegotiate}
              >
                <Text style={styles.sendButtonText}>Send Offer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  marketPriceContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  priceComparison: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  priceItem: {
    alignItems: 'center',
  },
  priceItemLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  priceItemValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    marginBottom: 20,
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
  farmerSection: {
    marginBottom: 20,
  },
  farmerCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  farmerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  farmerInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  farmerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  farmerRating: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  farmerLocation: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  actionButtons: {
    marginTop: 10,
  },
  negotiateButton: {
    backgroundColor: '#FF9800',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  negotiateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contractButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  contractButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  sendButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});