import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { getFarmerStats, getRecentCrops } from '../../services/firestoreService';
import ChatbotModal from '../../components/chatbot/ChatbotModal';

export default function FarmerDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    totalCrops: 0,
    activeContracts: 0,
    completedContracts: 0,
    totalEarnings: 0
  });
  const [recentCrops, setRecentCrops] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const loadDashboardData = async () => {
    const statsData = await getFarmerStats(user.uid);
    setStats(statsData);
    const crops = await getRecentCrops(user.uid);
    setRecentCrops(crops);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1 }}>
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.welcomeText, { color: colors.text }]}>{t('welcome')}, {user?.displayName || 'Farmer'}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profileImage, { backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={{ fontSize: 20, color: '#fff' }}>{user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={styles.statValue}>{stats.totalCrops}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('total')} {t('crops')}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={styles.statValue}>{stats.activeContracts}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('active')} {t('contracts')}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={styles.statValue}>{stats.completedContracts}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('completed')}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={styles.statValue}>₹{stats.totalEarnings}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Earnings</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('AddCrop')}
      >
        <Text style={styles.addButtonText}>+ {t('addCrop')}</Text>
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent {t('crops')}</Text>
      {recentCrops.map((crop) => (
        <TouchableOpacity 
          key={crop.id} 
          style={[styles.cropCard, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate('CropDetail', { cropId: crop.id })}
        >
          <Image source={{ uri: crop.images[0] }} style={styles.cropImage} />
          <View style={styles.cropInfo}>
            <Text style={[styles.cropName, { color: colors.text }]}>{crop.name}</Text>
            <Text style={styles.cropPrice}>₹{crop.price}/kg</Text>
            <Text style={[styles.cropQuantity, { color: colors.textSecondary }]}>{crop.quantity} kg available</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
      <TouchableOpacity 
        style={styles.chatbotFab} 
        onPress={() => setShowChatbot(true)}
      >
        <Text style={styles.chatbotFabText}>🤖</Text>
      </TouchableOpacity>
      <ChatbotModal visible={showChatbot} onClose={() => setShowChatbot(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  statCard: {
    backgroundColor: '#fff',
    width: '45%',
    margin: '2.5%',
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
  addButton: {
    backgroundColor: '#4CAF50',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 10,
    color: '#333',
  },
  cropCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    elevation: 2,
  },
  cropImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  cropInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  cropName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cropPrice: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 5,
  },
  cropQuantity: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  chatbotFab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#2196F3',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  chatbotFabText: {
    fontSize: 30,
  },
});