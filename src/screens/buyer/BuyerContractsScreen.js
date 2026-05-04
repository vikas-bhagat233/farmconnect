import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Share
} from 'react-native';
import { getBuyerContracts, updateContractStatus, downloadContractPDF } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';

export default function BuyerContractsScreen({ navigation }) {
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    setLoading(true);
    const contractsData = await getBuyerContracts(user.uid);
    setContracts(contractsData);
    setLoading(false);
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
      style={styles.contractCard}
      onPress={() => navigation.navigate('ContractDetails', { contractId: item.id })}
    >
      <View style={styles.contractHeader}>
        <Text style={styles.farmerName}>{item.farmerName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.contractDetails}>
        <Text style={styles.cropName}>🌾 {item.cropName}</Text>
        <Text style={styles.details}>📦 Quantity: {item.quantity} kg</Text>
        <Text style={styles.details}>💰 Price: ₹{item.agreedPrice}/kg</Text>
        <Text style={styles.totalAmount}>💵 Total: ₹{item.totalAmount}</Text>
        <Text style={styles.date}>📅 Created: {new Date(item.createdAt).toLocaleDateString()}</Text>
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredContracts}
        renderItem={renderContract}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No {activeTab} contracts found</Text>
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