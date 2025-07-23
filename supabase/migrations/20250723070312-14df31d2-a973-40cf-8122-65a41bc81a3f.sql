-- Fix search_path for the new mood summary function
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