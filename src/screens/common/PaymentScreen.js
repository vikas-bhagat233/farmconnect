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
import RazorpayCheckout from 'react-native-razorpay';
import { createRazorpayOrder, verifyRazorpayPayment, getPaymentDetails } from '../../services/paymentService';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function PaymentScreen({ navigation, route }) {
  const { contractId, type, amount: paramAmount, farmerId: paramFarmerId,
          farmerName: paramFarmerName, cropName: paramCropName,
          buyerId: paramBuyerId, buyerName: paramBuyerName } = route.params;
  const { user } = useAuth();
  const { t } = useLanguage();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPaymentDetails();
  }, []);

  const loadPaymentDetails = async () => {
    try {
      const data = await getPaymentDetails(contractId, type);
      setPayment(data);
    } catch (error) {
      console.error('loadPaymentDetails error:', error);
      // Fallback: build payment object from route params so screen still works
      if (paramAmount) {
        setPayment({
          contractId,
          type,
          amount: paramAmount,
          farmerId: paramFarmerId,
          farmerName: paramFarmerName,
          cropName: paramCropName,
          buyerId: paramBuyerId || user?.uid,
          buyerName: paramBuyerName || user?.displayName,
          status: 'pending'
        });
      } else {
        Alert.alert(
          t('error') || 'Error',
          (t('couldNotLoadPaymentDetails') || 'Could not load payment details: ') + error.message,
          [{ text: t('goBack') || 'Go Back', onPress: () => navigation.goBack() }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getPaymentTypeText = () => {
    return type === 'advance'
      ? (t('advancePaymentLabel') || 'Advance Payment (30%)')
      : (t('remainingPaymentLabel') || 'Remaining Payment (70%)');
  };

  const handlePayment = async () => {
    if (!payment) return;
    if (!process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID) {
      Alert.alert(t('paymentFailed') || 'Payment Failed', t('razorpayKeyNotConfigured') || 'Razorpay key is not configured.');
      return;
    }

    setProcessing(true);

    try {
      const amountPaise = Math.round(Number(payment.amount) * 100);
      if (!Number.isFinite(amountPaise) || amountPaise <= 0) {
        throw new Error(t('invalidPaymentAmount') || 'Invalid payment amount.');
      }

      const order = await createRazorpayOrder({
        amount: amountPaise,
        currency: 'INR',
        receipt: `contract_${contractId}_${type}`
      });

      const checkoutResult = await RazorpayCheckout.open({
        key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: 'FarmConnect',
        description: `${payment.cropName || (t('crop') || 'Crop')} - ${getPaymentTypeText()}`,
        prefill: {
          email: user?.email || '',
          contact: user?.phoneNumber || '',
          name: user?.displayName || ''
        },
        theme: { color: '#4CAF50' }
      });

      const verifyResult = await verifyRazorpayPayment({
        razorpay_order_id: checkoutResult.razorpay_order_id,
        razorpay_payment_id: checkoutResult.razorpay_payment_id,
        razorpay_signature: checkoutResult.razorpay_signature,
        paymentId: payment.id,
        contractId,
        type: payment.type,
        amount: payment.amount,
        buyerId: user.uid,
        farmerId: payment.farmerId,
        cropName: payment.cropName
      });

      if (!verifyResult.success) {
        throw new Error(verifyResult.error || (t('paymentVerificationFailed') || 'Payment verification failed.'));
      }

      Alert.alert(
        t('paymentSuccessful') || 'Payment Successful',
        `₹${payment.amount} ${t('paidSuccessfully') || 'paid successfully'}`,
        [{ text: t('ok') || 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      const message = error?.error?.description || error?.description || error?.message || (t('paymentFailed') || 'Payment failed.');
      Alert.alert(t('paymentFailed') || 'Payment Failed', message);
    } finally {
      setProcessing(false);
    }
  };

  const handleSimulatedPayment = async () => {
    setProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const { updateDoc, doc, db, collection, addDoc } = require('../../services/firebase');
      const transactionId = 'SIM_' + Math.random().toString(36).substr(2, 9).toUpperCase();

      // 1. Create or update the payment record
      let paymentId = payment.id;
      if (!paymentId) {
        const newPaymentRef = await addDoc(collection(db, 'payments'), {
          contractId,
          type: payment.type || type,
          amount: payment.amount,
          farmerId: payment.farmerId,
          farmerName: payment.farmerName,
          buyerId: payment.buyerId || user.uid,
          buyerName: payment.buyerName || user.displayName,
          cropName: payment.cropName,
          status: 'paid',
          transactionId,
          paidAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        });
        paymentId = newPaymentRef.id;
        await updateDoc(newPaymentRef, { id: paymentId });
      } else {
        await updateDoc(doc(db, 'payments', paymentId), {
          status: 'paid',
          transactionId,
          paidAt: new Date().toISOString()
        });
      }

      // 2. Update Contract Record
      const contractRef = doc(db, 'contracts', contractId);
      if (type === 'advance') {
        await updateDoc(contractRef, { advancePaid: true, updatedAt: new Date().toISOString() });
      } else {
        await updateDoc(contractRef, { fullPaid: true, status: 'completed', updatedAt: new Date().toISOString() });
      }

      Alert.alert(
        t('paymentSuccessful') || 'Payment Successful',
        `₹${payment.amount} ${t('paidSuccessfully') || 'paid successfully.'}`,
        [{ text: t('ok') || 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert(t('paymentFailed') || 'Payment Failed', error.message);
    } finally {
      setProcessing(false);
    }
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
        <Text style={styles.paymentTitle}>{t('paymentDetails') || 'Payment Details'}</Text>

        <View style={styles.detailRow}>
          <Text style={styles.label}>{t('contractId') || 'Contract ID'}:</Text>
          <Text style={styles.value}>#{contractId.slice(-8)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>{t('paymentType') || 'Payment Type'}:</Text>
          <Text style={styles.value}>{getPaymentTypeText()}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>{t('crop') || 'Crop'}:</Text>
          <Text style={styles.value}>{payment?.cropName}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>{t('farmer') || 'Farmer'}:</Text>
          <Text style={styles.value}>{payment?.farmerName}</Text>
        </View>

        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>{t('amountToPay') || 'Amount to Pay'}</Text>
          <Text style={styles.amountValue}>₹{payment?.amount}</Text>
        </View>
      </View>

      <View style={styles.paymentMethods}>
        <Text style={styles.sectionTitle}>{t('paymentMethods') || 'Payment Methods'}</Text>

        <TouchableOpacity style={styles.methodCard}>
          <Text style={styles.methodIcon}>💳</Text>
          <View style={styles.methodInfo}>
            <Text style={styles.methodName}>{t('creditDebitCard') || 'Credit/Debit Card'}</Text>
            <Text style={styles.methodDesc}>{t('payUsingCard') || 'Pay using card'}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.methodCard}>
          <Text style={styles.methodIcon}>📱</Text>
          <View style={styles.methodInfo}>
            <Text style={styles.methodName}>{t('upi') || 'UPI'}</Text>
            <Text style={styles.methodDesc}>{t('googlePayPhonePePaytm') || 'Google Pay, PhonePe, Paytm'}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.methodCard}>
          <Text style={styles.methodIcon}>🏦</Text>
          <View style={styles.methodInfo}>
            <Text style={styles.methodName}>{t('netBanking') || 'Net Banking'}</Text>
            <Text style={styles.methodDesc}>{t('allMajorBanks') || 'All major banks'}</Text>
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
          <Text style={styles.payButtonText}>{t('payWithRazorpay') || `Pay ₹${payment?.amount} (Razorpay)`}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.payButton, { backgroundColor: '#666', marginTop: 0 }]}
        onPress={handleSimulatedPayment}
        disabled={processing}
      >
        <Text style={styles.payButtonText}>{t('simulatePayment') || 'Simulate Payment (No Backend)'}</Text>
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
