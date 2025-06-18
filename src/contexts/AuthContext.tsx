
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'attendee' | 'organizer';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: 'attendee' | 'organizer') => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  requireAuth: (redirectTo?: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('eventory_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock login - replace with Supabase later
      const mockUser: User = {
        id: '1',
        email,
        name: email.split('@')[0],
        role: email.includes('organizer') ? 'organizer' : 'attendee'
      };
      setUser(mockUser);
      localStorage.setItem('eventory_user', JSON.stringify(mockUser));
      
      // Store user in appropriate "database" for mailing purposes
      const userDatabase = mockUser.role === 'organizer' ? 'eventory_organizers' : 'eventory_attendees';
      const existingUsers = JSON.parse(localStorage.getItem(userDatabase) || '[]');
      const userExists = existingUsers.find((u: User) => u.email === email);
      
      if (!userExists) {
        existingUsers.push(mockUser);
        localStorage.setItem(userDatabase, JSON.stringify(existingUsers));
      }
      
      toast({
        title: "Welcome back!",
        description: `Logged in as ${mockUser.role}`,
      });
    } catch (error) {
      throw new Error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string, role: 'attendee' | 'organizer') => {
    setIsLoading(true);
    try {
      // Mock signup - replace with Supabase later
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name,
        role
      };
      setUser(mockUser);
      localStorage.setItem('eventory_user', JSON.stringify(mockUser));
      
      // Store user in appropriate "database" for mailing purposes
      const userDatabase = role === 'organizer' ? 'eventory_organizers' : 'eventory_attendees';
      const existingUsers = JSON.parse(localStorage.getItem(userDatabase) || '[]');
      existingUsers.push(mockUser);
      localStorage.setItem(userDatabase, JSON.stringify(existingUsers));
      
      toast({
        title: "Account created!",
        description: `Welcome to Eventory as ${role}`,
      });
    } catch (error) {
      throw new Error('Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('eventory_user');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  const requireAuth = (redirectTo: string = '/login') => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to access this feature",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const value = {
    user,
    isLoading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    requireAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
