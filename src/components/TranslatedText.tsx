'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/components/providers/language-provider';
import { translateText } from '@/ai/flows/translate-text';

type TranslatedTextProps = {
  children: string;
};

const TranslatedText = ({ children }: TranslatedTextProps) => {
  const { language } = useLanguage();
  const [translatedText, setTranslatedText] = useState(children);
  const [cache, setCache] = useState<Record<string, string>>({ English: children });

  useEffect(() => {
    if (language === 'English') {
      setTranslatedText(children);
      return;
    }

    if (cache[language]) {
      setTranslatedText(cache[language]);
      return;
    }
    
    // To prevent flicker, show original text while loading
    setTranslatedText(children);

    let isMounted = true;
    const doTranslate = async () => {
      try {
        const result = await translateText({ text: children, targetLanguage: language });
        if (isMounted) {
          setTranslatedText(result.translatedText);
          setCache(prev => ({...prev, [language]: result.translatedText}));
        }
      } catch (e) {
        console.error("Translation failed", e);
        if (isMounted) {
          setTranslatedText(children); // Fallback to original text on error
        }
      }
    };

    doTranslate();

    return () => {
      isMounted = false;
    };
  }, [language, children, cache]);

  return <>{translatedText}</>;
};

export default TranslatedText;
