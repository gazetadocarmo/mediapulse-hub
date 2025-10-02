import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Search, Menu, X, User } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NavbarProps {
  user?: any;
}

export const Navbar = ({ user }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const categories = [
    { name: "Política", slug: "politica" },
    { name: "Economia", slug: "economia" },
    { name: "Cultura", slug: "cultura" },
    { name: "Esportes", slug: "esportes" },
    { name: "Tecnologia", slug: "tecnologia" },
    { name: "Mundo", slug: "mundo" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/busca?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logout realizado",
        description: "Você saiu da sua conta com sucesso",
      });
      navigate("/");
    }
  };

  return (
    <header className="border-b border-border sticky top-0 bg-background z-50">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="text-3xl font-serif font-bold text-foreground">
            GAZETA DO CARMO
          </Link>

          {/* Search and User Actions */}
          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2">
              <input
                type="text"
                placeholder="Buscar notícias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button type="submit" size="sm" variant="ghost">
                <Search className="h-4 w-4" />
              </Button>
            </form>

            {user ? (
              <div className="flex items-center gap-2">
                {user.is_admin && (
                  <Button asChild variant="outline" size="sm">
                    <Link to="/admin/dashboard">Painel Admin</Link>
                  </Button>
                )}
                <Button onClick={handleLogout} variant="ghost" size="sm">
                  Sair
                </Button>
              </div>
            ) : (
              <Button asChild variant="ghost" size="sm">
                <Link to="/admin/login">
                  <User className="h-4 w-4 mr-2" />
                  Login
                </Link>
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden md:block border-t border-border">
          <ul className="flex items-center justify-center gap-8 py-3">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  to={`/categoria/${category.slug}`}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden border-t border-border py-4">
            <form onSubmit={handleSearch} className="mb-4 flex gap-2">
              <input
                type="text"
                placeholder="Buscar notícias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border border-border rounded px-3 py-2 text-sm"
              />
              <Button type="submit" size="sm">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            <ul className="space-y-3">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    to={`/categoria/${category.slug}`}
                    className="block text-sm font-medium text-foreground hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};
