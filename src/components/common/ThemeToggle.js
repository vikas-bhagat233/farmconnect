import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle({ style = {} }) {
  const { theme, toggleTheme } = useTheme();
  const [animation] = React.useState(new Animated.Value(theme === 'dark' ? 1 : 0));

  React.useEffect(() => {
    Animated.spring(animation, {
      toValue: theme === 'dark' ? 1 : 0,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start();
  }, [theme]);

  const interpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 28],
  });

  return (
    <TouchableOpacity
      style={[styles.container, theme === 'dark' ? styles.darkContainer : styles.lightContainer, style]}
      onPress={toggleTheme}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.toggle,
          {
            transform: [{ translateX: interpolate }],
          },
        ]}
      />
      <Text style={[styles.icon, styles.sunIcon]}>☀️</Text>
      <Text style={[styles.icon, styles.moonIcon]}>🌙</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 60,
    height: 32,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    position: 'relative',
  },
  lightContainer: {
    backgroundColor: '#f0f0f0',
  },
  darkContainer: {
    backgroundColor: '#333',
  },
  toggle: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4CAF50',
    zIndex: 1,
  },
  icon: {
    fontSize: 16,
    zIndex: 0,
  },
  sunIcon: {
    opacity: 1,
  },
  moonIcon: {
    opacity: 1,
  },
});