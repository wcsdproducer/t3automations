import { Facebook, Twitter, Linkedin, Youtube } from 'lucide-react';
import { T3Logo, T3LogoText } from '../ui/logo';

export default function Footer() {
  return (
    <footer className="bg-background text-foreground" id="contact">
      <div className="container py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start gap-4">
                <T3Logo className="text-primary h-16 w-16" />
                <T3LogoText className="text-foreground" />
                <p className="text-muted-foreground">Automating the world's conversations.</p>
                <div className="flex gap-4 mt-4">
                    <a href="#" aria-label="Facebook"><Facebook className="h-6 w-6 text-muted-foreground hover:text-primary"/></a>
                    <a href="#" aria-label="Twitter"><Twitter className="h-6 w-6 text-muted-foreground hover:text-primary"/></a>
                    <a href="#" aria-label="LinkedIn"><Linkedin className="h-6 w-6 text-muted-foreground hover:text-primary"/></a>
                    <a href="#" aria-label="Youtube"><Youtube className="h-6 w-6 text-muted-foreground hover:text-primary"/></a>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-left">
              <div>
                <h3 className="font-bold">Solutions</h3>
                <ul className="mt-4 space-y-2">
                  <li><a href="#" className="hover:text-primary text-muted-foreground">AI Receptionists</a></li>
                  <li><a href="#" className="hover:text-primary text-muted-foreground">Live Chat</a></li>
                  <li><a href="#" className="hover:text-primary text-muted-foreground">AI Chatbot</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold">Company</h3>
                <ul className="mt-4 space-y-2">
                  <li><a href="#" className="hover:text-primary text-muted-foreground">About Us</a></li>
                  <li><a href="#" className="hover:text-primary text-muted-foreground">Careers</a></li>
                  <li><a href="#" className="hover:text-primary text-muted-foreground">Contact</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold">Resources</h3>
                <ul className="mt-4 space-y-2">
                  <li><a href="#" className="hover:text-primary text-muted-foreground">Blog</a></li>
                  <li><a href="#" className="hover:text-primary text-muted-foreground">Case Studies</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold">Legal</h3>
                <ul className="mt-4 space-y-2">
                  <li><a href="#" className="hover:text-primary text-muted-foreground">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-primary text-muted-foreground">Privacy Policy</a></li>
                </ul>
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
