-- Fix remaining functions to have proper search_path security setting
-- This fixes all functions that don't have SET search_path TO 'public'

-- Fix SQL functions (don't need complex re-creation)
DROP FUNCTION IF EXISTS public.get_current_performer(uuid, time);
CREATE OR REPLACE FUNCTION public.get_current_performer(event_uuid uuid, check_time time without time zone DEFAULT CURRENT_TIME)
 RETURNS TABLE(lineup_id uuid, artist_name text, start_time time without time zone, end_time time without time zone, stage_name text, description text)
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

DROP FUNCTION IF EXISTS public.get_event_rating(uuid);
CREATE OR REPLACE FUNCTION public.get_event_rating(event_uuid uuid)
 RETURNS numeric
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(AVG(rating), 0)::DECIMAL(3,2)
  FROM public.event_reviews
  WHERE event_id = event_uuid;
$function$;

DROP FUNCTION IF EXISTS public.get_cached_location(text);
CREATE OR REPLACE FUNCTION public.get_cached_location(_address text)
 RETURNS TABLE(latitude numeric, longitude numeric, city text, country text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT latitude, longitude, city, country
  FROM public.location_cache
  WHERE address = _address
  AND cached_at > now() - INTERVAL '30 days';
$function$;

DROP FUNCTION IF EXISTS public.get_current_performance_with_mood(uuid);
CREATE OR REPLACE FUNCTION public.get_current_performance_with_mood(event_uuid uuid)
 RETURNS TABLE(lineup_id uuid, artist_name text, start_time time without time zone, end_time time without time zone, average_mood numeric, checkin_count integer, alert_threshold numeric)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

DROP FUNCTION IF EXISTS public.get_top_photos_for_highlight(uuid, integer);
CREATE OR REPLACE FUNCTION public.get_top_photos_for_highlight(event_uuid uuid, limit_count integer DEFAULT 20)
 RETURNS TABLE(photo_id uuid, file_url text, likes_count integer, created_at timestamp with time zone, caption text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- Now fix all the PLPGSQL functions that need search_path
CREATE OR REPLACE FUNCTION public.set_waitlist_position()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Get the next position for this event
  SELECT COALESCE(MAX(position), 0) + 1 INTO NEW.position
  FROM public.event_waitlist
  WHERE event_id = NEW.event_id;
  
  RETURN NEW;
END;
$function$;