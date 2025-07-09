-- Fix security warning: Set fixed search_path for process_qr_scan function
CREATE OR REPLACE FUNCTION public.process_qr_scan(
  p_ticket_id UUID,
  p_scanner_id UUID,
  p_scan_location TEXT DEFAULT NULL,
  p_device_info JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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