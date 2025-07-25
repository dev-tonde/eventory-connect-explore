-- Fix remaining functions with mutable search_path
CREATE OR REPLACE FUNCTION public.increment_likes(photo_id text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE photos 
  SET likes_count = likes_count + 1 
  WHERE id = photo_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.decrement_likes(photo_id text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE photos 
  SET likes_count = GREATEST(likes_count - 1, 0) 
  WHERE id = photo_id;
END;
$function$;