
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

interface LanguageSelectorProps {
  onLanguageChange: (language: string) => void;
  currentLanguage?: string;
}

const LanguageSelector = ({ onLanguageChange, currentLanguage }: LanguageSelectorProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage || 'en');

  useEffect(() => {
    // Detect browser language on first load
    if (!currentLanguage) {
      const browserLang = navigator.language.substring(0, 2);
      const supportedLang = SUPPORTED_LANGUAGES.find(lang => lang.code === browserLang);
      if (supportedLang) {
        setSelectedLanguage(browserLang);
        onLanguageChange(browserLang);
      }
    }
  }, [currentLanguage, onLanguageChange]);

  const handleLanguageChange = (langCode: string) => {
    setSelectedLanguage(langCode);
    onLanguageChange(langCode);
    localStorage.setItem('eventory_language', langCode);
  };

  return (
    <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-32">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_LANGUAGES.map((language) => (
          <SelectItem key={language.code} value={language.code}>
            <div className="flex items-center gap-2">
              <span>{language.flag}</span>
              <span>{language.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSelector;
