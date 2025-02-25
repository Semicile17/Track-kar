"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from './api';

// Cookie helper functions
const setCookie = (name: string, value: string, days: number) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; secure; samesite=strict`;
};

const getCookie = (name: string) => {
  return document.cookie.split('; ').find(row => row.startsWith(`${name}=`))?.split('=')[1];
};

const removeCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
};

interface UserProfile {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  company?: string;
  role?: string;
}

interface User {
  id: string;
  email: string;
  profile?: UserProfile;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (profile: UserProfile) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchUserProfile = async () => {
    try {
      const profile = await api.getProfile();
      setUser(prev => prev ? { ...prev, profile } : null);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = getCookie('token');
        if (storedToken) {
          setToken(storedToken);
          await fetchUserProfile();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid auth state
        removeCookie('token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const signup = async (email: string, password: string) => {
    try {
      const data = await api.signup(email, password);
      if (data.status === 'success' && data.token) {
        setCookie('token', data.token, 7); // 7 days
        setToken(data.token);
        setUser({ id: 'temp-id', email });
        router.push("/dashboard");
      }
    } catch (error) {
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const data = await api.login(email, password);
      if (data.status === 'success' && data.token) {
        setCookie('token', data.token, 7); // 7 days
        setToken(data.token);
        setUser({ id: 'temp-id', email });
        router.push("/dashboard");
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    removeCookie('token');
    setToken(null);
    setUser(null);
    router.push("/");
  };

  const updateUserProfile = async (profileData: UserProfile) => {
    try {
      const updatedProfile = await api.updateProfile(profileData);
      setUser(prev => prev ? { ...prev, profile: updatedProfile } : null);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      signup, 
      login, 
      logout, 
      updateUserProfile,
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
