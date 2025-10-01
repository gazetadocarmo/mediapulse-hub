import { useEffect, useState } from "react";
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
  is_featured: boolean;
}

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [featuredNews, setFeaturedNews] = useState<News[]>([]);
  const [recentNews, setRecentNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth status
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Get user profile
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => {
            setUser(data);
          });
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => {
            setUser(data);
          });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    
    // Fetch featured news
    const { data: featured } = await supabase
      .from("news")
      .select(`
        *,
        category:categories(name, slug),
        author:profiles(full_name)
      `)
      .eq("is_featured", true)
      .order("published_at", { ascending: false })
      .limit(3);

    // Fetch recent news
    const { data: recent } = await supabase
      .from("news")
      .select(`
        *,
        category:categories(name, slug),
        author:profiles(full_name)
      `)
      .eq("is_featured", false)
      .order("published_at", { ascending: false })
      .limit(12);

    if (featured) setFeaturedNews(featured as any);
    if (recent) setRecentNews(recent as any);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Featured News */}
              {featuredNews.length > 0 && (
                <section className="mb-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <NewsCard
                        id={featuredNews[0].id}
                        title={featuredNews[0].title}
                        slug={featuredNews[0].slug}
                        category={featuredNews[0].category.name}
                        author={featuredNews[0].author.full_name}
                        publishedAt={featuredNews[0].published_at}
                        coverImage={featuredNews[0].cover_image_url}
                        excerpt={featuredNews[0].content.substring(0, 150) + "..."}
                        featured
                      />
                    </div>
                    {featuredNews.slice(1, 3).map((news) => (
                      <NewsCard
                        key={news.id}
                        id={news.id}
                        title={news.title}
                        slug={news.slug}
                        category={news.category.name}
                        author={news.author.full_name}
                        publishedAt={news.published_at}
                        coverImage={news.cover_image_url}
                        excerpt={news.content.substring(0, 120) + "..."}
                        featured
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Recent News */}
              <section>
                <h2 className="text-2xl font-serif font-bold mb-6 pb-2 border-b-2 border-primary">
                  Últimas Notícias
                </h2>
                <div className="space-y-0">
                  {recentNews.map((news) => (
                    <NewsCard
                      key={news.id}
                      id={news.id}
                      title={news.title}
                      slug={news.slug}
                      category={news.category.name}
                      author={news.author.full_name}
                      publishedAt={news.published_at}
                      coverImage={news.cover_image_url}
                      excerpt={news.content.substring(0, 120) + "..."}
                    />
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
