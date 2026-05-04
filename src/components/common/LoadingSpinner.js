import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet
} from 'react-native';

export default function LoadingSpinner({
  size = 'large',
  color = '#4CAF50',
  text = 'Loading...',
  fullScreen = false
}) {
  const Spinner = () => (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );

  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        <Spinner />
      </View>
    );
  }

  return <Spinner />;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
});