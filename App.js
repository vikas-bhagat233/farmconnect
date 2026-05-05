import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox } from 'react-native';

// Ignore all logs for a cleaner user experience as requested
LogBox.ignoreAllLogs();
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { LanguageProvider } from './src/context/LanguageContext';
import AppNavigator from './src/navigation/AppNavigator';

const NavigationWrapper = () => {
  const { isDark, colors } = useTheme();

  const customTheme = {
    dark: isDark,
    colors: {
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
  };

  return (
    <NavigationContainer theme={customTheme}>
      <AppNavigator />
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <LanguageProvider>
            <NavigationWrapper />
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}