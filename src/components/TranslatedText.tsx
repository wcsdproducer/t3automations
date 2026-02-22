'use client';

import React from 'react';
import { useLanguage } from '@/components/providers/language-provider';

type TranslatedTextProps = {
  children: string;
};

const TranslatedText = ({ children }: TranslatedTextProps) => {
  const { getTranslation } = useLanguage();

  return <>{getTranslation(children)}</>;
};

export default TranslatedText;
