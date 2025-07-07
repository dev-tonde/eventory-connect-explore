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
import { useErrorTracking } from "@/hooks/useErrorTracking";

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
  const { trackError } = useErrorTracking();

  // Token expiry checker
  const checkTokenExpiry = useCallback((session: Session | null): boolean => {
    if (!session) return false;
    
    const expiresAt = session.expires_at;
    if (!expiresAt) return true; // No expiry info, assume valid
    
    const now = Math.floor(Date.now() / 1000);
    const buffer = 300; // 5 minutes buffer
    
    return now < (expiresAt - buffer);
  }, []);

  // Enhanced profile fetching with better error handling
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle(); // Use maybeSingle to avoid errors when no profile exists

      if (error) {
        trackError(new Error(error.message), { component: "AuthContext", action: "fetchProfile" });
        
        // If it's a 406 error, likely RLS issue - create profile
        if (error.code === "PGRST301" || error.message.includes("406")) {
          console.warn("Profile not found, user may need to complete profile setup");
          return;
        }
        
        throw error;
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
          phone: data.phone || "",
          created_at: data.created_at,
          updated_at: data.updated_at,
        });
      }
    } catch (error) {
      trackError(error as Error, { 
        component: "AuthContext", 
        action: "fetchProfile",
        userId 
      });
    }
  }, [trackError]);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  // Enhanced session handling
  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      // Handle token expiry
      if (session && !checkTokenExpiry(session)) {
        console.warn("Session expired, logging out");
        await supabase.auth.signOut();
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Defer profile fetching to avoid blocking auth state update
        setTimeout(() => {
          if (mounted) {
            fetchProfile(session.user.id);
          }
        }, 0);
      } else {
        setProfile(null);
      }

      if (mounted) {
        setIsLoading(false);
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;

      if (error) {
        trackError(error, { component: "AuthContext", action: "getSession" });
        setIsLoading(false);
        return;
      }

      // Check if existing session is valid
      if (session && !checkTokenExpiry(session)) {
        console.warn("Existing session expired, clearing");
        supabase.auth.signOut();
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchProfile(session.user.id);
      }

      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe?.();
    };
  }, [fetchProfile, checkTokenExpiry, trackError]);

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
        trackError(error as Error, { component: "AuthContext", action: "login" });
        return { error: error as Error };
      }
    },
    [toast, trackError]
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

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              first_name: firstName,
              last_name: lastName,
              role: role,
              phone: "", // Will be updated later if needed
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
        trackError(error as Error, { component: "AuthContext", action: "signup" });
        return { error: error as Error };
      }
    },
    [toast, trackError]
  );

  const logout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }

      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      trackError(error as Error, { component: "AuthContext", action: "logout" });
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast, trackError]);

  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      if (!user) return { error: new Error("No user logged in") };

      try {
        const { error } = await supabase
          .from("profiles")
          .update(updates)
          .eq("id", user.id);

        if (error) {
          throw error;
        }

        await refreshProfile();

        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        });

        return { error: null };
      } catch (error) {
        trackError(error as Error, { 
          component: "AuthContext", 
          action: "updateProfile",
          userId: user.id 
        });
        toast({
          title: "Update Failed",
          description: "Failed to update profile. Please try again.",
          variant: "destructive",
        });
        return { error: error as Error };
      }
    },
    [user, refreshProfile, toast, trackError]
  );

  const value = useMemo(
    () => ({
      user,
      profile,
      session,
      isLoading,
      isAuthenticated: !!user && !!session && checkTokenExpiry(session),
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
      checkTokenExpiry,
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