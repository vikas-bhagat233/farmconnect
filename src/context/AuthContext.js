import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, onAuthStateChanged } from '../services/firebase';
import { getUserRole } from '../services/firestoreService';
import { loginWithEmail, signupWithEmail, loginWithGoogle, logout } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const role = await getUserRole(firebaseUser.uid);
        setUser(firebaseUser);
        setUserRole(role);
        await AsyncStorage.setItem('userRole', role || '');
      } else {
        setUser(null);
        setUserRole(null);
        await AsyncStorage.removeItem('userRole');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const result = await loginWithEmail(email, password);
    if (result.success) {
      setUser(result.user);
      setUserRole(result.role);
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const signup = async (email, password, displayName, securityAnswers) => {
    const result = await signupWithEmail(email, password, displayName, securityAnswers);
    if (result.success) {
      setUser(result.user);
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const googleLogin = async () => {
    const result = await loginWithGoogle();
    if (result.success) {
      setUser(result.user);
      setUserRole(result.role);
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const saveUserRole = async (role) => {
    setUserRole(role);
    await AsyncStorage.setItem('userRole', role);
    return { success: true };
  };

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      setUser(null);
      setUserRole(null);
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const updateUser = async (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  return (
    <AuthContext.Provider value={{
      user,
      userRole,
      loading,
      login,
      signup,
      googleLogin,
      logout: handleLogout,
      saveUserRole,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};