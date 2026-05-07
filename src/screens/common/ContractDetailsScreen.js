import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Share
} from 'react-native';
import { getContractById, updateContractStatus, downloadContractPDF, markDeliveryCompleted, ensureRemainingPaymentRecord } from '../../services/contractService';
import { getFarmerById } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export default function ContractDetailsScreen({ navigation, route }) {
  const { contractId } = route.params;
  const { user, userRole } = useAuth();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const formatDateSafe = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    loadContract();
  }, []);

  const loadContract = async () => {
    const data = await getContractById(contractId);
    setContract(data);
    setLoading(false);
  };

  const handleAccept = async () => {
    Alert.alert(
      t('acceptContract') || 'Accept Contract',
      t('acceptContractPromptShort') || 'Do you want to accept this contract?',
      [
        { text: t('cancel') || 'Cancel', style: 'cancel' },
        {
          text: t('accept') || 'Accept',
          onPress: async () => {
            setUpdating(true);
            await updateContractStatus(contractId, 'active');
            await loadContract();
            setUpdating(false);
            Alert.alert(t('success') || 'Success', t('contractAccepted') || 'Contract accepted successfully');
          }
        }
      ]
    );
  };

  const handleReject = async () => {
    Alert.alert(
      t('rejectContract') || 'Reject Contract',
      t('rejectContractPrompt') || 'Are you sure you want to reject this contract?',
      [
        { text: t('cancel') || 'Cancel', style: 'cancel' },
        {
          text: t('reject') || 'Reject',
          style: 'destructive',
          onPress: async () => {
            setUpdating(true);
            await updateContractStatus(contractId, 'rejected');
            await loadContract();
            setUpdating(false);
            Alert.alert(t('contractRejected') || 'Contract Rejected', t('contractRejectedMessage') || 'The contract has been rejected');
            navigation.goBack();
          }
        }
      ]
    );
  };

  const handleDownload = async () => {
    const pdfUrl = await downloadContractPDF(contract);
    if (pdfUrl) {
      Share.share({ url: pdfUrl, title: 'Contract.pdf' });
    }
  };

  const handleMarkDelivered = async () => {
    Alert.alert(
      t('confirmDelivery') || 'Confirm Delivery',
      t('confirmDeliveryPrompt') || 'Mark delivery as completed and request remaining payment? This will notify the buyer to pay the balance.',
      [
        { text: t('cancel') || 'Cancel', style: 'cancel' },
        {
          text: t('confirm') || 'Confirm',
          onPress: async () => {
            setUpdating(true);
            const deliveryResult = await markDeliveryCompleted(contractId);
            if (deliveryResult.success) {
              await ensureRemainingPaymentRecord(contractId);
              await loadContract();
              Alert.alert(t('success') || 'Success', t('deliveryMarkedComplete') || 'Delivery marked complete. Remaining payment requested.');
            } else {
              Alert.alert(t('error') || 'Error', deliveryResult.error || (t('failedToUpdateDeliveryStatus') || 'Failed to update delivery status'));
            }
            setUpdating(false);
          }
        }
      ]
    );
  };

  const getStatusColor = () => {
    switch(contract?.status) {
      case 'pending': return '#FFC107';
      case 'active': return '#4CAF50';
      case 'completed': return '#2196F3';
      case 'rejected': return '#f44336';
      default: return '#999';
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.contractId, { color: colors.textSecondary }]}>{t('contract') || 'Contract'} #{contract.id.slice(-8)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{contract?.status?.toUpperCase()}</Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('contractDetails') || 'Contract Details'}</Text>
        <View style={styles.detailRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('crops') || 'Crop'}:</Text>
          <Text style={[styles.value, { color: colors.text }]}>{contract?.cropName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('quantity') || 'Quantity'}:</Text>
          <Text style={[styles.value, { color: colors.text }]}>{contract?.quantity} kg</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('agreedPrice') || 'Agreed Price'}:</Text>
          <Text style={[styles.value, { color: colors.text }]}>₹{contract?.agreedPrice}/kg</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('totalAmount') || 'Total Amount'}:</Text>
          <Text style={[styles.value, styles.totalAmount, { color: colors.primary }]}>₹{contract?.totalAmount}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('advance') || 'Advance'}:</Text>
          <Text style={[styles.value, { color: colors.text }]}>₹{contract?.advanceAmount}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('remaining') || 'Remaining'}:</Text>
          <Text style={[styles.value, { color: colors.text }]}>₹{contract?.remainingAmount}</Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('parties') || 'Parties'}</Text>
        <View style={[styles.partyCard, { backgroundColor: isDark ? colors.background : '#f5f5f5' }]}>
          <Text style={[styles.partyRole, { color: colors.textSecondary }]}>{t('farmer') || 'Farmer'}</Text>
          <Text style={[styles.partyName, { color: colors.text }]}>{contract?.farmerName}</Text>
        </View>
        <View style={[styles.partyCard, { backgroundColor: isDark ? colors.background : '#f5f5f5' }]}>
          <Text style={[styles.partyRole, { color: colors.textSecondary }]}>{t('buyer') || 'Buyer'}</Text>
          <Text style={[styles.partyName, { color: colors.text }]}>{contract?.buyerName}</Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('deliveryDetails') || 'Delivery Details'}</Text>
        <View style={styles.detailRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('deliveryDate') || 'Delivery Date'}:</Text>
          <Text style={[styles.value, { color: colors.text }]}>{formatDateSafe(contract?.deliveryDate) || (t('notSet') || 'Not set')}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('location') || 'Location'}:</Text>
          <Text style={[styles.value, { color: colors.text }]}>{contract?.deliveryLocation || (t('toBeConfirmed') || 'To be confirmed')}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('deliveryStatus') || 'Delivery Status'}:</Text>
          <Text style={[styles.value, { color: colors.text }]}>{contract?.deliveryCompleted ? (t('completed') || 'Completed') : (t('pending') || 'Pending')}</Text>
        </View>
        {contract?.deliveryCompletedAt && (
          <View style={styles.detailRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('deliveredOn') || 'Delivered On'}:</Text>
            <Text style={[styles.value, { color: colors.text }]}>{formatDateSafe(contract?.deliveryCompletedAt) || (t('notSet') || 'Not set')}</Text>
          </View>
        )}
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('termsAndConditions') || 'Terms & Conditions'}</Text>
        <Text style={[styles.terms, { color: colors.textSecondary }]}>
          1. {contract?.advanceAmount > 0 ? `${t('advancePaymentOf') || 'Advance payment of'} ₹${contract.advanceAmount}` : (t('noAdvancePayment') || 'No advance payment')} {t('requiredWithin7Days') || 'required within 7 days.'}
        </Text>
        <Text style={[styles.terms, { color: colors.textSecondary }]}>
          2. {t('remainingPaymentOf') || 'Remaining payment of'} ₹{contract?.remainingAmount} {t('dueUponDelivery') || 'is due upon delivery.'}
        </Text>
        <Text style={[styles.terms, { color: colors.textSecondary }]}>
          3. {t('qualityInspectionNote') || 'Quality inspection can be done before final acceptance.'}
        </Text>
      </View>

      {contract?.status === 'pending' && user?.uid === contract?.farmerId && (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.acceptButton, { backgroundColor: colors.primary }]} onPress={handleAccept} disabled={updating}>
            <Text style={styles.acceptButtonText}>{t('acceptContract') || 'Accept Contract'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rejectButton} onPress={handleReject} disabled={updating}>
            <Text style={styles.rejectButtonText}>{t('reject') || 'Reject'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {contract?.status === 'active' && contract?.advancePaid && !contract?.deliveryCompleted && userRole === 'farmer' && (
        <TouchableOpacity
          style={[styles.downloadButton, { backgroundColor: colors.primary, marginVertical: 10 }]}
          onPress={handleMarkDelivered}
          disabled={updating}
        >
          <Text style={styles.downloadButtonText}>{t('markDeliveryCompleteRequestBalance') || 'Mark Delivery Complete & Request Balance'}</Text>
        </TouchableOpacity>
      )}

      {contract?.status === 'active' && !contract?.advancePaid && userRole === 'buyer' && (
        <TouchableOpacity 
          style={[styles.downloadButton, { backgroundColor: colors.primary, marginVertical: 20 }]} 
          onPress={() => navigation.navigate('Payment', { 
            contractId: contract.id,
            amount: contract.advanceAmount,
            farmerId: contract.farmerId,
            farmerName: contract.farmerName,
            cropName: contract.cropName,
            buyerId: contract.buyerId,
            buyerName: contract.buyerName,
            type: 'advance'
          })}
        >
          <Text style={styles.downloadButtonText}>💰 {t('payAdvance') || 'Pay Advance'} (₹{contract.advanceAmount})</Text>
        </TouchableOpacity>
      )}

      {(contract?.status === 'active' || contract?.status === 'completed') && (
        <TouchableOpacity style={[styles.downloadButton, { backgroundColor: '#2196F3' }]} onPress={handleDownload}>
          <Text style={styles.downloadButtonText}>📄 {t('downloadContractPdf') || 'Download Contract PDF'}</Text>
        </TouchableOpacity>
      )}
      <View style={{ height: 40 }} />
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
  header: {
    backgroundColor: '#fff',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  contractId: {
    fontSize: 16,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  section: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: 120,
    fontSize: 14,
    color: '#666',
  },
  value: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  totalAmount: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  partyCard: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  partyRole: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  partyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  terms: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: 'row',
    margin: 10,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 5,
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 5,
  },
  rejectButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  downloadButton: {
    backgroundColor: '#2196F3',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },
  downloadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});