'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';

/**
 * Component to initialize authentication state
 * This replaces the AuthProvider and sets up the auth listener
 */
export const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    // Initialize the auth state listener
    const cleanup = initializeAuth();

    // Return cleanup function
    return cleanup;
  }, [initializeAuth]);

  return <>{children}</>;
};
