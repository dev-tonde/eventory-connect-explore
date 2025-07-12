-- Add enhanced user gamification columns and tables
ALTER TABLE user_points ADD COLUMN IF NOT EXISTS achievements_unlocked_count INTEGER DEFAULT 0;
ALTER TABLE user_points ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0;
ALTER TABLE user_points ADD COLUMN IF NOT EXISTS favorite_category TEXT;

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  achievement_id TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  points_awarded INTEGER NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for achievements
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Create policies for achievements
CREATE POLICY "Users can view their own achievements" ON public.achievements
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert achievements" ON public.achievements
FOR INSERT WITH CHECK (true);

-- Create user referrals table
CREATE TABLE IF NOT EXISTS public.user_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL,
  referred_user_id UUID NOT NULL,
  referral_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  points_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for user referrals
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;

-- Create policies for user referrals
CREATE POLICY "Users can view their own referrals" ON public.user_referrals
FOR SELECT USING (referrer_id = auth.uid() OR referred_user_id = auth.uid());

CREATE POLICY "Users can create referrals" ON public.user_referrals
FOR INSERT WITH CHECK (referrer_id = auth.uid());

-- Create content moderation table
CREATE TABLE IF NOT EXISTS public.content_moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL,
  content_id TEXT,
  user_id UUID,
  content_text TEXT,
  moderation_result JSONB NOT NULL,
  is_approved BOOLEAN NOT NULL,
  flags TEXT[],
  confidence DECIMAL(4,3),
  reviewed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for content moderation logs
ALTER TABLE public.content_moderation_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for content moderation
CREATE POLICY "Admins can view moderation logs" ON public.content_moderation_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "System can insert moderation logs" ON public.content_moderation_logs
FOR INSERT WITH CHECK (true);

-- Create analytics configuration table
CREATE TABLE IF NOT EXISTS public.analytics_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT UNIQUE NOT NULL,
  config_value TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default analytics configuration
INSERT INTO public.analytics_config (config_key, config_value) VALUES
  ('google_analytics_tracking_id', 'G-XXXXXXXXXX'),
  ('google_analytics_measurement_id', 'G-XXXXXXXXXX'),
  ('facebook_pixel_id', ''),
  ('hotjar_site_id', '')
ON CONFLICT (config_key) DO NOTHING;

-- Enable RLS for analytics config
ALTER TABLE public.analytics_config ENABLE ROW LEVEL SECURITY;

-- Create policies for analytics config
CREATE POLICY "Anyone can view analytics config" ON public.analytics_config
FOR SELECT USING (true);

CREATE POLICY "Admins can manage analytics config" ON public.analytics_config
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Create enhanced event tracking
CREATE TABLE IF NOT EXISTS public.event_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  user_id UUID,
  interaction_type TEXT NOT NULL, -- 'view', 'share', 'favorite', 'unfavorite', 'rsvp', 'cancel_rsvp'
  interaction_data JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for event interactions
ALTER TABLE public.event_interactions ENABLE ROW LEVEL SECURITY;

-- Create policies for event interactions
CREATE POLICY "Anyone can insert interactions" ON public.event_interactions
FOR INSERT WITH CHECK (true);

CREATE POLICY "Event organizers can view interactions for their events" ON public.event_interactions
FOR SELECT USING (
  event_id IN (
    SELECT id FROM events WHERE organizer_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_achievement_id ON achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_referrals_referrer_id ON user_referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_user_referrals_referred_user_id ON user_referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_content_moderation_logs_user_id ON content_moderation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_content_moderation_logs_content_type ON content_moderation_logs(content_type);
CREATE INDEX IF NOT EXISTS idx_event_interactions_event_id ON event_interactions(event_id);
CREATE INDEX IF NOT EXISTS idx_event_interactions_user_id ON event_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_event_interactions_type ON event_interactions(interaction_type);

-- Update the update_user_points function to handle achievements
CREATE OR REPLACE FUNCTION public.update_user_points(p_user_id uuid, p_points integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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