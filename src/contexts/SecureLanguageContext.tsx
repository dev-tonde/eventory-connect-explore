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

// Secure translations object with sanitized content
const translations: Record<string, Record<string, string>> = {
  en: {
    "nav.events": "Events",
    "nav.communities": "Communities",
    "nav.profile": "Profile",
    "nav.dashboard": "Dashboard",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.loading": "Loading...",
    "common.error": "Error",
    "auth.login": "Login",
    "auth.signup": "Sign Up",
    "auth.logout": "Logout",
    "events.title": "Events",
    "events.create": "Create Event",
    "events.search": "Search Events",
    "profile.settings": "Profile Settings",
  },
  af: {
    "nav.events": "Gebeurtenisse",
    "nav.communities": "Gemeenskappe",
    "nav.profile": "Profiel",
    "nav.dashboard": "Kontrolebord",
    "common.delete": "Skrap",
    "common.edit": "Wysig",
    "common.save": "Stoor",
    "common.cancel": "Kanselleer",
    "common.loading": "Laai...",
    "common.error": "Fout",
    "auth.login": "Teken In",
    "auth.signup": "Registreer",
    "auth.logout": "Teken Uit",
    "events.title": "Gebeurtenisse",
    "events.create": "Skep Gebeurtenis",
    "events.search": "Soek Gebeurtenisse",
    "profile.settings": "Profiel Instellings",
  },
  zu: {
    "nav.events": "Imicimbi",
    "nav.communities": "Imiphakathi",
    "nav.profile": "Iphrofayela",
    "nav.dashboard": "Ibhodi",
    "common.delete": "Susa",
    "common.edit": "Hlela",
    "common.save": "Gcina",
    "common.cancel": "Khansela",
    "common.loading": "Iyalayisha...",
    "common.error": "Iphutha",
    "auth.login": "Ngena",
    "auth.signup": "Bhalisa",
    "auth.logout": "Phuma",
    "events.title": "Imicimbi",
    "events.create": "Dala Umcimbi",
    "events.search": "Sesha Imicimbi",
    "profile.settings": "Izilungiselelo Zephrofayela",
  },
  xh: {
    "nav.events": "Imisitho",
    "nav.communities": "Uluntu",
    "nav.profile": "Iprofayile",
    "nav.dashboard": "Ibhodi",
    "common.delete": "Cima",
    "common.edit": "Hlela",
    "common.save": "Gcina",
    "common.cancel": "Rhoxisa",
    "common.loading": "Iyalayisha...",
    "common.error": "Impazamo",
    "auth.login": "Ngena",
    "auth.signup": "Bhalisa",
    "auth.logout": "Phuma",
    "events.title": "Imisitho",
    "events.create": "Yenza Umsitho",
    "events.search": "Khangela Imisitho",
    "profile.settings": "Iisethingi Zeprofayile",
  },
};

/**
 * Secure language provider that doesn't use localStorage
 * Uses session storage for temporary persistence within the browser session
 */
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>("en");

  useEffect(() => {
    try {
      // Try to get from sessionStorage first (safer than localStorage)
      const savedLanguage = typeof window !== "undefined" 
        ? sessionStorage.getItem("app_language")
        : null;
        
      if (savedLanguage && isValidLanguage(savedLanguage)) {
        setCurrentLanguage(savedLanguage);
      } else if (typeof navigator !== "undefined") {
        // Fallback to browser language
        const browserLang = navigator.language.substring(0, 2);
        const supportedLang = SUPPORTED_LANGUAGES.find(
          (lang) => lang.code === browserLang
        );
        if (supportedLang) {
          setCurrentLanguage(browserLang);
        }
      }
    } catch (error) {
      // Ignore storage errors and use default language
      console.warn("Language detection failed, using default:", error);
    }
  }, []);

  const setLanguage = useCallback((language: string) => {
    if (!isValidLanguage(language)) {
      console.warn("Invalid language code:", language);
      return;
    }

    setCurrentLanguage(language);
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("app_language", language);
      }
    } catch (error) {
      // Ignore storage errors
      console.warn("Failed to save language preference:", error);
    }
  }, []);

  // Secure translation function with XSS protection
  const t = useCallback(
    (key: string): string => {
      if (typeof key !== "string" || !key.trim()) {
        return "";
      }

      // Sanitize the key to prevent injection
      const sanitizedKey = key.replace(/[<>]/g, "").trim();
      
      const translation = 
        translations[currentLanguage]?.[sanitizedKey] || 
        translations["en"]?.[sanitizedKey] || 
        sanitizedKey;

      // Additional XSS protection for the translation
      return typeof translation === "string" 
        ? translation.replace(/[<>]/g, "")
        : sanitizedKey;
    },
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
 * Hook to access secure language context
 */
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// Helper function to validate language codes
function isValidLanguage(language: string): boolean {
  return SUPPORTED_LANGUAGES.some(lang => lang.code === language);
}