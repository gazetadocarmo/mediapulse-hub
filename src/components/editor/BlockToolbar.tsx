import { 
  Heading1, 
  Heading2, 
  Heading3, 
  Type, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  List, 
  BarChart3, 
  AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlockType } from "@/types/contentBlocks";

interface BlockToolbarProps {
  onAddBlock: (type: BlockType) => void;
}

export function BlockToolbar({ onAddBlock }: BlockToolbarProps) {
  const blocks = [
    { type: 'heading' as BlockType, icon: Heading1, label: 'Título H1' },
    { type: 'heading' as BlockType, icon: Heading2, label: 'Título H2', level: 'h2' },
    { type: 'heading' as BlockType, icon: Heading3, label: 'Título H3', level: 'h3' },
    { type: 'subtitle' as BlockType, icon: Type, label: 'Subtítulo' },
    { type: 'paragraph' as BlockType, icon: FileText, label: 'Parágrafo' },
    { type: 'image' as BlockType, icon: ImageIcon, label: 'Imagem' },
    { type: 'video' as BlockType, icon: Video, label: 'Vídeo' },
    { type: 'list' as BlockType, icon: List, label: 'Lista' },
    { type: 'chart' as BlockType, icon: BarChart3, label: 'Gráfico' },
    { type: 'highlight' as BlockType, icon: AlertCircle, label: 'Destaque' },
  ];

  return (
    <div className="w-64 bg-background border-r border-border p-4 space-y-2">
      <h3 className="font-semibold mb-4">Adicionar Blocos</h3>
      {blocks.map((block) => (
        <Button
          key={block.label}
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => onAddBlock(block.type)}
        >
          <block.icon className="h-4 w-4" />
          {block.label}
        </Button>
      ))}
    </div>
  );
}
