import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  RefreshControl
} from 'react-native';
import { getMarketplaceCrops } from '../../services/firestoreService';

export default function MarketplaceScreen({ navigation }) {
  const [crops, setCrops] = useState([]);
  const [filteredCrops, setFilteredCrops] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCrops();
  }, []);

  const loadCrops = async () => {
    const cropList = await getMarketplaceCrops();
    setCrops(cropList);
    setFilteredCrops(cropList);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = crops.filter(crop => 
      crop.name.toLowerCase().includes(text.toLowerCase()) ||
      crop.category.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredCrops(filtered);
  };

  const renderCrop = ({ item }) => (
    <TouchableOpacity 
      style={styles.cropCard}
      onPress={() => navigation.navigate('CropDetail', { cropId: item.id })}
    >
      <Image source={{ uri: item.images[0] }} style={styles.cropImage} />
      <View style={styles.cropInfo}>
        <Text style={styles.cropName}>{item.name}</Text>
        <Text style={styles.cropPrice}>₹{item.price}/kg</Text>
        <Text style={styles.cropQuantity}>{item.quantity} kg available</Text>
        <Text style={styles.farmerName}>👨‍🌾 {item.farmerName}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>⭐ {item.rating || 4.5}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.negotiateButton}
        onPress={() => navigation.navigate('Negotiation', { cropId: item.id })}
      >
        <Text style={styles.negotiateButtonText}>Negotiate</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search crops..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <FlatList
        data={filteredCrops}
        renderItem={renderCrop}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadCrops} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No crops available</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#fff',
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  cropCard: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    elevation: 2,
  },
  cropImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  cropInfo: {
    flex: 1,
    marginLeft: 10,
  },
  cropName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cropPrice: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 3,
  },
  cropQuantity: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  farmerName: {
    fontSize: 12,
    color: '#2196F3',
    marginTop: 3,
  },
  ratingContainer: {
    marginTop: 3,
  },
  rating: {
    fontSize: 12,
    color: '#FFC107',
  },
  negotiateButton: {
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    paddingHorizontal: 15,
    borderRadius: 8,
    marginLeft: 5,
  },
  negotiateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});