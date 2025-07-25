import React, { createContext, useContext, useState } from "react";

interface SimpleLanguageContextType {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  t: (key: string) => string;
}

export const LanguageContext = createContext<SimpleLanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState("en");

  const setLanguage = (language: string) => {
    setCurrentLanguage(language);
  };

  const t = (key: string) => {
    // Simple translation - just return the key for now
    return key;
  };

  const value = {
    currentLanguage,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};