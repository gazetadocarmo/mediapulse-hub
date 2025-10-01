import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { NewsCard } from "@/components/NewsCard";
import { Loader2, Search as SearchIcon } from "lucide-react";

interface News {
  id: string;
  title: string;
  slug: string;
  category: { name: string; slug: string };
  author: { full_name: string };
  published_at: string;
  cover_image_url?: string;
  content: string;
}

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [user, setUser] = useState<any>(null);
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => setUser(data));
      }
    });
  }, []);

  useEffect(() => {
    if (query) {
      searchNews();
    }
  }, [query]);

  const searchNews = async () => {
    setLoading(true);
    
    const { data } = await supabase
      .from("news")
      .select(`
        *,
        category:categories(name, slug),
        author:profiles(full_name)
      `)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order("published_at", { ascending: false });

    if (data) setNews(data as any);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <SearchIcon className="h-5 w-5" />
              <span>Resultados da busca</span>
            </div>
            <h1 className="text-3xl font-serif font-bold">"{query}"</h1>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground mb-2">Nenhuma notícia encontrada</p>
              <p className="text-sm text-muted-foreground">
                Tente buscar com outras palavras-chave
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                {news.length} {news.length === 1 ? "resultado encontrado" : "resultados encontrados"}
              </p>
              <div className="space-y-0">
                {news.map((item) => (
                  <NewsCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    slug={item.slug}
                    category={item.category.name}
                    author={item.author.full_name}
                    publishedAt={item.published_at}
                    coverImage={item.cover_image_url}
                    excerpt={item.content.substring(0, 120) + "..."}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Search;
