import React, { useState } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import CropCard from './CropCard';

export default function CropList({
  crops,
  loading,
  onRefresh,
  onCropPress,
  onNegotiate,
  showNegotiate = true,
  variant = 'default',
  ListHeaderComponent = null
}) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => (
    <CropCard
      crop={item}
      onPress={() => onCropPress(item)}
      onNegotiate={() => onNegotiate && onNegotiate(item)}
      showNegotiate={showNegotiate}
      variant={variant}
    />
  );

  if (loading && !crops.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading crops...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={crops}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🌾</Text>
          <Text style={styles.emptyText}>No crops available</Text>
          <Text style={styles.emptySubtext}>Check back later for new listings</Text>
        </View>
      }
      contentContainerStyle={crops.length === 0 ? styles.emptyContent : styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: 10,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 50,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
});