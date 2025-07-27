-- Add missing columns to events table for comprehensive form support
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS seo_keywords text[];
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS accessibility_info text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS parking_info text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS public_transport_info text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS age_restrictions text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS dresscode text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS languages text[] DEFAULT ARRAY['English'];
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS enable_dynamic_pricing boolean DEFAULT false;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS min_price numeric;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS max_price numeric;

-- Add missing columns to profiles table for comprehensive user data
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS interests text[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS followers_count integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS following_count integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS events_created_count integer DEFAULT 0;

-- Create venue_suggestions table for real-time venue search
CREATE TABLE IF NOT EXISTS public.venue_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_name text NOT NULL,
  address text NOT NULL,
  city text,
  state text,
  country text,
  coordinates point,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on venue_suggestions
ALTER TABLE public.venue_suggestions ENABLE ROW LEVEL SECURITY;

-- Create policy for venue suggestions (public read access)
CREATE POLICY "Anyone can view venue suggestions" 
ON public.venue_suggestions FOR SELECT 
USING (true);

-- Create policy for venue suggestions (authenticated users can insert)
CREATE POLICY "Authenticated users can add venue suggestions" 
ON public.venue_suggestions FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_venue_suggestions_name ON public.venue_suggestions USING gin(to_tsvector('english', venue_name));
CREATE INDEX IF NOT EXISTS idx_venue_suggestions_address ON public.venue_suggestions USING gin(to_tsvector('english', address));

-- Create event_posters table for AI-generated posters
CREATE TABLE IF NOT EXISTS public.event_posters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  organizer_id uuid NOT NULL,
  image_url text NOT NULL,
  image_data text, -- base64 encoded image data
  prompt text,
  dimensions jsonb DEFAULT '{"width": 1024, "height": 1536}'::jsonb,
  status text DEFAULT 'active',
  is_primary boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on event_posters
ALTER TABLE public.event_posters ENABLE ROW LEVEL SECURITY;

-- Create policies for event_posters
CREATE POLICY "Organizers can manage their event posters" 
ON public.event_posters FOR ALL 
USING (organizer_id = auth.uid())
WITH CHECK (organizer_id = auth.uid());

CREATE POLICY "Anyone can view active event posters" 
ON public.event_posters FOR SELECT 
USING (status = 'active');

-- Create storage bucket for uploaded images if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for event images
CREATE POLICY "Anyone can view event images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'event-images');

CREATE POLICY "Authenticated users can upload event images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'event-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own event images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'event-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own event images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'event-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Update profiles to include updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_posters_updated_at
BEFORE UPDATE ON public.event_posters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_venue_suggestions_updated_at
BEFORE UPDATE ON public.venue_suggestions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();