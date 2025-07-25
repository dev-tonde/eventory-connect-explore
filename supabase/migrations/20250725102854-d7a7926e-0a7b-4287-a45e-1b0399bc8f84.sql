-- Create performance ratings table
CREATE TABLE public.performance_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  lineup_id UUID NOT NULL,
  user_id UUID,
  session_token TEXT,
  rating_type TEXT NOT NULL CHECK (rating_type IN ('thumbs_up', 'fire', 'sleeping', 'thumbs_down')),
  rating_value INTEGER NOT NULL CHECK (rating_value BETWEEN 1 AND 4),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Add indexes for performance
CREATE INDEX idx_performance_ratings_event_lineup ON public.performance_ratings(event_id, lineup_id);
CREATE INDEX idx_performance_ratings_created_at ON public.performance_ratings(created_at);

-- Create mood alerts table for tracking alerts sent to organizers
CREATE TABLE public.mood_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  lineup_id UUID,
  organizer_id UUID NOT NULL,
  alert_type TEXT NOT NULL DEFAULT 'low_mood',
  threshold_value DECIMAL(3,2) NOT NULL,
  average_mood DECIMAL(3,2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  alert_data JSONB DEFAULT '{}'
);

-- Create highlight reels table
CREATE TABLE public.highlight_reels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  organizer_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'generating' CHECK (status IN ('generating', 'completed', 'failed')),
  video_url TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER DEFAULT 60,
  photo_count INTEGER DEFAULT 20,
  generation_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Enable RLS
ALTER TABLE public.performance_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.highlight_reels ENABLE ROW LEVEL SECURITY;

-- Performance ratings policies
CREATE POLICY "Anyone can submit performance ratings" 
ON public.performance_ratings 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Organizers can view ratings for their events" 
ON public.performance_ratings 
FOR SELECT 
USING (
  event_id IN (
    SELECT id FROM events WHERE organizer_id = auth.uid()
  )
);

-- Mood alerts policies
CREATE POLICY "Organizers can view their mood alerts" 
ON public.mood_alerts 
FOR SELECT 
USING (organizer_id = auth.uid());

CREATE POLICY "System can create mood alerts" 
ON public.mood_alerts 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Organizers can resolve their alerts" 
ON public.mood_alerts 
FOR UPDATE 
USING (organizer_id = auth.uid());

-- Highlight reels policies
CREATE POLICY "Organizers can manage their highlight reels" 
ON public.highlight_reels 
FOR ALL 
USING (organizer_id = auth.uid())
WITH CHECK (organizer_id = auth.uid());

-- Function to get current performance for mood monitoring
CREATE OR REPLACE FUNCTION public.get_current_performance_with_mood(event_uuid UUID)
RETURNS TABLE(
  lineup_id UUID,
  artist_name TEXT,
  start_time TIME,
  end_time TIME,
  average_mood DECIMAL(3,2),
  checkin_count INTEGER,
  alert_threshold DECIMAL(3,2)
)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    el.id as lineup_id,
    el.artist_name,
    el.start_time,
    el.end_time,
    COALESCE(AVG(mc.mood_score::DECIMAL), 0) as average_mood,
    COUNT(mc.id)::INTEGER as checkin_count,
    2.5::DECIMAL(3,2) as alert_threshold
  FROM public.event_lineup el
  LEFT JOIN public.mood_checkins mc ON mc.event_id = event_uuid 
    AND mc.created_at >= (CURRENT_DATE + el.start_time) - INTERVAL '5 minutes'
    AND mc.created_at <= (CURRENT_DATE + el.end_time) + INTERVAL '5 minutes'
  WHERE el.event_id = event_uuid
    AND CURRENT_TIME >= el.start_time 
    AND CURRENT_TIME <= el.end_time
  GROUP BY el.id, el.artist_name, el.start_time, el.end_time
  ORDER BY el.start_time
  LIMIT 1;
$$;

-- Function to get performance ratings summary
CREATE OR REPLACE FUNCTION public.get_performance_ratings_summary(event_uuid UUID, lineup_uuid UUID)
RETURNS JSONB
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT json_build_object(
    'total_ratings', COUNT(*),
    'thumbs_up', COUNT(*) FILTER (WHERE rating_type = 'thumbs_up'),
    'fire', COUNT(*) FILTER (WHERE rating_type = 'fire'),
    'sleeping', COUNT(*) FILTER (WHERE rating_type = 'sleeping'),
    'thumbs_down', COUNT(*) FILTER (WHERE rating_type = 'thumbs_down'),
    'average_score', AVG(rating_value),
    'latest_ratings', json_agg(
      json_build_object(
        'rating_type', rating_type,
        'created_at', created_at
      ) ORDER BY created_at DESC
    ) FILTER (WHERE rating_type IS NOT NULL)
  ) INTO result
  FROM public.performance_ratings
  WHERE event_id = event_uuid AND lineup_id = lineup_uuid;
  
  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;

-- Function to get top photos for highlight reel
CREATE OR REPLACE FUNCTION public.get_top_photos_for_highlight(event_uuid UUID, limit_count INTEGER DEFAULT 20)
RETURNS TABLE(
  photo_id UUID,
  file_url TEXT,
  likes_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  caption TEXT
)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    p.id as photo_id,
    p.file_url,
    p.likes_count,
    p.created_at,
    p.caption
  FROM public.photos p
  WHERE p.event_id = event_uuid 
    AND p.moderation_status = 'approved'
  ORDER BY 
    p.likes_count DESC,
    p.created_at DESC
  LIMIT limit_count;
$$;

-- Enable realtime for mood monitoring
ALTER TABLE public.mood_checkins REPLICA IDENTITY FULL;
ALTER TABLE public.performance_ratings REPLICA IDENTITY FULL;
ALTER TABLE public.mood_alerts REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.mood_checkins;
ALTER PUBLICATION supabase_realtime ADD TABLE public.performance_ratings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mood_alerts;