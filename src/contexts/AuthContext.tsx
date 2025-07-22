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
import { useToast } from "@/hooks/use-toast";

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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

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
  }, [user, fetchProfile]);

  useEffect(() => {
    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user.id);
        }, 0);
      } else {
        setProfile(null);
      }

      setIsLoading(false);
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchProfile(session.user.id);
      }

      setIsLoading(false);
    });

    return () => {
      subscription?.unsubscribe?.();
    };
  }, [fetchProfile]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!error) {
          toast({
            title: "Welcome back!",
            description: "You have successfully logged in.",
          });
        }

        return { error };
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error("AuthContext: Login error:", error);
        }
        return { error };
      }
    },
    [toast]
  );

  const signup = useCallback(
    async (
      email: string,
      password: string,
      firstName: string,
      lastName: string,
      role: string = "attendee"
    ) => {
      try {
        const redirectUrl = `${window.location.origin}/`;

  // Update profile fields to store phone number for SMS notifications
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: {
        first_name: firstName,
        last_name: lastName, 
        role: role,
        phone: "" // Phone number handled separately
      },
    },
  });

        if (!error) {
          toast({
            title: "Account created!",
            description: "Please check your email to verify your account.",
          });
        }

        return { error };
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error("AuthContext: Signup error:", error);
        }
        return { error };
      }
    },
    [toast]
  );

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("AuthContext: Logout error:", error);
      }
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
  }, [toast]);

  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      if (!user) return { error: "No user logged in" };

      try {
        const { error } = await supabase
          .from("profiles")
          .update(updates)
          .eq("id", user.id);

        if (error) {
          if (process.env.NODE_ENV !== "production") {
            console.error("AuthContext: Profile update error:", error);
          }
          throw error;
        }

        await refreshProfile();

        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        });

        return { error: null };
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error("AuthContext: Profile update error:", error);
        }
        toast({
          title: "Update Failed",
          description: "Failed to update profile. Please try again.",
          variant: "destructive",
        });
        return { error };
      }
    },
    [user, refreshProfile, toast]
  );

  const value = useMemo(
    () => ({
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
    }),
    [
      user,
      profile,
      session,
      isLoading,
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
