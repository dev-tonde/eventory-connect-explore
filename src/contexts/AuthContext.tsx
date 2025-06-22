/* eslint-disable react-refresh/only-export-components */
// /* eslint-disable react-refresh/only-export-components */

// import React, { createContext, useContext, useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "@/lib/supabase";
// import { useToast } from "@/hooks/use-toast";

// interface User {
//   id: string;
//   email: string;
//   name: string;
//   role: "attendee" | "organizer";
//   avatar?: string;
// }

// interface AuthContextType {
//   user: User | null;
//   isLoading: boolean;
//   login: (email: string, password: string) => Promise<void>;
//   signup: (
//     email: string,
//     password: string,
//     name: string,
//     role: "attendee" | "organizer"
//   ) => Promise<void>;
//   logout: () => void;
//   isAuthenticated: boolean;
//   requireAuth: (redirectTo?: string) => boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const { toast } = useToast();

//   useEffect(() => {
//     // Check for stored user session
//     const storedUser = localStorage.getItem("eventory_user");
//     if (storedUser) {
//       setUser(JSON.parse(storedUser));
//     }
//     setIsLoading(false);
//   }, []);

//   const login = async (email: string, password: string) => {
//     setIsLoading(true);
//     try {
//       // Mock login - replace with Supabase later
//       const mockUser: User = {
//         id: "1",
//         email,
//         name: email.split("@")[0],
//         role: email.includes("organizer") ? "organizer" : "attendee",
//       };
//       setUser(mockUser);
//       localStorage.setItem("eventory_user", JSON.stringify(mockUser));

//       // Store user in appropriate "database" for mailing purposes
//       const userDatabase =
//         mockUser.role === "organizer"
//           ? "eventory_organizers"
//           : "eventory_attendees";
//       const existingUsers = JSON.parse(
//         localStorage.getItem(userDatabase) || "[]"
//       );
//       const userExists = existingUsers.find((u: User) => u.email === email);

//       if (!userExists) {
//         existingUsers.push(mockUser);
//         localStorage.setItem(userDatabase, JSON.stringify(existingUsers));
//       }

//       toast({
//         title: "Welcome back!",
//         description: `Logged in as ${mockUser.role}`,
//       });
//     } catch (error) {
//       throw new Error("Login failed");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const signup = async (
//     email: string,
//     password: string,
//     name: string,
//     role: "attendee" | "organizer"
//   ) => {
//     setIsLoading(true);
//     try {
//       // Mock signup - replace with Supabase later
//       const mockUser: User = {
//         id: Math.random().toString(36).substr(2, 9),
//         email,
//         name,
//         role,
//       };
//       setUser(mockUser);
//       localStorage.setItem("eventory_user", JSON.stringify(mockUser));

//       // Store user in appropriate "database" for mailing purposes
//       const userDatabase =
//         role === "organizer" ? "eventory_organizers" : "eventory_attendees";
//       const existingUsers = JSON.parse(
//         localStorage.getItem(userDatabase) || "[]"
//       );
//       existingUsers.push(mockUser);
//       localStorage.setItem(userDatabase, JSON.stringify(existingUsers));

//       toast({
//         title: "Account created!",
//         description: `Welcome to Eventory as ${role}`,
//       });
//     } catch (error) {
//       throw new Error("Signup failed");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem("eventory_user");
//     toast({
//       title: "Logged out",
//       description: "You have been successfully logged out",
//     });
//   };

//   const requireAuth = (redirectTo: string = "/login") => {
//     if (!user) {
//       toast({
//         title: "Authentication required",
//         description: "Please log in to access this feature",
//         variant: "destructive",
//       });
//       return false;
//     }
//     return true;
//   };

//   const value = {
//     user,
//     isLoading,
//     login,
//     signup,
//     logout,
//     isAuthenticated: !!user,
//     requireAuth,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
//   useMemo,
// } from "react";
// import { supabase } from "@/lib/supabase";
// import { useToast } from "@/hooks/use-toast";

// interface User {
//   id: string;
//   email: string;
//   name?: string;
//   role?: "attendee" | "organizer";
//   avatar_url?: string;
// }

// interface AuthContextType {
//   user: User | null;
//   isLoading: boolean;
//   login: (email: string, password: string) => Promise<void>;
//   signup: (
//     email: string,
//     password: string,
//     name: string,
//     role: "attendee" | "organizer"
//   ) => Promise<void>;
//   logout: () => Promise<void>;
//   isAuthenticated: boolean;
//   requireAuth: (redirectTo?: string) => boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const useAuth = (): AuthContextType => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const { toast } = useToast();

//   useEffect(() => {
//     const getSession = async () => {
//       const {
//         data: { session },
//         error,
//       } = await supabase.auth.getSession();

