import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ChatScreen from '../screens/common/ChatScreen';
import ChatList from '../components/chat/ChatList';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Stack = createStackNavigator();

function ChatListScreen() {
  const navigation = useNavigation();
  const [chats, setChats] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const handleChatPress = (chat) => {
    navigation.navigate('ChatDetail', {
      userId: chat.userId,
      userName: chat.userName,
      userRole: chat.userRole
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>
      <ChatList 
        chats={chats} 
        loading={loading} 
        onChatPress={handleChatPress}
      />
    </View>
  );
}

export default function ChatStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatList" component={ChatListScreen} />
      <Stack.Screen 
        name="ChatDetail" 
        component={ChatScreen} 
        options={{ headerShown: true }} 
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
});