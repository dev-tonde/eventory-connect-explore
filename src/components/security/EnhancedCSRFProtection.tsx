/* eslint-disable react-refresh/only-export-components */
import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { useAuth } from "@/contexts/AuthContext";

interface CSRFContextType {
  token: string | null;
  refreshToken: () => Promise<void>;
  validateToken: (token: string) => boolean;
}

const CSRFContext = createContext<CSRFContextType>({
  token: null,
  refreshToken: async () => {},
  validateToken: () => false,
});

export const useCSRF = () => useContext(CSRFContext);

export const EnhancedCSRFProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const { user } = useAuth();

  // Generate a secure CSRF token with timestamp and random bytes
  const generateToken = (): string => {
    const timestamp = Date.now().toString();
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    const randomString = Array.from(randomBytes, (byte) =>
      byte.toString(16).padStart(2, "0")
    ).join("");
    return `${timestamp}-${randomString}`;
  };

  // Refresh the CSRF token and store it with a timestamp
  const refreshToken = async () => {
    try {
      const newToken = generateToken();
      setToken(newToken);
      sessionStorage.setItem("csrf_token", newToken);
      sessionStorage.setItem("csrf_timestamp", Date.now().toString());
    } catch (error) {
      // Fallback: use a less secure random string if crypto fails
      const fallbackToken = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;
      setToken(fallbackToken);
      sessionStorage.setItem("csrf_token", fallbackToken);
      sessionStorage.setItem("csrf_timestamp", Date.now().toString());
      // Optionally log error
      // console.error("CSRF token generation failed:", error);
    }
  };

  // Validate the CSRF token and check expiry (1 hour)
  const validateToken = (tokenToValidate: string): boolean => {
    if (!tokenToValidate || !token) return false;
    const storedTimestamp = sessionStorage.getItem("csrf_timestamp");
    if (!storedTimestamp) return false;
    const tokenAge = Date.now() - parseInt(storedTimestamp, 10);
    if (tokenAge > 3600000) return false; // 1 hour expiry
    return tokenToValidate === token;
  };

  // On mount or user change, load or refresh token
  useEffect(() => {
    const storedToken = sessionStorage.getItem("csrf_token");
    const storedTimestamp = sessionStorage.getItem("csrf_timestamp");
    if (storedToken && storedTimestamp) {
      const tokenAge = Date.now() - parseInt(storedTimestamp, 10);
      if (tokenAge < 3600000) {
        setToken(storedToken);
      } else {
        refreshToken();
      }
    } else {
      refreshToken();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Refresh token every 30 minutes for extra security
  useEffect(() => {
    const interval = setInterval(refreshToken, 30 * 60 * 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CSRFContext.Provider value={{ token, refreshToken, validateToken }}>
      {children}
    </CSRFContext.Provider>
  );
};

// Hidden input for CSRF token in forms
export const CSRFToken = ({ name = "csrf_token" }: { name?: string }) => {
  const { token } = useCSRF();
  if (!token) return null;
  return <input type="hidden" name={name} value={token} />;
};
// This component provides a CSRF token input field that can be used in forms to protect against CSRF attacks.
