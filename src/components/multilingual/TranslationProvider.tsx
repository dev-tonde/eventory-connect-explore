
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface Translation {
  [key: string]: string;
}

interface TranslationContextType {
  currentLanguage: string;
  translations: Translation;
  setLanguage: (language: string) => void;
  t: (key: string, fallback?: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Mock translations - in real app would fetch from API or translation service
const TRANSLATIONS: Record<string, Translation> = {
  en: {
    'events.discover': 'Discover Events',
    'events.near_you': 'Events Near You',
    'events.featured': 'Featured Events',
    'events.no_events': 'No events found',
    'events.view_details': 'View Details',
    'events.free': 'Free',
    'events.attending': 'attending',
    'nav.home': 'Home',
    'nav.events': 'Events',
    'nav.create': 'Create Event',
    'nav.dashboard': 'Dashboard',
    'nav.profile': 'Profile',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.search': 'Search',
    'location.use_current': 'Use Current Location',
    'location.search_city': 'Search city or location...',
  },
  es: {
    'events.discover': 'Descubrir Eventos',
    'events.near_you': 'Eventos Cerca de Ti',
    'events.featured': 'Eventos Destacados',
    'events.no_events': 'No se encontraron eventos',
    'events.view_details': 'Ver Detalles',
    'events.free': 'Gratis',
    'events.attending': 'asistiendo',
    'nav.home': 'Inicio',
    'nav.events': 'Eventos',
    'nav.create': 'Crear Evento',
    'nav.dashboard': 'Panel',
    'nav.profile': 'Perfil',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.search': 'Buscar',
    'location.use_current': 'Usar Ubicación Actual',
    'location.search_city': 'Buscar ciudad o ubicación...',
  },
  fr: {
    'events.discover': 'Découvrir les Événements',
    'events.near_you': 'Événements Près de Vous',
    'events.featured': 'Événements en Vedette',
    'events.no_events': 'Aucun événement trouvé',
    'events.view_details': 'Voir les Détails',
    'events.free': 'Gratuit',
    'events.attending': 'participants',
    'nav.home': 'Accueil',
    'nav.events': 'Événements',
    'nav.create': 'Créer un Événement',
    'nav.dashboard': 'Tableau de Bord',
    'nav.profile': 'Profil',
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.search': 'Rechercher',
    'location.use_current': 'Utiliser la Position Actuelle',
    'location.search_city': 'Rechercher ville ou lieu...',
  }
};

interface TranslationProviderProps {
  children: ReactNode;
}

export const TranslationProvider = ({ children }: TranslationProviderProps) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [translations, setTranslations] = useState<Translation>(TRANSLATIONS.en);

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('eventory_language');
    if (savedLanguage && TRANSLATIONS[savedLanguage]) {
      setLanguage(savedLanguage);
    }
  }, []);

  const setLanguage = (language: string) => {
    setCurrentLanguage(language);
    setTranslations(TRANSLATIONS[language] || TRANSLATIONS.en);
  };

  const t = (key: string, fallback?: string) => {
    return translations[key] || fallback || key;
  };

  return (
    <TranslationContext.Provider value={{
      currentLanguage,
      translations,
      setLanguage,
      t
    }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
