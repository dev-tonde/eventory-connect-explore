import React, { createContext, useContext, useState } from "react";

// Minimal AuthContext for debugging
interface MinimalAuthContextType {
  user: any;
  isLoading: boolean;
}

export const AuthContext = createContext<MinimalAuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log("AuthProvider rendering...");
  
  try {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    console.log("useState calls successful");

    const value = {
      user,
      isLoading,
    };

    return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    );
  } catch (error) {
    console.error("AuthProvider error:", error);
    throw error;
  }
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};