
-- Add payment reference and ticket validation columns to tickets table
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS payment_reference text,
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'yoco',
ADD COLUMN IF NOT EXISTS qr_code text,
ADD COLUMN IF NOT EXISTS ticket_number text;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tickets_payment_reference ON public.tickets(payment_reference);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_number ON public.tickets(ticket_number);

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

-- Create function to handle new ticket creation
CREATE OR REPLACE FUNCTION handle_new_ticket()
RETURNS trigger
LANGUAGE plpgsql
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

-- Create trigger for new tickets (only if it doesn't exist)
DROP TRIGGER IF EXISTS on_ticket_created ON public.tickets;
CREATE TRIGGER on_ticket_created
    BEFORE INSERT ON public.tickets
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_ticket();
