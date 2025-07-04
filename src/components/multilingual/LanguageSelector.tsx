import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";

const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
];

interface LanguageSelectorProps {
  onLanguageChange: (language: string) => void;
  currentLanguage?: string;
}

const LanguageSelector = ({
  onLanguageChange,
  currentLanguage,
}: LanguageSelectorProps) => {
  // Use localStorage for persistence, fallback to browser language, then default to 'en'
  const getInitialLanguage = () => {
    if (currentLanguage) return currentLanguage;
    const stored = localStorage.getItem("eventory_language");
    if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored))
      return stored;
    const browserLang = navigator.language.substring(0, 2);
    return SUPPORTED_LANGUAGES.some((l) => l.code === browserLang)
      ? browserLang
      : "en";
  };

  const [selectedLanguage, setSelectedLanguage] = useState(getInitialLanguage);

  useEffect(() => {
    setSelectedLanguage(getInitialLanguage());
    // Only call onLanguageChange if not already set
    if (currentLanguage !== selectedLanguage) {
      onLanguageChange(selectedLanguage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLanguage]);

  const handleLanguageChange = (langCode: string) => {
    setSelectedLanguage(langCode);
    onLanguageChange(langCode);
    localStorage.setItem("eventory_language", langCode);
  };

  return (
    <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-36" aria-label="Select language">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" aria-hidden="true" />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_LANGUAGES.map((language) => (
          <SelectItem key={language.code} value={language.code}>
            <div className="flex items-center gap-2">
              <span aria-hidden="true">{language.flag}</span>
              <span>{language.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSelector;
// This component provides a language selector for the Eventory platform.
// It allows users to select their preferred language from a list of supported languages.
// The selected language is stored in localStorage for persistence across sessions.
// The component uses a dropdown select UI and displays the language name along with its flag for better user experience.
// The `onLanguageChange` callback is called whenever the user selects a new language, allowing the parent component to handle the change (e.g., updating translations).
