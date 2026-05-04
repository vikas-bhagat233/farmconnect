import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FarmerDashboardScreen from '../screens/farmer/FarmerDashboardScreen';
import MyCropsScreen from '../screens/farmer/MyCropsScreen';
import FarmerContractsScreen from '../screens/farmer/FarmerContractsScreen';
import FarmerPaymentsScreen from '../screens/farmer/FarmerPaymentsScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
import ChatList from '../components/chat/ChatList';
import { View, Text, StyleSheet } from 'react-native';

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

function ChatsScreen() {
  return (
    <View style={styles.chatContainer}>
      <ChatList 
        chats={[]} 
        loading={false} 
        onChatPress={() => {}} 
      />
    </View>
  );
}

export default function FarmerTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <Text style={styles.icon}>
            {getIcon(route.name, focused)}
          </Text>
        ),
        tabBarLabel: ({ focused }) => (
          <Text style={[styles.label, focused && styles.labelFocused]}>
            {getLabel(route.name)}
          </Text>
        ),
        tabBarStyle: styles.tabBar,
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