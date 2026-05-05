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
  limit
} from './firebase';
import { sendNotification } from './notificationService';
import { sendNegotiationMessage } from './messageService';
import { generateContractPDF } from './pdfService';

const generateRandomId = (prefix = 'CON') => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = prefix + '-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const createContract = async (contractData) => {
  try {
    const contractId = generateRandomId();
    const contractRef = doc(db, 'contracts', contractId);
    const totalAmount = contractData.totalAmount || (contractData.quantity * contractData.agreedPrice);
    const advanceAmount = contractData.advanceAmount !== undefined ? contractData.advanceAmount : (totalAmount * 0.3);
    const remainingAmount = contractData.remainingAmount !== undefined ? contractData.remainingAmount : (totalAmount - advanceAmount);
    
    const finalContractData = {
      ...contractData,
      id: contractId,
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
    
    // Note: Crop quantity update moved to updateContractStatus (when farmer accepts)
    // to comply with security rules (only farmers can update their own crops)

    // If there's a negotiation, add a system message and lock it
    if (contractData.negotiationId) {
      await sendNegotiationMessage(contractData.negotiationId, {
        text: `📄 Contract Proposal Created: ₹${totalAmount} total (Advance: ₹${advanceAmount})`,
        senderId: contractData.buyerId,
        senderName: contractData.buyerName,
        senderRole: 'buyer',
        timestamp: new Date().toISOString(),
        isSystem: true
      });
      
      // Lock the negotiation
      const negotiationRef = doc(db, 'negotiations', contractData.negotiationId);
      await updateDoc(negotiationRef, { 
        status: 'locked',
        lockedAt: new Date().toISOString()
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
    
    // If accepted, update crop status and quantity
    if (status === 'accept' || status === 'active') {
      const contract = await getContractById(contractId);
      if (contract) {
        // Send acceptance message to negotiation chat
        if (contract.negotiationId) {
          await sendNegotiationMessage(contract.negotiationId, {
            text: `✅ Contract Accepted by Farmer! Total: ₹${contract.totalAmount}. Advance Payment is now due.`,
            senderId: contract.farmerId,
            senderName: contract.farmerName,
            senderRole: 'farmer',
            timestamp: new Date().toISOString(),
            isSystem: true
          });
        }

        const cropRef = doc(db, 'crops', contract.cropId);
        const cropSnap = await getDoc(cropRef);
        if (cropSnap.exists()) {
          const cropData = cropSnap.data();
          const newQuantity = (cropData.quantity || 0) - contract.quantity;
          await updateDoc(cropRef, { 
            quantity: Math.max(0, newQuantity),
            status: newQuantity <= 0 ? 'sold' : 'available',
            contractId: contractId
          });
        }
      }
    }
    
    // If rejected, update crop status back to available
    if (status === 'rejected') {
      const contract = await getContractById(contractId);
      if (contract) {
        // Send rejection message
        if (contract.negotiationId) {
          await sendNegotiationMessage(contract.negotiationId, {
            text: `❌ Contract Proposal Rejected by Farmer. Negotiation unlocked.`,
            senderId: contract.farmerId,
            senderName: contract.farmerName,
            senderRole: 'farmer',
            timestamp: new Date().toISOString(),
            isSystem: true
          });

          // Unlock negotiation
          const negotiationRef = doc(db, 'negotiations', contract.negotiationId);
          await updateDoc(negotiationRef, { status: 'active' });
        }

        const cropRef = doc(db, 'crops', contract.cropId);
        await updateDoc(cropRef, { status: 'available', contractId: null });
      }
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getFarmerContracts = async (farmerId) => {
  if (!farmerId) return [];
  const contractsQuery = query(
    collection(db, 'contracts'),
    where('farmerId', '==', farmerId)
  );
  const snapshot = await getDocs(contractsQuery);
  const contracts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return contracts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getBuyerContracts = async (buyerId) => {
  if (!buyerId) return [];
  const contractsQuery = query(
    collection(db, 'contracts'),
    where('buyerId', '==', buyerId)
  );
  const snapshot = await getDocs(contractsQuery);
  const contracts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return contracts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};



export const downloadContractPDF = async (contract) => {
  const pdfUrl = await generateContractPDF(contract);
  return pdfUrl;
};