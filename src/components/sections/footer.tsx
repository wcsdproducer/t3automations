import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import Image from 'next/image';
import { T3LogoText } from '../ui/logo';
import TranslatedText from '../TranslatedText';

export default function Footer() {
  return (
    <footer className="bg-background text-foreground" id="contact">
      <div className="container py-12">
        <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="flex-shrink-0">
                <Image
                  src="https://firebasestorage.googleapis.com/v0/b/studio-1410114603-9e1f6.firebasestorage.app/o/Site%20Media%2FNew%20Logo%20(white).png?alt=media&token=b6f97462-93bc-464e-9a0c-a28fe81262c9"
                  alt="T3 Automations Logo"
                  width={120}
                  height={120}
                />
            </div>
            
            <div className="flex flex-col items-start pt-2">
                <T3LogoText className="text-[#C6410F]" />
                <p className="text-muted-foreground mt-1 text-left"><TranslatedText>Empowering small businesses through automations and AI Voice Assistants</TranslatedText></p>
                <div className="flex gap-4 mt-4">
                    <a href="#" aria-label="Facebook"><Facebook className="h-5 w-5 text-primary hover:opacity-80"/></a>
                    <a href="#" aria-label="Twitter"><Twitter className="h-5 w-5 text-primary hover:opacity-80"/></a>
                    <a href="#" aria-label="Instagram"><Instagram className="h-5 w-5 text-primary hover:opacity-80"/></a>
                    <a href="#" aria-label="LinkedIn"><Linkedin className="h-5 w-5 text-primary hover:opacity-80"/></a>
                </div>
            </div>
        </div>
        <div className="mt-12 border-t border-border pt-8 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} T3 Automations. <TranslatedText>All Rights Reserved.</TranslatedText></p>
        </div>
      </div>
    </footer>
  );
}
