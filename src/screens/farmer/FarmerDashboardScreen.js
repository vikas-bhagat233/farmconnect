import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { getFarmerStats, getRecentCrops } from '../../services/firestoreService';

export default function FarmerDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCrops: 0,
    activeContracts: 0,
    completedContracts: 0,
    totalEarnings: 0
  });
  const [recentCrops, setRecentCrops] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const statsData = await getFarmerStats(user.uid);
    setStats(statsData);
    const crops = await getRecentCrops(user.uid);
    setRecentCrops(crops);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
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
        <Text style={styles.welcomeText}>Welcome, {user?.displayName || 'Farmer'}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Image source={{ uri: user?.photoURL }} style={styles.profileImage} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalCrops}</Text>
          <Text style={styles.statLabel}>Total Crops</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.activeContracts}</Text>
          <Text style={styles.statLabel}>Active Contracts</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.completedContracts}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>₹{stats.totalEarnings}</Text>
          <Text style={styles.statLabel}>Earnings</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('AddCrop')}
      >
        <Text style={styles.addButtonText}>+ Add New Crop</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Recent Crops</Text>
      {recentCrops.map((crop) => (
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
    flexWrap: 'wrap',
    padding: 10,
  },
  statCard: {
    backgroundColor: '#fff',
    width: '45%',
    margin: '2.5%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
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
  cropQuantity: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
});