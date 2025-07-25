-- Add tags column to snaploop_uploads for automatic image categorization
ALTER TABLE public.snaploop_uploads 
ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Add index for tags filtering
CREATE INDEX idx_snaploop_uploads_tags ON public.snaploop_uploads USING GIN(tags);

-- Create table for social media sharing tracking
CREATE TABLE public.snaploop_social_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  upload_id UUID REFERENCES public.snaploop_uploads(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'facebook', 'twitter', 'instagram', etc.
  shared_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  branded_image_url TEXT, -- URL of the branded version with watermark
  share_url TEXT -- Platform-specific share URL
);

-- Create table for nearby events cache
CREATE TABLE public.nearby_events_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_location POINT NOT NULL, -- User's location when cache was created
  event_ids UUID[] NOT NULL, -- Array of event IDs within range
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '5 minutes')
);

-- Enable RLS
ALTER TABLE public.snaploop_social_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nearby_events_cache ENABLE ROW LEVEL SECURITY;

-- RLS policies for social shares
CREATE POLICY "Anyone can view social shares" 
  ON public.snaploop_social_shares 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can create social shares" 
  ON public.snaploop_social_shares 
  FOR INSERT 
  WITH CHECK (true);

-- RLS policies for nearby events cache
CREATE POLICY "Users can manage their nearby events cache" 
  ON public.nearby_events_cache 
  FOR ALL 
  USING (true);

-- Add indexes
CREATE INDEX idx_snaploop_social_shares_upload_id ON public.snaploop_social_shares(upload_id);
CREATE INDEX idx_snaploop_social_shares_platform ON public.snaploop_social_shares(platform);
CREATE INDEX idx_nearby_events_cache_expires_at ON public.nearby_events_cache(expires_at);
CREATE INDEX idx_nearby_events_cache_location ON public.nearby_events_cache USING GIST(user_location);

-- Function to get events within radius (50km)
CREATE OR REPLACE FUNCTION public.get_events_within_radius(
  user_lat NUMERIC,
  user_lng NUMERIC,
  radius_km NUMERIC DEFAULT 50
)
RETURNS TABLE(
  event_id UUID,
  title TEXT,
  venue TEXT,
  event_date DATE,
  event_time TIME,
  distance_km NUMERIC,
  mood_color TEXT,
  photo_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id as event_id,
    e.title,
    e.venue,
    e.date as event_date,
    e.time as event_time,
    ROUND(
      (6371 * acos(
        cos(radians(user_lat)) * 
        cos(radians(e.location_coordinates[1])) * 
        cos(radians(e.location_coordinates[0]) - radians(user_lng)) + 
        sin(radians(user_lat)) * 
        sin(radians(e.location_coordinates[1]))
      ))::NUMERIC, 2
    ) as distance_km,
    -- Get mood color based on average mood
    CASE 
      WHEN COALESCE(AVG(mc.mood_score), 3) >= 4.5 THEN '#10B981' -- Green
      WHEN COALESCE(AVG(mc.mood_score), 3) >= 3.5 THEN '#F59E0B' -- Yellow
      WHEN COALESCE(AVG(mc.mood_score), 3) >= 2.5 THEN '#EF4444' -- Red
      ELSE '#6B7280' -- Gray
    END as mood_color,
    COALESCE(COUNT(DISTINCT su.id), 0)::INTEGER as photo_count
  FROM public.events e
  LEFT JOIN public.mood_checkins mc ON mc.event_id = e.id 
    AND mc.created_at >= NOW() - INTERVAL '1 hour'
  LEFT JOIN public.snaploop_uploads su ON su.event_id = e.id 
    AND su.approved = true
  WHERE 
    e.is_active = true 
    AND e.date = CURRENT_DATE
    AND e.location_coordinates IS NOT NULL
    AND (6371 * acos(
      cos(radians(user_lat)) * 
      cos(radians(e.location_coordinates[1])) * 
      cos(radians(e.location_coordinates[0]) - radians(user_lng)) + 
      sin(radians(user_lat)) * 
      sin(radians(e.location_coordinates[1]))
    )) <= radius_km
  GROUP BY e.id, e.title, e.venue, e.date, e.time, e.location_coordinates
  ORDER BY distance_km ASC;
END;
$$;