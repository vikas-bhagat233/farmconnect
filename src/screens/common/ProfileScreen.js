import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { getUserProfile, getFarmerStats, getBuyerStats, subscribeToBuyerStats, subscribeToFarmerStats } from '../../services/firestoreService';

export default function ProfileScreen({ navigation }) {
  const { user, userRole, logout, saveUserRole } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    contracts: 0,
    crops: 0,
    rating: 0
  });

  useFocusEffect(
    useCallback(() => {
      if (!user?.uid) return;
      loadProfile();
      let unsubscribe;
      if (userRole === 'farmer') {
        unsubscribe = subscribeToFarmerStats(user.uid, (newStats) => {
          setStats(prev => ({ 
            ...prev, 
            contracts: newStats.activeContracts + newStats.completedContracts,
            value: newStats.totalEarnings
          }));
        });
      } else {
        unsubscribe = subscribeToBuyerStats(user.uid, (newStats) => {
          setStats(prev => ({ 
            ...prev, 
            contracts: newStats.activeContracts + newStats.completedContracts,
            value: newStats.totalSpent
          }));
        });
      }
      return () => unsubscribe && unsubscribe();
    }, [userRole])
  );

  const loadProfile = async () => {
    if (!user?.uid) return;
    const profileData = await getUserProfile(user.uid);
    setProfile(profileData);
    
    // Fetch live stats
    let liveStats = { contracts: 0, crops: 0, rating: profileData?.rating || 4.8 };
    if (profileData?.role === 'farmer') {
      const farmerStats = await getFarmerStats(user.uid);
      liveStats.contracts = farmerStats.activeContracts + farmerStats.completedContracts;
      liveStats.crops = farmerStats.totalCrops;
      liveStats.value = farmerStats.totalEarnings;
      liveStats.valueLabel = 'Earnings';
    } else {
      const buyerStats = await getBuyerStats(user.uid);
      liveStats.contracts = buyerStats.activeContracts + buyerStats.completedContracts;
      liveStats.value = buyerStats.totalSpent;
      liveStats.valueLabel = 'Invested';
    }
    
    setStats(liveStats);
    setLoading(false);
  };

  const handleLogout = () => {
    Alert.alert(
      t('logout') || 'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: t('logout') || 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            // No need to navigate, AppNavigator handles user null state
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Profile Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {user?.photoURL ? (
          <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
        ) : (
          <View style={[styles.profileImage, { backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ fontSize: 40, color: '#fff' }}>{user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}</Text>
          </View>
        )}
        <Text style={[styles.name, { color: colors.text }]}>{user?.displayName || 'User'}</Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email}</Text>
        <Text style={styles.role}>{profile?.role === 'farmer' ? '👨‍🌾 ' + (t('farmer') || 'Farmer') : '🛒 ' + (t('buyer') || 'Buyer')}</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Section with Live Data */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{stats.contracts}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('contracts')}</Text>
        </View>
        {profile?.role === 'farmer' ? (
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{stats.crops}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('crops')}</Text>
          </View>
        ) : (
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statValue, { color: '#4CAF50' }]}>₹{stats.value?.toLocaleString()}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stats.valueLabel}</Text>
          </View>
        )}
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statValue, { color: '#FFC107' }]}>⭐ {stats.rating}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rating</Text>
        </View>
      </View>

      {/* Info Sections */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Information</Text>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Phone:</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{profile?.phone || 'Not provided'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Email:</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{user?.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Location:</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{profile?.location || 'Not provided'}</Text>
        </View>
      </View>

      {profile?.role === 'farmer' && (
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Farm Details</Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{t('farmName') || 'Farm Name'}:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{profile?.farmName || t('notProvided') || 'Not provided'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{t('farmSize') || 'Farm Size'}:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{profile?.farmSize || t('notProvided') || 'Not provided'}</Text>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.settingsButton, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={[styles.settingsButtonText, { color: colors.text }]}>⚙️ {t('settings') || 'Settings'}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.settingsButton, { backgroundColor: '#FF9800' }]}
          onPress={() => {
            const newRole = profile?.role === 'farmer' ? 'buyer' : 'farmer';
            Alert.alert(
              t('switchRole') || 'Switch Role',
              `${t('switchRolePrompt') || 'Are you sure you want to switch your account to'} ${newRole}?`,
              [
                { text: t('cancel') || 'Cancel', style: 'cancel' },
                { 
                  text: t('switch') || 'Switch', 
                  onPress: async () => {
                    await saveUserRole(newRole);
                    Alert.alert(t('roleSwitched') || 'Role Switched', `${t('roleSwitchedMessage') || 'Your account is now set to'} "${newRole}". ${t('dashboardWillUpdate') || 'The dashboard will update automatically.'}`);
                    loadProfile();
                  }
                }
              ]
            );
          }}
        >
          <Text style={[styles.settingsButtonText, { color: '#fff', fontWeight: 'bold' }]}>🔄 {t('switchTo') || 'Switch to'} {profile?.role === 'farmer' ? (t('buyer') || 'Buyer') : (t('farmer') || 'Farmer')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>🚪 {t('logout') || 'Logout'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  role: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 5,
    fontWeight: 'bold',
  },
  editButton: {
    marginTop: 15,
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 5,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  section: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  infoLabel: {
    width: 100,
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  actionsContainer: {
    padding: 10,
    marginBottom: 30,
  },
  settingsButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
  },
  settingsButtonText: {
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});