import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { NewsCard } from "@/components/NewsCard";
import { Loader2 } from "lucide-react";

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

const CategoryNews = () => {
  const { slug } = useParams();
  const [user, setUser] = useState<any>(null);
  const [news, setNews] = useState<News[]>([]);
  const [categoryName, setCategoryName] = useState("");
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
    if (slug) {
      fetchNews();
    }
  }, [slug]);

  const fetchNews = async () => {
    setLoading(true);

    // Get category first
    const { data: category } = await supabase
      .from("categories")
      .select("id, name")
      .eq("slug", slug)
      .single();

    if (category) {
      setCategoryName(category.name);
      
      // Get news for this category
      const { data } = await supabase
        .from("news")
        .select(`
          *,
          category:categories(name, slug),
          author:profiles(full_name)
        `)
        .eq("category_id", category.id)
        .order("published_at", { ascending: false });

      if (data) setNews(data as any);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-serif font-bold mb-8 pb-4 border-b-2 border-primary">
            {categoryName}
          </h1>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : news.length === 0 ? (
            <p className="text-center text-muted-foreground py-20">
              Nenhuma notícia encontrada nesta categoria.
            </p>
          ) : (
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
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CategoryNews;
