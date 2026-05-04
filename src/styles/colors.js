export const colors = {
  // Primary Colors
  primary: '#4CAF50',
  primaryLight: '#81C784',
  primaryDark: '#388E3C',
  primaryLighter: '#E8F5E9',
  
  // Secondary Colors
  secondary: '#2196F3',
  secondaryLight: '#64B5F6',
  secondaryDark: '#1976D2',
  secondaryLighter: '#E3F2FD',
  
  // Accent Colors
  accent: '#FF9800',
  accentLight: '#FFB74D',
  accentDark: '#F57C00',
  accentLighter: '#FFF3E0',
  
  // Success Colors
  success: '#4CAF50',
  successLight: '#81C784',
  successDark: '#388E3C',
  
  // Error Colors
  error: '#f44336',
  errorLight: '#e57373',
  errorDark: '#d32f2f',
  
  // Warning Colors
  warning: '#FFC107',
  warningLight: '#FFD54F',
  warningDark: '#FFA000',
  
  // Info Colors
  info: '#2196F3',
  infoLight: '#64B5F6',
  infoDark: '#1976D2',
  
  // Neutral Colors (Light Mode)
  light: {
    background: '#F5F5F5',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    text: '#212121',
    textSecondary: '#757575',
    textHint: '#BDBDBD',
    border: '#E0E0E0',
    divider: '#EEEEEE',
    disabled: '#F5F5F5',
    placeholder: '#9E9E9E',
    icon: '#616161',
    backdrop: 'rgba(0,0,0,0.5)',
  },
  
  // Neutral Colors (Dark Mode)
  dark: {
    background: '#121212',
    surface: '#1E1E1E',
    card: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textHint: '#757575',
    border: '#2C2C2C',
    divider: '#2C2C2C',
    disabled: '#2C2C2C',
    placeholder: '#9E9E9E',
    icon: '#B0B0B0',
    backdrop: 'rgba(0,0,0,0.8)',
  },
  
  // Status Colors
  status: {
    pending: '#FFC107',
    active: '#4CAF50',
    completed: '#2196F3',
    cancelled: '#f44336',
    rejected: '#f44336',
    processing: '#FF9800',
    paid: '#4CAF50',
    failed: '#f44336',
  },
  
  // Social Colors
  social: {
    google: '#DB4437',
    facebook: '#4267B2',
    apple: '#000000',
  },
  
  // Crop Categories
  cropCategories: {
    vegetables: '#4CAF50',
    fruits: '#FF9800',
    grains: '#FFC107',
    spices: '#f44336',
    pulses: '#9C27B0',
    oilseeds: '#795548',
    flowers: '#E91E63',
    organic: '#8BC34A',
  },
  
  // Quality Colors
  quality: {
    A: '#4CAF50',
    B: '#2196F3',
    C: '#FF9800',
    organic: '#8BC34A',
    natural: '#009688',
  },
  
  // Shadow Colors
  shadow: {
    light: 'rgba(0,0,0,0.1)',
    medium: 'rgba(0,0,0,0.2)',
    dark: 'rgba(0,0,0,0.3)',
  },
  
  // Overlay Colors
  overlay: {
    light: 'rgba(255,255,255,0.9)',
    dark: 'rgba(0,0,0,0.7)',
    medium: 'rgba(0,0,0,0.5)',
  },
};

export const getColors = (theme = 'light') => {
  return {
    ...colors,
    ...colors[theme],
    status: colors.status,
    social: colors.social,
  };
};