import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { processPayment, getPaymentDetails } from '../../services/paymentService';
import { useAuth } from '../../context/AuthContext';

export default function PaymentScreen({ navigation, route }) {
  const { contractId, type } = route.params;
  const { user } = useAuth();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPaymentDetails();
  }, []);

  const loadPaymentDetails = async () => {
    const data = await getPaymentDetails(contractId, type);
    setPayment(data);
    setLoading(false);
  };

  const handlePayment = async () => {
    setProcessing(true);
    const result = await processPayment({
      contractId,
      amount: payment.amount,
      type: payment.type,
      buyerId: user.uid,
      farmerId: payment.farmerId
    });
    
    setProcessing(false);
    
    if (result.success) {
      Alert.alert(
        'Payment Successful',
        `₹${payment.amount} paid successfully`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } else {
      Alert.alert('Payment Failed', result.error);
    }
  };

  const getPaymentTypeText = () => {
    return type === 'advance' ? 'Advance Payment (30%)' : 'Remaining Payment (70%)';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.paymentCard}>
        <Text style={styles.paymentTitle}>Payment Details</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>Contract ID:</Text>
          <Text style={styles.value}>#{contractId.slice(-8)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>Payment Type:</Text>
          <Text style={styles.value}>{getPaymentTypeText()}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>Crop:</Text>
          <Text style={styles.value}>{payment?.cropName}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>Farmer:</Text>
          <Text style={styles.value}>{payment?.farmerName}</Text>
        </View>
        
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Amount to Pay</Text>
          <Text style={styles.amountValue}>₹{payment?.amount}</Text>
        </View>
      </View>

      <View style={styles.paymentMethods}>
        <Text style={styles.sectionTitle}>Payment Methods</Text>
        
        <TouchableOpacity style={styles.methodCard}>
          <Text style={styles.methodIcon}>💳</Text>
          <View style={styles.methodInfo}>
            <Text style={styles.methodName}>Credit/Debit Card</Text>
            <Text style={styles.methodDesc}>Pay using card</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.methodCard}>
          <Text style={styles.methodIcon}>📱</Text>
          <View style={styles.methodInfo}>
            <Text style={styles.methodName}>UPI</Text>
            <Text style={styles.methodDesc}>Google Pay, PhonePe, Paytm</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.methodCard}>
          <Text style={styles.methodIcon}>🏦</Text>
          <View style={styles.methodInfo}>
            <Text style={styles.methodName}>Net Banking</Text>
            <Text style={styles.methodDesc}>All major banks</Text>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.payButton}
        onPress={handlePayment}
        disabled={processing}
      >
        {processing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.payButtonText}>Pay ₹{payment?.amount}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
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
  paymentCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    elevation: 2,
  },
  paymentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  label: {
    width: 100,
    fontSize: 14,
    color: '#666',
  },
  value: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  amountContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
  },
  amountValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 5,
  },
  paymentMethods: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginBottom: 10,
  },
  methodIcon: {
    fontSize: 30,
    marginRight: 15,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  methodDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  payButton: {
    backgroundColor: '#4CAF50',
    margin: 15,
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});