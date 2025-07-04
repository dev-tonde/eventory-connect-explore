/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, createContext, useContext } from "react";

interface CSRFContextType {
  token: string | null;
  refreshToken: () => Promise<void>;
}

const CSRFContext = createContext<CSRFContextType>({
  token: null,
  refreshToken: async () => {},
});

export const useCSRF = () => useContext(CSRFContext);

export const CSRFProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);

  const refreshToken = async () => {
    try {
      // Use crypto API for secure random token generation
      const newToken = crypto.randomUUID();
      setToken(newToken);
      sessionStorage.setItem("csrf_token", newToken);
    } catch (error) {
      // Fallback: use a less secure random string if crypto fails
      const fallbackToken = Math.random().toString(36).slice(2) + Date.now();
      setToken(fallbackToken);
      sessionStorage.setItem("csrf_token", fallbackToken);
      // Optionally log error
      // console.error("CSRF token generation failed:", error);
    }
  };

  useEffect(() => {
    const storedToken = sessionStorage.getItem("csrf_token");
    if (storedToken) {
      setToken(storedToken);
    } else {
      refreshToken();
    }
    // Optionally, refresh token on tab visibility change for extra security
    // const handleVisibility = () => { if (document.visibilityState === "visible") refreshToken(); };
    // document.addEventListener("visibilitychange", handleVisibility);
    // return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  return (
    <CSRFContext.Provider value={{ token, refreshToken }}>
      {children}
    </CSRFContext.Provider>
  );
};

export const CSRFToken = ({ name = "csrf_token" }: { name?: string }) => {
  const { token } = useCSRF();
  if (!token) return null;
  return <input type="hidden" name={name} value={token} />;
};
// This component provides a CSRF token input field that can be used in forms to protect against CSRF attacks.
