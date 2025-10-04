import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, User, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentBlock } from "@/types/contentBlocks";

interface NewsDetail {
  id: string;
  title: string;
  slug: string;
  category: { name: string; slug: string };
  author: { full_name: string; email: string };
  published_at: string;
  cover_image_url?: string;
  content: string;
  content_blocks?: ContentBlock[];
}

const NewsDetail = () => {
  const { slug } = useParams();
  const [user, setUser] = useState<any>(null);
  const [news, setNews] = useState<NewsDetail | null>(null);
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
    const { data } = await supabase
      .from("news")
      .select(`
        *,
        category:categories(name, slug),
        author:profiles(full_name, email)
      `)
      .eq("slug", slug)
      .single();

    if (data) setNews(data as any);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-serif font-bold mb-4">Notícia não encontrada</h1>
            <Button asChild>
              <Link to="/">Voltar para home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} />
      
      <main className="flex-1">
        <article className="container mx-auto px-4 py-8 max-w-4xl">
          <Button asChild variant="ghost" className="mb-6">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>

          <div className="mb-6">
            <Link
              to={`/categoria/${news.category.slug}`}
              className="inline-block px-3 py-1 bg-primary text-primary-foreground text-sm font-semibold rounded mb-4 hover:bg-primary/90 transition-colors"
            >
              {news.category.name}
            </Link>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">{news.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{news.author.full_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{format(new Date(news.published_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
              </div>
            </div>
          </div>

          {news.cover_image_url && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img src={news.cover_image_url} alt={news.title} className="w-full h-auto" />
            </div>
          )}

          <div className="prose prose-lg max-w-none">
            {news.content_blocks && news.content_blocks.length > 0 ? (
              news.content_blocks.map((block) => {
                switch (block.type) {
                  case 'heading':
                    const HeadingTag = block.level;
                    return <HeadingTag key={block.id} className="font-serif font-bold mt-8 mb-4">{block.text}</HeadingTag>;
                  
                  case 'subtitle':
                    return <h4 key={block.id} className="text-xl text-muted-foreground mb-4">{block.text}</h4>;
                  
                  case 'paragraph':
                    return <p key={block.id} className="mb-4 leading-relaxed text-foreground">{block.text}</p>;
                  
                  case 'image':
                    return (
                      <figure key={block.id} className="my-8">
                        <img src={block.url} alt={block.caption || ''} className="w-full h-auto rounded-lg" />
                        {block.caption && <figcaption className="text-sm text-muted-foreground mt-2">{block.caption}</figcaption>}
                        {block.credit && <figcaption className="text-xs text-muted-foreground">{block.credit}</figcaption>}
                      </figure>
                    );
                  
                  case 'video':
                    return (
                      <div key={block.id} className="my-8 aspect-video">
                        {block.embedType === 'youtube' && block.url && (
                          <iframe
                            className="w-full h-full rounded-lg"
                            src={block.url.replace('watch?v=', 'embed/')}
                            allowFullScreen
                          />
                        )}
                      </div>
                    );
                  
                  case 'list':
                    const ListTag = block.ordered ? 'ol' : 'ul';
                    return (
                      <ListTag key={block.id} className="my-6 ml-6">
                        {block.items.map((item, idx) => (
                          <li key={idx} className="mb-2 text-foreground">{item}</li>
                        ))}
                      </ListTag>
                    );
                  
                  case 'chart':
                    return (
                      <figure key={block.id} className="my-8">
                        {block.imageUrl && <img src={block.imageUrl} alt="Gráfico" className="w-full h-auto rounded-lg" />}
                      </figure>
                    );
                  
                  case 'highlight':
                    return (
                      <div
                        key={block.id}
                        className={`my-8 p-6 rounded-lg border-l-4 ${
                          block.variant === 'alert'
                            ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-500'
                            : 'bg-blue-50 dark:bg-blue-950/20 border-blue-500'
                        }`}
                      >
                        <p className="text-foreground">{block.text}</p>
                      </div>
                    );
                  
                  default:
                    return null;
                }
              })
            ) : (
              // Fallback para conteúdo antigo
              news.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-foreground leading-relaxed">
                  {paragraph}
                </p>
              ))
            )}
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default NewsDetail;
