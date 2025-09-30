
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Setting up auth state listener');
    
    // CRITICAL FIX: Add proper error handling for initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthProvider: Error getting initial session:', error);
        } else {
          console.log('AuthProvider: Initial session:', session?.user?.email || 'No session');
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('AuthProvider: Unexpected error during auth initialization:', error);
      } finally {
        setLoading(false);
      }
    };

    // Initialize auth state
    initializeAuth().catch(error => {
      console.error('AuthProvider: Failed to initialize auth:', error);
      setLoading(false);
    });

    // Listen for auth changes with error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          console.log('AuthProvider: Auth state changed:', event, session?.user?.email || 'No session');
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        } catch (error) {
          console.error('AuthProvider: Error handling auth state change:', error);
          setLoading(false);
        }
      }
    );

    return () => {
      console.log('AuthProvider: Cleaning up auth listener');
      try {
        subscription.unsubscribe();
      } catch (error) {
        console.error('AuthProvider: Error unsubscribing from auth changes:', error);
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('AuthProvider: Attempting sign in for:', email);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.log('AuthProvider: Sign in error:', error.message);
      } else {
        console.log('AuthProvider: Sign in successful');
      }
      
      return { error };
    } catch (error) {
      console.error('AuthProvider: Unexpected error during sign in:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    console.log('AuthProvider: Attempting sign up for:', email);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
          },
        },
      });

      if (error) {
        console.log('AuthProvider: Sign up error:', error.message);
        return { error };
      }

      if (data.user) {
        console.log('AuthProvider: Sign up successful, creating profile');
        try {
          // Create profile in profiles table with error handling
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                user_id: data.user.id,
                full_name: fullName,
                phone_number: phone,
                email: email,
              },
            ]);
          
          if (profileError) {
            console.error('AuthProvider: Profile creation error:', profileError.message);
            // Don't return error here as the user was created successfully
          } else {
            console.log('AuthProvider: Profile created successfully');
          }
        } catch (profileError) {
          console.error('AuthProvider: Unexpected error creating profile:', profileError);
        }
      }

      return { error };
    } catch (error) {
      console.error('AuthProvider: Unexpected error during sign up:', error);
      return { error };
    }
  };

  const signOut = async () => {
    console.log('AuthProvider: Signing out');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('AuthProvider: Sign out error:', error.message);
      }
    } catch (error) {
      console.error('AuthProvider: Unexpected error during sign out:', error);
    }
  };

  const resetPassword = async (email: string) => {
    console.log('AuthProvider: Requesting password reset for:', email);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        console.log('AuthProvider: Password reset error:', error.message);
      } else {
        console.log('AuthProvider: Password reset email sent');
      }
      
      return { error };
    } catch (error) {
      console.error('AuthProvider: Unexpected error during password reset:', error);
      return { error };
    }
  };

  const value = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
