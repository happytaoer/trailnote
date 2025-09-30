import { create } from 'zustand';
import { 
  AuthUser, 
  onAuthStateChange,
  loginUser,
  registerUser,
  logoutUser,
  resetPassword,
  updatePassword,
  AuthResponse
} from '@/lib/authService';

interface AuthState {
  // State
  user: AuthUser | null;
  loading: boolean;

  // Actions
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  
  // Auth actions
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (email: string, password: string, username?: string) => Promise<AuthResponse>;
  logout: () => Promise<{ error: { message: string } | null }>;
  resetPassword: (email: string) => Promise<{ error: { message: string } | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: { message: string } | null }>;
  
  // Initialize auth state listener
  initializeAuth: () => () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  loading: true,

  // Basic setters
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),

  // Auth actions
  login: async (email: string, password: string) => {
    return await loginUser(email, password);
  },

  register: async (email: string, password: string) => {
    return await registerUser(email, password);
  },

  logout: async () => {
    return await logoutUser();
  },

  resetPassword: async (email: string) => {
    return await resetPassword(email);
  },

  updatePassword: async (newPassword: string) => {
    return await updatePassword(newPassword);
  },

  // Initialize auth state listener
  initializeAuth: () => {
    const { setUser, setLoading } = get();
    
    setLoading(true);
    
    // Set up the auth state change listener
    const { data } = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    // Return cleanup function
    return () => {
      data.subscription.unsubscribe();
    };
  },
}));
