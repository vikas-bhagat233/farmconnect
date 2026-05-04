import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

export default function MarketPriceChart({
  data,
  cropName,
  currentPrice,
  marketPrice
}) {
  const chartData = {
    labels: data?.labels || ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        data: data?.prices || [100, 110, 105, 115],
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 2
      }
    ]
  };

  const chartConfig = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#4CAF50'
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Market Price Trend</Text>
      <Text style={styles.cropName}>{cropName}</Text>
      
      <View style={styles.priceComparison}>
        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>Current Price</Text>
          <Text style={styles.currentPrice}>₹{currentPrice}/kg</Text>
        </View>
        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>Market Average</Text>
          <Text style={styles.marketPrice}>₹{marketPrice}/kg</Text>
        </View>
      </View>

      {data && (
        <LineChart
          data={chartData}
          width={width - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          formatYLabel={(value) => `₹${value}`}
        />
      )}

      <View style={styles.insights}>
        <Text style={styles.insightsTitle}>Price Insights</Text>
        {currentPrice < marketPrice ? (
          <Text style={styles.insightsText}>
            ✅ Current price is {((marketPrice - currentPrice) / marketPrice * 100).toFixed(0)}% below market average. Great deal!
          </Text>
        ) : currentPrice > marketPrice ? (
          <Text style={styles.insightsText}>
            ⚠️ Price is {((currentPrice - marketPrice) / marketPrice * 100).toFixed(0)}% above market average
          </Text>
        ) : (
          <Text style={styles.insightsText}>
            📊 Price is at market average
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    margin: 10,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  cropName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 15,
  },
  priceComparison: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  priceCard: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  currentPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  marketPrice: {
    fontSize: 16,
    color: '#FF9800',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  insights: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  insightsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  insightsText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
});