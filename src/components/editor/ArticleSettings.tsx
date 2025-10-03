import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ArticleSettingsProps {
  categoryId: string;
  onCategoryChange: (id: string) => void;
  authors: string[];
  onAuthorsChange: (authors: string[]) => void;
  scheduledAt?: string;
  onScheduledAtChange: (date: string) => void;
  status: string;
  onStatusChange: (status: string) => void;
  seoTitle: string;
  onSeoTitleChange: (title: string) => void;
  seoDescription: string;
  onSeoDescriptionChange: (desc: string) => void;
  seoTags: string[];
  onSeoTagsChange: (tags: string[]) => void;
  socialImageUrl?: string;
  onSocialImageChange: (url: string) => void;
  isFeatured: boolean;
  onFeaturedChange: (featured: boolean) => void;
  categories: { id: string; name: string }[];
}

export function ArticleSettings({
  categoryId,
  onCategoryChange,
  authors,
  onAuthorsChange,
  scheduledAt,
  onScheduledAtChange,
  status,
  onStatusChange,
  seoTitle,
  onSeoTitleChange,
  seoDescription,
  onSeoDescriptionChange,
  seoTags,
  onSeoTagsChange,
  socialImageUrl,
  onSocialImageChange,
  isFeatured,
  onFeaturedChange,
  categories,
}: ArticleSettingsProps) {
  const [uploading, setUploading] = useState(false);

  const handleSocialImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ title: "Erro", description: "Arquivo deve ser uma imagem", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `social-${Math.random()}.${fileExt}`;
      const filePath = `news-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('news-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('news-images')
        .getPublicUrl(filePath);

      onSocialImageChange(publicUrl);
      toast({ title: "Upload concluído!" });
    } catch (error) {
      toast({ title: "Erro ao fazer upload", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-80 p-6 space-y-6 overflow-y-auto max-h-screen">
      <h3 className="text-lg font-semibold">Configurações</h3>

      <div className="space-y-2">
        <Label>Categoria</Label>
        <Select value={categoryId} onValueChange={onCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Autor(es)</Label>
        <Input
          placeholder="Digite nomes separados por vírgula"
          value={authors.join(', ')}
          onChange={(e) => onAuthorsChange(e.target.value.split(',').map(a => a.trim()))}
        />
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Rascunho</SelectItem>
            <SelectItem value="review">Em Revisão</SelectItem>
            <SelectItem value="published">Publicado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Agendar Publicação</Label>
        <Input
          type="datetime-local"
          value={scheduledAt || ''}
          onChange={(e) => onScheduledAtChange(e.target.value)}
        />
      </div>

      <div className="space-y-4 border-t pt-4">
        <h4 className="font-medium">SEO</h4>
        
        <div className="space-y-2">
          <Label>Título SEO</Label>
          <Input
            placeholder="Título otimizado para buscadores"
            value={seoTitle}
            onChange={(e) => onSeoTitleChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Descrição SEO</Label>
          <Textarea
            placeholder="Descrição para buscadores"
            value={seoDescription}
            onChange={(e) => onSeoDescriptionChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Tags</Label>
          <Input
            placeholder="Tags separadas por vírgula"
            value={seoTags.join(', ')}
            onChange={(e) => onSeoTagsChange(e.target.value.split(',').map(t => t.trim()))}
          />
        </div>
      </div>

      <div className="space-y-2 border-t pt-4">
        <Label>Imagem Social</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleSocialImageUpload(e.target.files[0])}
          disabled={uploading}
        />
        {socialImageUrl && (
          <img src={socialImageUrl} alt="Social preview" className="w-full h-auto rounded mt-2" />
        )}
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        <Label>Destaque na Home</Label>
        <Switch checked={isFeatured} onCheckedChange={onFeaturedChange} />
      </div>
    </Card>
  );
}
