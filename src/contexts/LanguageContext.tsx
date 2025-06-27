
import React, { createContext, useContext, useState, useEffect } from 'react';

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  t: (key: string) => string;
  availableLanguages: Array<{ code: string; name: string; flag: string }>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// South African focused languages
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇿🇦' },
  { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
  { code: 'zu', name: 'isiZulu', flag: '🇿🇦' },
  { code: 'xh', name: 'isiXhosa', flag: '🇿🇦' },
];

// Translation dictionary
const translations: Record<string, Record<string, string>> = {
  en: {
    'nav.events': 'Events',
    'nav.create': 'Create Event',
    'nav.dashboard': 'Dashboard',
    'nav.profile': 'Profile',
    'nav.logout': 'Logout',
    'nav.login': 'Login',
    'events.title': 'Discover Amazing Events',
    'events.search': 'Search events...',
    'events.category': 'Category',
    'events.date': 'Date',
    'events.price': 'Price',
    'events.location': 'Location',
    'events.free': 'Free',
    'events.buy_tickets': 'Buy Tickets',
    'events.share': 'Share',
    'events.favorite': 'Add to Favorites',
    'payment.total': 'Total',
    'payment.secure': 'Secure Payment',
    'payment.processing': 'Processing...',
    'payment.success': 'Payment Successful!',
    'payment.failed': 'Payment Failed',
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Success!',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
  },
  af: {
    'nav.events': 'Gebeurtenisse',
    'nav.create': 'Skep Gebeurtenis',
    'nav.dashboard': 'Beheertuig',
    'nav.profile': 'Profiel',
    'nav.logout': 'Teken uit',
    'nav.login': 'Teken in',
    'events.title': 'Ontdek Wonderlike Gebeurtenisse',
    'events.search': 'Soek gebeurtenisse...',
    'events.category': 'Kategorie',
    'events.date': 'Datum',
    'events.price': 'Prys',
    'events.location': 'Ligging',
    'events.free': 'Gratis',
    'events.buy_tickets': 'Koop Kaartjies',
    'events.share': 'Deel',
    'events.favorite': 'Voeg by gunstelinge',
    'payment.total': 'Totaal',
    'payment.secure': 'Veilige Betaling',
    'payment.processing': 'Verwerk...',
    'payment.success': 'Betaling Suksesvol!',
    'payment.failed': 'Betaling Misluk',
    'common.loading': 'Laai...',
    'common.error': 'Fout het voorgekom',
    'common.success': 'Sukses!',
    'common.cancel': 'Kanselleer',
    'common.confirm': 'Bevestig',
    'common.save': 'Stoor',
    'common.edit': 'Wysig',
    'common.delete': 'Skrap',
  },
  zu: {
    'nav.events': 'Imicimbi',
    'nav.create': 'Yakha Umcimbi',
    'nav.dashboard': 'Ibhodi Lokufinyela',
    'nav.profile': 'Iphrofayela',
    'nav.logout': 'Phuma',
    'nav.login': 'Ngena',
    'events.title': 'Thola Imicimbi Emangalisayo',
    'events.search': 'Sesha imicimbi...',
    'events.category': 'Uhlobo',
    'events.date': 'Usuku',
    'events.price': 'Intengo',
    'events.location': 'Indawo',
    'events.free': 'Mahhala',
    'events.buy_tickets': 'Thenga Amathikithi',
    'events.share': 'Yabelana',
    'events.favorite': 'Engeza kuzithandekayo',
    'payment.total': 'Isamba',
    'payment.secure': 'Ukukhokha Okuphephile',
    'payment.processing': 'Kuyacutshungulwa...',
    'payment.success': 'Ukukhokha Kuphumelile!',
    'payment.failed': 'Ukukhokha Kuhlulekile',
    'common.loading': 'Iyalayisha...',
    'common.error': 'Kube khona iphutha',
    'common.success': 'Impumelelo!',
    'common.cancel': 'Khansela',
    'common.confirm': 'Qinisekisa',
    'common.save': 'Londoloza',
    'common.edit': 'Hlela',
    'common.delete': 'Susa',
  },
  xh: {
    'nav.events': 'Imisitho',
    'nav.create': 'Yenza Umsitho',
    'nav.dashboard': 'Ibhodi Yolawulo',
    'nav.profile': 'Iprofayile',
    'nav.logout': 'Phuma',
    'nav.login': 'Ngena',
    'events.title': 'Fumanisa Imisitho Emangalisayo',
    'events.search': 'Khangela imisitho...',
    'events.category': 'Udidi',
    'events.date': 'Umhla',
    'events.price': 'Ixabiso',
    'events.location': 'Indawo',
    'events.free': 'Simahla',
    'events.buy_tickets': 'Thenga Amatikiti',
    'events.share': 'Yabelana',
    'events.favorite': 'Yongeza kwizinto ozithandayo',
    'payment.total': 'Iyonke',
    'payment.secure': 'Intlawulo Ekhuselekileyo',
    'payment.processing': 'Iyaqhubeka...',
    'payment.success': 'Intlawulo Iphumelele!',
    'payment.failed': 'Intlawulo Ayiphumelelanga',
    'common.loading': 'Iyalayisha...',
    'common.error': 'Kwenzeke impazamo',
    'common.success': 'Impumelelo!',
    'common.cancel': 'Rhoxisa',
    'common.confirm': 'Qinisekisa',
    'common.save': 'Gcina',
    'common.edit': 'Hlela',
    'common.delete': 'Cima',
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    // Load saved language or detect browser language
    const savedLanguage = localStorage.getItem('preferred_language');
    if (savedLanguage && SUPPORTED_LANGUAGES.find(lang => lang.code === savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    } else {
      // Detect browser language
      const browserLang = navigator.language.substring(0, 2);
      const supportedLang = SUPPORTED_LANGUAGES.find(lang => lang.code === browserLang);
      if (supportedLang) {
        setCurrentLanguage(browserLang);
      }
    }
  }, []);

  const setLanguage = (language: string) => {
    setCurrentLanguage(language);
    localStorage.setItem('preferred_language', language);
  };

  const t = (key: string): string => {
    return translations[currentLanguage]?.[key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      setLanguage,
      t,
      availableLanguages: SUPPORTED_LANGUAGES,
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
