-- Add new columns to news table for modular editor
ALTER TABLE public.news 
ADD COLUMN IF NOT EXISTS content_blocks JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS seo_tags TEXT[],
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published')),
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS authors TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS social_image_url TEXT;

-- Create index for status queries
CREATE INDEX IF NOT EXISTS idx_news_status ON public.news(status);

-- Update RLS policies to consider status
DROP POLICY IF EXISTS "News are viewable by everyone" ON public.news;
CREATE POLICY "Published news are viewable by everyone" 
ON public.news 
FOR SELECT 
USING (status = 'published' OR EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.is_admin = true
));