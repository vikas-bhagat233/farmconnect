import { useState, useEffect } from 'react';
import { getMarketPrice, getHistoricalPrices, getRegionalPrices, getPricePrediction } from '../services/marketPriceService';

export const useMarketPrice = (cropName) => {
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cropName) {
      fetchPrice();
    }
  }, [cropName]);

  const fetchPrice = async () => {
    setLoading(true);
    try {
      const data = await getMarketPrice(cropName);
      setPrice(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { price, loading, error, refetch: fetchPrice };
};

export const useHistoricalPrices = (cropName, days = 30) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cropName) {
      fetchHistory();
    }
  }, [cropName, days]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await getHistoricalPrices(cropName, days);
      setHistory(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { history, loading, error, refetch: fetchHistory };
};

export const useRegionalPrices = (cropName) => {
  const [regional, setRegional] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cropName) {
      fetchRegional();
    }
  }, [cropName]);

  const fetchRegional = async () => {
    setLoading(true);
    try {
      const data = await getRegionalPrices(cropName);
      setRegional(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { regional, loading, error, refetch: fetchRegional };
};

export const usePricePrediction = (cropName) => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cropName) {
      fetchPredictions();
    }
  }, [cropName]);

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      const data = await getPricePrediction(cropName);
      setPredictions(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { predictions, loading, error, refetch: fetchPredictions };
};