import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { supabase, users } from '../lib/supabase';
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
const mapSupabaseUserToUser = (supabaseUser: SupabaseUser, userData?: any): User => {
  // If we have user data from our users table, use that
  if (userData) {
    return {
      id: userData.id,
      email: userData.email,
      fullName: userData.full_name,
      role: userData.role,
      status: userData.status,
      avatar: userData.avatar_url,
      createdAt: new Date(userData.created_at),
    };
  }
  
  // Fallback to metadata if no user data
  const metadata = supabaseUser.user_metadata || {};
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    fullName: metadata.fullName || metadata.full_name || supabaseUser.email?.split('@')[0] || 'User',
    role: metadata.role || 'customer',
    status: 'active',
    avatar: metadata.avatar_url,
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
        // Try to get user data from our users table
        try {
          const { data: userData, error } = await users.getByEmail(supabaseUser.email!);
          if (userData && !error) {
            const mappedUser = mapSupabaseUserToUser(supabaseUser, userData);
            setUser(mappedUser);
          } else {
            // Fallback to metadata
            const mappedUser = mapSupabaseUserToUser(supabaseUser);
            setUser(mappedUser);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Fallback to metadata
          const mappedUser = mapSupabaseUserToUser(supabaseUser);
          setUser(mappedUser);
        }
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Try to get user data from our users table
          try {
            const { data: userData, error } = await users.getByEmail(session.user.email!);
            if (userData && !error) {
              const mappedUser = mapSupabaseUserToUser(session.user, userData);
              setUser(mappedUser);
            } else {
              // Fallback to metadata
              const mappedUser = mapSupabaseUserToUser(session.user);
              setUser(mappedUser);
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
            // Fallback to metadata
            const mappedUser = mapSupabaseUserToUser(session.user);
            setUser(mappedUser);
          }
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Login error:', error.message, error);
        return false;
      }
      
      console.log('Login successful, user data:', data.user);
      if (data.user) {
        // Try to get user data from our users table
        try {
          const { data: userData, error: userError } = await users.getByEmail(data.user.email!);
          if (userData && !userError) {
            const mappedUser = mapSupabaseUserToUser(data.user, userData);
            setUser(mappedUser);
          } else {
            // Fallback to metadata
            const mappedUser = mapSupabaseUserToUser(data.user);
            setUser(mappedUser);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Fallback to metadata
          const mappedUser = mapSupabaseUserToUser(data.user);
          setUser(mappedUser);
        }
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
      
      // First, create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email!,
        password: userData.password,
        options: {
          data: {
            fullName: userData.fullName,
            role: userData.role || 'customer'
          }
        }
      });
      
      if (authError) {
        console.error('Auth registration error:', authError.message, authError);
        return false;
      }
      
      console.log('Auth registration response:', authData);
      
      if (authData.user) {
        // Create user record in our users table
        try {
          const { data: userRecord, error: userError } = await users.create({
            id: authData.user.id,
            email: userData.email!,
            full_name: userData.fullName!,
            role: userData.role || 'customer',
            status: 'active'
          });
          
          if (userError) {
            console.error('User record creation error:', userError);
            // Auth user was created but user record failed - this is a problem
            return false;
          }
          
          console.log('User record created successfully:', userRecord);
          
          // Set the user in context
          const mappedUser = mapSupabaseUserToUser(authData.user, userRecord[0]);
          setUser(mappedUser);
          
          return true;
        } catch (error) {
          console.error('Error creating user record:', error);
          return false;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    try {
      if (!user?.id) return false;
      
      const { data, error } = await users.update(user.id, {
        full_name: userData.fullName,
        phone: userData.phone,
        address: userData.address,
        business_name: userData.businessName,
        business_address: userData.businessAddress
      });
      
      if (error) {
        console.error('Profile update error:', error);
        return false;
      }
      
      if (data) {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
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