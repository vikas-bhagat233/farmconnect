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

export const addCrop = async (cropData) => {
  try {
    const cropRef = doc(collection(db, 'crops'));
    await setDoc(cropRef, {
      ...cropData,
      id: cropRef.id,
      createdAt: new Date().toISOString(),
      status: 'available'
    });
    return { success: true, id: cropRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateCrop = async (cropId, cropData) => {
  try {
    const cropRef = doc(db, 'crops', cropId);
    await updateDoc(cropRef, {
      ...cropData,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteCrop = async (cropId) => {
  try {
    await deleteDoc(doc(db, 'crops', cropId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getCropById = async (cropId) => {
  const cropDoc = await getDoc(doc(db, 'crops', cropId));
  if (cropDoc.exists()) {
    return { id: cropDoc.id, ...cropDoc.data() };
  }
  return null;
};

export const getFarmerCrops = async (farmerId) => {
  const cropsQuery = query(
    collection(db, 'crops'),
    where('farmerId', '==', farmerId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(cropsQuery);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getMarketplaceCrops = async (filters = {}) => {
  let cropsQuery = query(
    collection(db, 'crops'),
    where('status', '==', 'available'),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(cropsQuery);
  let crops = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  // Apply filters
  if (filters.category && filters.category !== 'All') {
    crops = crops.filter(c => c.category === filters.category);
  }
  if (filters.minPrice) {
    crops = crops.filter(c => c.price >= filters.minPrice);
  }
  if (filters.maxPrice) {
    crops = crops.filter(c => c.price <= filters.maxPrice);
  }
  if (filters.quality) {
    crops = crops.filter(c => c.quality === filters.quality);
  }
  
  // Apply sorting
  if (filters.sortBy === 'price_low') {
    crops.sort((a, b) => a.price - b.price);
  } else if (filters.sortBy === 'price_high') {
    crops.sort((a, b) => b.price - a.price);
  }
  
  return crops;
};

export const updateCropStatus = async (cropId, status) => {
  try {
    const cropRef = doc(db, 'crops', cropId);
    await updateDoc(cropRef, { status });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};