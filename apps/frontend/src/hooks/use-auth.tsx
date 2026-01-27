'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SurveyData, Review } from '@/lib/types';
import { listings } from '@/lib/mock-data';

// Define the shape of the user object
interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'owner' | 'admin';
}

// Define the shape of the Auth context
interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string, role: 'user' | 'owner') => Promise<boolean>;
  adminLogin: (email: string, pass: string) => Promise<boolean>;
  signup: (name: string, email: string, pass: string, role: 'user' | 'owner') => boolean;
  logout: () => void;
  updateUser?: (updates: Partial<User>) => void;
  loading: boolean;
  surveyData: SurveyData | null;
  saveSurveyData: (data: SurveyData) => void;
  favorites: number[];
  toggleFavorite: (listingId: number) => void;
  getMyReviews: (userId: number) => Review[];
}

// Create the Auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This is a temporary in-memory store for users.
// In a real app, this would be a database.
const userStore: { [email: string]: { id: string; name: string; email: string; passwordHash: string; role: 'user' | 'owner' | 'admin' } } = {
    'admin@example.com': {
        id: '999',
        name: 'Admin',
        email: 'admin@example.com',
        passwordHash: 'admin123',
        role: 'admin'
    },
     'owner@example.com': {
        id: '103', // Matches Pat Professional from mock-data
        name: 'Pat Professional',
        email: 'owner@example.com',
        passwordHash: 'owner123',
        role: 'owner'
    }
};
let userIdCounter = 1;


// Create the AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    // Check if user is logged in from a previous session (e.g., from localStorage)
    try {
      const storedUser = localStorage.getItem('makikibahay-user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
         // Also load their survey data and favorites
        const storedSurvey = localStorage.getItem(`makikibahay-survey-${parsedUser.id}`);
        if (storedSurvey) {
          setSurveyData(JSON.parse(storedSurvey));
        }
        const storedFavorites = localStorage.getItem(`makikibahay-favorites-${parsedUser.id}`);
        if(storedFavorites) {
            setFavorites(JSON.parse(storedFavorites));
        }
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('makikibahay-user');
    } finally {
        setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string, role: 'user' | 'owner'): Promise<boolean> => {
    // In a real app, you'd hash the password and compare it.
    const existingUser = Object.values(userStore).find(u => u.email === email);
    
    // Check if user exists, password matches, and role matches
    if (existingUser && existingUser.passwordHash === pass && existingUser.role === role) {
      const loggedInUser: User = { id: existingUser.id, name: existingUser.name, email: existingUser.email, role: existingUser.role };
      setUser(loggedInUser);
      localStorage.setItem('makikibahay-user', JSON.stringify(loggedInUser));

      const storedSurvey = localStorage.getItem(`makikibahay-survey-${loggedInUser.id}`);
      if (storedSurvey) {
        setSurveyData(JSON.parse(storedSurvey));
      }
      const storedFavorites = localStorage.getItem(`makikibahay-favorites-${loggedInUser.id}`);
      if(storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
      }

      return true;
    }
    return false;
  };

  const adminLogin = async (email: string, pass: string): Promise<boolean> => {
    const adminUser = userStore['admin@example.com'];
    if (email === adminUser.email && pass === adminUser.passwordHash) {
      const loggedInUser: User = { id: adminUser.id, name: adminUser.name, email: adminUser.email, role: adminUser.role };
      setUser(loggedInUser);
      localStorage.setItem('makikibahay-user', JSON.stringify(loggedInUser));
      // Admin doesn't have survey data or favorites
      setSurveyData(null);
      setFavorites([]);
      return true;
    }
    return false;
  };

  const signup = (name: string, email: string, pass: string, role: 'user' | 'owner'): boolean => {
    if (userStore[email]) {
      // User already exists
      return false;
    }
    const id = (userIdCounter++).toString();
    // In a real app, you'd hash the password before storing it.
    userStore[email] = { id, name, email, passwordHash: pass, role };
    const newUser: User = { id, name, email, role };
    setUser(newUser);
    localStorage.setItem('makikibahay-user', JSON.stringify(newUser));
    setSurveyData(null); // Clear survey data for new user
    setFavorites([]); // Clear favorites for new user
    return true;
  };

  const logout = () => {
    const role = user?.role;
    setUser(null);
    setSurveyData(null);
    setFavorites([]);
    localStorage.removeItem('makikibahay-user');
    if(user) {
        localStorage.removeItem(`makikibahay-survey-${user.id}`);
        localStorage.removeItem(`makikibahay-favorites-${user.id}`);
    }
    // Redirect to login page after logout
    if (role) {
       window.location.href = '/login';
    }
  };
  
  const updateUser = (updates: Partial<User>) => {
    if (user) {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('makikibahay-user', JSON.stringify(updatedUser));
         // In a real app, you'd also update the userStore/database
        if(userStore[user.email]) {
            userStore[user.email].name = updatedUser.name;
        }
    }
  }

  const saveSurveyData = (data: SurveyData) => {
      if (user) {
          setSurveyData(data);
          localStorage.setItem(`makikibahay-survey-${user.id}`, JSON.stringify(data));
      }
  }

  const toggleFavorite = (listingId: number) => {
      if (!user) return;
      
      const newFavorites = favorites.includes(listingId)
        ? favorites.filter(id => id !== listingId)
        : [...favorites, listingId];
      
      setFavorites(newFavorites);
      localStorage.setItem(`makikibahay-favorites-${user.id}`, JSON.stringify(newFavorites));
  }
  
  const getMyReviews = (userId: number): Review[] => {
    const allReviews: Review[] = [];
    listings.forEach(listing => {
        listing.reviews.forEach(review => {
            if (review.user_id === userId) {
                allReviews.push(review);
            }
        });
    });
    return allReviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  const value = {
    user,
    login,
    adminLogin,
    signup,
    logout,
    updateUser,
    loading,
    surveyData,
    saveSurveyData,
    favorites,
    toggleFavorite,
    getMyReviews,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

// Create the useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
