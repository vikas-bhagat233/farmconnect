import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { getFarmerById, getFarmerReviews } from '../../services/firestoreService';
import { getFarmerCrops } from '../../services/cropService';
import { useAuth } from '../../context/AuthContext';

export default function FarmerProfileScreen({ navigation, route }) {
  const { farmerId } = route.params;
  const { user } = useAuth();
  const [farmer, setFarmer] = useState(null);
  const [crops, setCrops] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFarmerData();
  }, []);

  const loadFarmerData = async () => {
    setLoading(true);
    const farmerData = await getFarmerById(farmerId);
    setFarmer(farmerData);
    
    const farmerCrops = await getFarmerCrops(farmerId);
    setCrops(farmerCrops.slice(0, 5));
    
    const farmerReviews = await getFarmerReviews(farmerId);
    setReviews(farmerReviews);
    
    setLoading(false);
  };

  const handleChat = () => {
    navigation.navigate('Chat', {
      userId: farmerId,
      userName: farmer.name,
      userRole: 'farmer'
    });
  };

  const handleViewAllCrops = () => {
    navigation.navigate('Marketplace', { filterFarmer: farmerId });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!farmer) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Farmer not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Image source={{ uri: farmer.photoURL }} style={styles.profileImage} />
        <Text style={styles.farmerName}>{farmer.name}</Text>
        <Text style={styles.farmerLocation}>📍 {farmer.location || 'India'}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>⭐ {farmer.rating || 4.5}</Text>
          <Text style={styles.reviewCount}>({reviews.length} reviews)</Text>
        </View>
        <TouchableOpacity style={styles.chatButton} onPress={handleChat}>
          <Text style={styles.chatButtonText}>💬 Send Message</Text>
        </TouchableOpacity>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Farmer</Text>
        <Text style={styles.aboutText}>
          {farmer.bio || 'Experienced farmer dedicated to providing high-quality organic produce.'}
        </Text>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{farmer.totalSales || 0}</Text>
          <Text style={styles.statLabel}>Total Sales</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{farmer.totalCrops || crops.length}</Text>
          <Text style={styles.statLabel}>Crops Listed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{farmer.completedContracts || 0}</Text>
          <Text style={styles.statLabel}>Contracts</Text>
        </View>
      </View>

      {/* Recent Crops */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Crops</Text>
          <TouchableOpacity onPress={handleViewAllCrops}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        {crops.map((crop) => (
          <TouchableOpacity 
            key={crop.id} 
            style={styles.cropCard}
            onPress={() => navigation.navigate('CropDetail', { cropId: crop.id })}
          >
            <Image source={{ uri: crop.images[0] }} style={styles.cropImage} />
            <View style={styles.cropInfo}>
              <Text style={styles.cropName}>{crop.name}</Text>
              <Text style={styles.cropPrice}>₹{crop.price}/kg</Text>
              <Text style={styles.cropQuantity}>{crop.quantity} kg available</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Reviews Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Reviews</Text>
        {reviews.length > 0 ? (
          reviews.map((review, idx) => (
            <View key={idx} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>{review.buyerName}</Text>
                <Text style={styles.reviewRating}>⭐ {review.rating}</Text>
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
              <Text style={styles.reviewDate}>
                {new Date(review.date).toLocaleDateString()}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noReviewsText}>No reviews yet</Text>
        )}
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
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  farmerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  farmerLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  rating: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFC107',
  },
  reviewCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  chatButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
  },
  chatButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllText: {
    color: '#4CAF50',
    fontSize: 12,
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 5,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  cropCard: {
    flexDirection: 'row',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  cropImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  cropInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  cropName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  cropPrice: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 2,
  },
  cropQuantity: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  reviewCard: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  reviewerName: {
    fontWeight: 'bold',
    color: '#333',
  },
  reviewRating: {
    color: '#FFC107',
  },
  reviewComment: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  reviewDate: {
    fontSize: 10,
    color: '#999',
  },
  noReviewsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
});