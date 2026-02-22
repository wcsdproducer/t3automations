'use client';

import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import React from 'react';
import { T3LogoText } from '../ui/logo';
import { LanguageSelector } from '../ui/language-selector';
import TranslatedText from '../TranslatedText';

const navLinks: { href: string; label: string }[] = [];

export default function Header() {
  const [isClient, setIsClient] = React.useState(false);
  const [isHomePage, setIsHomePage] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    setIsHomePage(window.location.pathname === '/');
  }, []);

  const getHref = (href: string) => {
    if (isHomePage) {
      return href;
    }
    if (href.startsWith('#')) {
      return `/${href}`;
    }
    return href;
  };

  return (
    <header className="fixed top-0 z-50 w-full bg-[#1A1A1A]">
      <div className="container flex h-20 items-center">
        <div className="mr-6 flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <T3LogoText className="text-primary text-xl sm:text-2xl" />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2 sm:space-x-4">
          <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={getHref(link.href)}
                className="transition-colors duration-300 hover:text-primary text-foreground/80"
              >
                <TranslatedText>{link.label}</TranslatedText>
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-4">
            {isClient && <LanguageSelector />}
            <Link href="/login">
              <Button variant="ghost" className="border-2 border-transparent hover:border-primary hover:bg-transparent">
                <TranslatedText>Client Login</TranslatedText>
              </Button>
            </Link>
          </div>
          {isClient && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle className="sr-only">Menu</SheetTitle>
                  <SheetDescription className="sr-only">Mobile navigation menu</SheetDescription>
                </SheetHeader>
                <Link href="/" className="mr-6 flex items-center space-x-2 mb-6">
                  <T3LogoText className="text-primary" />
                </Link>
                <div className="grid gap-4 py-6">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.label}>
                      <Link
                        href={getHref(link.href)}
                        className="-ml-4 flex w-full items-center py-2 px-4 text-lg font-semibold rounded-md hover:bg-muted"
                      >
                        <TranslatedText>{link.label}</TranslatedText>
                      </Link>
                    </SheetClose>
                  ))}
                  <div className="flex flex-col gap-4 mt-4">
                    <div className="px-4">
                      <LanguageSelector />
                    </div>
                    <SheetClose asChild>
                      <Link href="/login">
                        <Button variant="outline" className="w-full">
                          <TranslatedText>Client Login</TranslatedText>
                        </Button>
                      </Link>
                    </SheetClose>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
}
