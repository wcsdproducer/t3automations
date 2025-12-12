'use client';

import { Button } from '@/components/ui/button';
import { Menu, Phone } from 'lucide-react';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import React from 'react';

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#demos', label: 'Demos' },
  { href: '#contact', label: 'Contact' },
];

export default function Header() {
  const [isClient, setIsClient] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 z-50 w-full transition-colors duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
      <div className="container flex h-16 items-center">
        <div className="mr-6 flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Phone className={`h-6 w-6 transition-colors duration-300 ${isScrolled ? 'text-primary' : 'text-white'}`} />
            <span className={`hidden font-bold sm:inline-block transition-colors duration-300 ${isScrolled ? 'text-foreground' : 'text-white'}`}>Smith.ai</span>
          </Link>
        </div>
        <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors duration-300 hover:text-opacity-80 ${isScrolled ? 'text-foreground/60 hover:text-foreground' : 'text-white/80 hover:text-white'}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2 sm:space-x-4">
          <Link href="/dashboard">
            <Button variant="ghost" className={isScrolled ? '' : 'text-white hover:bg-white/10 hover:text-white'}>Login</Button>
          </Link>
          <Button className={isScrolled ? '' : 'bg-white text-primary hover:bg-white/90'}>Book a consultation</Button>
          {isClient && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className={`md:hidden ${isScrolled ? '' : 'text-white hover:bg-white/10 hover:text-white'}`}>
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <Link href="/" className="mr-6 flex items-center space-x-2 mb-6">
                  <Phone className="h-6 w-6 text-primary" />
                  <span className="font-bold">Smith.ai</span>
                </Link>
                <div className="grid gap-4 py-6">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className="-ml-4 flex w-full items-center py-2 px-4 text-lg font-semibold rounded-md hover:bg-muted"
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
}
