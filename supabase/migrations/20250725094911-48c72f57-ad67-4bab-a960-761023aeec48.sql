-- Create event_lineup table for storing performance schedules
CREATE TABLE public.event_lineup (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  artist_name TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  stage_name TEXT,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT event_lineup_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.event_lineup ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_lineup
CREATE POLICY "Anyone can view lineup for active events"
ON public.event_lineup
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = event_lineup.event_id 
    AND events.is_active = true
  )
);

CREATE POLICY "Event organizers can manage their event lineups"
ON public.event_lineup
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = event_lineup.event_id 
    AND events.organizer_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = event_lineup.event_id 
    AND events.organizer_id = auth.uid()
  )
);

-- Add lineup_id to mood_checkins for linking feedback to specific performances
ALTER TABLE public.mood_checkins 
ADD COLUMN lineup_id UUID REFERENCES public.event_lineup(id) ON DELETE SET NULL;

-- Add trigger for updated_at
CREATE TRIGGER update_event_lineup_updated_at
BEFORE UPDATE ON public.event_lineup
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance queries
CREATE INDEX idx_event_lineup_event_time ON public.event_lineup(event_id, start_time, end_time);
CREATE INDEX idx_mood_checkins_lineup ON public.mood_checkins(lineup_id);

-- Function to get current performer for an event
CREATE OR REPLACE FUNCTION public.get_current_performer(event_uuid UUID, check_time TIME DEFAULT CURRENT_TIME)
RETURNS TABLE(
  lineup_id UUID,
  artist_name TEXT,
  start_time TIME,
  end_time TIME,
  stage_name TEXT,
  description TEXT
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    el.id,
    el.artist_name,
    el.start_time,
    el.end_time,
    el.stage_name,
    el.description
  FROM public.event_lineup el
  WHERE el.event_id = event_uuid
    AND check_time >= el.start_time 
    AND check_time <= el.end_time
  ORDER BY el.start_time
  LIMIT 1;
$function$;