import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl
} from 'react-native';
import { getMarketplaceCrops, getBuyerStats } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';

export default function BuyerDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [featuredCrops, setFeaturedCrops] = useState([]);
  const [stats, setStats] = useState({
    activeContracts: 0,
    completedContracts: 0,
    totalSpent: 0
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const crops = await getMarketplaceCrops();
    setFeaturedCrops(crops.slice(0, 5));
    const buyerStats = await getBuyerStats(user.uid);
    setStats(buyerStats);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, {user?.displayName || 'Buyer'}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Image source={{ uri: user?.photoURL }} style={styles.profileImage} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.activeContracts}</Text>
          <Text style={styles.statLabel}>Active Contracts</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.completedContracts}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>₹{stats.totalSpent}</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.browseButton}
        onPress={() => navigation.navigate('Marketplace')}
      >
        <Text style={styles.browseButtonText}>Browse Marketplace</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Featured Crops</Text>
      {featuredCrops.map((crop) => (
        <TouchableOpacity 
          key={crop.id} 
          style={styles.cropCard}
          onPress={() => navigation.navigate('CropDetail', { cropId: crop.id })}
        >
          <Image source={{ uri: crop.images[0] }} style={styles.cropImage} />
          <View style={styles.cropInfo}>
            <Text style={styles.cropName}>{crop.name}</Text>
            <Text style={styles.cropPrice}>₹{crop.price}/kg</Text>
            <Text style={styles.farmerName}>By: {crop.farmerName}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 10,
  },
  statCard: {
    backgroundColor: '#fff',
    flex: 1,
    margin: 5,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  browseButton: {
    backgroundColor: '#2196F3',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 10,
    color: '#333',
  },
  cropCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    elevation: 2,
  },
  cropImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  cropInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  cropName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cropPrice: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 5,
  },
  farmerName: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
});