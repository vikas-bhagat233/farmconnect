import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';

import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';


export default function BottomTabBar({ state, descriptors, navigation }) {
  const { userRole } = useAuth();
  const { t } = useLanguage();

  const getIcon = (routeName, isFocused) => {
    const icons = {
      Dashboard: isFocused ? '🏠' : '🏠',
      Marketplace: isFocused ? '🛒' : '🛒',
      Contracts: isFocused ? '📄' : '📄',
      Payments: isFocused ? '💰' : '💰',
      Profile: isFocused ? '👤' : '👤',
      MyCrops: isFocused ? '🌾' : '🌾',
      History: isFocused ? '📜' : '📜'
    };
    return icons[routeName] || '📱';
  };

  const getLabel = (routeName) => {
    const labels = {
      Dashboard: t('home'),
      Marketplace: t('market'),
      Contracts: t('contracts'),
      Payments: t('payments'),
      Profile: t('profile'),
      MyCrops: t('crops'),
      History: t('history'),
      Chat: t('chat'),
      Notifications: t('notifications'),
    };
    return labels[routeName] || t(routeName) || routeName;
  };

  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = getLabel(route.name);
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={index}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <Text style={[styles.icon, isFocused && styles.activeIcon]}>
              {getIcon(route.name, isFocused)}
            </Text>
            <Text style={[styles.label, isFocused && styles.activeLabel]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 8,
    paddingBottom: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
    color: '#999',
  },
  activeIcon: {
    color: '#4CAF50',
  },
  label: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  activeLabel: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});