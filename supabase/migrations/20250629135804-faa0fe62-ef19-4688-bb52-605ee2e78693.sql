
-- Create social_posts table for tracking posted content
CREATE TABLE public.social_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'twitter', 'linkedin')),
  caption TEXT NOT NULL,
  image_url TEXT,
  poster_id UUID REFERENCES public.generated_posters(id),
  event_id TEXT,
  community_id UUID REFERENCES public.communities(id),
  external_post_id TEXT,
  status TEXT NOT NULL DEFAULT 'posted' CHECK (status IN ('posted', 'failed')),
  posted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for social_posts
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own social posts" 
  ON public.social_posts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own social posts" 
  ON public.social_posts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
