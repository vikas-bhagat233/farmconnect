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
import { useLanguage } from '../../context/LanguageContext';
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
  const { user, userRole } = useAuth();
  const { t } = useLanguage();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [crop, setCrop] = useState(null);
  const [farmer, setFarmer] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [notes, setNotes] = useState('');

  const totalAmount = agreedPrice * agreedQuantity;
  const initialAdvance = Math.round(totalAmount * 0.3);

  useEffect(() => {
    loadData();
    setAdvanceAmount(initialAdvance.toString());
  }, []);

  // Farmers should never land here — redirect back silently
  useEffect(() => {
    if (userRole && userRole !== 'buyer') {
      navigation.goBack();
    }
  }, [userRole]);

  const loadData = async () => {
    try {
      const [cropData, farmerData] = await Promise.all([
        getCropById(cropId),
        getFarmerById(farmerId)
      ]);
      setCrop(cropData);
      setFarmer(farmerData);
    } catch (error) {
      Alert.alert(t('error') || 'Error', t('failedToLoadDetails') || 'Failed to load details');
    }
    setLoading(false);
  };

  const handleCreateContract = async () => {
    if (!user?.uid) {
      Alert.alert(t('error') || 'Error', t('loginToCreateContract') || 'You must be logged in to create a contract.');
      return;
    }
    if (!deliveryDate || !/^\d{4}-\d{2}-\d{2}$/.test(deliveryDate)) {
      Alert.alert(t('error') || 'Error', t('enterDeliveryDate') || 'Please enter delivery date in YYYY-MM-DD format');
      return;
    }

    if (!deliveryLocation.trim()) {
      Alert.alert(t('error') || 'Error', t('enterDeliveryLocation') || 'Please enter delivery location');
      return;
    }

    if (!advanceAmount) {
      Alert.alert(t('error') || 'Error', t('enterAdvanceAmount') || 'Please enter advance amount');
      return;
    }

    const advance = parseFloat(advanceAmount);
    if (isNaN(advance) || advance < 0 || advance > totalAmount) {
      Alert.alert(t('error') || 'Error', t('invalidAdvanceAmount') || 'Invalid advance amount');
      return;
    }

    setSubmitting(true);
    try {
      const contractData = {
        cropId,
        cropName: crop.name || crop.cropName || 'Crop',
        farmerId,
        farmerName: farmer.displayName || farmer.name || 'Farmer',
        buyerId: user.uid,
        buyerName: user.displayName || 'Anonymous Buyer',
        agreedPrice,
        quantity: agreedQuantity,
        totalAmount,
        advanceAmount: advance,
        remainingAmount: totalAmount - advance,
        deliveryDate: new Date(deliveryDate).toISOString(),
        deliveryLocation: deliveryLocation.trim(),
        notes,
        negotiationId,
        status: 'pending', 
        createdAt: new Date().toISOString()
      };

      const result = await createContract(contractData);
      
      if (result.success) {
        Alert.alert(
          t('contractCreated') || 'Contract Created',
          t('contractSentForApproval') || 'Your contract proposal has been sent to the farmer for approval.',
          [
            {
              text: t('viewContracts') || 'View Contracts',
              onPress: () => {
                // Navigate to Main first, then to the Contracts tab
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Main' }],
                });
                // Use a small delay to let the navigator settle before switching tab
                setTimeout(() => {
                  navigation.navigate('Main', { screen: 'Contracts' });
                }, 100);
              }
            }
          ]
        );
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      Alert.alert(t('error') || 'Error', (t('failedToCreateContract') || 'Failed to create contract: ') + error.message);
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
        <Text style={[styles.title, { color: colors.text }]}>{t('finalizeContract') || 'Finalize Contract'}</Text>
        
        <View style={styles.summaryItem}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('crops') || 'Crop'}</Text>
          <Text style={[styles.value, { color: colors.text }]}>{crop?.name || (t('loading') || 'Loading...')}</Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('farmer') || 'Farmer'}</Text>
          <Text style={[styles.value, { color: colors.text }]}>{farmer?.name || (t('loading') || 'Loading...')}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.summaryItem}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('agreedPrice') || 'Agreed Price'}</Text>
          <Text style={[styles.value, { color: colors.primary }]}>₹{agreedPrice}/kg</Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('quantity') || 'Quantity'}</Text>
          <Text style={[styles.value, { color: colors.text }]}>{agreedQuantity} kg</Text>
        </View>
        
        <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>{t('totalAmount') || 'Total Amount'}</Text>
          <Text style={[styles.totalValue, { color: colors.primary }]}>₹{totalAmount}</Text>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('deliveryAndPayment') || 'Delivery & Payment'}</Text>
        
        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('expectedDeliveryDate') || 'Expected Delivery Date (YYYY-MM-DD)'}</Text>
        <TextInput
          style={[styles.input, { backgroundColor: isDark ? colors.background : '#f0f0f0', color: colors.text }]}
          placeholder={t('dateFormatPlaceholder') || 'YYYY-MM-DD'}
          placeholderTextColor={colors.textSecondary}
          value={deliveryDate}
          onChangeText={setDeliveryDate}
        />

        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('deliveryLocation') || 'Delivery Location'}</Text>
        <TextInput
          style={[styles.input, { backgroundColor: isDark ? colors.background : '#f0f0f0', color: colors.text }]}
          placeholder={t('enterDeliveryLocationPlaceholder') || 'Enter delivery location'}
          placeholderTextColor={colors.textSecondary}
          value={deliveryLocation}
          onChangeText={setDeliveryLocation}
        />

        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('advancePaymentAuto') || 'Advance Payment (30% Auto-calculated)'}</Text>
        <TextInput
          style={[styles.input, { backgroundColor: isDark ? colors.background : '#f0f0f0', color: colors.text }]}
          placeholder={t('enterAmountToPayNow') || 'Enter amount to pay now'}
          placeholderTextColor={colors.textSecondary}
          value={advanceAmount}
          onChangeText={setAdvanceAmount}
          keyboardType="numeric"
        />

        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('additionalNotes') || 'Additional Notes'}</Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: isDark ? colors.background : '#f0f0f0', color: colors.text }]}
          placeholder={t('deliveryInstructionsPlaceholder') || 'Any specific delivery instructions...'}
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
          <Text style={styles.submitButtonText}>{t('sendContractProposal') || 'Send Contract Proposal'}</Text>
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
