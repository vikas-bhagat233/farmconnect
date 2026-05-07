import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { getFarmerContracts, updateContractStatus } from '../../services/contractService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export default function FarmerContractsScreen({ navigation }) {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [refreshing, setRefreshing] = useState(false);

  // useFocusEffect must be called unconditionally (no early return before hooks)
  useFocusEffect(
    useCallback(() => {
      if (!user?.uid) return;

      setLoading(true);
      const { db, collection, query, where, onSnapshot } = require('../../services/firebase');
      const q = query(
        collection(db, 'contracts'),
        where('farmerId', '==', user.uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setContracts(sortedData);
        setLoading(false);
      }, (error) => {
        console.error("Farmer contracts listener error:", error);
        setLoading(false);
      });

      return () => unsubscribe();
    }, [user?.uid])
  );

  if (!user) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const loadContracts = async () => {
    if (!user?.uid) return;
    setLoading(true);
    const contractsData = await getFarmerContracts(user.uid);
    setContracts(contractsData);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const contractsData = await getFarmerContracts(user.uid);
    setContracts(contractsData);
    setRefreshing(false);
  };

  const handleContractAction = async (contractId, action) => {
    const isAccepting = action === 'active';
    Alert.alert(
        isAccepting ? (t('acceptContract') || 'Accept Contract') : (t('rejectContract') || 'Reject Contract'),
        isAccepting
          ? (t('acceptContractPrompt') || 'Do you want to accept this contract? The buyer will be notified to pay the advance.')
          : (t('rejectContractPrompt') || 'Are you sure you want to reject this contract?'),
      [
          { text: t('cancel') || 'Cancel', style: 'cancel' },
        {
            text: isAccepting ? (t('accept') || 'Accept') : (t('reject') || 'Reject'),
          style: isAccepting ? 'default' : 'destructive',
          onPress: async () => {
            const result = await updateContractStatus(contractId, action);
            if (result.success) {
                Alert.alert(
                  t('success') || 'Success',
                  isAccepting
                    ? (t('contractAcceptedNotifyBuyer') || 'Contract accepted! The buyer has been notified to pay the advance.')
                    : (t('contractRejected') || 'Contract rejected.')
                );
              if (isAccepting) setActiveTab('active');
            } else {
                Alert.alert(t('error') || 'Error', result.error || (t('failedToUpdateContract') || 'Failed to update contract'));
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FFC107';
      case 'active': return '#4CAF50';
      case 'completed': return '#2196F3';
      case 'cancelled': return '#f44336';
      default: return '#999';
    }
  };

  const filteredContracts = contracts.filter(c => {
    if (activeTab === 'pending') return c.status === 'pending';
    if (activeTab === 'active') return c.status === 'active' || c.status === 'accept';
    if (activeTab === 'completed') return c.status === 'completed';
    return true;
  });

  const renderContract = ({ item }) => (
    <TouchableOpacity
      style={[styles.contractCard, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate('ContractDetails', { contractId: item.id })}
    >
      <View style={styles.contractHeader}>
        <Text style={[styles.buyerName, { color: colors.text }]}>{item.buyerName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}
        >
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.contractDetails}>
        <Text style={[styles.cropName, { color: colors.text }]}>🌾 {item.cropName}</Text>
        <Text style={[styles.quantity, { color: colors.textSecondary }]}>📦 {t('quantity') || 'Quantity'}: {item.quantity} kg</Text>
        <Text style={[styles.price, { color: colors.textSecondary }]}>💰 {t('price') || 'Price'}: ₹{item.agreedPrice}/kg</Text>
        <Text style={styles.total}>💵 {t('total') || 'Total'}: ₹{item.totalAmount}</Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>📅 {new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>

      {item.status === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleContractAction(item.id, 'active')}
          >
            <Text style={styles.actionButtonText}>✓ {t('accept') || 'Accept'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleContractAction(item.id, 'rejected')}
          >
            <Text style={styles.actionButtonText}>✗ {t('reject') || 'Reject'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {(item.status === 'active' || item.status === 'accept') && (
        <View style={[styles.paymentInfo, { borderTopColor: colors.border }]}>
          {!item.advancePaid ? (
            <Text style={{ color: '#FF9800', fontWeight: 'bold', fontSize: 13 }}>
              ⏳ {t('buyerPaymentPending') || 'Buyer Payment Pending'}: ₹{item.advanceAmount} (30% {t('advance') || 'Advance'})
            </Text>
          ) : (
            <Text style={{ color: '#4CAF50', fontWeight: 'bold', fontSize: 13 }}>
              ✅ {t('advanceReceivedPrepare') || 'Advance Received! Prepare for delivery of'} {item.quantity}kg.
            </Text>
          )}
          {item.advancePaid && (
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 5 }}>
              {t('remaining') || 'Remaining'}: ₹{item.remainingAmount} ({t('dueOnDelivery') || 'Due on delivery'})
            </Text>
          )}
        </View>
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.tabContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === 'pending' && { color: colors.primary, fontWeight: 'bold' }]}>
            {t('pending') || 'Pending'} {contracts.filter(c => c.status === 'pending').length > 0 ? `(${contracts.filter(c => c.status === 'pending').length})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === 'active' && { color: colors.primary, fontWeight: 'bold' }]}>
            {t('active') || 'Active'} {contracts.filter(c => c.status === 'active' || c.status === 'accept').length > 0 ? `(${contracts.filter(c => c.status === 'active' || c.status === 'accept').length})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === 'completed' && { color: colors.primary, fontWeight: 'bold' }]}>
            {t('completed') || 'Completed'} {contracts.filter(c => c.status === 'completed').length > 0 ? `(${contracts.filter(c => c.status === 'completed').length})` : ''}
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
  buyerName: {
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
  quantity: {
    fontSize: 14,
    marginBottom: 5,
  },
  price: {
    fontSize: 14,
    marginBottom: 5,
  },
  total: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
    marginBottom: 3,
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