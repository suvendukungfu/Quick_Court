import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { supabase, auth } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Partial<User> & { password: string }) => Promise<boolean>;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to map Supabase user to our User type
const mapSupabaseUserToUser = (supabaseUser: SupabaseUser): User => {
  const metadata = supabaseUser.user_metadata || {};
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    fullName: metadata.fullName || metadata.full_name || supabaseUser.email?.split('@')[0] || 'User',
    role: metadata.role || 'user',
    status: 'active',
    createdAt: new Date(supabaseUser.created_at || Date.now()),
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      if (supabaseUser) {
        const userData = mapSupabaseUserToUser(supabaseUser);
        setUser(userData);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const userData = mapSupabaseUserToUser(session.user);
          setUser(userData);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login for:', email);
      const { data, error } = await auth.signIn(email, password);
      
      if (error) {
        console.error('Login error:', error.message, error);
        // Log specific error types for debugging
        if (error.message.includes('Invalid login credentials')) {
          console.error('Invalid credentials - user may not exist or password is wrong');
        } else if (error.message.includes('Email not confirmed')) {
          console.error('Email not confirmed - check Supabase auth settings');
        }
        return false;
      }
      
      console.log('Login successful, user data:', data.user);
      if (data.user) {
        const userData = mapSupabaseUserToUser(data.user);
        console.log('Mapped user data:', userData);
        setUser(userData);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: Partial<User> & { password: string }): Promise<boolean> => {
    try {
      console.log('Attempting registration for:', userData.email);
      const { data, error } = await auth.signUp(userData.email!, userData.password, {
        fullName: userData.fullName,
        role: userData.role || 'user'
      });
      
      if (error) {
        console.error('Registration error:', error.message, error);
        return false;
      }
      
      console.log('Registration response:', data);
      
      if (data.user) {
        console.log('User registered successfully:', data.user);
        // Check if email confirmation is required
        if (data.session) {
          console.log('User session created, setting user data');
          const mappedUser = mapSupabaseUserToUser(data.user);
          setUser(mappedUser);
        } else {
          console.log('No session created - email confirmation may be required');
          // Don't set user if email confirmation is required
        }
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('quickcourt_user', JSON.stringify(updatedUser));
      return true;
    }
    return false;
  };

  const logout = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const value = {
    user,
    login,
    logout,
    register,
    updateProfile,
    isAuthenticated: !!user,
    isLoading: loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}