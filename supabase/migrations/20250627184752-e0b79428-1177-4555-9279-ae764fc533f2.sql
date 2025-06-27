
-- Fix function search_path security warnings by setting SECURITY DEFINER and search_path
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

-- Fix handle_new_ticket function security
CREATE OR REPLACE FUNCTION public.handle_new_ticket()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
            'issued_at', now()
        )::text;
    END IF;
    
    RETURN NEW;
END;
$$;
