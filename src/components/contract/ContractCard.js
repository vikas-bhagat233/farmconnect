import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image
} from 'react-native';

export default function ContractCard({
  contract,
  onPress,
  onAccept,
  onReject,
  onDownload,
  showActions = true
}) {
  const getStatusColor = () => {
    switch(contract.status) {
      case 'pending': return '#FFC107';
      case 'active': return '#4CAF50';
      case 'completed': return '#2196F3';
      case 'cancelled': return '#f44336';
      case 'rejected': return '#f44336';
      default: return '#999';
    }
  };

  const getStatusText = () => {
    switch(contract.status) {
      case 'pending': return 'Pending Approval';
      case 'active': return 'Active';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'rejected': return 'Rejected';
      default: return contract.status;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View>
          <Text style={styles.cropName}>🌾 {contract.cropName}</Text>
          <Text style={styles.partyName}>
            {contract.farmerName} ↔ {contract.buyerName}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Quantity:</Text>
          <Text style={styles.detailValue}>{contract.quantity} kg</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Price:</Text>
          <Text style={styles.detailValue}>₹{contract.agreedPrice}/kg</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total:</Text>
          <Text style={[styles.detailValue, styles.totalAmount]}>₹{contract.totalAmount}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Created:</Text>
          <Text style={styles.detailValue}>{formatDate(contract.createdAt)}</Text>
        </View>
      </View>

      {showActions && contract.status === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
            <Text style={styles.acceptButtonText}>✓ Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rejectButton} onPress={onReject}>
            <Text style={styles.rejectButtonText}>✗ Reject</Text>
          </TouchableOpacity>
        </View>
      )}

      {contract.status === 'completed' && onDownload && (
        <TouchableOpacity style={styles.downloadButton} onPress={onDownload}>
          <Text style={styles.downloadButtonText}>📄 Download PDF</Text>
        </TouchableOpacity>
      )}

      {contract.paymentStatus && (
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentText}>
            Advance: {contract.advancePaid ? '✓ Paid' : '⏳ Pending'}
          </Text>
          <Text style={styles.paymentText}>
            Remaining: {contract.fullPaid ? '✓ Paid' : '⏳ Pending'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 10,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cropName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  partyName: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
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
  details: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  detailLabel: {
    width: 70,
    fontSize: 13,
    color: '#666',
  },
  detailValue: {
    flex: 1,
    fontSize: 13,
    color: '#333',
  },
  totalAmount: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
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
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 5,
  },
  rejectButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  downloadButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  downloadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  paymentInfo: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentText: {
    fontSize: 11,
    color: '#666',
  },
});