import { useState } from "react";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ContentBlock } from "@/types/contentBlocks";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { RichTextEditor } from "./RichTextEditor";

interface ContentBlockRendererProps {
  block: ContentBlock;
  onUpdate: (block: ContentBlock) => void;
  onDelete: () => void;
  dragHandleProps?: any;
}

export function ContentBlockRenderer({ 
  block, 
  onUpdate, 
  onDelete,
  dragHandleProps 
}: ContentBlockRendererProps) {
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ title: "Erro", description: "Arquivo deve ser uma imagem", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `news-images/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('news-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('news-images')
        .getPublicUrl(filePath);

      if (block.type === 'image') {
        onUpdate({ ...block, url: publicUrl });
      } else if (block.type === 'chart') {
        onUpdate({ ...block, imageUrl: publicUrl });
      }
    } catch (error) {
      toast({ title: "Erro ao fazer upload", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-4 mb-4">
      <div className="flex items-start gap-2">
        <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing mt-2">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        
        <div className="flex-1">
          {block.type === 'heading' && (
            <div className="space-y-2">
              <Select
                value={block.level}
                onValueChange={(level) => onUpdate({ ...block, level: level as 'h1' | 'h2' | 'h3' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="h1">H1</SelectItem>
                  <SelectItem value="h2">H2</SelectItem>
                  <SelectItem value="h3">H3</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Digite o título..."
                value={block.text}
                onChange={(e) => onUpdate({ ...block, text: e.target.value })}
              />
            </div>
          )}

          {block.type === 'subtitle' && (
            <Input
              placeholder="Digite o subtítulo..."
              value={block.text}
              onChange={(e) => onUpdate({ ...block, text: e.target.value })}
            />
          )}

          {block.type === 'paragraph' && (
            <RichTextEditor
              content={block.text}
              onChange={(html) => onUpdate({ ...block, text: html })}
              placeholder="Digite o texto do parágrafo..."
            />
          )}

          {block.type === 'image' && (
            <div className="space-y-2">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                disabled={uploading}
              />
              {block.url && <img src={block.url} alt="Preview" className="max-w-full h-auto rounded" />}
              <Input
                placeholder="Legenda..."
                value={block.caption || ''}
                onChange={(e) => onUpdate({ ...block, caption: e.target.value })}
              />
              <Input
                placeholder="Crédito..."
                value={block.credit || ''}
                onChange={(e) => onUpdate({ ...block, credit: e.target.value })}
              />
            </div>
          )}

          {block.type === 'video' && (
            <div className="space-y-2">
              <Select
                value={block.embedType || 'youtube'}
                onValueChange={(type) => onUpdate({ ...block, embedType: type as 'youtube' | 'vimeo' | 'upload' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="vimeo">Vimeo</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="URL do vídeo..."
                value={block.url}
                onChange={(e) => onUpdate({ ...block, url: e.target.value })}
              />
            </div>
          )}

          {block.type === 'list' && (
            <div className="space-y-2">
              <Select
                value={block.ordered ? 'ordered' : 'unordered'}
                onValueChange={(type) => onUpdate({ ...block, ordered: type === 'ordered' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unordered">Lista com marcadores</SelectItem>
                  <SelectItem value="ordered">Lista numerada</SelectItem>
                </SelectContent>
              </Select>
              {block.items.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <Input
                    placeholder="Texto do item"
                    value={item.text}
                    onChange={(e) => {
                      const newItems = [...block.items];
                      newItems[idx] = { ...newItems[idx], text: e.target.value };
                      onUpdate({ ...block, items: newItems });
                    }}
                  />
                  <Input
                    placeholder="Link (opcional)"
                    value={item.link || ''}
                    onChange={(e) => {
                      const newItems = [...block.items];
                      newItems[idx] = { ...newItems[idx], link: e.target.value };
                      onUpdate({ ...block, items: newItems });
                    }}
                  />
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdate({ ...block, items: [...block.items, { text: '', link: '' }] })}
              >
                + Adicionar item
              </Button>
            </div>
          )}

          {block.type === 'chart' && (
            <div className="space-y-2">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                disabled={uploading}
              />
              {block.imageUrl && <img src={block.imageUrl} alt="Gráfico" className="max-w-full h-auto rounded" />}
              <Textarea
                placeholder="Dados do gráfico (opcional)..."
                value={block.data || ''}
                onChange={(e) => onUpdate({ ...block, data: e.target.value })}
              />
            </div>
          )}

          {block.type === 'highlight' && (
            <div className="space-y-2">
              <Select
                value={block.variant}
                onValueChange={(variant) => onUpdate({ ...block, variant: variant as 'alert' | 'quote' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alert">Alerta</SelectItem>
                  <SelectItem value="quote">Citação</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Texto do destaque..."
                value={block.text}
                onChange={(e) => onUpdate({ ...block, text: e.target.value })}
              />
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
