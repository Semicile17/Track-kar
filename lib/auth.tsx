"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Redirect to dashboard when user is set
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const signup = async (email: string, password: string) => {
    if (!validateEmail(email)) {
      throw new Error("Invalid email format");
    }

    if (!validatePassword(password)) {
      throw new Error("Password must be at least 6 characters long");
    }

    // Here you would typically make an API call to your backend
    // For now, we'll simulate it with localStorage
    // Check if user already exists
    const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");
    if (existingUsers.some((u: User) => u.email === email)) {
      throw new Error("Email already in use");
    }

    const newUser = {
      id: crypto.randomUUID(),
      email,
      createdAt: new Date().toISOString(),
    };

    // Save to "database"
    existingUsers.push(newUser);
    localStorage.setItem("users", JSON.stringify(existingUsers));

    // Log the user in
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
  };

  const login = async (email: string, password: string) => {
    if (!validateEmail(email)) {
      throw new Error("Invalid email format");
    }

    if (!validatePassword(password)) {
      throw new Error("Invalid password format");
    }

    // Here you would typically verify with your backend
    // For now, we'll check localStorage
    const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");
    const user = existingUsers.find((u: User) => u.email === email);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // In a real app, you would verify the password hash here
    // For demo purposes, we'll just log them in
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  const logout = async () => {
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout, isLoading }}>
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
