import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import FarmerTabNavigator from './FarmerTabNavigator';
import BuyerTabNavigator from './BuyerTabNavigator';
import ChatScreen from '../screens/common/ChatScreen';
import ContractDetailsScreen from '../screens/common/ContractDetailsScreen';
import PaymentScreen from '../screens/common/PaymentScreen';
import ContractPDFViewer from '../screens/common/ContractPDFViewer';
import NotificationScreen from '../screens/common/NotificationScreen';
import EditProfileScreen from '../screens/common/EditProfileScreen';
import SettingsScreen from '../screens/common/SettingsScreen';
import FarmerProfileScreen from '../screens/buyer/FarmerProfileScreen';
import CropDetailScreen from '../screens/buyer/CropDetailScreen';
import NegotiationScreen from '../screens/buyer/NegotiationScreen';
import AddCropScreen from '../screens/farmer/AddCropScreen';
import EditCropScreen from '../screens/farmer/EditCropScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : userRole === 'farmer' ? (
        <>
          <Stack.Screen name="Main" component={FarmerTabNavigator} />
          <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: true, title: 'Chat' }} />
          <Stack.Screen name="ContractDetails" component={ContractDetailsScreen} options={{ headerShown: true, title: 'Contract Details' }} />
          <Stack.Screen name="Payment" component={PaymentScreen} options={{ headerShown: true, title: 'Payment' }} />
          <Stack.Screen name="ContractPDF" component={ContractPDFViewer} options={{ headerShown: true, title: 'Contract PDF' }} />
          <Stack.Screen name="Notifications" component={NotificationScreen} options={{ headerShown: true, title: 'Notifications' }} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: true, title: 'Edit Profile' }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: true, title: 'Settings' }} />
          <Stack.Screen name="AddCrop" component={AddCropScreen} options={{ headerShown: true, title: 'Add New Crop' }} />
          <Stack.Screen name="EditCrop" component={EditCropScreen} options={{ headerShown: true, title: 'Edit Crop' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={BuyerTabNavigator} />
          <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: true, title: 'Chat' }} />
          <Stack.Screen name="ContractDetails" component={ContractDetailsScreen} options={{ headerShown: true, title: 'Contract Details' }} />
          <Stack.Screen name="Payment" component={PaymentScreen} options={{ headerShown: true, title: 'Payment' }} />
          <Stack.Screen name="ContractPDF" component={ContractPDFViewer} options={{ headerShown: true, title: 'Contract PDF' }} />
          <Stack.Screen name="Notifications" component={NotificationScreen} options={{ headerShown: true, title: 'Notifications' }} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: true, title: 'Edit Profile' }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: true, title: 'Settings' }} />
          <Stack.Screen name="FarmerProfile" component={FarmerProfileScreen} options={{ headerShown: true, title: 'Farmer Profile' }} />
          <Stack.Screen name="CropDetail" component={CropDetailScreen} options={{ headerShown: true, title: 'Crop Details' }} />
          <Stack.Screen name="Negotiation" component={NegotiationScreen} options={{ headerShown: true, title: 'Negotiate' }} />
        </>
      )}
    </Stack.Navigator>
  );
}