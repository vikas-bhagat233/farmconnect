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
  limit,
  addDoc
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
    const totalAmount = contractData.totalAmount || (contractData.quantity * contractData.agreedPrice);
    const advanceAmount = contractData.advanceAmount !== undefined ? contractData.advanceAmount : (totalAmount * 0.3);
    const remainingAmount = contractData.remainingAmount !== undefined ? contractData.remainingAmount : (totalAmount - advanceAmount);

    console.log("DEBUG: Saving contract. BuyerID:", contractData.buyerId, "FarmerID:", contractData.farmerId);
    // Use addDoc to let Firestore generate the ID, which is safer for security rules
    const contractRef = await addDoc(collection(db, 'contracts'), {
      ...contractData,
      totalAmount,
      advanceAmount,
      remainingAmount,
      status: contractData.status || 'pending',
      advancePaid: false,
      fullPaid: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    const contractId = contractRef.id;
    // Update the document with its own ID for easier reference
    await updateDoc(contractRef, { id: contractId });
    
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
    
    // If there's a negotiation, add a system message and lock it
    if (contractData.negotiationId) {
      try {
        await sendNegotiationMessage(contractData.negotiationId, {
          text: `📄 Contract Proposal Created: ₹${totalAmount} total (Advance: ₹${advanceAmount})`,
          senderId: contractData.buyerId,
          senderName: contractData.buyerName,
          senderRole: 'buyer',
          timestamp: new Date().toISOString(),
          isSystem: true
        });
      } catch (e) {
        console.warn('System message failed, continuing...', e.message);
      }
      
      try {
        const negotiationRef = doc(db, 'negotiations', contractData.negotiationId);
        await updateDoc(negotiationRef, { 
          status: 'locked',
          lockedAt: new Date().toISOString()
        });
      } catch (e) {
        return { success: false, error: `Step 2 (Lock Negotiation) failed: ${e.message}` };
      }
    }

    // Send notification to the FARMER about new proposal
    try {
      await sendNotification(
        contractData.farmerId, 
        'New Contract Proposal 📄', 
        `${contractData.buyerName} has proposed a contract for ${contractData.cropName}. Total: ₹${totalAmount}. Go to Contracts → Pending to review.`,
        { type: 'contract', contractId }
      );
    } catch (e) {}

    // Send confirmation notification to the BUYER
    try {
      await sendNotification(
        contractData.buyerId,
        'Contract Proposal Sent ✅',
        `Your contract proposal for ${contractData.cropName} (₹${totalAmount}) has been sent to ${contractData.farmerName}. Waiting for farmer approval.`,
        { type: 'contract', contractId }
      );
    } catch (e) {}
    
    return { success: true, contractId: contractRef.id };
  } catch (error) {
    return { success: false, error: `General error: ${error.message}` };
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
          try {
            await sendNegotiationMessage(contract.negotiationId, {
              text: `🤝 Contract Accepted! Total: ₹${contract.totalAmount}.\n\n⚠️ Status: Waiting for Buyer to pay the 30% Advance (₹${contract.advanceAmount}).\n\nFarmer: Please wait for confirmation before preparing the shipment.`,
              senderId: contract.farmerId,
              senderName: contract.farmerName,
              senderRole: 'farmer',
              timestamp: new Date().toISOString(),
              isSystem: true
            });
          } catch (e) {}
        }

        // Send notification to the BUYER about advance payment
        try {
          await sendNotification(
            contract.buyerId,
            'Contract Accepted! 🎉',
            `Your contract for ${contract.cropName} has been accepted by ${contract.farmerName}. Please pay the 30% advance of ₹${contract.advanceAmount}. Go to Contracts → Active tab.`,
            { type: 'contract', contractId }
          );
        } catch (e) {}

        // Send confirmation to the FARMER
        try {
          await sendNotification(
            contract.farmerId,
            'Contract Accepted ✅',
            `You accepted the contract for ${contract.cropName} with ${contract.buyerName}. Waiting for buyer to pay ₹${contract.advanceAmount} advance.`,
            { type: 'contract', contractId }
          );
        } catch (e) {}

        // Generate PDF
        try {
          await generateContractPDF(contract);
        } catch (e) {}

        // Create initial pending payment record for the 30% advance
        try {
          const paymentRef = doc(collection(db, 'payments'));
          await setDoc(paymentRef, {
            id: paymentRef.id,
            contractId: contract.id,
            buyerId: contract.buyerId,
            buyerName: contract.buyerName,
            farmerId: contract.farmerId,
            farmerName: contract.farmerName,
            cropName: contract.cropName,
            amount: contract.advanceAmount,
            type: 'advance',
            status: 'pending',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString()
          });
        } catch (e) {}

        // Update crop
        try {
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
        } catch (e) {}
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