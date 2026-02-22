'use client';

import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect, useMemo, useRef } from 'react';
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
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const registerText = useCallback((text: string) => {
    setTextsToTranslate(prev => {
      if (prev.has(text) || !text) {
        return prev;
      }
      const newSet = new Set(prev);
      newSet.add(text);
      return newSet;
    });
  }, []);

  useEffect(() => {
    const translateBatch = async () => {
      const textsToFetch = Array.from(textsToTranslate);
      
      if (language === 'English' || textsToFetch.length === 0) {
        setTranslationMap({});
        return;
      }

      setIsLoading(true);
      try {
        const result = await batchTranslateText({ texts: textsToFetch, targetLanguage: language });
        const newMap: Record<string, string> = {};
        textsToFetch.forEach((originalText, index) => {
          newMap[originalText] = result.translatedTexts[index];
        });
        setTranslationMap(newMap);
      } catch (e) {
        console.error("Batch translation failed:", e);
        const errorMap: Record<string, string> = {};
        textsToFetch.forEach(text => {
          errorMap[text] = text; // Fallback to original
        });
        setTranslationMap(errorMap);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
        translateBatch();
    }, 500);

    return () => {
        if(debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
    }
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
