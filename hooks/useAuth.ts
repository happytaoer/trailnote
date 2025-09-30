import { useAuthStore } from '@/stores/useAuthStore';

/**
 * Custom hook for authentication
 * Provides access to auth state and actions from Zustand store
 */
export const useAuth = () => {
  const {
    user,
    loading,
    login,
    register,
    logout,
    resetPassword,
    updatePassword
  } = useAuthStore();

  return {
    user,
    loading,
    login,
    register,
    logout,
    resetPassword,
    updatePassword
  };
};
