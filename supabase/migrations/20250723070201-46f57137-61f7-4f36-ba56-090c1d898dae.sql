-- Create SnapLoop uploads table
CREATE TABLE public.snaploop_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  approved BOOLEAN DEFAULT false,
  uploaded_by TEXT, -- Guest name or identifier
  session_token TEXT, -- For guest tracking
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id)
);

-- Create mood check-ins table
CREATE TABLE public.mood_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 5),
  comment TEXT,
  user_id UUID REFERENCES auth.users(id), -- Nullable for anonymous check-ins
  session_token TEXT, -- For guest tracking
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage bucket for SnapLoop uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('snaploop-uploads', 'snaploop-uploads', true);

-- Enable RLS on both tables
ALTER TABLE public.snaploop_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_checkins ENABLE ROW LEVEL SECURITY;

-- SnapLoop RLS policies
CREATE POLICY "Anyone can view approved snaploop uploads" 
  ON public.snaploop_uploads 
  FOR SELECT 
  USING (approved = true);

CREATE POLICY "Anyone can insert snaploop uploads" 
  ON public.snaploop_uploads 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Event organizers can manage snaploop uploads" 
  ON public.snaploop_uploads 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = snaploop_uploads.event_id 
      AND events.organizer_id = auth.uid()
    )
  );

-- MoodMap RLS policies
CREATE POLICY "Anyone can view mood checkins for events" 
  ON public.mood_checkins 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can insert mood checkins" 
  ON public.mood_checkins 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Event organizers can view all mood data for their events" 
  ON public.mood_checkins 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = mood_checkins.event_id 
      AND events.organizer_id = auth.uid()
    )
  );

-- Storage policies for SnapLoop uploads
CREATE POLICY "Anyone can upload to snaploop-uploads" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'snaploop-uploads');

CREATE POLICY "Anyone can view snaploop uploads" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'snaploop-uploads');

CREATE POLICY "Event organizers can delete snaploop uploads" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'snaploop-uploads');

-- Add indexes for better performance
CREATE INDEX idx_snaploop_uploads_event_id ON public.snaploop_uploads(event_id);
CREATE INDEX idx_snaploop_uploads_approved ON public.snaploop_uploads(approved);
CREATE INDEX idx_mood_checkins_event_id ON public.mood_checkins(event_id);
CREATE INDEX idx_mood_checkins_created_at ON public.mood_checkins(created_at);

-- Function to get mood summary for an event
CREATE OR REPLACE FUNCTION public.get_mood_summary(event_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'average_mood', COALESCE(AVG(mood_score), 0),
    'total_checkins', COUNT(*),
    'mood_distribution', json_build_object(
      'very_happy', COUNT(*) FILTER (WHERE mood_score = 5),
      'happy', COUNT(*) FILTER (WHERE mood_score = 4),
      'neutral', COUNT(*) FILTER (WHERE mood_score = 3),
      'sad', COUNT(*) FILTER (WHERE mood_score = 2),
      'very_sad', COUNT(*) FILTER (WHERE mood_score = 1)
    )
  ) INTO result
  FROM public.mood_checkins
  WHERE event_id = event_uuid;
  
  RETURN result;
END;
$function$;