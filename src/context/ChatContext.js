import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { getChatList, getMessages, sendMessage, markMessagesAsRead } from '../services/messageService';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const intervalRef = useRef();

  useEffect(() => {
    if (user) {
      loadChats();
      intervalRef.current = setInterval(loadChats, 30000);
      return () => clearInterval(intervalRef.current);
    }
  }, [user]);

  const loadChats = async () => {
    if (!user) return;
    setLoading(true);
    const chatList = await getChatList(user.uid);
    setChats(chatList);
    setLoading(false);
  };

  const loadMessages = async (userId) => {
    if (!user || !userId) return;
    const messageList = await getMessages(user.uid, userId);
    setMessages(messageList);
    await markMessagesAsRead(user.uid, userId);
    return messageList;
  };

  const sendNewMessage = async (receiverId, text, image = null) => {
    const messageData = {
      text,
      senderId: user.uid,
      receiverId,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    if (image) {
      messageData.image = image;
    }
    
    const result = await sendMessage(messageData);
    if (result.success) {
      setMessages(prev => [...prev, { ...messageData, id: result.id }]);
      loadChats();
    }
    return result;
  };

  const setTyping = (userId, isTyping) => {
    setTypingUsers(prev => ({ ...prev, [userId]: isTyping }));
  };

  const clearChat = () => {
    setCurrentChat(null);
    setMessages([]);
  };

  return (
    <ChatContext.Provider value={{
      chats,
      messages,
      loading,
      typingUsers,
      loadChats,
      loadMessages,
      sendMessage: sendNewMessage,
      setTyping,
      clearChat,
      currentChat,
      setCurrentChat
    }}>
      {children}
    </ChatContext.Provider>
  );
};