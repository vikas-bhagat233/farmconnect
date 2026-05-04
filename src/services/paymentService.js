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
  Timestamp
} from './firebase';

export const processPayment = async (paymentData) => {
  try {
    const paymentRef = doc(collection(db, 'payments'));
    await setDoc(paymentRef, {
      ...paymentData,
      id: paymentRef.id,
      status: 'processing',
      createdAt: new Date().toISOString(),
      transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
    });
    
    // Simulate payment processing
    setTimeout(async () => {
      await updateDoc(paymentRef, { status: 'paid' });
      
      // Update contract payment status
      const contractRef = doc(db, 'contracts', paymentData.contractId);
      const contract = await getDoc(contractRef);
      const contractData = contract.data();
      
      if (paymentData.type === 'advance') {
        await updateDoc(contractRef, { advancePaid: true });
      } else {
        await updateDoc(contractRef, { fullPaid: true, status: 'completed' });
      }
    }, 2000);
    
    return { success: true, paymentId: paymentRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getPaymentDetails = async (contractId, type) => {
  const paymentsQuery = query(
    collection(db, 'payments'),
    where('contractId', '==', contractId),
    where('type', '==', type)
  );
  const snapshot = await getDocs(paymentsQuery);
  if (!snapshot.empty) {
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  }
  
  // Get contract for payment amount
  const contract = await getDoc(doc(db, 'contracts', contractId));
  const contractData = contract.data();
  
  return {
    amount: type === 'advance' ? contractData.advanceAmount : contractData.remainingAmount,
    type,
    contractId,
    farmerId: contractData.farmerId,
    farmerName: contractData.farmerName,
    cropName: contractData.cropName
  };
};

export const getFarmerPayments = async (farmerId) => {
  const paymentsQuery = query(
    collection(db, 'payments'),
    where('farmerId', '==', farmerId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(paymentsQuery);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getBuyerPayments = async (buyerId) => {
  const paymentsQuery = query(
    collection(db, 'payments'),
    where('buyerId', '==', buyerId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(paymentsQuery);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updatePaymentStatus = async (paymentId, status) => {
  try {
    const paymentRef = doc(db, 'payments', paymentId);
    await updateDoc(paymentRef, { status });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const makePayment = async (paymentData) => {
  return processPayment(paymentData);
};