-- Add stories and interest tags features

-- Create event_stories table for temporary stories that expire after 48 hours
CREATE TABLE IF NOT EXISTS public.event_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  user_id UUID NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video')),
  caption TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '48 hours'),
  is_pinned BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  views_count INTEGER DEFAULT 0
);

-- Create interest_tags table for available tags users can follow
CREATE TABLE IF NOT EXISTS public.interest_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL, -- 'genre', 'theme', 'location', etc.
  description TEXT,
  color_hex TEXT DEFAULT '#3b82f6',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_interest_follows table for tracking which tags users follow
CREATE TABLE IF NOT EXISTS public.user_interest_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tag_id UUID NOT NULL,
  followed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, tag_id)
);

-- Enable RLS on new tables
ALTER TABLE public.event_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interest_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interest_follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_stories
CREATE POLICY "Anyone can view active stories" ON public.event_stories FOR SELECT 
  USING (expires_at > now());
CREATE POLICY "Authenticated users can create stories" ON public.event_stories FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own stories" ON public.event_stories FOR UPDATE 
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own stories" ON public.event_stories FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for interest_tags
CREATE POLICY "Anyone can view active interest tags" ON public.interest_tags FOR SELECT 
  USING (is_active = true);
CREATE POLICY "Admins can manage interest tags" ON public.interest_tags FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- RLS Policies for user_interest_follows
CREATE POLICY "Users can manage their own interest follows" ON public.user_interest_follows FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_stories_event_id ON public.event_stories(event_id);
CREATE INDEX IF NOT EXISTS idx_event_stories_expires_at ON public.event_stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_event_stories_user_id ON public.event_stories(user_id);
CREATE INDEX IF NOT EXISTS idx_interest_tags_category ON public.interest_tags(category);
CREATE INDEX IF NOT EXISTS idx_user_interest_follows_user_id ON public.user_interest_follows(user_id);

-- Function to clean up expired stories
CREATE OR REPLACE FUNCTION public.cleanup_expired_stories()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.event_stories 
  WHERE expires_at <= now();
END;
$$;

-- Function to get personalized events based on user interests
CREATE OR REPLACE FUNCTION public.get_personalized_events(p_user_id UUID, p_limit INTEGER DEFAULT 20)
RETURNS TABLE(
  event_id UUID,
  title TEXT,
  description TEXT,
  venue TEXT,
  date DATE,
  time TIME,
  category TEXT,
  tags TEXT[],
  image_url TEXT,
  match_score DECIMAL(3,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.title,
    e.description,
    e.venue,
    e.date,
    e.time,
    e.category,
    e.tags,
    e.image_url,
    CASE 
      -- Higher score for matching category
      WHEN e.category IN (
        SELECT it.name FROM interest_tags it 
        JOIN user_interest_follows uif ON it.id = uif.tag_id 
        WHERE uif.user_id = p_user_id
      ) THEN 1.0
      -- Medium score for matching tags
      WHEN e.tags && (
        SELECT ARRAY_AGG(it.name) FROM interest_tags it 
        JOIN user_interest_follows uif ON it.id = uif.tag_id 
        WHERE uif.user_id = p_user_id
      ) THEN 0.7
      -- Lower score for no matches
      ELSE 0.3
    END as match_score
  FROM public.events e
  WHERE e.is_active = true 
    AND e.date >= CURRENT_DATE
  ORDER BY match_score DESC, e.date ASC
  LIMIT p_limit;
END;
$$;

-- Insert default interest tags
INSERT INTO public.interest_tags (name, category, description, color_hex) VALUES
-- Music Genres
('Jazz', 'genre', 'Smooth jazz and fusion music events', '#8B4513'),
('Electronic', 'genre', 'Electronic dance music and techno', '#00FFFF'),
('Rock', 'genre', 'Rock, indie, and alternative music', '#FF4500'),
('Hip Hop', 'genre', 'Hip hop, rap, and urban music', '#FFD700'),
('Pop', 'genre', 'Popular music and mainstream artists', '#FF69B4'),
('Classical', 'genre', 'Classical music and orchestral performances', '#4B0082'),
('Folk', 'genre', 'Folk, acoustic, and traditional music', '#228B22'),
('R&B', 'genre', 'Rhythm and blues, soul music', '#8B008B'),
('Reggae', 'genre', 'Reggae, ska, and Caribbean music', '#32CD32'),
('Country', 'genre', 'Country and western music', '#DAA520'),

-- Themes and Interests  
('Tech', 'theme', 'Technology conferences and startup events', '#0066CC'),
('Activism', 'theme', 'Social causes and advocacy events', '#DC143C'),
('Art', 'theme', 'Art exhibitions and creative showcases', '#9932CC'),
('Food', 'theme', 'Food festivals and culinary events', '#FF6347'),
('Fitness', 'theme', 'Sports, fitness, and wellness events', '#32CD32'),
('Business', 'theme', 'Networking and professional development', '#1E90FF'),
('Education', 'theme', 'Workshops, seminars, and learning events', '#FFD700'),
('Comedy', 'theme', 'Stand-up comedy and humor events', '#FF1493'),
('Fashion', 'theme', 'Fashion shows and style events', '#FF69B4'),
('Gaming', 'theme', 'Video games and esports events', '#00CED1'),

-- Event Types
('Festival', 'type', 'Multi-day festivals and large gatherings', '#FF8C00'),
('Concert', 'type', 'Live music performances', '#8A2BE2'),
('Conference', 'type', 'Professional conferences and summits', '#4682B4'),
('Workshop', 'type', 'Hands-on learning sessions', '#20B2AA'),
('Networking', 'type', 'Professional networking events', '#6495ED'),
('Outdoor', 'type', 'Outdoor and nature-based events', '#228B22'),
('Indoor', 'type', 'Indoor venue events', '#708090'),
('Free', 'type', 'Free admission events', '#32CD32'),
('Premium', 'type', 'High-end, exclusive events', '#FFD700')
ON CONFLICT (name) DO NOTHING;