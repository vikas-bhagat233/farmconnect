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

const QUESTIONS = [
  'What is your mother\'s maiden name?',
  'What was your first pet\'s name?',
  'What is your favorite teacher\'s name?',
  'What city were you born in?',
  'What is your childhood nickname?'
];

export default function SecurityQuestionsScreen({ navigation, route }) {
  const [selectedQuestion, setSelectedQuestion] = useState(QUESTIONS[0]);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!answer) {
      Alert.alert('Error', 'Please answer the security question');
      return;
    }

    setLoading(true);
    // Store security question and answer in Firebase
    // For demo, just navigate
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Success',
        'Answer verified. You can now reset your password.',
        [{ text: 'OK', onPress: () => navigation.navigate('ResetPassword') }]
      );
    }, 1000);
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
        <Text style={styles.questionLabel}>Security Question</Text>
        <TouchableOpacity style={styles.questionSelector}>
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