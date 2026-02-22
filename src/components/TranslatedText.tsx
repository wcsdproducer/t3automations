'use client';

import React, { useEffect } from 'react';
import { useLanguage } from '@/components/providers/language-provider';

type TranslatedTextProps = {
  children: string;
};

const TranslatedText = ({ children }: TranslatedTextProps) => {
  const { registerText, getTranslation } = useLanguage();

  useEffect(() => {
    if (children) {
      registerText(children);
    }
  }, [children, registerText]);

  return <>{getTranslation(children)}</>;
};

export default TranslatedText;
