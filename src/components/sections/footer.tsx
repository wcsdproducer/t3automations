import { Facebook, Twitter, Linkedin, Youtube } from 'lucide-react';
import Image from 'next/image';
import { T3LogoText } from '../ui/logo';

export default function Footer() {
  return (
    <footer className="bg-background text-foreground" id="contact">
      <div className="container py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start">
                <Image
                  src="https://firebasestorage.googleapis.com/v0/b/studio-1410114603-9e1f6.firebasestorage.app/o/Site%20Media%2FNew%20Logo%20(white).png?alt=media&token=b6f97462-93bc-464e-9a0c-a28fe81262c9"
                  alt="T3 Automations Logo"
                  width={64}
                  height={64}
                />
                <T3LogoText className="text-[#C6410F] mt-2" />
                <p className="text-muted-foreground mt-1">Empowering small businesses through automations and AI Voice Assistants</p>
                <div className="flex gap-4 mt-4">
                    <a href="#" aria-label="Facebook"><Facebook className="h-6 w-6 text-muted-foreground hover:text-primary"/></a>
                    <a href="#" aria-label="Twitter"><Twitter className="h-6 w-6 text-muted-foreground hover:text-primary"/></a>
                    <a href="#" aria-label="LinkedIn"><Linkedin className="h-6 w-6 text-muted-foreground hover:text-primary"/></a>
                    <a href="#" aria-label="Youtube"><Youtube className="h-6 w-6 text-muted-foreground hover:text-primary"/></a>
                </div>
            </div>
        </div>
        <div className="mt-12 border-t border-border pt-8 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} T3 Automations. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
