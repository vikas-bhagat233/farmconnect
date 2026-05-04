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
  await updateDoc(userRef, { role, updatedAt: new Date().toISOString() });
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
    if (contract.status === 'active') activeContracts++;
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
    if (contract.status === 'active') activeContracts++;
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
    where('farmerId', '==', farmerId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(cropsQuery);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getFarmerHistory = async (farmerId) => {
  const contractsQuery = query(
    collection(db, 'contracts'),
    where('farmerId', '==', farmerId),
    orderBy('createdAt', 'desc')
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
  
  return history;
};

export const getBuyerHistory = async (buyerId) => {
  const contractsQuery = query(
    collection(db, 'contracts'),
    where('buyerId', '==', buyerId),
    orderBy('createdAt', 'desc')
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
  
  return history;
};