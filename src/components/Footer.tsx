import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { MessageCircle } from "lucide-react";

export const Footer = () => {
  return (
    <>
      <a
        href="https://wa.me/2250789363442"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20BD5A] text-white p-4 rounded-full shadow-lg transition-all hover:scale-110"
        aria-label="Contactez-nous sur WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
      
      <footer className="border-t border-border bg-card mt-auto">
        <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="Le Koro" className="h-10 w-10" />
              <span className="text-xl font-bold">Le Koro</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Plateforme dédiée aux étudiants en Mathématiques et Informatique. 
              Accédez à des milliers de corrigés pour réussir vos études.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Navigation</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link to="/install" className="hover:text-primary transition-colors">Installer l'app</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Légal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/confidentialite" className="hover:text-primary transition-colors">Confidentialité</Link></li>
              <li><Link to="/conditions" className="hover:text-primary transition-colors">Conditions d'utilisation</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Le Koro. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
    </>
  );
};