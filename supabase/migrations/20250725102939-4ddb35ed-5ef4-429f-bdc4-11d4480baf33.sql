-- Fix the check_form_rate_limit function to have proper search path
DROP FUNCTION IF EXISTS public.check_form_rate_limit(text, text, integer, integer);

CREATE OR REPLACE FUNCTION public.check_form_rate_limit(identifier_val text, form_type_val text, max_submissions integer DEFAULT 5, window_minutes integer DEFAULT 60)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_count INTEGER;
  window_start_time TIMESTAMP WITH TIME ZONE;
BEGIN
  window_start_time := date_trunc('hour', now()) + 
    (EXTRACT(minute FROM now())::INTEGER / window_minutes) * 
    (window_minutes * INTERVAL '1 minute');
  
  SELECT submission_count INTO current_count
  FROM public.form_rate_limits
  WHERE identifier = identifier_val
    AND form_type = form_type_val
    AND window_start = window_start_time;
  
  IF current_count IS NULL THEN
    INSERT INTO public.form_rate_limits (identifier, form_type, submission_count, window_start)
    VALUES (identifier_val, form_type_val, 1, window_start_time);
    RETURN true;
  ELSIF current_count < max_submissions THEN
    UPDATE public.form_rate_limits
    SET submission_count = submission_count + 1
    WHERE identifier = identifier_val
      AND form_type = form_type_val
      AND window_start = window_start_time;
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$function$;

-- Fix the check_rate_limit function to have proper search path
DROP FUNCTION IF EXISTS public.check_rate_limit(text, text, integer, integer);

CREATE OR REPLACE FUNCTION public.check_rate_limit(identifier_val text, action_val text, max_requests integer, window_minutes integer DEFAULT 60)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_count INTEGER;
  window_start_time TIMESTAMP WITH TIME ZONE;
BEGIN
  window_start_time := date_trunc('hour', now()) + (EXTRACT(minute FROM now())::INTEGER / window_minutes) * (window_minutes * INTERVAL '1 minute');
  
  SELECT count INTO current_count
  FROM public.rate_limits
  WHERE identifier = identifier_val
    AND action = action_val
    AND window_start = window_start_time;
  
  IF current_count IS NULL THEN
    INSERT INTO public.rate_limits (identifier, action, window_start, count)
    VALUES (identifier_val, action_val, window_start_time, 1);
    RETURN true;
  ELSIF current_count < max_requests THEN
    UPDATE public.rate_limits
    SET count = count + 1
    WHERE identifier = identifier_val
      AND action = action_val
      AND window_start = window_start_time;
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$function$;