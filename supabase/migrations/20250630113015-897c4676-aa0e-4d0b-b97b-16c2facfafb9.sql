
-- Fix function search_path security warnings by setting SECURITY DEFINER and search_path
CREATE OR REPLACE FUNCTION public.update_user_points(
  p_user_id UUID,
  p_points INTEGER
) RETURNS VOID 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert or update user points
  INSERT INTO public.user_points (user_id, total_points, level, last_activity)
  VALUES (p_user_id, p_points, GREATEST(1, p_points / 100), now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_points = user_points.total_points + p_points,
    level = GREATEST(1, (user_points.total_points + p_points) / 100),
    last_activity = now(),
    updated_at = now();
END;
$$;

-- Fix set_waitlist_position function security
CREATE OR REPLACE FUNCTION public.set_waitlist_position()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Get the next position for this event
  SELECT COALESCE(MAX(position), 0) + 1 INTO NEW.position
  FROM public.event_waitlist
  WHERE event_id = NEW.event_id;
  
  RETURN NEW;
END;
$$;
