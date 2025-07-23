-- Fix remaining functions that need search_path set
CREATE OR REPLACE FUNCTION public.set_waitlist_position()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Get the next position for this event
  SELECT COALESCE(MAX(position), 0) + 1 INTO NEW.position
  FROM public.event_waitlist
  WHERE event_id = NEW.event_id;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_user_points(p_user_id uuid, p_points integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
    
  -- Update achievements count
  UPDATE public.user_points 
  SET achievements_unlocked_count = (
    SELECT COUNT(*) FROM achievements WHERE user_id = p_user_id
  )
  WHERE user_id = p_user_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    ticket_num text;
    counter integer := 1;
BEGIN
    -- Generate ticket number format: EVT-YYYYMMDD-XXXXX
    ticket_num := 'EVT-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(extract(epoch from now())::text, 5, '0');
    
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM public.tickets WHERE ticket_number = ticket_num) LOOP
        ticket_num := 'EVT-' || to_char(now(), 'YYYYMMDD') || '-' || lpad((extract(epoch from now()) + counter)::text, 5, '0');
        counter := counter + 1;
    END LOOP;
    
    RETURN ticket_num;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_ticket()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
    -- Only generate if not already set
    IF NEW.ticket_number IS NULL THEN
        NEW.ticket_number := generate_ticket_number();
    END IF;
    
    -- Generate QR code data (JSON string with ticket info)
    IF NEW.qr_code IS NULL THEN
        NEW.qr_code := json_build_object(
            'ticket_id', NEW.id,
            'ticket_number', COALESCE(NEW.ticket_number, generate_ticket_number()),
            'event_id', NEW.event_id,
            'user_id', NEW.user_id,
            'quantity', NEW.quantity,
            'issued_at', now(),
            'verification_hash', encode(digest(NEW.id::text || NEW.user_id::text || extract(epoch from now())::text, 'sha256'), 'hex')
        )::text;
    END IF;
    
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN upper(substr(md5(random()::text), 1, 8));
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_invite_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF NEW.invite_code IS NULL THEN
    NEW.invite_code = generate_invite_code();
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$function$;