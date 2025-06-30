
-- Create user_points table for gamification
CREATE TABLE public.user_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  badges TEXT[] DEFAULT '{}',
  streak_days INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create point_transactions table to track point history
CREATE TABLE public.point_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  action TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create event_waitlist table for waitlist management
CREATE TABLE public.event_waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  notified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Create function to update user points
CREATE OR REPLACE FUNCTION public.update_user_points(
  p_user_id UUID,
  p_points INTEGER
) RETURNS VOID AS $$
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically set waitlist position
CREATE OR REPLACE FUNCTION public.set_waitlist_position()
RETURNS TRIGGER AS $$
BEGIN
  -- Get the next position for this event
  SELECT COALESCE(MAX(position), 0) + 1 INTO NEW.position
  FROM public.event_waitlist
  WHERE event_id = NEW.event_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_waitlist_position_trigger
  BEFORE INSERT ON public.event_waitlist
  FOR EACH ROW
  EXECUTE FUNCTION public.set_waitlist_position();

-- Enable RLS on all tables
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_waitlist ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_points
CREATE POLICY "Users can view their own points" ON public.user_points
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own points" ON public.user_points
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for point_transactions
CREATE POLICY "Users can view their own transactions" ON public.point_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON public.point_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for event_waitlist
CREATE POLICY "Users can view their own waitlist entries" ON public.event_waitlist
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can join waitlists" ON public.event_waitlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave waitlists" ON public.event_waitlist
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_user_points_user_id ON public.user_points(user_id);
CREATE INDEX idx_point_transactions_user_id ON public.point_transactions(user_id);
CREATE INDEX idx_event_waitlist_event_id ON public.event_waitlist(event_id);
CREATE INDEX idx_event_waitlist_user_id ON public.event_waitlist(user_id);
CREATE INDEX idx_event_waitlist_position ON public.event_waitlist(event_id, position);
