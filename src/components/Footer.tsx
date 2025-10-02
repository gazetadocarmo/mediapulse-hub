import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-serif font-bold mb-4">GAZETA DO CARMO</h3>
            <p className="text-sm text-background/80">
              Seu portal de notícias confiável com cobertura completa em política, economia, cultura e esportes.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/sobre" className="hover:text-primary transition-colors">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link to="/contato" className="hover:text-primary transition-colors">
                  Contato
                </Link>
              </li>
              <li>
                <Link to="/categoria/politica" className="hover:text-primary transition-colors">
                  Política
                </Link>
              </li>
              <li>
                <Link to="/categoria/economia" className="hover:text-primary transition-colors">
                  Economia
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4">Categorias</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/categoria/cultura" className="hover:text-primary transition-colors">
                  Cultura
                </Link>
              </li>
              <li>
                <Link to="/categoria/esportes" className="hover:text-primary transition-colors">
                  Esportes
                </Link>
              </li>
              <li>
                <Link to="/categoria/tecnologia" className="hover:text-primary transition-colors">
                  Tecnologia
                </Link>
              </li>
              <li>
                <Link to="/categoria/mundo" className="hover:text-primary transition-colors">
                  Mundo
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="font-semibold mb-4">Siga-nos</h4>
            <div className="flex gap-4">
              <a href="#" className="hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 mt-8 pt-8 text-center text-sm text-background/80">
          <p>&copy; {currentYear} GAZETA DO CARMO. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
