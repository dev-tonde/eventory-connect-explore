-- Comprehensive fix for ALL remaining functions without proper search_path
-- This migration adds SET search_path TO 'public' to all security definer functions

-- Batch 1: Critical trigger and admin functions
CREATE OR REPLACE FUNCTION public.log_admin_action(action_val text, resource_type_val text, resource_id_val uuid DEFAULT NULL::uuid, details_val jsonb DEFAULT '{}'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.admin_audit_logs (
    admin_id, action, resource_type, resource_id, details
  ) VALUES (
    auth.uid(), action_val, resource_type_val, resource_id_val, details_val
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$function$;

-- Batch 2: Event and pricing functions
CREATE OR REPLACE FUNCTION public.get_dynamic_price_with_constraints(event_uuid uuid)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    base_price DECIMAL(10,2);
    final_price DECIMAL(10,2);
    min_price_limit DECIMAL(10,2);
    max_price_limit DECIMAL(10,2);
    event_date DATE;
    max_attendees INTEGER;
    current_attendees INTEGER;
    days_until_event INTEGER;
    attendance_ratio DECIMAL(4,2);
    price_multiplier DECIMAL(4,2) := 1.0;
BEGIN
    -- Get event details
    SELECT price, date, max_attendees, current_attendees
    INTO base_price, event_date, max_attendees, current_attendees
    FROM public.events
    WHERE id = event_uuid;
    
    IF base_price IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Get pricing constraints
    SELECT MIN(min_price), MAX(max_price)
    INTO min_price_limit, max_price_limit
    FROM public.pricing_rules
    WHERE event_id = event_uuid AND is_active = true;
    
    -- Calculate days until event
    days_until_event := event_date - CURRENT_DATE;
    
    -- Calculate attendance ratio
    attendance_ratio := CASE 
        WHEN max_attendees > 0 THEN current_attendees::DECIMAL / max_attendees::DECIMAL
        ELSE 0
    END;
    
    -- Apply pricing rules based on active rules
    SELECT COALESCE(
        (SELECT 
            CASE 
                WHEN days_until_event > 30 THEN 0.8 -- Early bird
                WHEN days_until_event <= 7 AND days_until_event > 0 THEN 1.2 -- Last week
                WHEN attendance_ratio >= 0.9 THEN 1.5 -- Almost sold out
                WHEN attendance_ratio >= 0.7 THEN 1.3 -- High demand
                ELSE 1.0
            END
        ), 1.0
    ) INTO price_multiplier;
    
    final_price := base_price * price_multiplier;
    
    -- Apply min/max constraints
    IF min_price_limit IS NOT NULL AND final_price < min_price_limit THEN
        final_price := min_price_limit;
    END IF;
    
    IF max_price_limit IS NOT NULL AND final_price > max_price_limit THEN
        final_price := max_price_limit;
    END IF;
    
    RETURN final_price;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_dynamic_price(event_uuid uuid)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
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

-- Batch 3: More critical functions
CREATE OR REPLACE FUNCTION public.track_event_view(event_uuid uuid, session_id text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.event_analytics (event_id, metric_type, user_id, session_id, created_at)
  VALUES (event_uuid, 'view', auth.uid(), session_id, now());
END;
$function$;