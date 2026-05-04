import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { getFarmerHistory } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';

export default function FarmerHistoryScreen({ navigation }) {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    const historyData = await getFarmerHistory(user.uid);
    setHistory(historyData);
    setLoading(false);
  };

  const getFilteredHistory = () => {
    if (filter === 'all') return history;
    return history.filter(item => item.type === filter);
  };

  const renderHistoryItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.historyCard}
      onPress={() => {
        if (item.type === 'contract') {
          navigation.navigate('ContractDetails', { contractId: item.contractId });
        }
      }}
    >
      <View style={styles.historyHeader}>
        <Text style={styles.historyType}>
          {item.type === 'contract' ? '📄 Contract' : '💰 Payment'}
        </Text>
        <Text style={styles.historyDate}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.historyDetails}>
        <Text style={styles.historyTitle}>{item.title}</Text>
        <Text style={styles.historyDescription}>{item.description}</Text>
        {item.amount && (
          <Text style={styles.historyAmount}>Amount: ₹{item.amount}</Text>
        )}
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'completed' ? '#4CAF50' : '#FFC107' }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterTab, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterTab, filter === 'contract' && styles.activeFilter]}
          onPress={() => setFilter('contract')}
        >
          <Text style={[styles.filterText, filter === 'contract' && styles.activeFilterText]}>Contracts</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterTab, filter === 'payment' && styles.activeFilter]}
          onPress={() => setFilter('payment')}
        >
          <Text style={[styles.filterText, filter === 'payment' && styles.activeFilterText]}>Payments</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={getFilteredHistory()}
        renderItem={renderHistoryItem}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No history found</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
  },
  filterTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 5,
  },
  activeFilter: {
    backgroundColor: '#4CAF50',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  historyCard: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  historyType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  historyDate: {
    fontSize: 12,
    color: '#666',
  },
  historyDetails: {
    marginBottom: 10,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  historyDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  historyAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
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