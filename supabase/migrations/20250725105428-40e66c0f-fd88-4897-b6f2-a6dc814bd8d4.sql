-- Create table for user event recommendations
CREATE TABLE public.user_event_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  score NUMERIC(5,2) NOT NULL, -- Recommendation score 0-100
  reasoning TEXT, -- AI explanation for recommendation
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  viewed BOOLEAN DEFAULT false,
  clicked BOOLEAN DEFAULT false
);

-- Create table for post-event summaries
CREATE TABLE public.event_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  organizer_message TEXT,
  mood_timeline JSONB, -- Timeline of mood data
  top_photos UUID[], -- Array of top SnapLoop photo IDs
  highlight_reel_url TEXT,
  is_public BOOLEAN DEFAULT true,
  share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_event_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_summaries ENABLE ROW LEVEL SECURITY;

-- RLS policies for recommendations
CREATE POLICY "Users can view their own recommendations" 
  ON public.user_event_recommendations 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "System can insert recommendations" 
  ON public.user_event_recommendations 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update their recommendation interactions" 
  ON public.user_event_recommendations 
  FOR UPDATE 
  USING (user_id = auth.uid());

-- RLS policies for event summaries  
CREATE POLICY "Anyone can view public event summaries" 
  ON public.event_summaries 
  FOR SELECT 
  USING (is_public = true);

CREATE POLICY "Organizers can manage their event summaries" 
  ON public.event_summaries 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = event_summaries.event_id 
    AND events.organizer_id = auth.uid()
  ));

-- Add indexes
CREATE INDEX idx_user_event_recommendations_user_id ON public.user_event_recommendations(user_id);
CREATE INDEX idx_user_event_recommendations_score ON public.user_event_recommendations(score DESC);
CREATE INDEX idx_event_summaries_event_id ON public.event_summaries(event_id);
CREATE INDEX idx_event_summaries_share_token ON public.event_summaries(share_token);

-- Function to get user recommendation data
CREATE OR REPLACE FUNCTION public.get_user_recommendation_data(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT json_build_object(
    'attended_events', (
      SELECT json_agg(
        json_build_object(
          'event_id', t.event_id,
          'category', e.category,
          'tags', e.tags,
          'date', e.date
        )
      )
      FROM public.tickets t
      JOIN public.events e ON t.event_id = e.id
      WHERE t.user_id = target_user_id
      AND t.status = 'active'
      ORDER BY e.date DESC
      LIMIT 50
    ),
    'favorite_categories', (
      SELECT json_agg(
        json_build_object(
          'category', f.event_category,
          'count', f.category_count
        )
      )
      FROM (
        SELECT e.category as event_category, COUNT(*) as category_count
        FROM public.favorites fav
        JOIN public.events e ON fav.event_id = e.id
        WHERE fav.user_id = target_user_id
        GROUP BY e.category
        ORDER BY category_count DESC
        LIMIT 10
      ) f
    ),
    'mood_patterns', (
      SELECT json_agg(
        json_build_object(
          'event_id', mc.event_id,
          'mood_score', mc.mood_score,
          'category', e.category,
          'date', e.date
        )
      )
      FROM public.mood_checkins mc
      JOIN public.events e ON mc.event_id = e.id
      WHERE mc.user_id = target_user_id
      ORDER BY mc.created_at DESC
      LIMIT 100
    ),
    'avg_mood_by_category', (
      SELECT json_object_agg(category, avg_mood)
      FROM (
        SELECT e.category, ROUND(AVG(mc.mood_score), 2) as avg_mood
        FROM public.mood_checkins mc
        JOIN public.events e ON mc.event_id = e.id
        WHERE mc.user_id = target_user_id
        GROUP BY e.category
        HAVING COUNT(*) >= 2
      ) avg_moods
    )
  ) INTO result;
  
  RETURN result;
END;
$$;