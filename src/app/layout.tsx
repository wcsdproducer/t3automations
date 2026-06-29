
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import { LanguageProvider } from '@/components/providers/language-provider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'T3 Automations | Business Process Automation',
  description: 'Automate your success with custom AI solutions.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <body className="font-body antialiased bg-background" suppressHydrationWarning>
        <FirebaseClientProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}

