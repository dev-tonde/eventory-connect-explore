import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

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

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<string, Record<string, string>> = {
  en: {
    "nav.events": "Events",
    "common.delete": "Delete",
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.search": "Search",
    "events.discover": "Discover Events",
    "events.near_you": "Events Near You",
    "events.featured": "Featured Events",
    "events.no_events": "No events found",
    "events.view_details": "View Details",
    "events.free": "Free",
    "events.attending": "attending",
    "nav.home": "Home",
    "nav.create": "Create Event",
    "nav.dashboard": "Dashboard",
    "nav.profile": "Profile",
    "location.use_current": "Use Current Location",
    "location.search_city": "Search city or location...",
  },
  af: {
    "nav.events": "Gebeurtenisse",
    "common.delete": "Skrap",
    "common.loading": "Laai...",
    "common.error": "Fout",
    "common.search": "Soek",
    "events.discover": "Ontdek Gebeurtenisse",
    "events.near_you": "Gebeurtenisse Naby Jou",
    "events.featured": "Uitgestalde Gebeurtenisse",
    "events.no_events": "Geen gebeurtenisse gevind nie",
    "events.view_details": "Bekyk Besonderhede",
    "events.free": "Gratis",
    "events.attending": "bywonend",
    "nav.home": "Tuis",
    "nav.create": "Skep Gebeurtenis",
    "nav.dashboard": "Dashboard",
    "nav.profile": "Profiel",
    "location.use_current": "Gebruik Huidige Ligging",
    "location.search_city": "Soek stad of ligging...",
  },
  zu: {
    "nav.events": "Imicimbi",
    "common.delete": "Susa",
    "common.loading": "Kulayisha...",
    "common.error": "Iphutha",
    "common.search": "Sesha",
    "events.discover": "Thola Imicimbi",
    "events.near_you": "Imicimbi Eduze Nawe",
    "events.featured": "Imicimbi Evelile",
    "events.no_events": "Ayikho imicimbi etholiwe",
    "events.view_details": "Buka Imininingwane",
    "events.free": "Mahhala",
    "events.attending": "ehambe",
    "nav.home": "Ekhaya",
    "nav.create": "Dala Umcimbi",
    "nav.dashboard": "I-Dashboard",
    "nav.profile": "Iphrofayela",
    "location.use_current": "Sebenzisa Indawo Yamanje",
    "location.search_city": "Sesha idolobha noma indawo...",
  },
  xh: {
    "nav.events": "Imisitho",
    "common.delete": "Cima",
    "common.loading": "Kulayishwa...",
    "common.error": "Impazamo",
    "common.search": "Khangela",
    "events.discover": "Fumana Imisitho",
    "events.near_you": "Imisitho Ekufutshane Nawe",
    "events.featured": "Imisitho Ebalaseleyo",
    "events.no_events": "Akukho misitho ifunyenweyo",
    "events.view_details": "Jonga Iinkcukacha",
    "events.free": "Simahla",
    "events.attending": "ehambe",
    "nav.home": "Ekhaya",
    "nav.create": "Yenza Umsitho",
    "nav.dashboard": "I-Dashboard",
    "nav.profile": "Iprofayile",
    "location.use_current": "Sebenzisa Indawo Yangoku",
    "location.search_city": "Khangela isixeko okanye indawo...",
  },
};

/**
 * Secure language provider that uses sessionStorage instead of localStorage
 */
export const SecureLanguageProvider = ({ children }: { children: ReactNode }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>("en");

  useEffect(() => {
    try {
      // Use sessionStorage instead of localStorage for security
      const savedLanguage = sessionStorage.getItem("preferred_language");
      if (savedLanguage && SUPPORTED_LANGUAGES.find((lang) => lang.code === savedLanguage)) {
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
      // Ignore sessionStorage errors
    }
  }, []);

  const setLanguage = useCallback((language: string) => {
    setCurrentLanguage(language);
    try {
      sessionStorage.setItem("preferred_language", language);
    } catch {
      // Ignore sessionStorage errors
    }
  }, []);

  const t = useCallback(
    (key: string): string =>
      translations[currentLanguage]?.[key] || translations["en"]?.[key] || key,
    [currentLanguage]
  );

  return (
    <LanguageContext.Provider 
      value={{
        currentLanguage,
        setLanguage,
        t,
        availableLanguages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * Hook to access secure language context.
 */
export const useSecureLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useSecureLanguage must be used within a SecureLanguageProvider");
  }
  return context;
};