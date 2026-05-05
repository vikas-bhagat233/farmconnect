import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc,
  deleteDoc,
  Timestamp,
  limit
} from './firebase';

// User functions
export const saveUserRole = async (userId, role) => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, { role, updatedAt: new Date().toISOString() }, { merge: true });
};

export const getUserRole = async (userId) => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  return userDoc.exists() ? userDoc.data().role : null;
};

export const getUserProfile = async (userId) => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  return userDoc.exists() ? userDoc.data() : null;
};

export const updateUserProfile = async (userId, data) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { ...data, updatedAt: new Date().toISOString() });
  return { success: true };
};

export const getFarmerById = async (farmerId) => {
  const farmerDoc = await getDoc(doc(db, 'users', farmerId));
  return farmerDoc.exists() ? farmerDoc.data() : null;
};

export const getFarmerReviews = async (farmerId) => {
  const reviewsQuery = query(collection(db, 'reviews'), where('farmerId', '==', farmerId));
  const snapshot = await getDocs(reviewsQuery);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Farmer Stats
export const getFarmerStats = async (farmerId) => {
  const cropsQuery = query(collection(db, 'crops'), where('farmerId', '==', farmerId));
  const contractsQuery = query(collection(db, 'contracts'), where('farmerId', '==', farmerId));
  
  const cropsSnapshot = await getDocs(cropsQuery);
  const contractsSnapshot = await getDocs(contractsQuery);
  
  let totalEarnings = 0;
  let activeContracts = 0;
  let completedContracts = 0;
  
  contractsSnapshot.forEach(doc => {
    const contract = doc.data();
    if (contract.status === 'active' || contract.status === 'pending') activeContracts++;
    if (contract.status === 'completed') {
      completedContracts++;
      totalEarnings += contract.totalAmount;
    }
  });
  
  return {
    totalCrops: cropsSnapshot.size,
    activeContracts,
    completedContracts,
    totalEarnings
  };
};

export const getBuyerStats = async (buyerId) => {
  const contractsQuery = query(collection(db, 'contracts'), where('buyerId', '==', buyerId));
  const contractsSnapshot = await getDocs(contractsQuery);
  
  let activeContracts = 0;
  let completedContracts = 0;
  let totalSpent = 0;
  
  contractsSnapshot.forEach(doc => {
    const contract = doc.data();
    if (contract.status === 'active' || contract.status === 'pending') activeContracts++;
    if (contract.status === 'completed') {
      completedContracts++;
      totalSpent += contract.totalAmount;
    }
  });
  
  return { activeContracts, completedContracts, totalSpent };
};

export const getRecentCrops = async (farmerId, limitCount = 5) => {
  const cropsQuery = query(
    collection(db, 'crops'),
    where('farmerId', '==', farmerId)
  );
  const snapshot = await getDocs(cropsQuery);
  const crops = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  crops.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return crops.slice(0, limitCount);
};

export const getFarmerHistory = async (farmerId) => {
  const contractsQuery = query(
    collection(db, 'contracts'),
    where('farmerId', '==', farmerId)
  );
  const contractsSnapshot = await getDocs(contractsQuery);
  
  const history = [];
  contractsSnapshot.forEach(doc => {
    const contract = doc.data();
    history.push({
      type: 'contract',
      title: `Contract for ${contract.cropName}`,
      description: `${contract.quantity}kg at ₹${contract.agreedPrice}/kg`,
      amount: contract.totalAmount,
      status: contract.status,
      date: contract.createdAt,
      contractId: doc.id
    });
  });
  
  return history.sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const getBuyerHistory = async (buyerId) => {
  const contractsQuery = query(
    collection(db, 'contracts'),
    where('buyerId', '==', buyerId)
  );
  const contractsSnapshot = await getDocs(contractsQuery);
  
  const history = [];
  contractsSnapshot.forEach(doc => {
    const contract = doc.data();
    history.push({
      type: 'contract',
      title: `Contract for ${contract.cropName}`,
      description: `${contract.quantity}kg at ₹${contract.agreedPrice}/kg`,
      amount: contract.totalAmount,
      status: contract.status,
      date: contract.createdAt,
      contractId: doc.id
    });
  });
  
  return history.sort((a, b) => new Date(b.date) - new Date(a.date));
};

// Negotiation functions
export const createNegotiation = async (data) => {
  const negotiationRef = doc(collection(db, 'negotiations'));
  const negotiationData = {
    ...data,
    id: negotiationRef.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: []
  };
  await setDoc(negotiationRef, negotiationData);
  return negotiationData;
};

export const getNegotiation = async (cropId, buyerId, farmerId) => {
  const q = query(
    collection(db, 'negotiations'),
    where('cropId', '==', cropId),
    where('buyerId', '==', buyerId),
    where('farmerId', '==', farmerId)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
};

export const sendNegotiationMessage = async (negotiationId, message) => {
  const negotiationRef = doc(db, 'negotiations', negotiationId);
  const negotiationDoc = await getDoc(negotiationRef);
  if (!negotiationDoc.exists()) return;
  
  const messages = negotiationDoc.data().messages || [];
  messages.push(message);
  
  const updateData = {
    messages,
    updatedAt: new Date().toISOString()
  };
  
  // Update current offer if message contains one
  if (message.offer) {
    updateData.currentOffer = message.offer;
  }
  
  await updateDoc(negotiationRef, updateData);
};