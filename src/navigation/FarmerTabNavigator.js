import React, { useState, useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FarmerDashboardScreen from '../screens/farmer/FarmerDashboardScreen';
import MyCropsScreen from '../screens/farmer/MyCropsScreen';
import FarmerContractsScreen from '../screens/farmer/FarmerContractsScreen';
import FarmerPaymentsScreen from '../screens/farmer/FarmerPaymentsScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
import ChatList from '../components/chat/ChatList';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { getNegotiationList } from '../services/messageService';
import { useFocusEffect } from '@react-navigation/native';

const Tab = createBottomTabNavigator();

const getIcon = (routeName, focused) => {
  const icons = {
    Dashboard: focused ? '🏠' : '🏠',
    MyCrops: focused ? '🌾' : '🌾',
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
    MyCrops: 'My Crops',
    Contracts: 'Contracts',
    Payments: 'Payments',
    Profile: 'Profile',
    Chats: 'Chats'
  };
  return labels[routeName] || routeName;
};

function ChatsScreen({ navigation }) {
  const { user, userRole } = useAuth();
  const { colors } = useTheme();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadChats();
    }, [])
  );

  const loadChats = async () => {
    setLoading(true);
    try {
      const data = await getNegotiationList(user.uid, userRole);
      setChats(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleChatPress = (chat) => {
    navigation.navigate('Negotiation', {
      negotiationId: chat.id,
      cropId: chat.cropId,
      cropName: chat.cropName,
      farmerId: chat.farmerId,
      farmerName: chat.farmerName,
      originalPrice: chat.originalPrice,
      maxQuantity: chat.maxQuantity,
      proposedPrice: chat.proposedPrice,
      proposedQuantity: chat.proposedQuantity,
      buyerId: chat.buyerId
    });
  };

  return (
    <View style={[styles.chatContainer, { backgroundColor: colors.background }]}>
      <ChatList 
        chats={chats} 
        loading={loading} 
        onChatPress={handleChatPress} 
      />
    </View>
  );
}

export default function FarmerTabNavigator() {
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
      <Tab.Screen name="Dashboard" component={FarmerDashboardScreen} />
      <Tab.Screen name="MyCrops" component={MyCropsScreen} />
      <Tab.Screen name="Contracts" component={FarmerContractsScreen} />
      <Tab.Screen name="Payments" component={FarmerPaymentsScreen} />
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