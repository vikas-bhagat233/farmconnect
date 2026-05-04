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
import { getContractById, updateContractStatus, downloadContractPDF } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';

export default function ContractDetailsScreen({ navigation, route }) {
  const { contractId } = route.params;
  const { user } = useAuth();
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.contractId}>Contract #{contract.id.slice(-8)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{contract?.status?.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contract Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Crop:</Text>
          <Text style={styles.value}>{contract?.cropName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Quantity:</Text>
          <Text style={styles.value}>{contract?.quantity} kg</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Agreed Price:</Text>
          <Text style={styles.value}>₹{contract?.agreedPrice}/kg</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Total Amount:</Text>
          <Text style={[styles.value, styles.totalAmount]}>₹{contract?.totalAmount}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Advance (30%):</Text>
          <Text style={styles.value}>₹{contract?.advanceAmount}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Remaining (70%):</Text>
          <Text style={styles.value}>₹{contract?.remainingAmount}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Parties</Text>
        <View style={styles.partyCard}>
          <Text style={styles.partyRole}>Farmer</Text>
          <Text style={styles.partyName}>{contract?.farmerName}</Text>
        </View>
        <View style={styles.partyCard}>
          <Text style={styles.partyRole}>Buyer</Text>
          <Text style={styles.partyName}>{contract?.buyerName}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Delivery Date:</Text>
          <Text style={styles.value}>{new Date(contract?.deliveryDate).toLocaleDateString()}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Delivery Location:</Text>
          <Text style={styles.value}>{contract?.deliveryLocation || 'To be confirmed'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Terms & Conditions</Text>
        <Text style={styles.terms}>
          1. 30% advance payment is required within 7 days of contract acceptance.
        </Text>
        <Text style={styles.terms}>
          2. Remaining 70% payment is due upon delivery of goods.
        </Text>
        <Text style={styles.terms}>
          3. Quality inspection can be done before acceptance.
        </Text>
        <Text style={styles.terms}>
          4. Contract cannot be cancelled after both parties agree.
        </Text>
      </View>

      {contract?.status === 'pending' && user?.uid === contract?.farmerId && (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.acceptButton} onPress={handleAccept} disabled={updating}>
            <Text style={styles.acceptButtonText}>Accept Contract</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rejectButton} onPress={handleReject} disabled={updating}>
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}

      {(contract?.status === 'active' || contract?.status === 'completed') && (
        <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
          <Text style={styles.downloadButtonText}>📄 Download Contract PDF</Text>
        </TouchableOpacity>
      )}
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