
-- Fix Function Search Path Mutable security issues
-- Update all functions to have SET search_path = 'public' for security

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

CREATE OR REPLACE FUNCTION public.track_event_view(event_uuid uuid, session_id text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.event_analytics (event_id, metric_type, user_id, session_id, created_at)
  VALUES (event_uuid, 'view', auth.uid(), session_id, now());
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_event_rating(event_uuid uuid)
 RETURNS numeric
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT COALESCE(AVG(rating), 0)::DECIMAL(3,2)
  FROM public.event_reviews
  WHERE event_id = event_uuid;
$function$;

CREATE OR REPLACE FUNCTION public.generate_unique_username(first_name text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
    base_username text;
    final_username text;
    counter integer := 1;
BEGIN
    -- Create base username from first name (lowercase, no spaces)
    base_username := lower(regexp_replace(coalesce(first_name, 'user'), '[^a-zA-Z0-9]', '', 'g'));
    
    -- If base_username is empty, use 'user'
    IF base_username = '' THEN
        base_username := 'user';
    END IF;
    
    final_username := base_username;
    
    -- Check if username exists and increment until we find a unique one
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
        final_username := base_username || counter;
        counter := counter + 1;
    END LOOP;
    
    RETURN final_username;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_dynamic_price(event_uuid uuid)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
    base_price decimal(10,2);
    final_price decimal(10,2);
    event_date date;
    max_attendees integer;
    current_attendees integer;
    days_until_event integer;
    attendance_ratio decimal(4,2);
    price_multiplier decimal(4,2) := 1.0;
BEGIN
    -- Get event details
    SELECT price, date, max_attendees, current_attendees
    INTO base_price, event_date, max_attendees, current_attendees
    FROM public.events
    WHERE id = event_uuid;
    
    IF base_price IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Calculate days until event
    days_until_event := event_date - CURRENT_DATE;
    
    -- Calculate attendance ratio
    attendance_ratio := CASE 
        WHEN max_attendees > 0 THEN current_attendees::decimal / max_attendees::decimal
        ELSE 0
    END;
    
    -- Apply early bird discount (more than 30 days out)
    IF days_until_event > 30 THEN
        price_multiplier := 0.8; -- 20% discount
    -- Apply time-based surge pricing (less than 7 days)
    ELSIF days_until_event <= 7 AND days_until_event > 0 THEN
        price_multiplier := 1.2; -- 20% increase
    -- Apply capacity-based pricing
    ELSIF attendance_ratio >= 0.8 THEN
        price_multiplier := 1.5; -- 50% increase when 80%+ sold
    ELSIF attendance_ratio >= 0.5 THEN
        price_multiplier := 1.3; -- 30% increase when 50%+ sold
    END IF;
    
    final_price := base_price * price_multiplier;
    RETURN final_price;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_rate_limit(identifier_val text, action_val text, max_requests integer, window_minutes integer DEFAULT 60)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.create_split_payment(_event_id uuid, _total_amount numeric, _quantity integer, _participant_emails text[])
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  _split_id UUID;
  _amount_per_person DECIMAL(10,2);
  _email TEXT;
BEGIN
  -- Calculate amount per person
  _amount_per_person := _total_amount / array_length(_participant_emails, 1);
  
  -- Create split payment
  INSERT INTO public.split_payments (event_id, organizer_id, total_amount, quantity)
  VALUES (_event_id, auth.uid(), _total_amount, _quantity)
  RETURNING id INTO _split_id;
  
  -- Add participants
  FOREACH _email IN ARRAY _participant_emails
  LOOP
    INSERT INTO public.split_payment_participants (split_payment_id, email, amount)
    VALUES (_split_id, _email, _amount_per_person);
  END LOOP;
  
  RETURN _split_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.cache_location(_address text, _latitude numeric, _longitude numeric, _city text DEFAULT NULL::text, _country text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.location_cache (address, latitude, longitude, city, country)
  VALUES (_address, _latitude, _longitude, _city, _country)
  ON CONFLICT (address) DO UPDATE SET
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    city = EXCLUDED.city,
    country = EXCLUDED.country,
    cached_at = now();
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_cached_location(_address text)
 RETURNS TABLE(latitude numeric, longitude numeric, city text, country text)
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT latitude, longitude, city, country
  FROM public.location_cache
  WHERE address = _address
  AND cached_at > now() - INTERVAL '30 days';
$function$;

CREATE OR REPLACE FUNCTION public.process_split_payment_contribution(_split_id uuid, _participant_email text, _payment_method text DEFAULT 'mock'::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  _participant_count INTEGER;
  _paid_count INTEGER;
BEGIN
  -- Update participant status
  UPDATE public.split_payment_participants
  SET status = 'paid', payment_method = _payment_method, paid_at = now()
  WHERE split_payment_id = _split_id AND email = _participant_email;
  
  -- Check if all participants have paid
  SELECT COUNT(*) INTO _participant_count
  FROM public.split_payment_participants
  WHERE split_payment_id = _split_id;
  
  SELECT COUNT(*) INTO _paid_count
  FROM public.split_payment_participants
  WHERE split_payment_id = _split_id AND status = 'paid';
  
  -- Update split payment status
  IF _paid_count = _participant_count THEN
    UPDATE public.split_payments
    SET status = 'complete'
    WHERE id = _split_id;
  ELSIF _paid_count > 0 THEN
    UPDATE public.split_payments
    SET status = 'partial'
    WHERE id = _split_id;
  END IF;
  
  RETURN TRUE;
END;
$function$;
