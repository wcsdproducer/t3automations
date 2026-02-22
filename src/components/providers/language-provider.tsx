'use client';

import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect, useMemo } from 'react';

// Import language files
import en from '@/locales/en.json';
import es from '@/locales/es.json';
import fr from '@/locales/fr.json';
import de from '@/locales/de.json';
import pt from '@/locales/pt.json';


type LanguageContextType = {
  language: string;
  setLanguage: (language: string) => void;
  getTranslation: (text: string) => string;
};

const translations: Record<string, Record<string, string>> = {
  'English': en,
  'Spanish': es,
  'French': fr,
  'German': de,
  'Brazilian Portuguese': pt,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState('English');
  const [translationMap, setTranslationMap] = useState<Record<string, string>>(() => translations['English']);

  useEffect(() => {
    setTranslationMap(translations[language] || translations['English']);
  }, [language]);


  const getTranslation = useCallback((text: string) => {
    return translationMap[text] || text;
  }, [translationMap]);


  const contextValue = useMemo(() => ({
    language,
    setLanguage,
    getTranslation,
  }), [language, getTranslation]);


  return (
    <LanguageContext.Provider value={contextValue}>
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
