import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    const savedTheme = await AsyncStorage.getItem('appTheme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme(systemScheme === 'dark' ? 'dark' : 'light');
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    await AsyncStorage.setItem('appTheme', newTheme);
  };

  const setThemeMode = async (mode) => {
    setTheme(mode);
    await AsyncStorage.setItem('appTheme', mode);
  };

  const colors = {
    light: {
      background: '#f5f5f5',
      card: '#ffffff',
      text: '#333333',
      textSecondary: '#666666',
      border: '#eeeeee',
      primary: '#4CAF50',
      primaryDark: '#388E3C',
      secondary: '#2196F3',
      danger: '#f44336',
      warning: '#FFC107',
      success: '#4CAF50',
      shadow: '#000000',
    },
    dark: {
      background: '#121212',
      card: '#1e1e1e',
      text: '#ffffff',
      textSecondary: '#aaaaaa',
      border: '#333333',
      primary: '#4CAF50',
      primaryDark: '#388E3C',
      secondary: '#2196F3',
      danger: '#f44336',
      warning: '#FFC107',
      success: '#4CAF50',
      shadow: '#000000',
    },
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      colors: colors[theme],
      isDark: theme === 'dark',
      toggleTheme,
      setThemeMode
    }}>
      {children}
    </ThemeContext.Provider>
  );
};