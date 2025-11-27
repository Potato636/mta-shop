import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { translations, type Language } from "./translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language") as Language | null;
    return saved || "pt";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (path: string): string => {
    try {
      const keys = path.split(".");
      let value: any = translations[language];
      
      for (const key of keys) {
        value = value[key];
        if (value === undefined) {
          // Fallback to English if translation not found
          value = translations.en;
          for (const k of keys) {
            value = value[k];
          }
          return value || path;
        }
      }
      return value || path;
    } catch {
      return path;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
