import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ContentBlock, BlockType } from "@/types/contentBlocks";
import { BlockToolbar } from "@/components/editor/BlockToolbar";
import { ContentBlockRenderer } from "@/components/editor/ContentBlockRenderer";
import { ArticlePreview } from "@/components/editor/ArticlePreview";
import { ArticleSettings } from "@/components/editor/ArticleSettings";

function SortableBlock({ 
  block, 
  onUpdate, 
  onDelete 
}: { 
  block: ContentBlock; 
  onUpdate: (block: ContentBlock) => void; 
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <ContentBlockRenderer
        block={block}
        onUpdate={onUpdate}
        onDelete={onDelete}
        dragHandleProps={listeners}
      />
    </div>
  );
}

export default function CreateNews() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string; }[]>([]);
  
  // Basic fields
  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  
  // Content blocks
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  
  // Settings
  const [authors, setAuthors] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [status, setStatus] = useState("draft");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoTags, setSeoTags] = useState<string[]>([]);
  const [socialImageUrl, setSocialImageUrl] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    checkAuth();
    fetchCategories();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/admin/login");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      toast({ title: "Acesso negado", variant: "destructive" });
      navigate("/");
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("id, name")
      .order("name");
    if (data) setCategories(data);
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const addBlock = (type: BlockType) => {
    const newBlock: ContentBlock = {
      id: `${Date.now()}`,
      type,
      ...(type === 'heading' && { level: 'h1' as const, text: '' }),
      ...(type === 'subtitle' && { text: '' }),
      ...(type === 'paragraph' && { text: '' }),
      ...(type === 'image' && { url: '' }),
      ...(type === 'video' && { url: '', embedType: 'youtube' as const }),
      ...(type === 'list' && { items: [{ text: '', link: '' }], ordered: false }),
      ...(type === 'chart' && { imageUrl: '' }),
      ...(type === 'highlight' && { text: '', variant: 'alert' as const }),
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (id: string, updatedBlock: ContentBlock) => {
    setBlocks(blocks.map(b => b.id === id ? updatedBlock : b));
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const uploadCoverImage = async (): Promise<string | null> => {
    if (!coverImage) return null;

    const fileExt = coverImage.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `news-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('news-images')
      .upload(filePath, coverImage);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('news-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !categoryId) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const imageUrl = await uploadCoverImage();
      const slug = generateSlug(title);

      const { error } = await supabase.from("news").insert({
        title,
        slug,
        content: "", // Legacy field, kept for compatibility
        content_blocks: blocks as any,
        category_id: categoryId,
        author_id: user.id,
        cover_image_url: imageUrl,
        is_featured: isFeatured,
        authors,
        scheduled_at: scheduledAt || null,
        status,
        seo_title: seoTitle,
        seo_description: seoDescription,
        seo_tags: seoTags,
        social_image_url: socialImageUrl,
      } as any);

      if (error) throw error;

      toast({ title: "Notícia criada com sucesso!" });
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Erro ao criar notícia:", error);
      toast({ title: "Erro ao criar notícia", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Criar Nova Notícia</h1>
          </div>
          <Button onClick={handleSubmit} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Salvando..." : "Publicar"}
          </Button>
        </div>

        <div className="mb-6 space-y-4">
          <div>
            <Label>Título da Notícia</Label>
            <Input
              placeholder="Digite o título principal..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-bold"
            />
          </div>
          
          <div>
            <Label>Imagem de Capa</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setCoverImage(file);
                  setCoverImageUrl(URL.createObjectURL(file));
                }
              }}
            />
            {coverImageUrl && (
              <img src={coverImageUrl} alt="Preview" className="mt-2 max-w-md rounded" />
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <BlockToolbar onAddBlock={addBlock} />
          
          <div className="flex-1 space-y-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                {blocks.map((block) => (
                  <SortableBlock
                    key={block.id}
                    block={block}
                    onUpdate={(updated) => updateBlock(block.id, updated)}
                    onDelete={() => deleteBlock(block.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {blocks.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>Nenhum bloco adicionado ainda.</p>
                <p className="text-sm">Use a barra lateral para adicionar conteúdo.</p>
              </div>
            )}

            <ArticlePreview title={title} coverImage={coverImageUrl} blocks={blocks} />
          </div>

          <ArticleSettings
            categoryId={categoryId}
            onCategoryChange={setCategoryId}
            authors={authors}
            onAuthorsChange={setAuthors}
            scheduledAt={scheduledAt}
            onScheduledAtChange={setScheduledAt}
            status={status}
            onStatusChange={setStatus}
            seoTitle={seoTitle}
            onSeoTitleChange={setSeoTitle}
            seoDescription={seoDescription}
            onSeoDescriptionChange={setSeoDescription}
            seoTags={seoTags}
            onSeoTagsChange={setSeoTags}
            socialImageUrl={socialImageUrl}
            onSocialImageChange={setSocialImageUrl}
            isFeatured={isFeatured}
            onFeaturedChange={setIsFeatured}
            categories={categories}
          />
        </div>
      </div>
    </div>
  );
}
