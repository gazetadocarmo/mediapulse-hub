import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Loader2, Plus, Edit, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
      return;
    }
    
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
    if (!profile?.is_admin) {
      toast({ title: "Acesso negado", description: "Você não tem permissão de administrador", variant: "destructive" });
      navigate("/");
      return;
    }
    
    setUser(profile);
    fetchNews();
  };

  const fetchNews = async () => {
    const { data } = await supabase.from("news").select("*, category:categories(name), author:profiles(full_name)").order("published_at", { ascending: false });
    if (data) setNews(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja deletar esta notícia?")) return;
    const { error } = await supabase.from("news").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao deletar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Notícia deletada!" });
      fetchNews();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif font-bold">Painel Administrativo</h1>
          <Button asChild>
            <Link to="/admin/criar-noticia"><Plus className="h-4 w-4 mr-2" />Nova Notícia</Link>
          </Button>
        </div>
        
        <div className="space-y-4">
          {news.map((item) => (
            <div key={item.id} className="border border-border rounded-lg p-4 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.category.name} • {item.author.full_name}</p>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to={`/admin/editar-noticia/${item.id}`}><Edit className="h-4 w-4" /></Link>
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
