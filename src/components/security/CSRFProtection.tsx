
import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CSRFContextType {
  token: string | null;
  refreshToken: () => Promise<void>;
}

const CSRFContext = createContext<CSRFContextType>({
  token: null,
  refreshToken: async () => {}
});

export const useCSRF = () => useContext(CSRFContext);

export const CSRFProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);

  const refreshToken = async () => {
    try {
      const newToken = crypto.randomUUID();
      setToken(newToken);
      sessionStorage.setItem('csrf_token', newToken);
    } catch (error) {
      console.error('CSRF token generation failed:', error);
    }
  };

  useEffect(() => {
    const storedToken = sessionStorage.getItem('csrf_token');
    if (storedToken) {
      setToken(storedToken);
    } else {
      refreshToken();
    }
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
