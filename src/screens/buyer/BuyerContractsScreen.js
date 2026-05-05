import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Share,
  RefreshControl
} from 'react-native';
import { getBuyerContracts, updateContractStatus, downloadContractPDF } from '../../services/contractService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export default function BuyerContractsScreen({ navigation }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadContracts();
    }, [])
  );

  const loadContracts = async () => {
    setLoading(true);
    const contractsData = await getBuyerContracts(user.uid);
    setContracts(contractsData);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const contractsData = await getBuyerContracts(user.uid);
    setContracts(contractsData);
    setRefreshing(false);
  };

  const handleDownloadPDF = async (contract) => {
    const pdfUrl = await downloadContractPDF(contract);
    if (pdfUrl) {
      Alert.alert('Success', 'Contract PDF is ready', [
        { text: 'Share', onPress: () => Share.share({ url: pdfUrl }) },
        { text: 'OK' }
      ]);
    }
  };

  const handleMakePayment = (contract) => {
    navigation.navigate('Payment', {
      contractId: contract.id,
      amount: contract.advanceAmount,
      type: 'advance'
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#FFC107';
      case 'active': return '#4CAF50';
      case 'completed': return '#2196F3';
      case 'cancelled': return '#f44336';
      default: return '#999';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return 'Pending Farmer Approval';
      case 'active': return 'Active';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const filteredContracts = contracts.filter(c => {
    if (activeTab === 'pending') return c.status === 'pending';
    if (activeTab === 'active') return c.status === 'active';
    if (activeTab === 'completed') return c.status === 'completed';
    return true;
  });

  const renderContract = ({ item }) => (
    <TouchableOpacity 
      style={[styles.contractCard, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate('ContractDetails', { contractId: item.id })}
    >
      <View style={styles.contractHeader}>
        <Text style={[styles.farmerName, { color: colors.text }]}>{item.farmerName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.contractDetails}>
        <Text style={[styles.cropName, { color: colors.text }]}>🌾 {item.cropName}</Text>
        <Text style={[styles.details, { color: colors.textSecondary }]}>📦 Quantity: {item.quantity} kg</Text>
        <Text style={[styles.details, { color: colors.textSecondary }]}>💰 Price: ₹{item.agreedPrice}/kg</Text>
        <Text style={styles.totalAmount}>💵 Total: ₹{item.totalAmount}</Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>📅 Created: {new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>

      {item.status === 'active' && (
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentText}>
            Advance Paid: ₹{item.advanceAmount} (30%)
          </Text>
          {!item.advancePaid && (
            <TouchableOpacity 
              style={styles.payButton}
              onPress={() => handleMakePayment(item)}
            >
              <Text style={styles.payButtonText}>Pay Advance (30%)</Text>
            </TouchableOpacity>
          )}
          {item.advancePaid && !item.fullPaid && (
            <Text style={styles.remainingText}>
              Remaining: ₹{item.remainingAmount} (70% due on delivery)
            </Text>
          )}
        </View>
      )}

      {item.status === 'completed' && (
        <TouchableOpacity 
          style={styles.downloadButton}
          onPress={() => handleDownloadPDF(item)}
        >
          <Text style={styles.downloadButtonText}>📄 Download Contract</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.tabContainer, { backgroundColor: colors.card }]}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'active' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === 'active' && { color: colors.primary, fontWeight: 'bold' }]}>
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'pending' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === 'pending' && { color: colors.primary, fontWeight: 'bold' }]}>
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'completed' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === 'completed' && { color: colors.primary, fontWeight: 'bold' }]}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredContracts}
        renderItem={renderContract}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No {activeTab} contracts found</Text>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  contractCard: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  contractHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  farmerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  contractDetails: {
    marginBottom: 10,
  },
  cropName: {
    fontSize: 14,
    marginBottom: 5,
  },
  details: {
    fontSize: 14,
    marginBottom: 3,
    color: '#666',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 5,
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  paymentInfo: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  paymentText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  remainingText: {
    fontSize: 12,
    color: '#FF9800',
    marginTop: 5,
  },
  payButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  payButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  downloadButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  downloadButtonText: {
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