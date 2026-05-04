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

export default function FarmerPaymentsScreen({ navigation }) {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalEarned: 0,
    pendingAmount: 0,
    receivedAmount: 0
  });

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    const paymentsData = await getFarmerPayments(user.uid);
    setPayments(paymentsData);
    
    // Calculate summary
    let totalEarned = 0;
    let pendingAmount = 0;
    let receivedAmount = 0;
    
    paymentsData.forEach(payment => {
      totalEarned += payment.amount;
      if (payment.status === 'pending') {
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
      'Confirm Payment Received',
      'Have you received this payment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            await updatePaymentStatus(paymentId, 'received');
            loadPayments();
            Alert.alert('Success', 'Payment marked as received');
          }
        }
      ]
    );
  };

  const getPaymentStatusColor = (status) => {
    switch(status) {
      case 'advance_paid': return '#FFC107';
      case 'pending': return '#f44336';
      case 'received': return '#4CAF50';
      default: return '#999';
    }
  };

  const getPaymentStatusText = (status) => {
    switch(status) {
      case 'advance_paid': return 'Advance Paid (30%)';
      case 'pending': return 'Pending';
      case 'received': return 'Received';
      default: return status;
    }
  };

  const renderPayment = ({ item }) => (
    <View style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <Text style={styles.contractId}>Contract #{item.contractId.slice(-6)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getPaymentStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getPaymentStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.paymentDetails}>
        <Text style={styles.cropName}>🌾 {item.cropName}</Text>
        <Text style={styles.buyerName}>👤 {item.buyerName}</Text>
        <Text style={styles.amount}>💰 Amount: ₹{item.amount}</Text>
        <Text style={styles.paymentType}>💳 Type: {item.type === 'advance' ? 'Advance Payment (30%)' : 'Remaining Payment (70%)'}</Text>
        <Text style={styles.date}>📅 Due: {new Date(item.dueDate).toLocaleDateString()}</Text>
      </View>

      {item.status === 'advance_paid' && (
        <View style={styles.noteContainer}>
          <Text style={styles.noteText}>
            ⚠️ Advance payment received. Remaining 70% due on delivery.
          </Text>
        </View>
      )}

      {item.status === 'pending' && (
        <TouchableOpacity 
          style={styles.receivedButton}
          onPress={() => handleMarkAsReceived(item.id)}
        >
          <Text style={styles.receivedButtonText}>✓ Mark as Received</Text>
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
    <View style={styles.container}>
      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>₹{summary.totalEarned}</Text>
          <Text style={styles.summaryLabel}>Total Earned</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryValue, { color: '#FFC107' }]}>₹{summary.pendingAmount}</Text>
          <Text style={styles.summaryLabel}>Pending</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>₹{summary.receivedAmount}</Text>
          <Text style={styles.summaryLabel}>Received</Text>
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