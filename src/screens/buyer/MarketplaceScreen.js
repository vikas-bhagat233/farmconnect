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
import { getMarketplaceCrops } from '../../services/cropService';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export default function MarketplaceScreen({ navigation }) {
  const { colors } = useTheme();
  const { t } = useLanguage();
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
      style={[styles.cropCard, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate('CropDetail', { cropId: item.id })}
    >
      <Image source={{ uri: item.images[0] }} style={styles.cropImage} />
      <View style={styles.cropInfo}>
        <Text style={[styles.cropName, { color: colors.text }]}>{item.name}</Text>
        <Text style={styles.cropPrice}>₹{item.price}/kg</Text>
        <Text style={[styles.cropQuantity, { color: colors.textSecondary }]}>{item.quantity} {t('kgAvailable') || 'kg available'}</Text>
        <Text style={[styles.farmerName, { color: colors.textSecondary }]}>👨‍🌾 {item.farmerName}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>⭐ {item.rating || 4.5}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.negotiateButton}
        onPress={() => navigation.navigate('Negotiation', { 
          cropId: item.id,
          cropName: item.name,
          farmerId: item.farmerId,
          farmerName: item.farmerName,
          originalPrice: item.price,
          maxQuantity: item.quantity
        })}
      >
        <Text style={styles.negotiateButtonText}>{t('negotiate') || 'Negotiate'}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.background, color: colors.text }]}
          placeholder={t('searchCrops') || 'Search crops...'}
          placeholderTextColor={colors.textSecondary}
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
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('noCropsAvailable') || 'No crops available'}</Text>
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