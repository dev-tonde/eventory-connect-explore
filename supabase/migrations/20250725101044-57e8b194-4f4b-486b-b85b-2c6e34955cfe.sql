-- Fix search path issues in existing functions
DROP FUNCTION IF EXISTS public.get_current_performer(UUID, TIME);

-- Recreate function with proper security settings
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