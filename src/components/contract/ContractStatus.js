import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator
} from 'react-native';

export default function ContractStatus({ status, steps = null }) {
  const defaultSteps = [
    { key: 'created', label: 'Created', icon: '📝' },
    { key: 'accepted', label: 'Accepted', icon: '✓' },
    { key: 'advance_paid', label: 'Advance Paid', icon: '💰' },
    { key: 'delivered', label: 'Delivered', icon: '🚚' },
    { key: 'completed', label: 'Completed', icon: '✅' }
  ];

  const statusSteps = steps || defaultSteps;
  const currentIndex = statusSteps.findIndex(step => step.key === status);

  const getStepStatus = (index) => {
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contract Progress</Text>
      <View style={styles.stepsContainer}>
        {statusSteps.map((step, index) => {
          const stepStatus = getStepStatus(index);
          
          return (
            <View key={step.key} style={styles.step}>
              <View style={styles.stepIconContainer}>
                <View style={[
                  styles.stepIcon,
                  stepStatus === 'completed' && styles.completedIcon,
                  stepStatus === 'current' && styles.currentIcon
                ]}>
                  <Text style={styles.stepIconText}>
                    {stepStatus === 'completed' ? '✓' : step.icon}
                  </Text>
                </View>
                {index < statusSteps.length - 1 && (
                  <View style={[
                    styles.stepLine,
                    stepStatus === 'completed' && styles.completedLine
                  ]} />
                )}
              </View>
              <Text style={[
                styles.stepLabel,
                stepStatus === 'completed' && styles.completedLabel,
                stepStatus === 'current' && styles.currentLabel
              ]}>
                {step.label}
              </Text>
            </View>
          );
        })}
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
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  step: {
    flex: 1,
    alignItems: 'center',
  },
  stepIconContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  completedIcon: {
    backgroundColor: '#4CAF50',
  },
  currentIcon: {
    backgroundColor: '#FF9800',
    borderWidth: 3,
    borderColor: '#FFC107',
  },
  stepIconText: {
    fontSize: 18,
    color: '#fff',
  },
  stepLine: {
    position: 'absolute',
    top: 20,
    left: 30,
    right: -30,
    height: 2,
    backgroundColor: '#e0e0e0',
    zIndex: 1,
  },
  completedLine: {
    backgroundColor: '#4CAF50',
  },
  stepLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  completedLabel: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  currentLabel: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
});