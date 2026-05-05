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
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { createNegotiation, sendNegotiationMessage, getNegotiation } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { sendNotification } from '../../services/notificationService';

export default function NegotiationScreen({ navigation, route }) {
  const { 
    cropId, 
    cropName, 
    farmerId, 
    farmerName,
    originalPrice,
    maxQuantity,
    proposedPrice,
    proposedQuantity,
    buyerId: routeBuyerId 
  } = route.params;
  
  const { user, userRole } = useAuth();
  const { colors, isDark } = useTheme();
  const [negotiation, setNegotiation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterQuantity, setCounterQuantity] = useState('');

  useEffect(() => {
    initializeNegotiation();
  }, []);

  const initializeNegotiation = async () => {
    setLoading(true);
    
    const bId = userRole === 'buyer' ? user.uid : routeBuyerId;
    const fId = userRole === 'farmer' ? user.uid : farmerId;

    // Check if negotiation exists
    let negotiationData = await getNegotiation(cropId, bId, fId);
    
    if (!negotiationData && userRole === 'buyer') {
      // Only buyers can initiate a new negotiation
      negotiationData = await createNegotiation({
        cropId,
        cropName,
        buyerId: user.uid,
        buyerName: user.displayName,
        farmerId,
        farmerName,
        originalPrice,
        proposedPrice,
        proposedQuantity,
        maxQuantity,
        status: 'active'
      });
    }
    
    if (negotiationData) {
      setNegotiation(negotiationData);
      setMessages(negotiationData.messages || []);
    } else if (userRole === 'farmer') {
      Alert.alert('Error', 'Negotiation not found');
      navigation.goBack();
    }
    
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setSending(true);
    const messageData = {
      text: newMessage,
      senderId: user.uid,
      senderName: user.displayName,
      senderRole: userRole,
      timestamp: new Date().toISOString()
    };
    
    await sendNegotiationMessage(negotiation.id, messageData);
    setMessages([...messages, messageData]);
    setNewMessage('');
    
    // Send notification to other party
    const recipientId = userRole === 'buyer' ? farmerId : negotiation.buyerId;
    await sendNotification(recipientId, 'New Negotiation Message', `${user.displayName}: ${newMessage}`);
    
    setSending(false);
  };

  const sendCounterOffer = async () => {
    if (!counterPrice || !counterQuantity) {
      Alert.alert('Error', 'Please enter both price and quantity');
      return;
    }
    
    if (parseInt(counterQuantity) > maxQuantity) {
      Alert.alert('Error', `Quantity cannot exceed ${maxQuantity} kg`);
      return;
    }
    
    const offerMessage = {
      text: `Counter Offer: ₹${counterPrice}/kg for ${counterQuantity} kg`,
      senderId: user.uid,
      senderName: user.displayName,
      senderRole: 'buyer',
      offer: {
        price: parseInt(counterPrice),
        quantity: parseInt(counterQuantity)
      },
      timestamp: new Date().toISOString()
    };
    
    setSending(true);
    await sendNegotiationMessage(negotiation.id, offerMessage);
    setMessages([...messages, offerMessage]);
    setCounterPrice('');
    setCounterQuantity('');
    setSending(false);
    
    await sendNotification(farmerId, 'New Counter Offer', `${user.displayName} offered ₹${counterPrice}/kg for ${counterQuantity}kg`);
  };

  const acceptOffer = async (offerPrice, offerQuantity) => {
    Alert.alert(
      'Accept Offer',
      `Do you want to accept ₹${offerPrice}/kg for ${offerQuantity}kg?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            // Create contract from negotiation
            navigation.navigate('MakeContract', {
              cropId,
              farmerId,
              agreedPrice: offerPrice,
              agreedQuantity: offerQuantity,
              negotiationId: negotiation.id
            });
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.cropName, { color: colors.text }]}>{cropName}</Text>
        <Text style={[styles.farmerName, { color: colors.textSecondary }]}>with {farmerName}</Text>
      </View>

      {/* Messages */}
      <ScrollView style={styles.messagesContainer}>
        {messages.map((msg, idx) => (
          <View
            key={idx}
            style={[
              styles.messageBubble,
              msg.senderId === user.uid 
                ? [styles.myMessage, { backgroundColor: colors.primary }] 
                : [styles.theirMessage, { backgroundColor: colors.card, borderWidth: isDark ? 1 : 0, borderColor: colors.border }]
            ]}
          >
            <Text style={[styles.senderName, { color: msg.senderId === user.uid ? '#eee' : colors.textSecondary }]}>
              {msg.senderName}
            </Text>
            <Text style={[styles.messageText, { color: msg.senderId === user.uid ? '#fff' : colors.text }]}>
              {msg.text}
            </Text>
            {msg.offer && (
              <View style={[styles.offerContainer, { borderTopColor: msg.senderId === user.uid ? 'rgba(255,255,255,0.2)' : colors.border }]}>
                <Text style={[styles.offerText, { color: msg.senderId === user.uid ? '#FFD54F' : '#FF9800' }]}>
                  Price: ₹{msg.offer.price}/kg | Quantity: {msg.offer.quantity}kg
                </Text>
                {msg.senderId !== user.uid && (
                  <TouchableOpacity 
                    style={[styles.acceptButton, { backgroundColor: colors.primary }]}
                    onPress={() => acceptOffer(msg.offer.price, msg.offer.quantity)}
                  >
                    <Text style={styles.acceptButtonText}>Accept Offer</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            <Text style={[styles.timestamp, { color: msg.senderId === user.uid ? '#eee' : colors.textSecondary }]}>
              {new Date(msg.timestamp).toLocaleTimeString()}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Counter Offer Section */}
      <View style={[styles.counterSection, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Send Counter Offer</Text>
        <View style={styles.counterRow}>
          <TextInput
            style={[styles.counterInput, { flex: 1, backgroundColor: isDark ? colors.background : '#f0f0f0', color: colors.text }]}
            placeholder="Price"
            placeholderTextColor={colors.textSecondary}
            value={counterPrice}
            onChangeText={setCounterPrice}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.counterInput, { flex: 1, backgroundColor: isDark ? colors.background : '#f0f0f0', color: colors.text }]}
            placeholder="Qty"
            placeholderTextColor={colors.textSecondary}
            value={counterQuantity}
            onChangeText={setCounterQuantity}
            keyboardType="numeric"
          />
          <TouchableOpacity 
            style={[styles.sendOfferButton, { backgroundColor: '#FF9800' }]}
            onPress={sendCounterOffer}
            disabled={sending}
          >
            <Text style={styles.sendOfferButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Message Input */}
      <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TextInput
          style={[styles.input, { backgroundColor: isDark ? colors.background : '#f0f0f0', color: colors.text }]}
          placeholder="Type a message..."
          placeholderTextColor={colors.textSecondary}
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendButton, { backgroundColor: colors.primary }]}
          onPress={sendMessage}
          disabled={sending}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cropName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  farmerName: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  messagesContainer: {
    flex: 1,
    padding: 15,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4CAF50',
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
  },
  senderName: {
    fontSize: 10,
    color: '#999',
    marginBottom: 3,
  },
  messageText: {
    fontSize: 14,
    color: '#333',
  },
  offerContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  offerText: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: 'bold',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 5,
    marginTop: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
    marginTop: 5,
  },
  counterSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    fontSize: 14,
  },
  sendOfferButton: {
    backgroundColor: '#FF9800',
    padding: 10,
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  sendOfferButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    padding: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});