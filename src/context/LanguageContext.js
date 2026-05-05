import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { useAuth } from './AuthContext';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

const translations = {
  en: {
    welcome: 'Welcome',
    login: 'Login',
    signup: 'Signup',
    logout: 'Logout',
    home: 'Home',
    profile: 'Profile',
    settings: 'Settings',
    crops: 'Crops',
    contracts: 'Contracts',
    payments: 'Payments',
    chat: 'Chat',
    notifications: 'Notifications',
    addCrop: 'Add Crop',
    negotiate: 'Negotiate',
    accept: 'Accept',
    reject: 'Reject',
    pending: 'Pending',
    active: 'Active',
    completed: 'Completed',
    cancelled: 'Cancelled',
    total: 'Total',
    quantity: 'Quantity',
    price: 'Price',
    description: 'Description',
    location: 'Location',
    loading: 'Loading...',
    noData: 'No data found',
    retry: 'Retry',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    share: 'Share',
    download: 'Download',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    language: 'Language',
    theme: 'Theme',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    about: 'About',
    version: 'Version',
    help: 'Help',
    support: 'Support',
    terms: 'Terms & Conditions',
    privacy: 'Privacy Policy',
    contact: 'Contact Us',
    earningsOverview: 'Earnings Overview',
    spendingAnalysis: 'Spending Analysis',
    quickActions: 'Quick Actions',
    topPicks: 'Top Picks For You',
    activeDeals: 'Active Deals',
    totalInvested: 'Total Invested',
    recentCrops: 'Recent Crops',
    searchPlaceholder: 'Search for fresh crops...',
    weatherForecast: 'Weather Forecast',
    seeAll: 'See All',
    market: 'Market',
    invested: 'Invested',
    earnings: 'Earnings',
  },
  hi: {
    welcome: 'स्वागत है',
    login: 'लॉगिन',
    signup: 'साइनअप',
    logout: 'लॉगआउट',
    home: 'होम',
    profile: 'प्रोफाइल',
    settings: 'सेटिंग्स',
    crops: 'फसलें',
    contracts: 'अनुबंध',
    payments: 'भुगतान',
    chat: 'चैट',
    notifications: 'सूचनाएं',
    addCrop: 'फसल जोड़ें',
    negotiate: 'मोलभाव करें',
    accept: 'स्वीकार करें',
    reject: 'अस्वीकार करें',
    pending: 'लंबित',
    active: 'सक्रिय',
    completed: 'पूर्ण',
    cancelled: 'रद्द',
    total: 'कुल',
    quantity: 'मात्रा',
    price: 'कीमत',
    description: 'विवरण',
    location: 'स्थान',
    loading: 'लोड हो रहा है...',
    noData: 'कोई डेटा नहीं मिला',
    retry: 'पुनः प्रयास करें',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    delete: 'हटाएं',
    edit: 'संपादित करें',
    share: 'साझा करें',
    download: 'डाउनलोड',
    search: 'खोजें',
    filter: 'फ़िल्टर',
    sort: 'क्रमबद्ध करें',
    language: 'भाषा',
    theme: 'थीम',
    darkMode: 'डार्क मोड',
    lightMode: 'लाइट मोड',
    about: 'हमारे बारे में',
    version: 'संस्करण',
    help: 'सहायता',
    support: 'समर्थन',
    terms: 'नियम और शर्तें',
    privacy: 'गोपनीयता नीति',
    contact: 'संपर्क करें',
    earningsOverview: 'कमाई का अवलोकन',
    spendingAnalysis: 'खर्च का विश्लेषण',
    quickActions: 'त्वरित कार्रवाई',
    topPicks: 'आपके लिए बेहतरीन विकल्प',
    activeDeals: 'सक्रिय सौदे',
    totalInvested: 'कुल निवेश',
    recentCrops: 'हाल की फसलें',
    searchPlaceholder: 'ताजी फसलों की खोज करें...',
    weatherForecast: 'मौसम का पूर्वानुमान',
    seeAll: 'सभी देखें',
    market: 'बाज़ार',
    invested: 'निवेशित',
    earnings: 'कमाई',
  },
  mr: {
    welcome: 'स्वागत आहे',
    login: 'लॉगिन',
    signup: 'साइनअप',
    logout: 'लॉगआउट',
    home: 'मुख्यपृष्ठ',
    profile: 'प्रोफाइल',
    settings: 'सेटिंग्ज',
    crops: 'पिके',
    contracts: 'करार',
    payments: 'देयके',
    chat: 'गप्पा',
    notifications: 'सूचना',
    addCrop: 'पीक जोडा',
    negotiate: 'भाव करा',
    accept: 'स्वीकारा',
    reject: 'नकारा',
    pending: 'प्रलंबित',
    active: 'सक्रिय',
    completed: 'पूर्ण',
    cancelled: 'रद्द',
    total: 'एकूण',
    quantity: 'प्रमाण',
    price: 'किंमत',
    description: 'वर्णन',
    location: 'स्थान',
    loading: 'लोड होत आहे...',
    noData: 'वेळापत्रक सापडले नाही',
    retry: 'पुन्हा प्रयत्न करा',
    save: 'जतन करा',
    cancel: 'रद्द करा',
    delete: 'हटवा',
    edit: 'संपादित करा',
    share: 'शेअर करा',
    download: 'डाउनलोड',
    search: 'शोधा',
    filter: 'फिल्टर',
    sort: 'क्रमवारी',
    language: 'भाषा',
    theme: 'थीम',
    darkMode: 'डार्क मोड',
    lightMode: 'लाइट मोड',
    about: 'आमच्याबद्दल',
    version: 'आवृत्ती',
    help: 'मदत',
    support: 'सहाय्य',
    terms: 'अटी आणि नियम',
    privacy: 'गोपनीयता धोरण',
    contact: 'संपर्क',
    earningsOverview: 'उत्पन्नाचे विहंगावलोकन',
    spendingAnalysis: 'खर्चाचे विश्लेषण',
    quickActions: 'त्वरित कृती',
    topPicks: 'तुमच्यासाठी सर्वोत्तम निवडी',
    activeDeals: 'सक्रिय सौदे',
    totalInvested: 'एकूण गुंतवणूक',
    recentCrops: 'अलीकडील पिके',
    searchPlaceholder: 'ताज्या पिकांचा शोध घ्या...',
    weatherForecast: 'हवामान अंदाज',
    seeAll: 'सर्व पहा',
    market: 'बाजार',
    invested: 'गुंतवणूक',
    earnings: 'उत्पन्न',
  },
};

