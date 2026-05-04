const MARKET_API_URL = process.env.EXPO_PUBLIC_MARKET_PRICE_API_URL;
const MARKET_API_KEY = process.env.EXPO_PUBLIC_MARKET_PRICE_API_KEY;

const normalizeCommodity = (cropName) => cropName?.trim();

const parseNumber = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseRecordDate = (record) => {
  const raw = record.arrival_date || record.price_date || record.timestamp;
  if (!raw) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toDateKey = (date) => date.toISOString().split('T')[0];

const fetchCommodityRecords = async (cropName, limit = 50) => {
  if (!MARKET_API_URL || !MARKET_API_KEY) {
    throw new Error('Market price API is not configured.');
  }

  const url = new URL(MARKET_API_URL);
  url.searchParams.set('api-key', MARKET_API_KEY);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('filters[commodity]', normalizeCommodity(cropName));
  url.searchParams.set('sort[arrival_date]', 'desc');

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error('Failed to fetch market price data.');
  }

  const payload = await response.json();
  const records = payload.records || payload.data?.records || [];

  return Array.isArray(records) ? records : [];
};

export const getMarketPrice = async (cropName) => {
  const records = await fetchCommodityRecords(cropName, 50);
  if (records.length === 0) {
    throw new Error('No market price data found for this crop.');
  }

  const sortedByDate = records
    .map((record) => ({ record, date: parseRecordDate(record) }))
    .sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));

  const latest = sortedByDate[0]?.record || records[0];
  const previous = sortedByDate[1]?.record || null;

  const minPrice = parseNumber(latest.min_price ?? latest.minPrice ?? latest.min);
  const maxPrice = parseNumber(latest.max_price ?? latest.maxPrice ?? latest.max);
  const currentPrice = parseNumber(latest.modal_price ?? latest.modalPrice ?? latest.avg ?? latest.price);
  if (currentPrice === null) {
    throw new Error('Market price data is missing for this crop.');
  }

  const previousPrice = previous
    ? parseNumber(previous.modal_price ?? previous.modalPrice ?? previous.avg ?? previous.price)
    : null;
  const percentageChange = previousPrice ? ((currentPrice - previousPrice) / previousPrice) * 100 : null;
  const trend = percentageChange === null ? null : percentageChange >= 0 ? 'up' : 'down';

  return {
    cropName,
    currentPrice,
    minPrice,
    maxPrice,
    averagePrice: currentPrice,
    trend,
    percentageChange: percentageChange === null ? null : percentageChange.toFixed(1),
    lastUpdated: (parseRecordDate(latest) || new Date()).toISOString()
  };
};

export const getHistoricalPrices = async (cropName, days = 30) => {
  const records = await fetchCommodityRecords(cropName, Math.max(days * 3, 60));
  if (records.length === 0) {
    throw new Error('No historical market price data found.');
  }

  const byDate = new Map();
  records.forEach((record) => {
    const date = parseRecordDate(record);
    const price = parseNumber(record.modal_price ?? record.modalPrice ?? record.avg ?? record.price);
    if (!date || price === null) return;
    const key = toDateKey(date);
    if (!byDate.has(key)) {
      byDate.set(key, { total: price, count: 1 });
    } else {
      const existing = byDate.get(key);
      byDate.set(key, { total: existing.total + price, count: existing.count + 1 });
    }
  });

  return Array.from(byDate.entries())
    .map(([date, { total, count }]) => ({ date, price: total / count }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-days);
};

export const getRegionalPrices = async (cropName) => {
  const records = await fetchCommodityRecords(cropName, 200);
  if (records.length === 0) {
    throw new Error('No regional market price data found.');
  }

  const byRegion = new Map();
  records.forEach((record) => {
    const region = record.state || record.district || record.market || 'Unknown';
    const price = parseNumber(record.modal_price ?? record.modalPrice ?? record.avg ?? record.price);
    if (!region || price === null) return;
    if (!byRegion.has(region)) {
      byRegion.set(region, { total: price, count: 1 });
    } else {
      const existing = byRegion.get(region);
      byRegion.set(region, { total: existing.total + price, count: existing.count + 1 });
    }
  });

  return Array.from(byRegion.entries()).map(([region, { total, count }]) => ({
    region,
    price: total / count
  }));
};

export const getPricePrediction = async (cropName) => {
  const history = await getHistoricalPrices(cropName, 14);
  if (history.length < 2) {
    throw new Error('Not enough data for predictions.');
  }

  const recent = history.slice(-2);
  const delta = recent[1].price - recent[0].price;
  const base = recent[1].price;
  const predictions = [];

  for (let i = 1; i <= 4; i++) {
    predictions.push({
      week: i,
      predictedPrice: base + delta * i,
      confidence: '60.0'
    });
  }

  return predictions;
};