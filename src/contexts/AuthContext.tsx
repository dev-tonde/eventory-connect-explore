
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  secondary_email?: string;
  avatar_url?: string;
  role: string;
  bio?: string;
  social_links: any;
  name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  signup: (email: string, password: string, firstName: string, lastName: string, role: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    try {
      console.log('AuthContext: Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("AuthContext: Error fetching profile:", error);
        return;
      }
      
      if (data) {
        console.log('AuthContext: Profile fetched successfully:', data);
        setProfile({
          id: data.id,
          username: data.username || '',
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          secondary_email: data.secondary_email,
          avatar_url: data.avatar_url,
          role: data.role || 'attendee',
          bio: data.bio,
          social_links: data.social_links || {},
          name: data.name,
          created_at: data.created_at,
          updated_at: data.updated_at
        });
      }
    } catch (error) {
      console.error("AuthContext: Error fetching profile:", error);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      console.log('AuthContext: Refreshing profile for user:', user.id);
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    console.log('AuthContext: Setting up auth state listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext: Auth state change:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use setTimeout to prevent recursion issues
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('AuthContext: Existing session check:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('AuthContext: Attempting login for:', email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (!error) {
        console.log('AuthContext: Login successful');
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
      }
      
      return { error };
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      return { error };
    }
  };

  const signup = async (email: string, password: string, firstName: string, lastName: string, role: string = "attendee") => {
    try {
      console.log('AuthContext: Attempting signup for:', email, 'with role:', role);
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: firstName,
            last_name: lastName,
            role: role,
          },
        },
      });
      
      if (!error) {
        console.log('AuthContext: Signup successful');
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
      }
      
      return { error };
    } catch (error) {
      console.error('AuthContext: Signup error:', error);
      return { error };
    }
  };

  const logout = async () => {
    console.log('AuthContext: Logging out');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('AuthContext: Logout error:', error);
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: "No user logged in" };

    try {
      console.log('AuthContext: Updating profile with:', updates);
      
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) {
        console.error('AuthContext: Profile update error:', error);
        throw error;
      }

      console.log('AuthContext: Profile updated successfully, refreshing...');
      
      // Refresh profile data immediately after update
      await refreshProfile();
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      
      return { error: null };
    } catch (error) {
      console.error('AuthContext: Profile update error:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const value = {
    user,
    profile,
    session,
    isLoading,
    isAuthenticated: !!user && !!session,
    login,
    signup,
    logout,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
