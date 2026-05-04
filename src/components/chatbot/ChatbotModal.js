import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { GoogleGenAI } from '@google/genai';
import ChatbotMessage from './ChatbotMessage';
import LanguageSelector from './LanguageSelector';

const ai = new GoogleGenAI({ apiKey: 'YOUR_GEMINI_API_KEY' });

export default function ChatbotModal({ visible, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Hello! I am your farming assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const flatListRef = useRef();

  const translations = {
    en: {
      placeholder: 'Ask me about crop prices, farming tips, market trends...',
      title: 'AI Farming Assistant'
    },
    hi: {
      placeholder: 'फसल की कीमतों, खेती के टिप्स, बाजार के रुझान के बारे में पूछें...',
      title: 'एआई कृषि सहायक'
    },
    mr: {
      placeholder: 'पीक किमती, शेती टिप्स, बाजार ट्रेंड विषयी विचारा...',
      title: 'एआय शेती सहाय्यक'
    }
  };

  const getGeminiResponse = async (userMessage) => {
    try {
      const prompt = `You are a helpful farming assistant for Indian farmers. Respond in ${language === 'en' ? 'English' : language === 'hi' ? 'Hindi' : 'Marathi'}. User question: ${userMessage}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: prompt,
      });
      
      return response.text;
    } catch (error) {
      console.error('Gemini API Error:', error);
      return getFallbackResponse(userMessage, language);
    }
  };

  const getFallbackResponse = (question, lang) => {
    const responses = {
      en: {
        price: 'Current market prices vary by crop. Would you like specific price information?',
        weather: 'Check local weather forecasts for best farming conditions.',
        pest: 'For pest control, consult your local agricultural extension office.',
        default: 'I appreciate your question. For detailed information, please consult with local agricultural experts.'
      },
      hi: {
        price: 'वर्तमान बाजार मूल्य फसल के अनुसार भिन्न होते हैं। क्या आप विशिष्ट मूल्य जानकारी चाहेंगे?',
        weather: 'सर्वोत्तम कृषि स्थितियों के लिए स्थानीय मौसम पूर्वानुमान देखें।',
        pest: 'कीट नियंत्रण के लिए, अपने स्थानीय कृषि विस्तार कार्यालय से परामर्श लें।',
        default: 'आपके प्रश्न की सराहना करता हूं। विस्तृत जानकारी के लिए, कृपया स्थानीय कृषि विशेषज्ञों से परामर्श लें।'
      },
      mr: {
        price: 'सध्याच्या बाजारभाव पिकानुसार बदलतात. तुम्हाला विशिष्ट किंमत माहिती हवी आहे का?',
        weather: 'सर्वोत्तम शेती परिस्थितीसाठी स्थानिक हवामान अंदाज तपासा.',
        pest: 'कीटक नियंत्रणासाठी, तुमच्या स्थानिक कृषि विस्तार कार्यालयाचा सल्ला घ्या.',
        default: 'तुमच्या प्रश्नाचे कौतुक करतो. तपशीलवार माहितीसाठी, कृपया स्थानिक कृषी तज्ञांचा सल्ला घ्या.'
      }
    };
    
    if (question.includes('price') || question.includes('कीमत') || question.includes('किंमत')) {
      return responses[lang].price;
    }
    if (question.includes('weather') || question.includes('मौसम') || question.includes('हवामान')) {
      return responses[lang].weather;
    }
    if (question.includes('pest') || question.includes('कीट') || question.includes('कीटक')) {
      return responses[lang].pest;
    }
    return responses[lang].default;
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);
    
    const responseText = await getGeminiResponse(inputText);
    
    const botMessage = {
      id: (Date.now() + 1).toString(),
      text: responseText,
      isUser: false,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, botMessage]);
    setLoading(false);
  };

  const renderMessage = ({ item }) => (
    <ChatbotMessage message={item} language={language} />
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{translations[language].title}</Text>
          <LanguageSelector language={language} setLanguage={setLanguage} />
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={translations[language].placeholder}
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              multiline
              editable={!loading}
            />
            <TouchableOpacity 
              style={[styles.sendButton, (!inputText.trim() || loading) && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!inputText.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.sendText}>➤</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#4CAF50',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  closeText: {
    fontSize: 20,
    color: '#fff',
  },
  messagesList: {
    padding: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendText: {
    fontSize: 18,
    color: '#fff',
  },
});