import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
// Note: Removed useToast import to prevent dispatcher conflicts

interface SocialLinks {
  [key: string]: string;
}

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
  social_links: SocialLinks;
  name?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  signup: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role?: string
  ) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  updateProfile: (
    updates: Partial<Profile>
  ) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Add safety check for React hooks
  if (!React.useState) {
    console.error('React hooks not available - this usually indicates a development hot reload issue');
    return <div>Loading...</div>;
  }

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Note: useToast removed to prevent React dispatcher conflicts

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error("AuthContext: Error fetching profile:", error);
        }
        return;
      }

      if (data) {
        setProfile({
          id: data.id,
          username: data.username || "",
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          secondary_email: data.secondary_email,
          avatar_url: data.avatar_url,
          role: data.role || "attendee",
          bio: data.bio,
          social_links: (data.social_links as Record<string, string>) || {},
          name: data.name,
          created_at: data.created_at,
          updated_at: data.updated_at,
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("AuthContext: Error fetching profile:", error);
      }
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer profile fetching to avoid deadlock
        if (session?.user) {
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
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user.id);
        }, 0);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error("Login failed:", error.message);
          return { error };
        }

        console.log("Login successful");
        return { error: null };
      } catch (error) {
        const err = error as Error;
        console.error("Login error:", err.message);
        return { error: err };
      }
    },
    [] // Removed toast dependency
  );

  const signup = useCallback(
    async (
      email: string,
      password: string,
      firstName: string,
      lastName: string,
      role?: string
    ) => {
      try {
        const redirectUrl = `${window.location.origin}/`;

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              first_name: firstName,
              last_name: lastName,
            },
          },
        });

        if (error) {
          console.error("Signup failed:", error.message);
          return { error };
        }

        console.log("Account created successfully");
        return { error: null };
      } catch (error) {
        const err = error as Error;
        console.error("Signup error:", err.message);
        return { error: err };
      }
    },
    [] // Removed toast dependency
  );

  const logout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error.message);
      } else {
        setUser(null);
        setProfile(null);
        setSession(null);
        console.log("Logged out successfully");
      }
    } catch (error) {
      const err = error as Error;
      console.error("Logout error:", err.message);
    }
  }, []); // Removed toast dependency

  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      if (!user?.id) {
        return { error: new Error("User not authenticated") };
      }

      try {
        const { error } = await supabase
          .from("profiles")
          .update(updates)
          .eq("id", user.id);

        if (error) {
          console.error("Profile update failed:", error.message);
          return { error: new Error(error.message) };
        }

        // Refresh profile data
        await fetchProfile(user.id);

        console.log("Profile updated successfully");
        return { error: null };
      } catch (error) {
        const err = error as Error;
        console.error("Profile update error:", err.message);
        return { error: err };
      }
    },
    [user?.id, fetchProfile] // Removed toast dependency
  );

  const isAuthenticated = !!user;

  const value = useMemo(
    () => ({
      user,
      profile,
      session,
      isLoading,
      isAuthenticated,
      login,
      signup,
      logout,
      updateProfile,
      refreshProfile,
    }),
    [
      user,
      profile,
      session,
      isLoading,
      isAuthenticated,
      login,
      signup,
      logout,
      updateProfile,
      refreshProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};