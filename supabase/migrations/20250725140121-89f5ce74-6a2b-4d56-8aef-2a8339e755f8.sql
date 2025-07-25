-- Fix the get_events_within_radius function to handle point data type correctly
CREATE OR REPLACE FUNCTION public.get_events_within_radius(user_lat numeric, user_lng numeric, radius_km numeric DEFAULT 50)
 RETURNS TABLE(event_id uuid, title text, venue text, event_date date, event_time time without time zone, distance_km numeric, mood_color text, photo_count integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
        cos(radians((e.location_coordinates)[1])) * 
        cos(radians((e.location_coordinates)[0]) - radians(user_lng)) + 
        sin(radians(user_lat)) * 
        sin(radians((e.location_coordinates)[1]))
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
      cos(radians((e.location_coordinates)[1])) * 
      cos(radians((e.location_coordinates)[0]) - radians(user_lng)) + 
      sin(radians(user_lat)) * 
      sin(radians((e.location_coordinates)[1]))
    )) <= radius_km
  GROUP BY e.id, e.title, e.venue, e.date, e.time, e.location_coordinates
  ORDER BY distance_km ASC;
END;
$function$