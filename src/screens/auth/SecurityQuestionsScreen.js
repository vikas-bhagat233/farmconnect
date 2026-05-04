import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';

import { resetPassword, resetPasswordWithSecurity } from '../../services/authService';

const QUESTIONS = [
  'What is your mother\'s maiden name?',
  'What was your first pet\'s name?',
  'What is your favorite teacher\'s name?',
  'What city were you born in?',
  'What is your childhood nickname?'
];

export default function SecurityQuestionsScreen({ navigation, route }) {
  const [selectedQuestion, setSelectedQuestion] = useState(QUESTIONS[0]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [email, setEmail] = useState(route?.params?.email || '');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!email || !answer) {
      Alert.alert('Error', 'Please answer the security question');
      return;
    }

    setLoading(true);
    const verify = await resetPasswordWithSecurity(email, selectedQuestion, answer);
    if (!verify.success) {
      setLoading(false);
      Alert.alert('Error', verify.error || 'Security answer incorrect');
      return;
    }

    const reset = await resetPassword(email);
    setLoading(false);
    if (!reset.success) {
      Alert.alert('Error', reset.error || 'Failed to send reset email');
      return;
    }

    Alert.alert(
      'Success',
      'Password reset email sent. Check your inbox.',
      [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Security Verification</Text>
        <Text style={styles.subtitle}>
          Answer your security question to reset password
        </Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.questionLabel}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.questionLabel}>Security Question</Text>
        <TouchableOpacity
          style={styles.questionSelector}
          onPress={() => {
            const nextIndex = (questionIndex + 1) % QUESTIONS.length;
            setQuestionIndex(nextIndex);
            setSelectedQuestion(QUESTIONS[nextIndex]);
          }}
        >
          <Text style={styles.selectedQuestion}>{selectedQuestion}</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Your answer"
          value={answer}
          onChangeText={setAnswer}
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={styles.verifyButton}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.verifyButtonText}>Verify & Reset Password</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.backText}>Back to Login</Text>
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
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    paddingHorizontal: 30,
  },
  questionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  questionSelector: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedQuestion: {
    fontSize: 14,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  verifyButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backText: {
    textAlign: 'center',
    color: '#666',
  },
});