-- Clear any existing dummy data from events table
DELETE FROM events WHERE true;

-- Ensure tickets table has QR code functionality
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS qr_scanned_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS scanned_by UUID REFERENCES profiles(id);

-- Create QR code scanner log table for organizers
CREATE TABLE IF NOT EXISTS qr_scan_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id),
  event_id UUID NOT NULL REFERENCES events(id),
  scanned_by UUID NOT NULL REFERENCES profiles(id),
  scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  scan_location TEXT,
  device_info JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on qr_scan_logs
ALTER TABLE qr_scan_logs ENABLE ROW LEVEL SECURITY;

-- Policy for organizers to view their event scans
CREATE POLICY "Organizers can view scans for their events" 
ON qr_scan_logs FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM events 
    WHERE events.id = qr_scan_logs.event_id 
    AND events.organizer_id = auth.uid()
  )
);

-- Policy for organizers to insert scan logs
CREATE POLICY "Organizers can log QR scans for their events" 
ON qr_scan_logs FOR INSERT 
WITH CHECK (
  scanned_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM events 
    WHERE events.id = qr_scan_logs.event_id 
    AND events.organizer_id = auth.uid()
  )
);

-- Function to process QR scan and prevent duplicate entries
CREATE OR REPLACE FUNCTION process_qr_scan(
  p_ticket_id UUID,
  p_scanner_id UUID,
  p_scan_location TEXT DEFAULT NULL,
  p_device_info JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ticket_info RECORD;
  v_scan_result JSONB;
BEGIN
  -- Get ticket and event information
  SELECT 
    t.id,
    t.event_id,
    t.user_id,
    t.qr_scanned_at,
    t.status,
    e.organizer_id,
    e.title as event_title,
    e.date as event_date
  INTO v_ticket_info
  FROM tickets t
  JOIN events e ON t.event_id = e.id
  WHERE t.id = p_ticket_id;
  
  -- Check if ticket exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Ticket not found',
      'code', 'TICKET_NOT_FOUND'
    );
  END IF;
  
  -- Check if scanner is the event organizer
  IF v_ticket_info.organizer_id != p_scanner_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized: Only event organizer can scan tickets',
      'code', 'UNAUTHORIZED'
    );
  END IF;
  
  -- Check if ticket is valid status
  IF v_ticket_info.status != 'active' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Ticket is not active',
      'code', 'TICKET_INACTIVE'
    );
  END IF;
  
  -- Check if already scanned
  IF v_ticket_info.qr_scanned_at IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Ticket already scanned',
      'code', 'ALREADY_SCANNED',
      'scanned_at', v_ticket_info.qr_scanned_at
    );
  END IF;
  
  -- Mark ticket as scanned
  UPDATE tickets 
  SET 
    qr_scanned_at = now(),
    scanned_by = p_scanner_id
  WHERE id = p_ticket_id;
  
  -- Log the scan
  INSERT INTO qr_scan_logs (
    ticket_id,
    event_id,
    scanned_by,
    scan_location,
    device_info
  ) VALUES (
    p_ticket_id,
    v_ticket_info.event_id,
    p_scanner_id,
    p_scan_location,
    p_device_info
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'ticket_id', v_ticket_info.id,
    'event_title', v_ticket_info.event_title,
    'event_date', v_ticket_info.event_date,
    'scanned_at', now()
  );
END;
$$;

-- Ensure ticket QR codes are properly generated with trigger
CREATE OR REPLACE FUNCTION public.handle_new_ticket()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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
            'issued_at', now(),
            'verification_hash', encode(digest(NEW.id::text || NEW.user_id::text || extract(epoch from now())::text, 'sha256'), 'hex')
        )::text;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create or replace trigger
DROP TRIGGER IF EXISTS handle_new_ticket_trigger ON tickets;
CREATE TRIGGER handle_new_ticket_trigger
  BEFORE INSERT ON tickets
  FOR EACH ROW EXECUTE FUNCTION handle_new_ticket();