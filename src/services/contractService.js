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

export const createContract = async (contractData) => {
  try {
    const contractRef = doc(collection(db, 'contracts'));
    const totalAmount = contractData.quantity * contractData.agreedPrice;
    const advanceAmount = totalAmount * 0.3;
    const remainingAmount = totalAmount * 0.7;
    
    await setDoc(contractRef, {
      ...contractData,
      id: contractRef.id,
      totalAmount,
      advanceAmount,
      remainingAmount,
      status: 'pending',
      advancePaid: false,
      fullPaid: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    // Update crop status to under contract
    const cropRef = doc(db, 'crops', contractData.cropId);
    await updateDoc(cropRef, { 
      status: 'under_contract',
      contractId: contractRef.id 
    });
    
    return { success: true, contractId: contractRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getContractById = async (contractId) => {
  const contractDoc = await getDoc(doc(db, 'contracts', contractId));
  if (contractDoc.exists()) {
    return { id: contractDoc.id, ...contractDoc.data() };
  }
  return null;
};

export const updateContractStatus = async (contractId, status) => {
  try {
    const contractRef = doc(db, 'contracts', contractId);
    await updateDoc(contractRef, { 
      status,
      updatedAt: new Date().toISOString()
    });
    
    // If rejected, update crop status back to available
    if (status === 'rejected') {
      const contract = await getContractById(contractId);
      const cropRef = doc(db, 'crops', contract.cropId);
      await updateDoc(cropRef, { status: 'available', contractId: null });
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getFarmerContracts = async (farmerId) => {
  const contractsQuery = query(
    collection(db, 'contracts'),
    where('farmerId', '==', farmerId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(contractsQuery);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getBuyerContracts = async (buyerId) => {
  const contractsQuery = query(
    collection(db, 'contracts'),
    where('buyerId', '==', buyerId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(contractsQuery);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const generateContractPDF = async (contract) => {
  // This would integrate with a PDF generation service
  // For now, return a mock URL
  return `https://example.com/contracts/${contract.id}.pdf`;
};

export const downloadContractPDF = async (contract) => {
  const pdfUrl = await generateContractPDF(contract);
  return pdfUrl;
};