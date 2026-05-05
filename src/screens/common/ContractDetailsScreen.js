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
import { getContractById, updateContractStatus, downloadContractPDF } from '../../services/contractService';
import { getFarmerById } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function ContractDetailsScreen({ navigation, route }) {
  const { contractId } = route.params;
  const { user, userRole } = useAuth();
  const { colors, isDark } = useTheme();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

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
      'Accept Contract',
      'Do you want to accept this contract?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            setUpdating(true);
            await updateContractStatus(contractId, 'active');
            await loadContract();
            setUpdating(false);
            Alert.alert('Success', 'Contract accepted successfully');
          }
        }
      ]
    );
  };

  const handleReject = async () => {
    Alert.alert(
      'Reject Contract',
      'Are you sure you want to reject this contract?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setUpdating(true);
            await updateContractStatus(contractId, 'rejected');
            await loadContract();
            setUpdating(false);
            Alert.alert('Contract Rejected', 'The contract has been rejected');
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
        <Text style={[styles.contractId, { color: colors.textSecondary }]}>Contract #{contract.id.slice(-8)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{contract?.status?.toUpperCase()}</Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Contract Details</Text>
        <View style={styles.detailRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Crop:</Text>
          <Text style={[styles.value, { color: colors.text }]}>{contract?.cropName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Quantity:</Text>
          <Text style={[styles.value, { color: colors.text }]}>{contract?.quantity} kg</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Agreed Price:</Text>
          <Text style={[styles.value, { color: colors.text }]}>₹{contract?.agreedPrice}/kg</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Total Amount:</Text>
          <Text style={[styles.value, styles.totalAmount, { color: colors.primary }]}>₹{contract?.totalAmount}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Advance:</Text>
          <Text style={[styles.value, { color: colors.text }]}>₹{contract?.advanceAmount}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Remaining:</Text>
          <Text style={[styles.value, { color: colors.text }]}>₹{contract?.remainingAmount}</Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Parties</Text>
        <View style={[styles.partyCard, { backgroundColor: isDark ? colors.background : '#f5f5f5' }]}>
          <Text style={[styles.partyRole, { color: colors.textSecondary }]}>Farmer</Text>
          <Text style={[styles.partyName, { color: colors.text }]}>{contract?.farmerName}</Text>
        </View>
        <View style={[styles.partyCard, { backgroundColor: isDark ? colors.background : '#f5f5f5' }]}>
          <Text style={[styles.partyRole, { color: colors.textSecondary }]}>Buyer</Text>
          <Text style={[styles.partyName, { color: colors.text }]}>{contract?.buyerName}</Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Delivery Details</Text>
        <View style={styles.detailRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Delivery Date:</Text>
          <Text style={[styles.value, { color: colors.text }]}>{new Date(contract?.deliveryDate).toLocaleDateString()}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Location:</Text>
          <Text style={[styles.value, { color: colors.text }]}>{contract?.deliveryLocation || 'To be confirmed'}</Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Terms & Conditions</Text>
        <Text style={[styles.terms, { color: colors.textSecondary }]}>
          1. {contract?.advanceAmount > 0 ? `Advance payment of ₹${contract.advanceAmount}` : 'No advance payment'} required within 7 days.
        </Text>
        <Text style={[styles.terms, { color: colors.textSecondary }]}>
          2. Remaining payment of ₹{contract?.remainingAmount} is due upon delivery.
        </Text>
        <Text style={[styles.terms, { color: colors.textSecondary }]}>
          3. Quality inspection can be done before final acceptance.
        </Text>
      </View>

      {contract?.status === 'pending' && user?.uid === contract?.farmerId && (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.acceptButton, { backgroundColor: colors.primary }]} onPress={handleAccept} disabled={updating}>
            <Text style={styles.acceptButtonText}>Accept Contract</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rejectButton} onPress={handleReject} disabled={updating}>
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}

      {contract?.status === 'active' && !contract?.advancePaid && userRole === 'buyer' && (
        <TouchableOpacity 
          style={[styles.downloadButton, { backgroundColor: colors.primary, marginVertical: 20 }]} 
          onPress={() => navigation.navigate('Payment', { 
            contractId: contract.id,
            amount: contract.advanceAmount,
            type: 'advance'
          })}
        >
          <Text style={styles.downloadButtonText}>💰 Pay Advance (₹{contract.advanceAmount})</Text>
        </TouchableOpacity>
      )}

      {(contract?.status === 'active' || contract?.status === 'completed') && (
        <TouchableOpacity style={[styles.downloadButton, { backgroundColor: '#2196F3' }]} onPress={handleDownload}>
          <Text style={styles.downloadButtonText}>📄 Download Contract PDF</Text>
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