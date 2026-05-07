import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { getBuyerPayments } from '../../services/paymentService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export default function BuyerPaymentsScreen({ navigation }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalPaid: 0,
    pendingPayments: 0,
    advancePaid: 0
  });

  const formatDateSafe = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString();
  };

  useFocusEffect(
    React.useCallback(() => {
      if (!user?.uid) return;

      setLoading(true);
      const { db, collection, query, where, onSnapshot } = require('../../services/firebase');
      const q = query(
        collection(db, 'payments'),
        where('buyerId', '==', user.uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const paymentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const sortedData = paymentsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPayments(sortedData);

        let totalPaid = 0;
        let pendingPayments = 0;
        let advancePaid = 0;

        sortedData.forEach(payment => {
          if (payment.status === 'paid' || payment.status === 'received' || payment.status === 'advance_paid') {
            totalPaid += payment.amount;
            if (payment.type === 'advance') advancePaid += payment.amount;
          } else if (payment.status === 'pending') {
            pendingPayments += payment.amount;
          }
        });

        setSummary({ totalPaid, pendingPayments, advancePaid });
        setLoading(false);
      }, (error) => {
        console.error("Payments listener failed:", error);
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

  const loadPayments = async () => {
    if (!user?.uid) return;
    setLoading(true);
    const paymentsData = await getBuyerPayments(user.uid);
    setPayments(paymentsData);

    let totalPaid = 0;
    let pendingPayments = 0;
    let advancePaid = 0;

    paymentsData.forEach(payment => {
          if (payment.status === 'paid' || payment.status === 'received' || payment.status === 'advance_paid') {
        totalPaid += payment.amount;
        if (payment.type === 'advance') advancePaid += payment.amount;
      } else if (payment.status === 'pending') {
        pendingPayments += payment.amount;
      }
    });

    setSummary({ totalPaid, pendingPayments, advancePaid });
    setLoading(false);
  };

  const handlePayNow = async (payment) => {
    navigation.navigate('Payment', {
      contractId: payment.contractId,
      type: payment.type
    });
  };

  const getPaymentTypeText = (type) => {
    return type === 'advance' ? (t('advancePaymentLabel') || 'Advance Payment (30%)') : (t('remainingPaymentLabel') || 'Remaining Payment (70%)');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#4CAF50';
      case 'received': return '#4CAF50';
      case 'advance_paid': return '#4CAF50';
      case 'pending': return '#f44336';
      case 'processing': return '#FFC107';
      default: return '#999';
    }
  };

  const renderPayment = ({ item }) => (
    <View style={[styles.paymentCard, { backgroundColor: colors.card }]}>
      <View style={[styles.paymentHeader, { borderBottomColor: colors.border }]}>
        <Text style={[styles.contractId, { color: colors.textSecondary }]}>{t('contract') || 'Contract'} #{item.contractId.slice(-6)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.paymentDetails}>
        <Text style={[styles.cropName, { color: colors.text }]}>🌾 {item.cropName}</Text>
        <Text style={[styles.farmerName, { color: colors.textSecondary }]}>👨‍🌾 {item.farmerName}</Text>
        <Text style={styles.amount}>💰 {t('amount') || 'Amount'}: ₹{item.amount}</Text>
        <Text style={[styles.paymentType, { color: colors.textSecondary }]}>💳 {t('type') || 'Type'}: {getPaymentTypeText(item.type)}</Text>
        {formatDateSafe(item.dueDate) ? (
          <Text style={[styles.date, { color: colors.textSecondary }]}>📅 {t('due') || 'Due'}: {formatDateSafe(item.dueDate)}</Text>
        ) : formatDateSafe(item.paidAt) ? (
          <Text style={[styles.date, { color: colors.textSecondary }]}>📅 {t('paid') || 'Paid'}: {formatDateSafe(item.paidAt)}</Text>
        ) : null}
      </View>

      {item.status === 'pending' && (
        <TouchableOpacity
          style={styles.payButton}
          onPress={() => handlePayNow(item)}
        >
          <Text style={styles.payButtonText}>{t('payNow') || 'Pay Now'}</Text>
        </TouchableOpacity>
      )}

      {(item.status === 'paid' || item.status === 'received' || item.status === 'advance_paid') && (
        <View style={styles.receiptContainer}>
          <Text style={styles.receiptText}>✓ {t('paymentCompleted') || 'Payment Completed'}</Text>
          {item.transactionId && <Text style={styles.transactionId}>{t('transactionId') || 'TX ID'}: {item.transactionId}</Text>}
        </View>
      )}
    </View>
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
      {/* Summary Cards */}
      <View style={[styles.summaryContainer, { backgroundColor: colors.card }]}>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryValue, { color: colors.text }]}>₹{summary.totalPaid}</Text>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('totalPaid') || 'Total Paid'}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryValue, { color: '#f44336' }]}>₹{summary.pendingPayments}</Text>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('pending') || 'Pending'}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryValue, { color: '#FF9800' }]}>₹{summary.advancePaid}</Text>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('advancePaid') || 'Advance Paid'}</Text>
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
  farmerName: {
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
  payButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  payButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  receiptContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  receiptText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  transactionId: {
    fontSize: 10,
    color: '#666',
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