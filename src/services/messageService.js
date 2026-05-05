import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc,
  Timestamp
} from './firebase';

export const sendMessage = async (messageData) => {
  try {
    const messageRef = doc(collection(db, 'messages'));
    await setDoc(messageRef, {
      ...messageData,
      id: messageRef.id,
      createdAt: new Date().toISOString()
    });
    return { success: true, id: messageRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getMessages = async (userId1, userId2) => {
  const messagesQuery = query(
    collection(db, 'messages'),
    where('senderId', 'in', [userId1, userId2]),
    where('receiverId', 'in', [userId1, userId2])
  );
  const snapshot = await getDocs(messagesQuery);
  const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
};

export const markMessagesAsRead = async (userId, senderId) => {
  const messagesQuery = query(
    collection(db, 'messages'),
    where('receiverId', '==', userId),
    where('senderId', '==', senderId),
    where('read', '==', false)
  );
  const snapshot = await getDocs(messagesQuery);
  
  snapshot.forEach(async (doc) => {
    await updateDoc(doc.ref, { read: true });
  });
};

export const getChatList = async (userId) => {
  const sentQuery = query(
    collection(db, 'messages'),
    where('senderId', '==', userId)
  );
  const receivedQuery = query(
    collection(db, 'messages'),
    where('receiverId', '==', userId)
  );
  
  const [sentSnapshot, receivedSnapshot] = await Promise.all([
    getDocs(sentQuery),
    getDocs(receivedQuery)
  ]);
  
  const chats = new Map();
  
  sentSnapshot.forEach(doc => {
    const msg = doc.data();
    const otherId = msg.receiverId;
    if (!chats.has(otherId) || msg.createdAt > chats.get(otherId).lastMessageTime) {
      chats.set(otherId, {
        userId: otherId,
        lastMessage: msg.text,
        lastMessageTime: msg.createdAt,
        unreadCount: 0
      });
    }
  });
  
  receivedSnapshot.forEach(doc => {
    const msg = doc.data();
    const otherId = msg.senderId;
    if (!chats.has(otherId) || msg.createdAt > chats.get(otherId).lastMessageTime) {
      chats.set(otherId, {
        userId: otherId,
        lastMessage: msg.text,
        lastMessageTime: msg.createdAt,
        unreadCount: msg.read ? 0 : 1
      });
    } else if (!msg.read) {
      const chat = chats.get(otherId);
      chat.unreadCount += 1;
    }
  });
  
  return Array.from(chats.values()).sort((a, b) => 
    new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
  );
};

export const createNegotiation = async (negotiationData) => {
  try {
    const negotiationRef = doc(collection(db, 'negotiations'));
    await setDoc(negotiationRef, {
      ...negotiationData,
      id: negotiationRef.id,
      messages: [],
      status: 'active',
      createdAt: new Date().toISOString()
    });
    return negotiationRef.id;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getNegotiation = async (cropId, buyerId, farmerId) => {
  const negotiationsQuery = query(
    collection(db, 'negotiations'),
    where('cropId', '==', cropId),
    where('buyerId', '==', buyerId),
    where('farmerId', '==', farmerId)
  );
  const snapshot = await getDocs(negotiationsQuery);
  if (!snapshot.empty) {
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  }
  return null;
};

export const sendNegotiationMessage = async (negotiationId, message) => {
  try {
    const negotiationRef = doc(db, 'negotiations', negotiationId);
    const negotiation = await getDoc(negotiationRef);
    const messages = negotiation.data().messages || [];
    await updateDoc(negotiationRef, { messages: [...messages, message] });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getNegotiationList = async (userId, role) => {
  const field = role === 'farmer' ? 'farmerId' : 'buyerId';
  const q = query(
    collection(db, 'negotiations'),
    where(field, '==', userId)
  );
  const snapshot = await getDocs(q);
  const negotiations = snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data() 
  }));
  
  return negotiations.map(n => ({
    userId: role === 'farmer' ? n.buyerId : n.farmerId,
    userName: role === 'farmer' ? n.buyerName : n.farmerName,
    lastMessage: n.messages && n.messages.length > 0 ? n.messages[n.messages.length - 1].text : `Negotiation for ${n.cropName}`,
    lastMessageTime: n.messages && n.messages.length > 0 ? n.messages[n.messages.length - 1].timestamp : n.createdAt,
    unreadCount: 0,
    avatar: 'https://ui-avatars.com/api/?name=' + (role === 'farmer' ? n.buyerName : n.farmerName),
    negotiationId: n.id,
    cropName: n.cropName,
    ...n
  })).sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
};