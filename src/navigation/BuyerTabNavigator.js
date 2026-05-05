import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import BuyerDashboardScreen from '../screens/buyer/BuyerDashboardScreen';
import MarketplaceScreen from '../screens/buyer/MarketplaceScreen';
import BuyerContractsScreen from '../screens/buyer/BuyerContractsScreen';
import BuyerPaymentsScreen from '../screens/buyer/BuyerPaymentsScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
import ChatList from '../components/chat/ChatList';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const Tab = createBottomTabNavigator();

const getIcon = (routeName, focused) => {
  const icons = {
    Dashboard: focused ? '🏠' : '🏠',
    Marketplace: focused ? '🛒' : '🛒',
    Contracts: focused ? '📄' : '📄',
    Payments: focused ? '💰' : '💰',
    Profile: focused ? '👤' : '👤',
    Chats: focused ? '💬' : '💬'
  };
  return icons[routeName] || '📱';
};

const getLabel = (routeName) => {
  const labels = {
    Dashboard: 'Home',
    Marketplace: 'Market',
    Contracts: 'Contracts',
    Payments: 'Payments',
    Profile: 'Profile',
    Chats: 'Chats'
  };
  return labels[routeName] || routeName;
};

function ChatsScreen() {
  const { colors } = useTheme();
  return (
    <View style={[styles.chatContainer, { backgroundColor: colors.background }]}>
      <ChatList 
        chats={[]} 
        loading={false} 
        onChatPress={() => {}} 
      />
    </View>
  );
}

export default function BuyerTabNavigator() {
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <Text style={styles.icon}>
            {getIcon(route.name, focused)}
          </Text>
        ),
        tabBarLabel: ({ focused }) => (
          <Text style={[styles.label, { color: colors.textSecondary }, focused && { color: colors.primary, fontWeight: 'bold' }]}>
            {t(route.name.toLowerCase()) || getLabel(route.name)}
          </Text>
        ),
        tabBarStyle: [styles.tabBar, { backgroundColor: colors.card, borderTopColor: colors.border }],
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={BuyerDashboardScreen} />
      <Tab.Screen name="Marketplace" component={MarketplaceScreen} />
      <Tab.Screen name="Contracts" component={BuyerContractsScreen} />
      <Tab.Screen name="Payments" component={BuyerPaymentsScreen} />
      <Tab.Screen name="Chats" component={ChatsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: 5,
    paddingTop: 5,
    height: 60,
  },
  icon: {
    fontSize: 22,
  },
  label: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  labelFocused: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});