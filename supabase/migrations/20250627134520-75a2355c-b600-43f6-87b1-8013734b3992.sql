
-- Add audit logging table for admin operations
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add session tracking table
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  device_info JSONB DEFAULT '{}',
  ip_address INET,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add rate limiting table for form submissions
CREATE TABLE IF NOT EXISTS public.form_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL, -- IP or user_id
  form_type TEXT NOT NULL,
  submission_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(identifier, form_type, window_start)
);

-- Add file upload security table
CREATE TABLE IF NOT EXISTS public.file_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  original_filename TEXT NOT NULL,
  stored_filename TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  scan_status TEXT DEFAULT 'pending', -- pending, clean, infected, error
  scan_result JSONB DEFAULT '{}',
  upload_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enhance pricing_rules table with min/max constraints
ALTER TABLE public.pricing_rules 
ADD COLUMN IF NOT EXISTS min_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS max_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;

-- Add two-factor authentication table
CREATE TABLE IF NOT EXISTS public.user_2fa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  secret TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  backup_codes TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  enabled_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on new tables
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_2fa ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin audit logs
CREATE POLICY "Admins can view all audit logs" 
  ON public.admin_audit_logs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can insert audit logs" 
  ON public.admin_audit_logs 
  FOR INSERT 
  WITH CHECK (true);

-- RLS policies for user sessions
CREATE POLICY "Users can view their own sessions" 
  ON public.user_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own sessions" 
  ON public.user_sessions 
  FOR ALL 
  USING (auth.uid() = user_id);

-- RLS policies for form rate limits
CREATE POLICY "System can manage rate limits" 
  ON public.form_rate_limits 
  FOR ALL 
  USING (true);

-- RLS policies for file uploads
CREATE POLICY "Users can view their own file uploads" 
  ON public.file_uploads 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create file uploads" 
  ON public.file_uploads 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for 2FA
CREATE POLICY "Users can manage their own 2FA" 
  ON public.user_2fa 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_id ON public.admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON public.admin_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON public.user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON public.user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_form_rate_limits_identifier ON public.form_rate_limits(identifier, form_type);
CREATE INDEX IF NOT EXISTS idx_file_uploads_user_id ON public.file_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_scan_status ON public.file_uploads(scan_status);

-- Function to check form rate limits
CREATE OR REPLACE FUNCTION check_form_rate_limit(
  identifier_val TEXT,
  form_type_val TEXT,
  max_submissions INTEGER DEFAULT 5,
  window_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  action_val TEXT,
  resource_type_val TEXT,
  resource_id_val UUID DEFAULT NULL,
  details_val JSONB DEFAULT '{}'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Enhanced dynamic pricing function with min/max constraints
CREATE OR REPLACE FUNCTION get_dynamic_price_with_constraints(event_uuid UUID)
RETURNS DECIMAL(10,2)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;
