
import { useState, useEffect, createContext, useContext, ReactNode } from "react";
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

  const generateToken = (): string => {
    const timestamp = Date.now().toString();
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    const randomString = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
    return `${timestamp}-${randomString}`;
  };

  const refreshToken = async () => {
    try {
      const newToken = generateToken();
      setToken(newToken);
      sessionStorage.setItem('csrf_token', newToken);
      sessionStorage.setItem('csrf_timestamp', Date.now().toString());
    } catch (error) {
      console.error('CSRF token generation failed:', error);
    }
  };

  const validateToken = (tokenToValidate: string): boolean => {
    if (!tokenToValidate || !token) return false;
    
    const storedTimestamp = sessionStorage.getItem('csrf_timestamp');
    if (!storedTimestamp) return false;
    
    // Token expires after 1 hour
    const tokenAge = Date.now() - parseInt(storedTimestamp);
    if (tokenAge > 3600000) return false;
    
    return tokenToValidate === token;
  };

  useEffect(() => {
    const storedToken = sessionStorage.getItem('csrf_token');
    const storedTimestamp = sessionStorage.getItem('csrf_timestamp');
    
    if (storedToken && storedTimestamp) {
      const tokenAge = Date.now() - parseInt(storedTimestamp);
      if (tokenAge < 3600000) { // 1 hour
        setToken(storedToken);
      } else {
        refreshToken();
      }
    } else {
      refreshToken();
    }
  }, [user]);

  // Refresh token every 30 minutes
  useEffect(() => {
    const interval = setInterval(refreshToken, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <CSRFContext.Provider value={{ token, refreshToken, validateToken }}>
      {children}
    </CSRFContext.Provider>
  );
};

export const CSRFToken = ({ name = "csrf_token" }: { name?: string }) => {
  const { token } = useCSRF();
  
  if (!token) return null;
  
  return <input type="hidden" name={name} value={token} />;
};
