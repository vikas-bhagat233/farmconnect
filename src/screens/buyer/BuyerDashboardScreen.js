import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ImageBackground,
  Dimensions,
  TextInput,
  Image
} from 'react-native';
import { getMarketplaceCrops, getFeaturedCrops } from '../../services/cropService';
import { getBuyerStats, subscribeToBuyerStats } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';
import ChatbotModal from '../../components/chatbot/ChatbotModal';
import { BarChart } from 'react-native-chart-kit';


const screenWidth = Dimensions.get('window').width;

export default function BuyerDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { unreadCount } = useNotification();
  const [featuredCrops, setFeaturedCrops] = useState([]);
  const [stats, setStats] = useState({
    activeContracts: 0,
    completedContracts: 0,
    totalSpent: 0
  });
  const [refreshing, setRefreshing] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCrops, setFilteredCrops] = useState([]);

  useFocusEffect(
    useCallback(() => {
      if (!user?.uid) return;
      loadData();
      const unsubscribe = subscribeToBuyerStats(user.uid, (newStats) => {
        setStats(newStats);
      });
      return () => unsubscribe();
    }, [])
  );

  const loadData = async () => {
    if (!user?.uid) return;
    const crops = await getMarketplaceCrops();
    setFeaturedCrops(crops.slice(0, 5));
    setFilteredCrops(crops.slice(0, 5));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredCrops(featuredCrops);
      return;
    }
    const filtered = featuredCrops.filter(crop => 
      crop.name.toLowerCase().includes(text.toLowerCase()) ||
      crop.farmerName?.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredCrops(filtered);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Hero Header Section */}
        <ImageBackground 
          source={{ uri: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80' }}
          style={styles.heroHeader}
        >
          <View style={styles.heroOverlay}>
            <View style={styles.topBar}>
              <View>
                <Text style={styles.greetingText}>{t('welcome')},</Text>
                <Text style={styles.userNameText}>{user?.displayName || (t('buyer') || 'Buyer')}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={{ position: 'relative', marginRight: 12 }}>
                  <Text style={{ fontSize: 26 }}>🔔</Text>
                  {unreadCount > 0 && (
                    <View style={{ position: 'absolute', top: -4, right: -4, backgroundColor: '#f44336', borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 3 }}>
                      <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{unreadCount > 99 ? '99+' : String(unreadCount)}</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.profileContainer}>
                  {user?.photoURL ? (
                    <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
                  ) : (
                    <View style={styles.profilePlaceholder}>
                      <Text style={styles.profileInitial}>{user?.displayName?.charAt(0).toUpperCase() || 'B'}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.searchBarWrapper}>
              <View style={styles.searchBarInner}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholder={t('searchPlaceholder')}
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={handleSearch}
                />
              </View>
            </View>
          </View>
        </ImageBackground>

        {/* Stats Section with Glassmorphism feel */}
        <View style={styles.glassStatsContainer}>
          <View style={[styles.glassStatCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statIconCircle, { backgroundColor: '#E3F2FD' }]}>
              <Text style={styles.statIconEmoji}>📄</Text>
            </View>
            <Text style={[styles.glassStatValue, { color: colors.text }]}>{stats.activeContracts}</Text>
            <Text style={[styles.glassStatLabel, { color: colors.textSecondary }]}>{t('activeDeals')}</Text>
          </View>
          
          <View style={[styles.glassStatCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statIconCircle, { backgroundColor: '#E8F5E9' }]}>
              <Text style={styles.statIconEmoji}>💰</Text>
            </View>
            <Text style={[styles.glassStatValue, { color: colors.text }]}>₹{stats.totalSpent.toLocaleString()}</Text>
            <Text style={[styles.glassStatLabel, { color: colors.textSecondary }]}>{t('totalInvested')}</Text>
          </View>
        </View>

        {/* Action Required Alert */}
        {stats.pendingPayments?.length > 0 && (
          <View style={styles.alertContainer}>
            <View style={styles.alertBox}>
              <Text style={styles.alertEmoji}>💳</Text>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>
                  {t('actionRequired') || 'Action Required'}: {stats.pendingPayments.length} {t('payments') || 'Payment(s)'}
                </Text>
                <Text style={styles.alertMessage}>
                  {t('payAdvanceReminder') || 'Please pay the 30% advance to finalize your contract for'} {stats.pendingPayments[0].cropName}.
                </Text>
                <TouchableOpacity 
                  style={styles.alertButton} 
                  onPress={() => navigation.navigate('Payment', { 
                    contractId: stats.pendingPayments[0].id,
                    amount: stats.pendingPayments[0].advanceAmount,
                    type: 'advance'
                  })}
                >
                  <Text style={styles.alertButtonText}>{t('payAdvanceNow') || 'Pay Advance Now'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Quick Actions Grid */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('quickActions')}</Text>
        </View>
        <View style={styles.actionGrid}>
          {[
            { title: t('market'), icon: '🛒', color: '#FFF3E0', screen: 'Marketplace' },
            { title: t('contracts'), icon: '📄', color: '#E8EAF6', screen: 'Contracts' },
            { title: t('chat'), icon: '💬', color: '#F1F8E9', screen: 'Chats' },
            { title: t('payments'), icon: '💳', color: '#FCE4EC', screen: 'Payments' }
          ].map((action, i) => (
            <TouchableOpacity 
              key={i} 
              style={[styles.actionCard, { backgroundColor: colors.card }]}
              onPress={() => navigation.navigate(action.screen)}
            >
              <View style={[styles.actionIconBox, { backgroundColor: action.color }]}>
                <Text style={styles.actionEmoji}>{action.icon}</Text>
              </View>
              <Text style={[styles.actionText, { color: colors.text }]}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Horizontal Featured Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('topPicks')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Marketplace')}>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>{t('seeAll')}</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.featuredCarousel}
        >
          {filteredCrops.map((crop) => (
            <TouchableOpacity 
              key={crop.id} 
              style={[styles.featuredCard, { backgroundColor: colors.card }]}
              onPress={() => navigation.navigate('CropDetail', { cropId: crop.id })}
            >
              <Image source={{ uri: crop.images?.[0] }} style={styles.featuredImage} />
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredBadgeText}>{t('newLabel') || 'New'}</Text>
              </View>
              <View style={styles.featuredInfo}>
                <Text style={[styles.featuredName, { color: colors.text }]} numberOfLines={1}>{crop.name}</Text>
                <Text style={styles.featuredPrice}>₹{crop.price}/kg</Text>
                <View style={styles.featuredFooter}>
                  <Text style={styles.featuredFarmer} numberOfLines={1}>👨‍🌾 {crop.farmerName}</Text>
                  <Text style={styles.featuredRating}>⭐ 4.8</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Analytics Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('spendingAnalysis')}</Text>
        </View>
        <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
          <BarChart
            data={{
              labels: [
                t('cropWheatShort') || 'Wht',
                t('cropRiceShort') || 'Rice',
                t('cropCornShort') || 'Corn',
                t('cropSoyShort') || 'Soy',
                t('cropTeaShort') || 'Tea'
              ],
              datasets: [{
                data: [
                  Math.max(20, stats.totalSpent * 0.02),
                  Math.max(30, stats.totalSpent * 0.03),
                  Math.max(10, stats.totalSpent * 0.01),
                  Math.max(25, stats.totalSpent * 0.025),
                  Math.max(15, stats.totalSpent * 0.015)
                ]
              }]
            }}
            width={screenWidth - 40}
            height={200}
            yAxisLabel="₹"
            chartConfig={{
              backgroundColor: colors.card,
              backgroundGradientFrom: colors.card,
              backgroundGradientTo: colors.card,
              color: (opacity = 1) => '#2196F3',
              labelColor: (opacity = 1) => colors.textSecondary,
              barPercentage: 0.6,
              style: { borderRadius: 16 },
            }}
            style={{ borderRadius: 16, alignSelf: 'center' }}
          />
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity 
        style={[styles.chatbotFab, { backgroundColor: colors.primary }]} 
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
  },
  heroHeader: {
    height: 220,
    width: '100%',
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 20,
    justifyContent: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  greetingText: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.9,
  },
  userNameText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileContainer: {
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 25,
    padding: 2,
  },
  profileImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  profilePlaceholder: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchBarWrapper: {
    width: '100%',
  },
  searchBarInner: {
    backgroundColor: '#fff',
    height: 50,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchPlaceholder: {
    color: '#999',
    fontSize: 15,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  glassStatsContainer: {
    flexDirection: 'row',
    padding: 20,
    marginTop: -30,
    justifyContent: 'space-between',
  },
  glassStatCard: {
    width: '48%',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statIconEmoji: {
    fontSize: 20,
  },
  glassStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  glassStatLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  actionCard: {
    width: (screenWidth - 60) / 2,
    margin: 10,
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
  },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionEmoji: {
    fontSize: 20,
  },
  actionText: {
    fontWeight: '600',
    fontSize: 14,
  },
  featuredCarousel: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  featuredCard: {
    width: 220,
    borderRadius: 25,
    marginRight: 15,
    overflow: 'hidden',
    elevation: 5,
    marginBottom: 10,
  },
  featuredImage: {
    width: '100%',
    height: 140,
  },
  featuredBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FF5252',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  featuredBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  featuredInfo: {
    padding: 12,
  },
  featuredName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  featuredPrice: {
    fontSize: 15,
    color: '#4CAF50',
    fontWeight: '700',
    marginTop: 2,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    alignItems: 'center',
  },
  featuredFarmer: {
    fontSize: 11,
    color: '#777',
    maxWidth: '70%',
  },
  featuredRating: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFC107',
  },
  chartCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 25,
    elevation: 4,
    marginBottom: 20,
  },
  chatbotFab: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  chatbotFabText: {
    fontSize: 32,
  },
  alertContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  alertBox: {
    backgroundColor: '#FFF3E0',
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 5,
    borderLeftColor: '#FF9800',
    elevation: 3,
  },
  alertEmoji: {
    fontSize: 24,
    marginRight: 15,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E65100',
  },
  alertMessage: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    marginBottom: 8,
  },
  alertButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  alertButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});