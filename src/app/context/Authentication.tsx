// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithEmail: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string, passwordConfirm: string) => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
  updateName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // This would be a real API call to check authentication status
        // For now, let's simulate by checking localStorage
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  // Login with email and password
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // This would be a real API call in production
      // For demo purposes, just simulate successful login
      const mockUser = { id: '123', email, name: email.split('@')[0] };
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Login with magic link
  const loginWithEmail = async (email: string) => {
    setIsLoading(true);
    try {
      // In a real app, this would send a magic link email
      // For demo purposes, just log the event
      console.log(`Magic link login requested for ${email}`);
      // Simulate successful verification
      const mockUser = { id: '123', email, name: email.split('@')[0] };
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Email login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up
  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // In a real app, this would create a new user
      console.log(`Sign up requested for ${email}`);
      // Simulate successful sign up and login
      const mockUser = { id: '123', email, name: email.split('@')[0] };
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      // In a real app, this would send a password reset email
      console.log(`Password reset requested for ${email}`);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update password
  const updatePassword = async (password: string, passwordConfirm: string) => {
    setIsLoading(true);
    try {
      if (password !== passwordConfirm) {
        throw new Error('Passwords do not match');
      }
      // In a real app, this would update the user's password
      console.log('Password update requested');
    } catch (error) {
      console.error('Password update error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update email
  const updateEmail = async (email: string) => {
    setIsLoading(true);
    try {
      if (!user) throw new Error('Not authenticated');
      
      // In a real app, this would update the user's email
      console.log(`Email update requested to ${email}`);
      
      // Update local user data
      const updatedUser = { ...user, email };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Email update error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update name
  const updateName = async (name: string) => {
    setIsLoading(true);
    try {
      if (!user) throw new Error('Not authenticated');
      
      // In a real app, this would update the user's name
      console.log(`Name update requested to ${name}`);
      
      // Update local user data
      const updatedUser = { ...user, name };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Name update error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would call a logout API
      localStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithEmail,
        logout,
        signUp,
        resetPassword,
        updatePassword,
        updateEmail,
        updateName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};