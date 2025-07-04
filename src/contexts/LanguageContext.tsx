import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";

interface Language {
  code: string;
  name: string;
  flag: string;
}

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  t: (key: string) => string;
  availableLanguages: readonly Language[];
}

const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", flag: "🇿🇦" },
  { code: "af", name: "Afrikaans", flag: "🇿🇦" },
  { code: "zu", name: "isiZulu", flag: "🇿🇦" },
  { code: "xh", name: "isiXhosa", flag: "🇿🇦" },
] as const;

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const translations: Record<string, Record<string, string>> = {
  // ...existing code...
  en: {
    // ...existing code...
    "nav.events": "Events",
    // ...existing code...
    "common.delete": "Delete",
  },
  af: {
    // ...existing code...
    "nav.events": "Gebeurtenisse",
    // ...existing code...
    "common.delete": "Skrap",
  },
  zu: {
    // ...existing code...
    "nav.events": "Imicimbi",
    // ...existing code...
    "common.delete": "Susa",
  },
  xh: {
    // ...existing code...
    "nav.events": "Imisitho",
    // ...existing code...
    "common.delete": "Cima",
  },
};

/**
 * Provides language context for the app.
 */
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>("en");

  useEffect(() => {
    try {
      const savedLanguage =
        typeof window !== "undefined"
          ? localStorage.getItem("preferred_language")
          : null;
      if (
        savedLanguage &&
        SUPPORTED_LANGUAGES.find((lang) => lang.code === savedLanguage)
      ) {
        setCurrentLanguage(savedLanguage);
      } else if (typeof navigator !== "undefined") {
        const browserLang = navigator.language.substring(0, 2);
        const supportedLang = SUPPORTED_LANGUAGES.find(
          (lang) => lang.code === browserLang
        );
        if (supportedLang) {
          setCurrentLanguage(browserLang);
        }
      }
    } catch {
      // Ignore localStorage errors (e.g., SSR)
    }
  }, []);

  const setLanguage = useCallback((language: string) => {
    setCurrentLanguage(language);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("preferred_language", language);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const t = useCallback(
    (key: string): string =>
      translations[currentLanguage]?.[key] || translations["en"]?.[key] || key,
    [currentLanguage]
  );

  const value = useMemo(
    () => ({
      currentLanguage,
      setLanguage,
      t,
      availableLanguages: SUPPORTED_LANGUAGES,
    }),
    [currentLanguage, setLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * Hook to access language context.
 */
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
