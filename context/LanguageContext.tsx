import React, { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react';
import { translations, Language } from '../utils/translations';
import { debounce } from '../utils/debounce';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getInitialLanguage = (): Language => {
  if (typeof localStorage === 'undefined') return 'en';
  const saved = localStorage.getItem('app_language') as Language;
  if (saved === 'en' || saved === 'es') return saved;

  const browserLang = navigator.language.split('-')[0];
  return browserLang === 'es' ? 'es' : 'en';
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage());
  const debouncedSaveRef = useRef(debounce((lang: Language) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('app_language', lang);
    }
  }, 500));

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    debouncedSaveRef.current(lang);
  };

  useEffect(() => {
    return () => {
      debouncedSaveRef.current.cancel?.();
    };
  }, []);

  const t = (path: string): string => {
    const keys = path.split('.');
    let current: any = translations[language];

    for (const key of keys) {
      if (current[key] === undefined) return path;
      current = current[key];
    }

    return typeof current === 'string' ? current : path;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
