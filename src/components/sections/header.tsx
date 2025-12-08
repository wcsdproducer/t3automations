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
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-6 flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Phone className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">Smith.ai</span>
          </Link>
        </div>
        <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2 sm:space-x-4">
          <Button variant="ghost">Login</Button>
          <Button>Book a consultation</Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
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
        </div>
      </div>
    </header>
  );
}
