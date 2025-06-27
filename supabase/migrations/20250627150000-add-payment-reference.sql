
-- Add payment reference column to tickets table
ALTER TABLE public.tickets 
ADD COLUMN payment_reference text,
ADD COLUMN payment_status text DEFAULT 'pending',
ADD COLUMN payment_method text DEFAULT 'yoco';

-- Add index for payment reference lookups
CREATE INDEX idx_tickets_payment_reference ON public.tickets(payment_reference);

-- Add QR code column for ticket validation
ALTER TABLE public.tickets
ADD COLUMN qr_code text,
ADD COLUMN ticket_number text;

-- Create function to generate unique ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS text
LANGUAGE plpgsql
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

-- Create trigger to auto-generate ticket numbers and QR codes
CREATE OR REPLACE FUNCTION handle_new_ticket()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Generate ticket number
    NEW.ticket_number := generate_ticket_number();
    
    -- Generate QR code data (JSON string with ticket info)
    NEW.qr_code := json_build_object(
        'ticket_id', NEW.id,
        'ticket_number', NEW.ticket_number,
        'event_id', NEW.event_id,
        'user_id', NEW.user_id,
        'quantity', NEW.quantity,
        'issued_at', now()
    )::text;
    
    RETURN NEW;
END;
$$;

-- Create trigger for new tickets
DROP TRIGGER IF EXISTS on_ticket_created ON public.tickets;
CREATE TRIGGER on_ticket_created
    BEFORE INSERT ON public.tickets
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_ticket();
