import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  TextInput
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { getFarmerStats, getRecentCrops } from '../../services/firestoreService';
import { getWeatherData } from '../../services/weatherService';
import ChatbotModal from '../../components/chatbot/ChatbotModal';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default function FarmerDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
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
  const [weather, setWeather] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCrops, setFilteredCrops] = useState([]);

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
    setFilteredCrops(crops);
    const weatherData = await getWeatherData(28.6139, 77.2090);
    setWeather(weatherData);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredCrops(recentCrops);
      return;
    }
    const filtered = recentCrops.filter(crop => 
      crop.name.toLowerCase().includes(text.toLowerCase()) ||
      crop.category?.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredCrops(filtered);
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
        <View>
          <Text style={[styles.welcomeText, { color: colors.text }]}>{t('welcome')}, {user?.displayName || (t('farmer') || 'Farmer')}</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profileImage, { backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={{ fontSize: 20, color: '#fff' }}>{user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'F'}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <View style={[styles.searchBar, { backgroundColor: isDark ? colors.background : '#f0f0f0' }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={t('searchPlaceholder')}
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {/* Weather Card */}
      {weather && (
        <View style={[styles.weatherCard, { backgroundColor: colors.primary }]}>
          <View style={styles.weatherInfo}>
            <View>
              <Text style={styles.weatherTemp}>{weather.temp}°C</Text>
              <Text style={styles.weatherCondition}>{weather.condition}</Text>
            </View>
            <Text style={styles.weatherIcon}>☀️</Text>
          </View>
          <View style={styles.forecastContainer}>
            {weather.forecast.map((f, i) => (
              <View key={i} style={styles.forecastItem}>
                <Text style={styles.forecastDay}>{f.day}</Text>
                <Text style={styles.forecastIcon}>{f.icon}</Text>
                <Text style={styles.forecastTemp}>{f.temp}°</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={styles.statValue}>{stats.totalCrops}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('total')} {t('crops')}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={styles.statValue}>{stats.activeContracts}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('active')} {t('contracts')}</Text>
        </View>
      </View>

      {/* Earnings Chart */}
      <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text, marginLeft: 0 }]}>{t('earningsOverview')}</Text>
        <LineChart
          data={{
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            datasets: [{
              data: [
                Math.random() * 5000,
                Math.random() * 5000,
                Math.random() * 10000,
                Math.random() * 8000,
                stats.totalEarnings * 0.4,
                stats.totalEarnings
              ]
            }]
          }}
          width={screenWidth - 60}
          height={180}
          chartConfig={{
            backgroundColor: colors.card,
            backgroundGradientFrom: colors.card,
            backgroundGradientTo: colors.card,
            decimalPlaces: 0,
            color: (opacity = 1) => colors.primary,
            labelColor: (opacity = 1) => colors.textSecondary,
            style: { borderRadius: 16 },
            propsForDots: { r: "6", strokeWidth: "2", stroke: colors.primary }
          }}
          bezier
          style={{ marginVertical: 8, borderRadius: 16 }}
        />
      </View>

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('AddCrop')}
      >
        <Text style={styles.addButtonText}>+ {t('addCrop')}</Text>
      </TouchableOpacity>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('recentCrops')}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('MyCrops')}>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>{t('seeAll')}</Text>
        </TouchableOpacity>
      </View>
      {filteredCrops.map((crop) => (
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
  weatherCard: {
    margin: 20,
    padding: 20,
    borderRadius: 20,
    elevation: 4,
  },
  weatherInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  weatherTemp: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  weatherCondition: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
  },
  weatherIcon: {
    fontSize: 50,
  },
  forecastContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 15,
  },
  forecastItem: {
    alignItems: 'center',
  },
  forecastDay: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 5,
  },
  forecastIcon: {
    fontSize: 18,
    marginBottom: 5,
  },
  forecastTemp: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  chartCard: {
    margin: 20,
    padding: 15,
    borderRadius: 20,
    elevation: 2,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 15,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
});