//       if (error) {
//         console.error("Session error:", error.message);
//       } else {
//         const currentUser = session?.user;
//         if (currentUser) {
//           setUser({
//             id: currentUser.id,
//             email: currentUser.email ?? "",
//           });
//         }
//       }
//       setIsLoading(false);
//     };

//     getSession();

//     const { data: listener } = supabase.auth.onAuthStateChange(
//       (_event, session) => {
//         const currentUser = session?.user;
//         if (currentUser) {
//           setUser({
//             id: currentUser.id,
//             email: currentUser.email ?? "",
//           });
//         } else {
//           setUser(null);
//         }
//       }
//     );

//     return () => {
//       listener.subscription.unsubscribe();
//     };
//   }, []);

//   const login = async (email: string, password: string) => {
//     setIsLoading(true);
//     const { error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     });

//     if (error) {
//       toast({
//         title: "Login Failed",
//         description: error.message,
//         variant: "destructive",
//       });
//       throw new Error(error.message);
//     } else {
//       toast({ title: "Logged in", description: "Welcome back!" });
//     }
//     setIsLoading(false);
//   };

//   const signup = async (
//     email: string,
//     password: string,
//     name: string,
//     role: "attendee" | "organizer"
//   ) => {
//     setIsLoading(true);
//     const { data, error } = await supabase.auth.signUp({
//       email,
//       password,
//       options: {
//         data: { name, role },
//       },
//     });

//     if (error) {
//       toast({
//         title: "Signup Failed",
//         description: error.message,
//         variant: "destructive",
//       });
//       throw new Error(error.message);
//     } else {
//       toast({ title: "Signup Success", description: `Welcome ${name}!` });
//     }
//     setIsLoading(false);
//   };

//   const logout = async () => {
//     const { error } = await supabase.auth.signOut();
//     if (error) {
//       toast({ title: "Logout Error", description: error.message });
//     } else {
//       toast({ title: "Logged out", description: "See you soon." });
//     }
//   };

//   const requireAuth = (redirectTo: string = "/login") => {
//     if (!user) {
//       toast({
//         title: "Authentication required",
//         description: "Please log in to access this feature",
//         variant: "destructive",
//       });
//       return false;
//     }
//     return true;
//   };

//   const value = useMemo(
//     () => ({
//       user,
//       isLoading,
//       login,
//       signup,
//       logout,
//       isAuthenticated: !!user,
//       requireAuth,
//     }),
//     [user, isLoading]
//   );

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

import React, { createContext, useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: "attendee" | "organizer";
  avatar_url?: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    name: string,
    role: "attendee" | "organizer"
  ) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  requireAuth: (redirectTo?: string) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Session error:", error.message);
      } else {
        const currentUser = session?.user;
        if (currentUser) {
          setUser({
            id: currentUser.id,
            email: currentUser.email ?? "",
          });
        }
      }
      setIsLoading(false);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentUser = session?.user;
        if (currentUser) {
          setUser({
            id: currentUser.id,
            email: currentUser.email ?? "",
          });
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = React.useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      const { data: loginData, error } = await supabase.auth.signInWithPassword(
        {
          email,
          password,
        }
      );

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const userId = loginData.user?.id;
      if (userId) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (profileError) {
          toast({
            title: "Profile Fetch Failed",
            description: profileError.message,
          });
        } else {
          setUser({
            id: userId,
            email,
            name: profile.name,
            role: profile.role,
            avatar_url: profile.avatar_url,
          });

          toast({
            title: "Welcome back!",
            description: `Logged in as ${profile.role}`,
          });
        }
      }

      setIsLoading(false);
    },
    [toast]
  );

  const signup = React.useCallback(
    async (
      email: string,
      password: string,
      name: string,
      role: "attendee" | "organizer"
    ) => {
      setIsLoading(true);
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
        });

      if (signUpError) {
        toast({
          title: "Signup Failed",
          description: signUpError.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const userId = signUpData.user?.id;
      if (userId) {
        // Insert profile
        const { error: profileError } = await supabase.from("profiles").insert({
          id: userId,
          name,
          role,
        });

        if (profileError) {
          toast({
            title: "Profile creation failed",
            description: profileError.message,
            variant: "destructive",
          });
        }
      }

      toast({ title: "Signup Success", description: `Welcome ${name}!` });
      setIsLoading(false);
    },
    [toast]
  );

  const logout = React.useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: "Logout Error", description: error.message });
    } else {
      toast({ title: "Logged out", description: "See you soon." });
    }
  }, [toast]);

  const requireAuth = React.useCallback(
    (redirectTo: string = "/login") => {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to access this feature",
          variant: "destructive",
        });
        return false;
      }
      return true;
    },
    [user, toast]
  );

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      signup,
      logout,
      isAuthenticated: !!user,
      requireAuth,
    }),
    [user, isLoading, login, signup, logout, requireAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
