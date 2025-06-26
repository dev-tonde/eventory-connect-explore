
-- Event Reviews System
CREATE TABLE public.event_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_verified_attendee BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Push Notifications
CREATE TABLE public.user_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- 'info', 'event', 'reminder', 'admin'
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Push Subscription for browser notifications
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- Refund System
CREATE TABLE public.refund_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'processed'
  refund_amount DECIMAL(10,2) NOT NULL,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Admin & Moderation
CREATE TABLE public.user_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL, -- 'spam', 'inappropriate', 'fake', 'harassment'
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved', 'dismissed'
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Event Approval System
CREATE TABLE public.event_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  admin_id UUID REFERENCES auth.users(id),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Analytics tracking
CREATE TABLE public.event_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL, -- 'view', 'click', 'share', 'favorite'
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Platform analytics
CREATE TABLE public.platform_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  metric_name TEXT NOT NULL, -- 'daily_active_users', 'events_created', 'tickets_sold', etc.
  metric_value INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(date, metric_name)
);

-- Error logs
CREATE TABLE public.error_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  url TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Rate limiting
CREATE TABLE public.rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL, -- IP or user_id
  action TEXT NOT NULL, -- 'api_call', 'login_attempt', 'event_creation'
  count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(identifier, action, window_start)
);

-- Add RLS policies
ALTER TABLE public.event_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_reviews
CREATE POLICY "Users can view all event reviews" ON public.event_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create their own reviews" ON public.event_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON public.event_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON public.event_reviews FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_notifications
CREATE POLICY "Users can view their own notifications" ON public.user_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.user_notifications FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for push_subscriptions
CREATE POLICY "Users can manage their push subscriptions" ON public.push_subscriptions FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for refund_requests
CREATE POLICY "Users can view their own refund requests" ON public.refund_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own refund requests" ON public.refund_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_reports
CREATE POLICY "Users can create reports" ON public.user_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users can view their own reports" ON public.user_reports FOR SELECT USING (auth.uid() = reporter_id);

-- Functions for analytics
CREATE OR REPLACE FUNCTION public.track_event_view(event_uuid UUID, session_id TEXT DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.event_analytics (event_id, metric_type, user_id, session_id, created_at)
  VALUES (event_uuid, 'view', auth.uid(), session_id, now());
END;
$$;

-- Function to get event rating average
CREATE OR REPLACE FUNCTION public.get_event_rating(event_uuid UUID)
RETURNS DECIMAL(3,2)
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(AVG(rating), 0)::DECIMAL(3,2)
  FROM public.event_reviews
  WHERE event_id = event_uuid;
$$;

-- Function to check rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  identifier_val TEXT,
  action_val TEXT,
  max_requests INTEGER,
  window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Add indexes for performance
CREATE INDEX idx_event_reviews_event_id ON public.event_reviews(event_id);
CREATE INDEX idx_event_reviews_user_id ON public.event_reviews(user_id);
CREATE INDEX idx_user_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX idx_user_notifications_created_at ON public.user_notifications(created_at);
CREATE INDEX idx_event_analytics_event_id ON public.event_analytics(event_id);
CREATE INDEX idx_event_analytics_created_at ON public.event_analytics(created_at);
CREATE INDEX idx_rate_limits_identifier_action ON public.rate_limits(identifier, action, window_start);
