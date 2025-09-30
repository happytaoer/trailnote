"use client";

import { supabase } from './supabase';

export interface Subscription {
  subscriptionId: string;
  subscriptionStatus: string;
  priceId: string;
  productId: string;
  scheduledChange?: {
    action: string;
    effectiveAt: string;
    resumeAt: string | null;
  };
  customerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  subscription?: Subscription | null;
  settings?: {
    id: number;
    layer: string;
    route_color: string;
    route_width: string;
    route_opacity: string;
    created_at: string;
    updated_at: string;
  } | null;
}

export interface AuthError {
  message: string;
}

export interface AuthResponse {
  user: AuthUser | null;
  error: AuthError | null;
}

// Register a new user
export const registerUser = async (
  email: string, 
  password: string, 
): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { user: null, error: { message: error.message } };
    }

    if (!data.user) {
      return { 
        user: null, 
        error: { message: 'Registration successful! Please check your email to verify your account.' } 
      };
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email || '',
      },
      error: null,
    };
  } catch (error: unknown) {
    let message = 'An error occurred during registration';
    if (error instanceof Error) {
      message = error.message;
    }
    return {
      user: null,
      error: { message },
    };
  }
};

// Login user
export const loginUser = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error: { message: error.message } };
    }

    if (!data.user) {
      return { user: null, error: { message: 'Login failed, please try again.' } };
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email || '',
        username: data.user.user_metadata.username,
      },
      error: null,
    };
  } catch (error: unknown) {
    let message = 'An error occurred during login';
    if (error instanceof Error) {
      message = error.message;
    }
    return {
      user: null,
      error: { message },
    };
  }
};

// Logout user
export const logoutUser = async (): Promise<{ error: AuthError | null }> => {  
  try {  
    const { data: { session } } = await supabase.auth.getSession();  
    if (!session) {  
      return { error: null };  
    }  
    
    const { error } = await supabase.auth.signOut({ scope: 'local' });  
    
    if (error) {  
      return { error: { message: error.message } };  
    }  
    
    return { error: null };  
  } catch (error: unknown) {  
    let message = 'An error occurred during logout';  
    if (error instanceof Error) {  
      message = error.message;  
    }  
    return { error: { message } };  
  }  
};  

// Reset password
export const resetPassword = async (
  email: string
): Promise<{ error: AuthError | null }> => {
  try {
    // Get the origin for the redirect URL
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/reset-password`,
    });
    
    if (error) {
      return { error: { message: error.message } };
    }
    
    return { error: null };
  } catch (error: unknown) {
    let message = 'An error occurred during password reset';
    if (error instanceof Error) {
      message = error.message;
    }
    return { error: { message } };
  }
};

// Update password
export const updatePassword = async (
  newPassword: string
): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) {
      return { error: { message: error.message } };
    }
    
    return { error: null };
  } catch (error: unknown) {
    let message = 'An error occurred during password update';
    if (error instanceof Error) {
      message = error.message;
    }
    return { error: { message } };
  }
};

// Get current user with subscription information and settings
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) return null;
    
    const user = session.user;
    const email = user.email;
    
    // Create the base user object
    const authUser: AuthUser = {
      id: user.id,
      email: email || '',
      username: user.user_metadata.username,
      subscription: null,
      settings: null
    };
    
    // Fetch user settings
    try {
      const { data: settingsData, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .single();
      
      if (!settingsError && settingsData) {
        authUser.settings = {
          id: settingsData.id,
          layer: settingsData.layer,
          route_color: settingsData.route_color,
          route_width: settingsData.route_width,
          route_opacity: settingsData.route_opacity,
          created_at: settingsData.created_at,
          updated_at: settingsData.updated_at
        };
      }
    } catch (settingsError) {
      // Continue with the user data even if settings fetch fails
      console.error('Error fetching user settings:', settingsError);
    }
    
    // Fetch subscription data if user has an email
    if (email) {
      try {
        // First get the customer_id for the current user's email
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('customer_id')
          .eq('email', email)
          .single();

        if (customerError) {
          if (customerError.code !== 'PGRST116') { // Not found is expected for users without subscriptions
            console.error('Error fetching customer data:', customerError);
          }
          return authUser; // Return user without subscription data
        }

        if (!customerData?.customer_id) {
          return authUser; // Return user without subscription data
        }

        // Then get the subscription details using the customer_id
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('customer_id', customerData.customer_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (subscriptionError) {
          if (subscriptionError.code !== 'PGRST116') { // Not found is expected for users without subscriptions
            console.error('Error fetching subscription data:', subscriptionError);
          }
          return authUser; // Return user without subscription data
        }
        
        if (subscriptionData) {
          authUser.subscription = {
            subscriptionId: subscriptionData.subscription_id,
            subscriptionStatus: subscriptionData.subscription_status,
            priceId: subscriptionData.price_id,
            productId: subscriptionData.product_id,
            scheduledChange: subscriptionData.scheduled_change
              ? JSON.parse(subscriptionData.scheduled_change)
              : undefined,
            customerId: subscriptionData.customer_id,
            createdAt: subscriptionData.created_at,
            updatedAt: subscriptionData.updated_at,
          };
        }
      } catch (subError) {

        
        console.error('Error processing subscription data:', subError);
        // Continue with the user data even if subscription fetch fails
      }
    }
    
    return authUser;
  } catch (error) {
    console.error('Failed to get current user info:', error);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) return false;
    return !!session;
  } catch (error) {
    return false;
  }
};

// Set up auth state change listener
export const onAuthStateChange = (
  callback: (user: AuthUser | null) => void
) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    if (session && session.user) {
      // Use setTimeout to dispatch the call to getCurrentUser
      // This avoids running Supabase functions directly within the onAuthStateChange callback
      setTimeout(async () => {
        const user = await getCurrentUser();
        callback(user);
      }, 0);
    } else {
      // If there's no session or user, immediately call back with null
      // No need for setTimeout here as no async Supabase calls are made
      callback(null);
    }
  });
};
