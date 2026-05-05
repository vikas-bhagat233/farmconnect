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
import { sendNotification } from './notificationService';
import { sendNegotiationMessage } from './messageService';

export const createContract = async (contractData) => {
  try {
    const contractRef = doc(collection(db, 'contracts'));
    const totalAmount = contractData.totalAmount || (contractData.quantity * contractData.agreedPrice);
    const advanceAmount = contractData.advanceAmount !== undefined ? contractData.advanceAmount : (totalAmount * 0.3);
    const remainingAmount = contractData.remainingAmount !== undefined ? contractData.remainingAmount : (totalAmount - advanceAmount);
    
    const finalContractData = {
      ...contractData,
      id: contractRef.id,
      totalAmount,
      advanceAmount,
      remainingAmount,
      status: contractData.status || 'pending',
      advancePaid: false,
      fullPaid: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(contractRef, finalContractData);
    
    // Update crop status to under contract
    const cropRef = doc(db, 'crops', contractData.cropId);
    await updateDoc(cropRef, { 
      status: 'under_contract',
      contractId: contractRef.id 
    });

    // If there's a negotiation, add a system message
    if (contractData.negotiationId) {
      await sendNegotiationMessage(contractData.negotiationId, {
        text: `📄 Contract Proposal Created: ₹${totalAmount} total (Advance: ₹${advanceAmount})`,
        senderId: contractData.buyerId,
        senderName: contractData.buyerName,
        senderRole: 'buyer',
        timestamp: new Date().toISOString(),
        isSystem: true
      });
    }

    // Send notification to the farmer
    await sendNotification(
      contractData.farmerId, 
      'New Contract Proposal', 
      `${contractData.buyerName} has proposed a contract for ${contractData.cropName}.`
    );
    
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
    where('farmerId', '==', farmerId)
  );
  const snapshot = await getDocs(contractsQuery);
  const contracts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return contracts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getBuyerContracts = async (buyerId) => {
  const contractsQuery = query(
    collection(db, 'contracts'),
    where('buyerId', '==', buyerId)
  );
  const snapshot = await getDocs(contractsQuery);
  const contracts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return contracts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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