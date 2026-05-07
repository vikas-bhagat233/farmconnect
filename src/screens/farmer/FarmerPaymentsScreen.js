import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { getFarmerPayments, updatePaymentStatus } from '../../services/paymentService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export default function FarmerPaymentsScreen({ navigation }) {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalEarned: 0,
    pendingAmount: 0,
    receivedAmount: 0
  });

  const formatDateSafe = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString();
  };

  // useEffect dependency must use optional chaining — user can be null on mount
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { db, collection, query, where, onSnapshot } = require('../../services/firebase');
    const q = query(
      collection(db, 'payments'),
      where('farmerId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const paymentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const sortedData = paymentsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPayments(sortedData);

      let totalEarned = 0;
      let pendingAmount = 0;
      let receivedAmount = 0;

      sortedData.forEach(payment => {
        if (payment.status === 'received' || payment.status === 'paid' || payment.status === 'advance_paid') {
          totalEarned += payment.amount;
          receivedAmount += payment.amount;
        } else if (payment.status === 'pending') {
          pendingAmount += payment.amount;
        }
      });

      setSummary({ totalEarned, pendingAmount, receivedAmount });
      setLoading(false);
    }, (error) => {
      console.error('Farmer payments listener error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]); // safe — won't crash when user is null

  if (!user) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const loadPayments = async () => {
    if (!user?.uid) return;
    setLoading(true);
    const paymentsData = await getFarmerPayments(user.uid);
    setPayments(paymentsData);

    let totalEarned = 0;
    let pendingAmount = 0;
    let receivedAmount = 0;

    paymentsData.forEach(payment => {
      totalEarned += payment.amount;
      if (payment.status === 'pending' || payment.status === 'accept') {
        pendingAmount += payment.amount;
      } else if (payment.status === 'received') {
        receivedAmount += payment.amount;
      }
    });

    setSummary({ totalEarned, pendingAmount, receivedAmount });
    setLoading(false);
  };

  const handleMarkAsReceived = async (paymentId) => {
    Alert.alert(
      t('confirmPaymentReceived') || 'Confirm Payment Received',
      t('confirmPaymentReceivedPrompt') || 'Have you received this payment?',
      [
        { text: t('no') || 'No', style: 'cancel' },
        {
          text: t('yes') || 'Yes',
          onPress: async () => {
            await updatePaymentStatus(paymentId, 'received');
            loadPayments();
            Alert.alert(t('success') || 'Success', t('paymentMarkedReceived') || 'Payment marked as received');
          }
        }
      ]
    );
  };

  const getPaymentStatusColor = (status) => {
    switch(status) {
      case 'advance_paid': return '#FFC107';
      case 'paid': return '#4CAF50';
      case 'pending': return '#f44336';
      case 'received': return '#4CAF50';
      default: return '#999';
    }
  };

  const getPaymentStatusText = (status) => {
    switch(status) {
      case 'advance_paid': return t('advancePaidStatus') || 'Advance Paid (30%)';
      case 'paid': return t('paid') || 'Paid';
      case 'pending': return t('pending') || 'Pending';
      case 'received': return t('received') || 'Received';
      default: return status;
    }
  };

  const renderPayment = ({ item }) => (
    <View style={[styles.paymentCard, { backgroundColor: colors.card }]}>
      <View style={[styles.paymentHeader, { borderBottomColor: colors.border }]}>
        <Text style={[styles.contractId, { color: colors.textSecondary }]}>{t('contract') || 'Contract'} #{item.contractId.slice(-6)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getPaymentStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getPaymentStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.paymentDetails}>
        <Text style={[styles.cropName, { color: colors.text }]}>🌾 {item.cropName}</Text>
        <Text style={[styles.buyerName, { color: colors.textSecondary }]}>👤 {item.buyerName}</Text>
        <Text style={styles.amount}>💰 {t('amount') || 'Amount'}: ₹{item.amount}</Text>
        <Text style={[styles.paymentType, { color: colors.textSecondary }]}>
          💳 {t('type') || 'Type'}: {item.type === 'advance' ? (t('advancePaymentLabel') || 'Advance Payment (30%)') : (t('remainingPaymentLabel') || 'Remaining Payment (70%)')}
        </Text>
        {formatDateSafe(item.dueDate) ? (
          <Text style={[styles.date, { color: colors.textSecondary }]}>📅 {t('due') || 'Due'}: {formatDateSafe(item.dueDate)}</Text>
        ) : formatDateSafe(item.paidAt) ? (
          <Text style={[styles.date, { color: colors.textSecondary }]}>📅 {t('paid') || 'Paid'}: {formatDateSafe(item.paidAt)}</Text>
        ) : null}
      </View>

      {item.status === 'advance_paid' && (
        <View style={styles.noteContainer}>
          <Text style={styles.noteText}>
            ⚠️ {t('advanceReceivedNote') || 'Advance payment received. Remaining 70% due on delivery.'}
          </Text>
        </View>
      )}

      {(item.status === 'pending' || item.status === 'paid') && (
        <TouchableOpacity 
          style={styles.receivedButton}
          onPress={() => handleMarkAsReceived(item.id)}
        >
          <Text style={styles.receivedButtonText}>✓ {t('markAsReceived') || 'Mark as Received'}</Text>
        </TouchableOpacity>
      )}
    </View>
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
      {/* Summary Cards */}
      <View style={[styles.summaryContainer, { backgroundColor: colors.card }]}>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryValue, { color: colors.text }]}>₹{summary.totalEarned}</Text>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('totalEarned') || 'Total Earned'}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryValue, { color: '#FFC107' }]}>₹{summary.pendingAmount}</Text>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('pending') || 'Pending'}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>₹{summary.receivedAmount}</Text>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('received') || 'Received'}</Text>
        </View>
      </View>

      <FlatList
        data={payments}
        renderItem={renderPayment}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('noPaymentRecords') || 'No payment records found'}</Text>
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
  summaryContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  paymentCard: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  contractId: {
    fontSize: 12,
    color: '#666',
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
  paymentDetails: {
    marginBottom: 10,
  },
  cropName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  buyerName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  paymentType: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  noteContainer: {
    backgroundColor: '#FFF3E0',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  noteText: {
    fontSize: 12,
    color: '#FF9800',
  },
  receivedButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  receivedButtonText: {
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