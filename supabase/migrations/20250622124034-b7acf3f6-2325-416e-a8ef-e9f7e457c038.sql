
-- Create table for poster templates
CREATE TABLE public.poster_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  design_data JSONB NOT NULL, -- Store template design specifications
  social_platform TEXT CHECK (social_platform IN ('instagram', 'facebook', 'twitter', 'linkedin')),
  dimensions JSONB NOT NULL, -- {width: 1080, height: 1080} etc
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for generated posters
CREATE TABLE public.generated_posters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL, -- Reference to event
  user_id UUID REFERENCES auth.users NOT NULL,
  template_id UUID REFERENCES public.poster_templates,
  prompt TEXT NOT NULL,
  image_url TEXT,
  image_data TEXT, -- Base64 encoded image data
  social_platform TEXT,
  dimensions JSONB NOT NULL,
  status TEXT DEFAULT 'generating' CHECK (status IN ('generating', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for scheduled social media posts
CREATE TABLE public.scheduled_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  event_id TEXT NOT NULL,
  poster_id UUID REFERENCES public.generated_posters,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'twitter', 'linkedin')),
  caption TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'posted', 'failed', 'cancelled')),
  post_id TEXT, -- Social media platform post ID after posting
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  posted_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE public.poster_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_posters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;

-- RLS policies for poster_templates (public read, admin write)
CREATE POLICY "Anyone can view poster templates" 
  ON public.poster_templates 
  FOR SELECT 
  USING (true);

-- RLS policies for generated_posters
CREATE POLICY "Users can view their own generated posters" 
  ON public.generated_posters 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own generated posters" 
  ON public.generated_posters 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generated posters" 
  ON public.generated_posters 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generated posters" 
  ON public.generated_posters 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS policies for scheduled_posts
CREATE POLICY "Users can view their own scheduled posts" 
  ON public.scheduled_posts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scheduled posts" 
  ON public.scheduled_posts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled posts" 
  ON public.scheduled_posts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled posts" 
  ON public.scheduled_posts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Insert some default poster templates
INSERT INTO public.poster_templates (name, description, design_data, social_platform, dimensions) VALUES
('Instagram Square', 'Square format for Instagram posts', '{"layout": "center", "text_position": "bottom", "color_scheme": "vibrant"}', 'instagram', '{"width": 1080, "height": 1080}'),
('Instagram Story', 'Vertical format for Instagram stories', '{"layout": "vertical", "text_position": "center", "color_scheme": "gradient"}', 'instagram', '{"width": 1080, "height": 1920}'),
('Facebook Post', 'Landscape format for Facebook posts', '{"layout": "landscape", "text_position": "overlay", "color_scheme": "professional"}', 'facebook', '{"width": 1200, "height": 630}'),
('Twitter Post', 'Twitter optimized format', '{"layout": "compact", "text_position": "top", "color_scheme": "minimal"}', 'twitter', '{"width": 1024, "height": 512}'),
('LinkedIn Post', 'Professional format for LinkedIn', '{"layout": "professional", "text_position": "bottom", "color_scheme": "corporate"}', 'linkedin', '{"width": 1200, "height": 627}');

-- Enable pg_cron extension for scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;
