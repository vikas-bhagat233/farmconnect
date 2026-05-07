import React, { useState, useEffect, useRef } from 'react';
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
import { createNegotiation, sendNegotiationMessage, getNegotiation, getNegotiationById } from '../../services/firestoreService';
import { createContract } from '../../services/contractService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
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
    buyerId: routeBuyerId,
    negotiationId: routeNegotiationId
  } = route.params;

  const { user, userRole } = useAuth();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const [negotiation, setNegotiation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterQuantity, setCounterQuantity] = useState('');
  const scrollRef = useRef(null);
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    initializeNegotiation();
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, []);

  const initializeNegotiation = async () => {
    setLoading(true);

    const bId = userRole === 'buyer' ? user.uid : routeBuyerId;
    const fId = userRole === 'farmer' ? user.uid : farmerId;

    let negotiationData = null;
    if (routeNegotiationId) {
      negotiationData = await getNegotiationById(routeNegotiationId);
    } else {
      negotiationData = await getNegotiation(cropId, bId, fId);
    }

    if (!negotiationData && userRole === 'buyer') {
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
      // Subscribe to real-time updates
      subscribeToNegotiation(negotiationData.id);
    } else if (userRole === 'farmer') {
      Alert.alert(t('error') || 'Error', t('negotiationNotFound') || 'Negotiation not found');
      navigation.goBack();
    }

    setLoading(false);
  };

  const subscribeToNegotiation = (negId) => {
    const { db, doc, onSnapshot } = require('../../services/firebase');
    unsubscribeRef.current = onSnapshot(doc(db, 'negotiations', negId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setNegotiation({ id: snap.id, ...data });
        setMessages(data.messages || []);
        // Auto-scroll to bottom on new message
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      }
    });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !negotiation) return;
    setSending(true);
    const messageData = {
      text: newMessage,
      senderId: user.uid,
      senderName: user.displayName,
      senderRole: userRole,
      timestamp: new Date().toISOString()
    };
    await sendNegotiationMessage(negotiation.id, messageData);
    setNewMessage('');
    const recipientId = userRole === 'buyer' ? farmerId : negotiation.buyerId;
    await sendNotification(recipientId, t('newMessage') || 'New Message 💬', `${user.displayName}: ${newMessage}`, { type: 'message' });
    setSending(false);
  };

  const sendCounterOffer = async () => {
    if (!counterPrice || !counterQuantity) {
      Alert.alert(t('error') || 'Error', t('enterPriceQuantity') || 'Please enter both price and quantity');
      return;
    }
    const qty = parseInt(counterQuantity);
    const effectiveMax = maxQuantity || negotiation?.maxQuantity;
    if (effectiveMax && qty > effectiveMax) {
      Alert.alert(t('error') || 'Error', `${t('quantityCannotExceed') || 'Quantity cannot exceed'} ${effectiveMax} kg`);
      return;
    }
    const offerMessage = {
      text: `${userRole === 'farmer' ? '🌾 Farmer' : '🛒 Buyer'} Counter Offer: ₹${counterPrice}/kg for ${counterQuantity} kg`,
      senderId: user.uid,
      senderName: user.displayName,
      senderRole: userRole,   // ← fixed: was hardcoded 'buyer'
      offer: {
        price: parseInt(counterPrice),
        quantity: qty
      },
      timestamp: new Date().toISOString()
    };
    setSending(true);
    await sendNegotiationMessage(negotiation.id, offerMessage);
    setCounterPrice('');
    setCounterQuantity('');
    setSending(false);
    const recipientId = userRole === 'buyer' ? farmerId : negotiation.buyerId;
    await sendNotification(
      recipientId,
      t('newCounterOffer') || 'New Counter Offer 🤝',
      `${user.displayName} ${t('offered') || 'offered'} ₹${counterPrice}/kg ${t('for') || 'for'} ${counterQuantity}kg`,
      { type: 'negotiation' }
    );
  };

  // Buyer accepts a farmer's counter offer → goes to MakeContract
  const buyerAcceptOffer = (offerPrice, offerQuantity) => {
    Alert.alert(
      t('acceptOffer') || 'Accept Offer',
      `${t('acceptOfferPrompt') || 'Accept'} ₹${offerPrice}/kg ${t('for') || 'for'} ${offerQuantity}kg?\n${t('acceptOfferCreatesContract') || 'This will create a contract proposal.'}`,
      [
        { text: t('cancel') || 'Cancel', style: 'cancel' },
        {
          text: t('acceptCreateContract') || 'Accept & Create Contract',
          onPress: () => navigation.navigate('MakeContract', {
            cropId,
            farmerId,
            agreedPrice: offerPrice,
            agreedQuantity: offerQuantity,
            negotiationId: negotiation.id
          })
        }
      ]
    );
  };

  // Farmer accepts a buyer's offer → directly creates contract
  const farmerAcceptOffer = (offerPrice, offerQuantity) => {
    Alert.alert(
      t('acceptBuyerOffer') || 'Accept Buyer Offer',
      `${t('acceptOfferPrompt') || 'Accept'} ₹${offerPrice}/kg ${t('for') || 'for'} ${offerQuantity}kg?\n${t('contractCreatedImmediately') || 'A contract will be created immediately.'}`,
      [
        { text: t('cancel') || 'Cancel', style: 'cancel' },
        {
          text: t('accept') || 'Accept',
          onPress: async () => {
            setSending(true);
            try {
              const contractData = {
                cropId,
                cropName,
                farmerId: user.uid,
                farmerName: user.displayName,
                buyerId: negotiation.buyerId,
                buyerName: negotiation.buyerName,
                agreedPrice: offerPrice,
                quantity: offerQuantity,
                totalAmount: offerPrice * offerQuantity,
                advanceAmount: Math.round(offerPrice * offerQuantity * 0.3),
                remainingAmount: Math.round(offerPrice * offerQuantity * 0.7),
                deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                negotiationId: negotiation.id,
                status: 'active',  // farmer accepts → directly active
                createdAt: new Date().toISOString()
              };
              const result = await createContract(contractData);
              if (result.success) {
                Alert.alert(t('contractCreatedCelebration') || 'Contract Created! 🎉', t('contractActiveAdvanceNotify') || 'The contract is now active. The buyer has been notified to pay the advance.');
              } else {
                Alert.alert(t('error') || 'Error', result.error || (t('failedToCreateContract') || 'Failed to create contract'));
              }
            } catch (e) {
              Alert.alert(t('error') || 'Error', e.message);
            }
            setSending(false);
          }
        }
      ]
    );
  };

  const isLocked = negotiation?.status === 'locked';

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
        <Text style={[styles.subTitle, { color: colors.textSecondary }]}>
          {userRole === 'farmer' ? `${t('buyer') || 'Buyer'}: ${negotiation?.buyerName || ''}` : `${t('farmer') || 'Farmer'}: ${farmerName}`}
        </Text>
        {isLocked && (
          <View style={styles.lockedBanner}>
            <Text style={styles.lockedText}>🔒 {t('contractCreatedNegotiationLocked') || 'Contract created — negotiation locked'}</Text>
          </View>
        )}
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messagesContainer}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      >
        {messages.length === 0 && (
          <View style={styles.emptyMessages}>
            <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
                {t('noMessagesYet') || 'No messages yet.'}{'\n'}{t('sendOfferToStart') || 'Send an offer to start negotiating.'}
            </Text>
          </View>
        )}
        {messages.map((msg, idx) => {
          const isMe = msg.senderId === user.uid;
          const isSystem = msg.isSystem;
          if (isSystem) {
            return (
              <View key={idx} style={styles.systemMessage}>
                <Text style={styles.systemMessageText}>{msg.text}</Text>
              </View>
            );
          }
          return (
            <View
              key={idx}
              style={[
                styles.messageBubble,
                isMe
                  ? [styles.myMessage, { backgroundColor: colors.primary }]
                  : [styles.theirMessage, { backgroundColor: colors.card, borderWidth: isDark ? 1 : 0, borderColor: colors.border }]
              ]}
            >
              <Text style={[styles.senderName, { color: isMe ? '#eee' : colors.textSecondary }]}>
                {msg.senderName} · {msg.senderRole}
              </Text>
              <Text style={[styles.messageText, { color: isMe ? '#fff' : colors.text }]}>
                {msg.text}
              </Text>
              {msg.offer && (
                <View style={[styles.offerContainer, { borderTopColor: isMe ? 'rgba(255,255,255,0.2)' : colors.border }]}>
                  <Text style={[styles.offerText, { color: isMe ? '#FFD54F' : '#FF9800' }]}>
                    ₹{msg.offer.price}/kg · {msg.offer.quantity}kg · Total: ₹{msg.offer.price * msg.offer.quantity}
                  </Text>
                  {/* Show Accept button only to the OTHER party, and only when not locked */}
                  {!isMe && !isLocked && (
                    <TouchableOpacity
                      style={[styles.acceptButton, { backgroundColor: colors.primary }]}
                      onPress={() =>
                        userRole === 'farmer'
                          ? farmerAcceptOffer(msg.offer.price, msg.offer.quantity)
                          : buyerAcceptOffer(msg.offer.price, msg.offer.quantity)
                      }
                      disabled={sending}
                    >
                      <Text style={styles.acceptButtonText}>✓ {t('acceptOffer') || 'Accept Offer'}</Text>
                    </TouchableOpacity>
                  )}
                  {isLocked && !isMe && (
                    <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 6 }}>{t('contractCreated') || 'Contract created'}</Text>
                  )}
                </View>
              )}
              <Text style={[styles.timestamp, { color: isMe ? '#eee' : colors.textSecondary }]}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Counter Offer — hidden when locked */}
      {!isLocked && (
        <View style={[styles.counterSection, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {userRole === 'farmer' ? `🌾 ${t('sendCounterOffer') || 'Send Counter Offer'}` : `🛒 ${t('sendCounterOffer') || 'Send Counter Offer'}`}
          </Text>
          <View style={styles.counterRow}>
            <TextInput
              style={[styles.counterInput, { flex: 1, backgroundColor: isDark ? colors.background : '#f0f0f0', color: colors.text }]}
              placeholder={t('pricePerKgPlaceholder') || '₹ Price/kg'}
              placeholderTextColor={colors.textSecondary}
              value={counterPrice}
              onChangeText={setCounterPrice}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.counterInput, { flex: 1, backgroundColor: isDark ? colors.background : '#f0f0f0', color: colors.text }]}
              placeholder={t('quantityKgPlaceholder') || 'Qty (kg)'}
              placeholderTextColor={colors.textSecondary}
              value={counterQuantity}
              onChangeText={setCounterQuantity}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={[styles.sendOfferButton, { backgroundColor: sending ? colors.border : '#FF9800' }]}
              onPress={sendCounterOffer}
              disabled={sending}
            >
              <Text style={styles.sendOfferButtonText}>{t('send') || 'Send'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Message Input — hidden when locked */}
      {!isLocked && (
        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? colors.background : '#f0f0f0', color: colors.text }]}
            placeholder={t('typeMessage') || 'Type a message...'}
            placeholderTextColor={colors.textSecondary}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: sending ? colors.border : colors.primary }]}
            onPress={sendMessage}
            disabled={sending}
          >
            <Text style={styles.sendButtonText}>{t('send') || 'Send'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 15, borderBottomWidth: 1 },
  cropName: { fontSize: 18, fontWeight: 'bold' },
  subTitle: { fontSize: 13, marginTop: 2 },
  lockedBanner: { marginTop: 8, backgroundColor: '#FFF3E0', padding: 6, borderRadius: 6 },
  lockedText: { fontSize: 12, color: '#E65100', fontWeight: 'bold' },
  messagesContainer: { flex: 1, padding: 15 },
  emptyMessages: { flex: 1, alignItems: 'center', paddingTop: 40 },
  systemMessage: {
    alignSelf: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    maxWidth: '90%',
  },
  systemMessageText: { fontSize: 12, color: '#388E3C', textAlign: 'center' },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 15, marginBottom: 10 },
  myMessage: { alignSelf: 'flex-end' },
  theirMessage: { alignSelf: 'flex-start' },
  senderName: { fontSize: 10, marginBottom: 3 },
  messageText: { fontSize: 14 },
  offerContainer: { marginTop: 8, paddingTop: 8, borderTopWidth: 1 },
  offerText: { fontSize: 13, fontWeight: 'bold' },
  acceptButton: { padding: 8, borderRadius: 6, marginTop: 8, alignItems: 'center' },
  acceptButtonText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  timestamp: { fontSize: 10, marginTop: 5 },
  counterSection: { padding: 12, borderTopWidth: 1 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', marginBottom: 8 },
  counterRow: { flexDirection: 'row', alignItems: 'center' },
  counterInput: { borderRadius: 8, padding: 10, marginRight: 8, fontSize: 14 },
  sendOfferButton: { padding: 10, borderRadius: 8, paddingHorizontal: 14 },
  sendOfferButtonText: { color: '#fff', fontWeight: 'bold' },
  inputContainer: { flexDirection: 'row', padding: 12, borderTopWidth: 1 },
  input: { flex: 1, borderRadius: 20, padding: 10, paddingHorizontal: 15, marginRight: 10, maxHeight: 100 },
  sendButton: { justifyContent: 'center', paddingHorizontal: 18, borderRadius: 20 },
  sendButtonText: { color: '#fff', fontWeight: 'bold' },
});
