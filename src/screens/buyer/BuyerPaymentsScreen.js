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
import { getBuyerPayments } from '../../services/paymentService';
import { useAuth } from '../../context/AuthContext';

export default function BuyerPaymentsScreen({ navigation }) {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalPaid: 0,
    pendingPayments: 0,
    advancePaid: 0
  });

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    const paymentsData = await getBuyerPayments(user.uid);
    setPayments(paymentsData);
    
    let totalPaid = 0;
    let pendingPayments = 0;
    let advancePaid = 0;
    
    paymentsData.forEach(payment => {
      if (payment.status === 'paid') {
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
    return type === 'advance' ? 'Advance Payment (30%)' : 'Remaining Payment (70%)';
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'paid': return '#4CAF50';
      case 'pending': return '#f44336';
      case 'processing': return '#FFC107';
      default: return '#999';
    }
  };

  const renderPayment = ({ item }) => (
    <View style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <Text style={styles.contractId}>Contract #{item.contractId.slice(-6)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.paymentDetails}>
        <Text style={styles.cropName}>🌾 {item.cropName}</Text>
        <Text style={styles.farmerName}>👨‍🌾 {item.farmerName}</Text>
        <Text style={styles.amount}>💰 Amount: ₹{item.amount}</Text>
        <Text style={styles.paymentType}>💳 Type: {getPaymentTypeText(item.type)}</Text>
        <Text style={styles.date}>📅 Due: {new Date(item.dueDate).toLocaleDateString()}</Text>
      </View>

      {item.status === 'pending' && (
        <TouchableOpacity 
          style={styles.payButton}
          onPress={() => handlePayNow(item)}
        >
          <Text style={styles.payButtonText}>Pay Now</Text>
        </TouchableOpacity>
      )}

      {item.status === 'paid' && (
        <View style={styles.receiptContainer}>
          <Text style={styles.receiptText}>✓ Payment Completed</Text>
          <Text style={styles.transactionId}>TX ID: {item.transactionId}</Text>
        </View>
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
    <View style={styles.container}>
      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>₹{summary.totalPaid}</Text>
          <Text style={styles.summaryLabel}>Total Paid</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryValue, { color: '#f44336' }]}>₹{summary.pendingPayments}</Text>
          <Text style={styles.summaryLabel}>Pending</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryValue, { color: '#FF9800' }]}>₹{summary.advancePaid}</Text>
          <Text style={styles.summaryLabel}>Advance Paid</Text>
        </View>
      </View>

      <FlatList
        data={payments}
        renderItem={renderPayment}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No payment records found</Text>
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