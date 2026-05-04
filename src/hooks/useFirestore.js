import { useState, useEffect } from 'react';
import { db, collection, query, where, getDocs, onSnapshot } from '../services/firebase';

export const useFirestore = (collectionName, conditions = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    let q = collection(db, collectionName);
    
    conditions.forEach(condition => {
      q = query(q, where(condition.field, condition.operator, condition.value));
    });
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const results = [];
      snapshot.forEach(doc => {
        results.push({ id: doc.id, ...doc.data() });
      });
      setData(results);
      setLoading(false);
      setError(null);
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [collectionName, JSON.stringify(conditions)]);

  return { data, loading, error };
};

export const useDocument = (collectionName, documentId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!documentId) {
      setLoading(false);
      return;
    }
    
    const docRef = doc(db, collectionName, documentId);
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        setData({ id: doc.id, ...doc.data() });
      } else {
        setData(null);
      }
      setLoading(false);
      setError(null);
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [collectionName, documentId]);

  return { data, loading, error };
};