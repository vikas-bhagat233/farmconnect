export const APP_CONFIG = {
  APP_NAME: 'Farmer Buyer Contract Platform',
  VERSION: '1.0.0',
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api',
  SOCKET_URL: process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:5001',
};

export const CROP_CATEGORIES = [
  { id: 'vegetables', name: 'Vegetables', icon: '🥬', subCategories: ['Tomato', 'Onion', 'Potato', 'Carrot', 'Cabbage', 'Cauliflower', 'Brinjal', 'Ladyfinger', 'Spinach', 'Pumpkin'] },
  { id: 'fruits', name: 'Fruits', icon: '🍎', subCategories: ['Apple', 'Mango', 'Banana', 'Orange', 'Grapes', 'Pomegranate', 'Watermelon', 'Papaya', 'Pineapple', 'Guava'] },
  { id: 'grains', name: 'Grains', icon: '🌾', subCategories: ['Wheat', 'Rice', 'Maize', 'Barley', 'Millet', 'Sorghum', 'Oats', 'Quinoa', 'Ragi', 'Bajra'] },
  { id: 'spices', name: 'Spices', icon: '🌶️', subCategories: ['Cumin', 'Coriander', 'Turmeric', 'Red Chilli', 'Black Pepper', 'Cardamom', 'Clove', 'Cinnamon', 'Fenugreek', 'Mustard'] },
  { id: 'pulses', name: 'Pulses', icon: '🫘', subCategories: ['Chickpea', 'Pigeon Pea', 'Green Gram', 'Black Gram', 'Red Lentil', 'Moth Bean', 'Horse Gram', 'Cowpea'] },
  { id: 'oilseeds', name: 'Oilseeds', icon: '🥜', subCategories: ['Groundnut', 'Soybean', 'Sunflower', 'Sesame', 'Mustard', 'Castor', 'Coconut', 'Linseed'] },
  { id: 'flowers', name: 'Flowers', icon: '🌸', subCategories: ['Marigold', 'Rose', 'Jasmine', 'Sunflower', 'Lotus', 'Tuberose', 'Chrysanthemum', 'Orchid'] },
  { id: 'organic', name: 'Organic', icon: '🌱', subCategories: ['Organic Vegetables', 'Organic Fruits', 'Organic Grains', 'Organic Spices', 'Organic Pulses'] },
];

export const QUALITY_GRADES = [
  { id: 'A', name: 'Grade A - Premium', color: '#4CAF50' },
  { id: 'B', name: 'Grade B - Good', color: '#2196F3' },
  { id: 'C', name: 'Grade C - Standard', color: '#FF9800' },
  { id: 'organic', name: 'Organic Certified', color: '#8BC34A' },
  { id: 'natural', name: 'Natural Farming', color: '#009688' },
];

export const CONTRACT_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
};

export const CONTRACT_STATUS_LABELS = {
  pending: 'Pending Approval',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

export const PAYMENT_TYPES = {
  ADVANCE: 'advance',
  REMAINING: 'remaining',
};

export const USER_ROLES = {
  FARMER: 'farmer',
  BUYER: 'buyer',
  ADMIN: 'admin',
};

export const NOTIFICATION_TYPES = {
  CONTRACT: 'contract',
  MESSAGE: 'message',
  PAYMENT: 'payment',
  NEGOTIATION: 'negotiation',
  SYSTEM: 'system',
};

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
];

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  USER_ROLE: 'user_role',
  THEME: 'app_theme',
  LANGUAGE: 'app_language',
  NOTIFICATIONS_ENABLED: 'notifications_enabled',
};

export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  GOOGLE_LOGIN: '/auth/google',
  RESET_PASSWORD: '/auth/reset-password',
  CROPS: '/crops',
  CONTRACTS: '/contracts',
  PAYMENTS: '/payments',
  MESSAGES: '/messages',
  NOTIFICATIONS: '/notifications',
  MARKET_PRICE: '/market-price',
  UPLOAD_IMAGE: '/upload',
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  UNAUTHORIZED: 'Please login to continue',
  SERVER_ERROR: 'Something went wrong. Please try again later.',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_EXISTS: 'Email already registered',
  WEAK_PASSWORD: 'Password must be at least 6 characters',
  FIELD_REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  PASSWORDS_MISMATCH: 'Passwords do not match',
};

export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  PHONE_LENGTH: 10,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  QUANTITY_MIN: 1,
  QUANTITY_MAX: 100000,
  PRICE_MIN: 1,
  PRICE_MAX: 100000,
};

export const PAYMENT_SPLITS = {
  ADVANCE_PERCENTAGE: 30,
  REMAINING_PERCENTAGE: 70,
};

export const DEFAULT_AVATAR = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
export const DEFAULT_CROP_IMAGE = 'https://cdn.pixabay.com/photo/2016/03/05/19/02/wheat-1238564_1280.jpg';

export const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest First', icon: '🕒' },
  { id: 'price_low', label: 'Price: Low to High', icon: '💰' },
  { id: 'price_high', label: 'Price: High to Low', icon: '💸' },
  { id: 'popular', label: 'Most Popular', icon: '⭐' },
  { id: 'nearest', label: 'Nearest First', icon: '📍' },
];

export const FILTER_OPTIONS = {
  priceRange: { min: 0, max: 10000, step: 100 },
  quantityRange: { min: 0, max: 10000, step: 100 },
  distance: [5, 10, 25, 50, 100],
};