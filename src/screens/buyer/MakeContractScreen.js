import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
// import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getCropById } from '../../services/cropService';
import { getFarmerById } from '../../services/firestoreService';
import { createContract } from '../../services/contractService';

export default function MakeContractScreen({ navigation, route }) {
  const { 
    cropId, 
    farmerId, 
    agreedPrice, 
    agreedQuantity, 
    negotiationId 
  } = route.params;
  
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [crop, setCrop] = useState(null);
  const [farmer, setFarmer] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [notes, setNotes] = useState('');

  const totalAmount = agreedPrice * agreedQuantity;
  const initialAdvance = Math.round(totalAmount * 0.3);

  useEffect(() => {
    loadData();
    setAdvanceAmount(initialAdvance.toString());
  }, []);

  const loadData = async () => {
    try {
      const [cropData, farmerData] = await Promise.all([
        getCropById(cropId),
        getFarmerById(farmerId)
      ]);
      setCrop(cropData);
      setFarmer(farmerData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load details');
    }
    setLoading(false);
  };

  const handleCreateContract = async () => {
    if (!deliveryDate || !/^\d{4}-\d{2}-\d{2}$/.test(deliveryDate)) {
      Alert.alert('Error', 'Please enter delivery date in YYYY-MM-DD format');
      return;
    }

    if (!advanceAmount) {
      Alert.alert('Error', 'Please enter advance amount');
      return;
    }

    const advance = parseFloat(advanceAmount);
    if (isNaN(advance) || advance < 0 || advance > totalAmount) {
      Alert.alert('Error', 'Invalid advance amount');
      return;
    }

    setSubmitting(true);
    try {
      const contractData = {
        cropId,
        cropName: crop.name,
        farmerId,
        farmerName: farmer.name,
        buyerId: user.uid,
        buyerName: user.displayName,
        agreedPrice,
        quantity: agreedQuantity,
        totalAmount,
        advanceAmount: advance,
        remainingAmount: totalAmount - advance,
        deliveryDate: new Date(deliveryDate).toISOString(),
        notes,
        negotiationId,
        status: 'pending', // Pending farmer approval
        createdAt: new Date().toISOString()
      };

      const result = await createContract(contractData);
      
      if (result.success) {
        Alert.alert(
          'Contract Created', 
          'Your contract proposal has been sent to the farmer and a negotiation record has been updated.', 
          [
            { 
              text: 'OK', 
              onPress: () => navigation.reset({
                index: 0,
                routes: [{ name: 'Main', params: { screen: 'Contracts' } }],
              }) 
            }
          ]
        );
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create contract: ' + error.message);
    }
    setSubmitting(false);
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
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.text }]}>Finalize Contract</Text>
        
        <View style={styles.summaryItem}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Crop</Text>
          <Text style={[styles.value, { color: colors.text }]}>{crop?.name || 'Loading...'}</Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Farmer</Text>
          <Text style={[styles.value, { color: colors.text }]}>{farmer?.name || 'Loading...'}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.summaryItem}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Agreed Price</Text>
          <Text style={[styles.value, { color: colors.primary }]}>₹{agreedPrice}/kg</Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Quantity</Text>
          <Text style={[styles.value, { color: colors.text }]}>{agreedQuantity} kg</Text>
        </View>
        
        <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>Total Amount</Text>
          <Text style={[styles.totalValue, { color: colors.primary }]}>₹{totalAmount}</Text>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Delivery & Payment</Text>
        
        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Expected Delivery Date (YYYY-MM-DD)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: isDark ? colors.background : '#f0f0f0', color: colors.text }]}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textSecondary}
          value={deliveryDate}
          onChangeText={setDeliveryDate}
        />

        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Advance Payment (30% Auto-calculated)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: isDark ? colors.background : '#f0f0f0', color: colors.text }]}
          placeholder="Enter amount to pay now"
          placeholderTextColor={colors.textSecondary}
          value={advanceAmount}
          onChangeText={setAdvanceAmount}
          keyboardType="numeric"
        />

        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Additional Notes</Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: isDark ? colors.background : '#f0f0f0', color: colors.text }]}
          placeholder="Any specific delivery instructions..."
          placeholderTextColor={colors.textSecondary}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
        />
      </View>

      <TouchableOpacity 
        style={[styles.submitButton, { backgroundColor: colors.primary }]}
        onPress={handleCreateContract}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Send Contract Proposal</Text>
        )}
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    marginTop: 15,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  input: {
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
