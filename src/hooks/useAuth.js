import { useAuth } from '../context/AuthContext';

export default function useAuthHook() {
  const {
    user,
    userRole,
    loading,
    login,
    signup,
    googleLogin,
    logout,
    saveUserRole,
    updateUser
  } = useAuth();

  const isAuthenticated = !!user;
  const isFarmer = userRole === 'farmer';
  const isBuyer = userRole === 'buyer';

  return {
    user,
    userRole,
    loading,
    isAuthenticated,
    isFarmer,
    isBuyer,
    login,
    signup,
    googleLogin,
    logout,
    saveUserRole,
    updateUser
  };
}