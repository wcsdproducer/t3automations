'use client';

import { Button } from '@/components/ui/button';
import { Menu, Share2 } from 'lucide-react';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import React from 'react';

const navLinks = [
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
    
    // Set initial state
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 z-50 w-full transition-colors duration-300 bg-white shadow-md`}>
      <div className="container flex h-16 items-center">
        <div className="mr-6 flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Share2 className={`h-6 w-6 transition-colors duration-300 text-primary`} />
            <span className={`hidden font-bold sm:inline-block transition-colors duration-300 text-foreground`}>T3 Automations</span>
          </Link>
        </div>
        <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors duration-300 hover:text-opacity-80 text-foreground/60 hover:text-foreground`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2 sm:space-x-4">
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/signup">
            <Button>Book a consultation</Button>
          </Link>
          {isClient && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className={`md:hidden`}>
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <Link href="/" className="mr-6 flex items-center space-x-2 mb-6">
                  <Share2 className="h-6 w-6 text-primary" />
                  <span className="font-bold">T3 Automations</span>
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
