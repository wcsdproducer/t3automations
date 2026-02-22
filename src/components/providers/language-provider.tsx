'use client';

import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { batchTranslateText } from '@/ai/flows/translate-text';

type LanguageContextType = {
  language: string;
  setLanguage: (language: string) => void;
  getTranslation: (text: string) => string;
  registerText: (text: string) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState('English');
  const [translationMap, setTranslationMap] = useState<Record<string, string>>({});
  const [textsToTranslate, setTextsToTranslate] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const registerText = useCallback((text: string) => {
    setTextsToTranslate(prev => {
      if (prev.has(text)) {
        return prev;
      }
      const newSet = new Set(prev);
      newSet.add(text);
      return newSet;
    });
  }, []);

  useEffect(() => {
    const translateAll = async () => {
      if (language === 'English' || textsToTranslate.size === 0) {
        setTranslationMap({});
        return;
      }

      setIsLoading(true);
      const textsArray = Array.from(textsToTranslate);
      
      try {
        const result = await batchTranslateText({ texts: textsArray, targetLanguage: language });
        const newMap: Record<string, string> = {};
        textsArray.forEach((originalText, index) => {
          newMap[originalText] = result.translatedTexts[index];
        });
        setTranslationMap(newMap);
      } catch (e) {
        console.error("Batch translation failed:", e);
        // On failure, map original text to itself to avoid breaking the UI
        const newMap: Record<string, string> = {};
        textsArray.forEach(text => {
          newMap[text] = text;
        });
        setTranslationMap(newMap);
      } finally {
        setIsLoading(false);
      }
    };

    translateAll();
  }, [language, textsToTranslate]);

  const getTranslation = useCallback((text: string) => {
    if (language === 'English' || isLoading) {
      return text;
    }
    return translationMap[text] || text;
  }, [language, translationMap, isLoading]);

  const contextValue = useMemo(() => ({
    language,
    setLanguage,
    getTranslation,
    registerText
  }), [language, getTranslation, registerText]);


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