export const LanguageProvider = ({ children }) => {
  const { user } = useAuth();
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    loadLanguage(user?.uid);
  }, [user]);

  const loadLanguage = async (userId = null) => {
    const key = userId ? `appLanguage_${userId}` : 'appLanguage_guest';
    const savedLanguage = await AsyncStorage.getItem(key);
    const deviceLanguage = Localization.locale.split('-')[0];
    
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage);
    } else if (!userId) {
      // If guest, try global setting or device language
      const globalLang = await AsyncStorage.getItem('appLanguage_global');
      if (globalLang && translations[globalLang]) {
        setLanguage(globalLang);
      } else if (translations[deviceLanguage]) {
        setLanguage(deviceLanguage);
      }
    } else if (translations[deviceLanguage]) {
      setLanguage(deviceLanguage);
    }
  };

  const changeLanguage = async (lang, userId = user?.uid) => {
    if (translations[lang]) {
      setLanguage(lang);
      const key = userId ? `appLanguage_${userId}` : 'appLanguage_guest';
      await AsyncStorage.setItem(key, lang);
      if (!userId) {
        await AsyncStorage.setItem('appLanguage_global', lang);
      }
    }
  };

  const t = (key) => {
    return translations[language][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage: changeLanguage,
      t,
      translations: translations[language],
      loadLanguage
    }}>
      {children}
    </LanguageContext.Provider>
  );
};