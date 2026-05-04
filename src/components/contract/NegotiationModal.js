import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';

export default function NegotiationModal({
  visible,
  onClose,
  onSubmit,
  crop,
  loading = false
}) {
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!price || !quantity) {
      alert('Please enter both price and quantity');
      return;
    }
    onSubmit({
      price: parseInt(price),
      quantity: parseInt(quantity),
      message: message || `I offer ₹${price}/kg for ${quantity}kg`
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Negotiate</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.cropName}>Crop: {crop?.name}</Text>
            <Text style={styles.originalPrice}>Original: ₹{crop?.price}/kg</Text>
            
            <Text style={styles.label}>Your Offer Price (₹/kg) *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your price"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
            
            <Text style={styles.label}>Quantity (kg) *</Text>
            <TextInput
              style={styles.input}
              placeholder={`Max: ${crop?.quantity} kg`}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
            />
            
            <Text style={styles.label}>Message (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add a message to the farmer..."
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={3}
            />

            <View style={styles.suggestions}>
              <Text style={styles.suggestionsTitle}>Suggested Offers:</Text>
              <TouchableOpacity 
                style={styles.suggestionChip}
                onPress={() => setPrice(Math.round(crop?.price * 0.9))}
              >
                <Text>10% below market</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.suggestionChip}
                onPress={() => setPrice(Math.round(crop?.price * 0.85))}
              >
                <Text>15% below market</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Send Offer</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#999',
  },
  cropName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  originalPrice: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  suggestions: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  suggestionsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  suggestionChip: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#666',
  },
  submitButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FF9800',
    alignItems: 'center',
    marginLeft: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});