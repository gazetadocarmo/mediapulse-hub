import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock } from "lucide-react";

interface NewsCardProps {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  publishedAt: string;
  coverImage?: string;
  excerpt?: string;
  featured?: boolean;
}

export const NewsCard = ({
  title,
  slug,
  category,
  author,
  publishedAt,
  coverImage,
  excerpt,
  featured = false,
}: NewsCardProps) => {
  const timeAgo = formatDistanceToNow(new Date(publishedAt), {
    addSuffix: true,
    locale: ptBR,
  });

  if (featured) {
    return (
      <Link to={`/noticia/${slug}`} className="block group">
        <article className="relative h-[500px] overflow-hidden rounded-lg">
          {coverImage ? (
            <img
              src={coverImage}
              alt={title}
              className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
            />
          ) : (
            <div className="w-full h-full bg-muted" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-background">
            <span className="inline-block px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded mb-3">
              {category}
            </span>
            <h2 className="text-4xl font-serif font-bold mb-3 group-hover:text-primary transition-colors">
              {title}
            </h2>
            {excerpt && <p className="text-background/90 mb-3 line-clamp-2">{excerpt}</p>}
            <div className="flex items-center gap-2 text-sm text-background/80">
              <span>{author}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeAgo}
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link to={`/noticia/${slug}`} className="block group">
      <article className="border-b border-border pb-6 mb-6">
        <div className="flex gap-4">
          {coverImage && (
            <div className="flex-shrink-0 w-32 h-32 overflow-hidden rounded">
              <img
                src={coverImage}
                alt={title}
                className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
              />
            </div>
          )}
          <div className="flex-1">
            <span className="inline-block px-2 py-1 bg-muted text-muted-foreground text-xs font-semibold rounded mb-2">
              {category}
            </span>
            <h3 className="text-xl font-serif font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
              {title}
            </h3>
            {excerpt && <p className="text-muted-foreground text-sm mb-2 line-clamp-2">{excerpt}</p>}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{author}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeAgo}
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};
