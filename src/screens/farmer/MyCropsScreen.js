import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl
} from 'react-native';
import { getFarmerCrops, deleteCrop } from '../../services/cropService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export default function MyCropsScreen({ navigation }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [crops, setCrops] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadCrops();
    }, [])
  );

  const loadCrops = async () => {
    const cropList = await getFarmerCrops(user.uid);
    setCrops(cropList);
  };

  const handleDelete = (cropId) => {
    Alert.alert(
      'Delete Crop',
      'Are you sure you want to delete this crop?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            await deleteCrop(cropId);
            loadCrops();
          }
        }
      ]
    );
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
        <Text style={[styles.cropQuantity, { color: colors.textSecondary }]}>{item.quantity} kg available</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            {item.contractId ? 'Under Contract' : 'Available'}
          </Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => handleDelete(item.id)}
      >
        <Text style={styles.deleteButtonText}>🗑️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={crops}
        renderItem={renderCrop}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadCrops} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No crops added yet</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => navigation.navigate('AddCrop')}
            >
              <Text style={styles.addButtonText}>Add Your First Crop</Text>
            </TouchableOpacity>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cropPrice: {
    fontSize: 16,
    color: '#4CAF50',
    marginTop: 5,
  },
  cropQuantity: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  statusBadge: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  statusText: {
    fontSize: 10,
    color: '#333',
  },
  deleteButton: {
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  deleteButtonText: {
    fontSize: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});