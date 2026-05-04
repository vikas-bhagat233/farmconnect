import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from '../screens/common/ProfileScreen';
import EditProfileScreen from '../screens/common/EditProfileScreen';
import SettingsScreen from '../screens/common/SettingsScreen';
import NotificationScreen from '../screens/common/NotificationScreen';
import FarmerProfileScreen from '../screens/buyer/FarmerProfileScreen';

const Stack = createStackNavigator();

export default function ProfileStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen} 
        options={{ headerShown: true, title: 'Edit Profile' }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ headerShown: true, title: 'Settings' }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationScreen} 
        options={{ headerShown: true, title: 'Notifications' }}
      />
      <Stack.Screen 
        name="FarmerProfile" 
        component={FarmerProfileScreen} 
        options={{ headerShown: true, title: 'Farmer Profile' }}
      />
    </Stack.Navigator>
  );
}