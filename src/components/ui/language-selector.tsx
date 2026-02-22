'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/components/providers/language-provider';

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <Select onValueChange={setLanguage} value={language}>
      <SelectTrigger className="w-auto bg-transparent border-0 text-foreground/80 hover:text-primary focus:ring-0 gap-2">
        <Globe className="h-5 w-5" />
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="English">English</SelectItem>
        <SelectItem value="Spanish">Spanish</SelectItem>
        <SelectItem value="French">French</SelectItem>
        <SelectItem value="German">German</SelectItem>
        <SelectItem value="Brazilian Portuguese">Brazilian Portuguese</SelectItem>
      </SelectContent>
    </Select>
  );
}
