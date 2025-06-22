import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext"; // updated path

import type { AuthContextType } from "@/contexts/AuthContext";

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
