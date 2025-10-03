import { ContentBlock } from "@/types/contentBlocks";
import { Card } from "@/components/ui/card";

interface ArticlePreviewProps {
  title: string;
  coverImage?: string;
  blocks: ContentBlock[];
}

export function ArticlePreview({ title, coverImage, blocks }: ArticlePreviewProps) {
  return (
    <Card className="p-6 bg-background">
      <h3 className="text-lg font-semibold mb-4">Pré-visualização</h3>
      <div className="prose prose-slate max-w-none">
        {title && <h1 className="font-serif text-4xl font-bold mb-4">{title}</h1>}
        {coverImage && <img src={coverImage} alt="Capa" className="w-full h-auto rounded-lg mb-6" />}
        
        {blocks.map((block) => {
          switch (block.type) {
            case 'heading':
              const HeadingTag = block.level;
              return <HeadingTag key={block.id} className="font-serif font-bold mt-6 mb-3">{block.text}</HeadingTag>;
            
            case 'subtitle':
              return <h4 key={block.id} className="text-xl text-muted-foreground mb-3">{block.text}</h4>;
            
            case 'paragraph':
              return <p key={block.id} className="mb-4 leading-relaxed">{block.text}</p>;
            
            case 'image':
              return (
                <figure key={block.id} className="my-6">
                  <img src={block.url} alt={block.caption || ''} className="w-full h-auto rounded-lg" />
                  {block.caption && <figcaption className="text-sm text-muted-foreground mt-2">{block.caption}</figcaption>}
                  {block.credit && <figcaption className="text-xs text-muted-foreground">{block.credit}</figcaption>}
                </figure>
              );
            
            case 'video':
              return (
                <div key={block.id} className="my-6 aspect-video">
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
                <ListTag key={block.id} className="my-4 ml-6">
                  {block.items.map((item, idx) => (
                    <li key={idx} className="mb-2">{item}</li>
                  ))}
                </ListTag>
              );
            
            case 'chart':
              return (
                <figure key={block.id} className="my-6">
                  {block.imageUrl && <img src={block.imageUrl} alt="Gráfico" className="w-full h-auto rounded-lg" />}
                </figure>
              );
            
            case 'highlight':
              return (
                <div
                  key={block.id}
                  className={`my-6 p-4 rounded-lg border-l-4 ${
                    block.variant === 'alert'
                      ? 'bg-yellow-50 border-yellow-500'
                      : 'bg-blue-50 border-blue-500'
                  }`}
                >
                  {block.text}
                </div>
              );
            
            default:
              return null;
          }
        })}
      </div>
    </Card>
  );
}
