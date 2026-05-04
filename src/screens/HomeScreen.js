import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import FarmerDashboardScreen from './farmer/FarmerDashboardScreen';
import BuyerDashboardScreen from './buyer/BuyerDashboardScreen';

export default function HomeScreen({ navigation }) {
  const { userRole, loading } = useAuth();

  useEffect(() => {
    if (!loading && !userRole) {
      navigation.replace('RoleSelection');
    }
  }, [userRole, loading]);

  if (loading) {
    return null;
  }

  if (userRole === 'farmer') {
    return <FarmerDashboardScreen navigation={navigation} />;
  } else if (userRole === 'buyer') {
    return <BuyerDashboardScreen navigation={navigation} />;
  }

  return null;
}