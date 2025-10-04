export type BlockType = 
  | 'heading' 
  | 'subtitle' 
  | 'paragraph' 
  | 'image' 
  | 'video' 
  | 'list' 
  | 'chart' 
  | 'highlight';

export interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface HeadingBlock extends BaseBlock {
  type: 'heading';
  level: 'h1' | 'h2' | 'h3';
  text: string;
}

export interface SubtitleBlock extends BaseBlock {
  type: 'subtitle';
  text: string;
}

export interface ParagraphBlock extends BaseBlock {
  type: 'paragraph';
  text: string;
  formatting?: {
    bold?: boolean;
    italic?: boolean;
  };
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  url: string;
  caption?: string;
  credit?: string;
}

export interface VideoBlock extends BaseBlock {
  type: 'video';
  url: string;
  embedType?: 'youtube' | 'vimeo' | 'upload';
}

export interface ListItem {
  text: string;
  link?: string;
}

export interface ListBlock extends BaseBlock {
  type: 'list';
  items: ListItem[];
  ordered: boolean;
}

export interface ChartBlock extends BaseBlock {
  type: 'chart';
  imageUrl?: string;
  data?: string;
}

export interface HighlightBlock extends BaseBlock {
  type: 'highlight';
  text: string;
  variant: 'alert' | 'quote';
}

export type ContentBlock = 
  | HeadingBlock 
  | SubtitleBlock 
  | ParagraphBlock 
  | ImageBlock 
  | VideoBlock 
  | ListBlock 
  | ChartBlock 
  | HighlightBlock;
