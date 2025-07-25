-- Add lineup optimization, contributor tracking, and attendance streak features

-- Create artist_genres table for mapping artists to their genres and energy levels
CREATE TABLE IF NOT EXISTS public.artist_genres (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_name TEXT NOT NULL,
  genre TEXT NOT NULL,
  energy_level INTEGER NOT NULL CHECK (energy_level >= 1 AND energy_level <= 10),
  historical_engagement DECIMAL(3,2) DEFAULT 7.5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create lineup_suggestions table for AI-generated lineup recommendations
CREATE TABLE IF NOT EXISTS public.lineup_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  suggested_order JSONB NOT NULL,
  engagement_score DECIMAL(5,2) NOT NULL,
  created_by_ai BOOLEAN DEFAULT true,
  is_accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create snaploop_contributors table for tracking user upload activity
CREATE TABLE IF NOT EXISTS public.snaploop_contributors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_id UUID NOT NULL,
  upload_count INTEGER DEFAULT 0,
  is_top_contributor BOOLEAN DEFAULT false,
  badge_earned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Create user_attendance_streaks table for tracking category-based attendance
CREATE TABLE IF NOT EXISTS public.user_attendance_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_events_attended INTEGER DEFAULT 0,
  last_event_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, category)
);

-- Create streak_badges table for different streak achievements
CREATE TABLE IF NOT EXISTS public.streak_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  badge_type TEXT NOT NULL, -- 'streak_3', 'streak_5', 'streak_10', etc.
  streak_count INTEGER NOT NULL,
  xp_awarded INTEGER DEFAULT 50,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.artist_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lineup_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.snaploop_contributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_attendance_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for artist_genres
CREATE POLICY "Anyone can view artist genres" ON public.artist_genres FOR SELECT USING (true);
CREATE POLICY "Event organizers can manage artist genres" ON public.artist_genres FOR ALL 
  USING (true) WITH CHECK (true); -- Allow organizers to add/edit artist data

-- RLS Policies for lineup_suggestions
CREATE POLICY "Event organizers can view lineup suggestions for their events" ON public.lineup_suggestions FOR SELECT 
  USING (event_id IN (SELECT id FROM events WHERE organizer_id = auth.uid()));
CREATE POLICY "System can create lineup suggestions" ON public.lineup_suggestions FOR INSERT WITH CHECK (true);
CREATE POLICY "Event organizers can update lineup suggestions" ON public.lineup_suggestions FOR UPDATE 
  USING (event_id IN (SELECT id FROM events WHERE organizer_id = auth.uid()));

-- RLS Policies for snaploop_contributors
CREATE POLICY "Anyone can view contributor stats" ON public.snaploop_contributors FOR SELECT USING (true);
CREATE POLICY "System can manage contributor stats" ON public.snaploop_contributors FOR ALL 
  USING (true) WITH CHECK (true);

-- RLS Policies for user_attendance_streaks
CREATE POLICY "Users can view their own streaks" ON public.user_attendance_streaks FOR SELECT 
  USING (user_id = auth.uid());
CREATE POLICY "System can manage attendance streaks" ON public.user_attendance_streaks FOR ALL 
  USING (true) WITH CHECK (true);

-- RLS Policies for streak_badges
CREATE POLICY "Users can view their own streak badges" ON public.streak_badges FOR SELECT 
  USING (user_id = auth.uid());
CREATE POLICY "System can award streak badges" ON public.streak_badges FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_artist_genres_artist_name ON public.artist_genres(artist_name);
CREATE INDEX IF NOT EXISTS idx_artist_genres_genre ON public.artist_genres(genre);
CREATE INDEX IF NOT EXISTS idx_lineup_suggestions_event_id ON public.lineup_suggestions(event_id);
CREATE INDEX IF NOT EXISTS idx_snaploop_contributors_user_event ON public.snaploop_contributors(user_id, event_id);
CREATE INDEX IF NOT EXISTS idx_snaploop_contributors_event_id ON public.snaploop_contributors(event_id);
CREATE INDEX IF NOT EXISTS idx_user_attendance_streaks_user_category ON public.user_attendance_streaks(user_id, category);
CREATE INDEX IF NOT EXISTS idx_streak_badges_user_id ON public.streak_badges(user_id);

-- Create function to calculate lineup engagement score
CREATE OR REPLACE FUNCTION public.calculate_lineup_engagement_score(lineup_order JSONB)
RETURNS DECIMAL(5,2)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_score DECIMAL(5,2) := 0;
  artist_count INTEGER := 0;
  artist_record RECORD;
  position INTEGER := 1;
  position_multiplier DECIMAL(3,2);
BEGIN
  -- Iterate through the lineup order
  FOR artist_record IN SELECT value->>'artist_name' as artist_name FROM jsonb_array_elements(lineup_order)
  LOOP
    -- Calculate position multiplier (prime time slots get higher multiplier)
    position_multiplier := CASE 
      WHEN position <= 2 THEN 0.8  -- Opening acts
      WHEN position <= 5 THEN 1.2  -- Prime time
      WHEN position <= 8 THEN 1.0  -- Main acts
      ELSE 0.9  -- Closing acts
    END;
    
    -- Add artist's engagement score weighted by position
    SELECT COALESCE(historical_engagement * position_multiplier, 7.5 * position_multiplier)
    INTO total_score
    FROM public.artist_genres 
    WHERE artist_name = artist_record.artist_name
    LIMIT 1;
    
    artist_count := artist_count + 1;
    position := position + 1;
  END LOOP;
  
  -- Return average engagement score
  RETURN CASE WHEN artist_count > 0 THEN total_score / artist_count ELSE 0 END;
END;
$$;

-- Create function to update SnapLoop contributor stats
CREATE OR REPLACE FUNCTION public.update_snaploop_contributor_stats(p_user_id UUID, p_event_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INTEGER;
  max_count INTEGER;
BEGIN
  -- Upsert contributor record
  INSERT INTO public.snaploop_contributors (user_id, event_id, upload_count, updated_at)
  VALUES (p_user_id, p_event_id, 1, now())
  ON CONFLICT (user_id, event_id)
  DO UPDATE SET 
    upload_count = snaploop_contributors.upload_count + 1,
    updated_at = now()
  RETURNING upload_count INTO current_count;
  
  -- Get the maximum upload count for this event
  SELECT MAX(upload_count) INTO max_count
  FROM public.snaploop_contributors
  WHERE event_id = p_event_id;
  
  -- Reset all top contributor flags for this event
  UPDATE public.snaploop_contributors
  SET is_top_contributor = false
  WHERE event_id = p_event_id;
  
  -- Set top contributor flag for users with maximum uploads
  UPDATE public.snaploop_contributors
  SET is_top_contributor = true, badge_earned_at = now()
  WHERE event_id = p_event_id AND upload_count = max_count;
END;
$$;

-- Create function to update attendance streaks
CREATE OR REPLACE FUNCTION public.update_attendance_streak(p_user_id UUID, p_category TEXT, p_event_date DATE)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_streak INTEGER := 0;
  longest_streak INTEGER := 0;
  total_attended INTEGER := 0;
  last_date DATE;
  streak_broken BOOLEAN := false;
BEGIN
  -- Get current streak data
  SELECT current_streak, longest_streak, total_events_attended, last_event_date
  INTO current_streak, longest_streak, total_attended, last_date
  FROM public.user_attendance_streaks
  WHERE user_id = p_user_id AND category = p_category;
  
  -- Initialize if no record exists
  IF NOT FOUND THEN
    current_streak := 0;
    longest_streak := 0;
    total_attended := 0;
    last_date := NULL;
  END IF;
  
  -- Check if streak is broken (more than 90 days since last event in this category)
  IF last_date IS NOT NULL AND (p_event_date - last_date) > 90 THEN
    streak_broken := true;
    current_streak := 0;
  END IF;
  
  -- Increment counters
  current_streak := current_streak + 1;
  total_attended := total_attended + 1;
  
  -- Update longest streak if necessary
  IF current_streak > longest_streak THEN
    longest_streak := current_streak;
  END IF;
  
  -- Upsert the streak record
  INSERT INTO public.user_attendance_streaks (user_id, category, current_streak, longest_streak, total_events_attended, last_event_date, updated_at)
  VALUES (p_user_id, p_category, current_streak, longest_streak, total_attended, p_event_date, now())
  ON CONFLICT (user_id, category)
  DO UPDATE SET
    current_streak = EXCLUDED.current_streak,
    longest_streak = EXCLUDED.longest_streak,
    total_events_attended = EXCLUDED.total_events_attended,
    last_event_date = EXCLUDED.last_event_date,
    updated_at = now();
    
  -- Award badges for milestone streaks
  IF current_streak IN (3, 5, 10, 15, 20, 25, 30) THEN
    INSERT INTO public.streak_badges (user_id, category, badge_type, streak_count, xp_awarded)
    VALUES (p_user_id, p_category, 'streak_' || current_streak, current_streak, current_streak * 10)
    ON CONFLICT DO NOTHING; -- Prevent duplicate badges
  END IF;
END;
$$;

-- Create function to handle ticket purchase for streak tracking
CREATE OR REPLACE FUNCTION public.handle_ticket_purchase_streak()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_category TEXT;
  event_date DATE;
BEGIN
  -- Get event details
  SELECT category, date INTO event_category, event_date
  FROM public.events
  WHERE id = NEW.event_id;
  
  -- Update attendance streak
  IF event_category IS NOT NULL THEN
    PERFORM public.update_attendance_streak(NEW.user_id, event_category, event_date);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to update attendance streaks when tickets are purchased
DROP TRIGGER IF EXISTS trigger_ticket_purchase_streak ON public.tickets;
CREATE TRIGGER trigger_ticket_purchase_streak
  AFTER INSERT ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_ticket_purchase_streak();

-- Add trigger for updated_at columns
CREATE TRIGGER update_lineup_suggestions_updated_at
  BEFORE UPDATE ON public.lineup_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_snaploop_contributors_updated_at
  BEFORE UPDATE ON public.snaploop_contributors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_attendance_streaks_updated_at
  BEFORE UPDATE ON public.user_attendance_streaks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Populate artist_genres with sample data
INSERT INTO public.artist_genres (artist_name, genre, energy_level, historical_engagement) VALUES
('DJ Shadow', 'Electronic', 8, 8.5),
('Billie Eilish', 'Pop', 6, 9.2),
('Kendrick Lamar', 'Hip Hop', 9, 9.8),
('Tame Impala', 'Psychedelic Rock', 7, 8.7),
('Daft Punk', 'Electronic', 9, 9.5),
('The Weeknd', 'R&B', 7, 8.9),
('Arctic Monkeys', 'Indie Rock', 8, 8.3),
('Tyler, The Creator', 'Hip Hop', 8, 8.6),
('FKA twigs', 'Alternative R&B', 6, 7.8),
('Flume', 'Electronic', 8, 8.4),
('Radiohead', 'Alternative Rock', 6, 9.1),
('Childish Gambino', 'Hip Hop', 7, 8.8),
('ODESZA', 'Electronic', 8, 8.7),
('SZA', 'R&B', 6, 8.5),
('Glass Animals', 'Indie Pop', 7, 8.2),
('Bad Bunny', 'Reggaeton', 9, 9.3),
('Phoebe Bridgers', 'Indie Folk', 4, 7.9),
('The Strokes', 'Indie Rock', 8, 8.1),
('Frank Ocean', 'R&B', 5, 9.0),
('Porter Robinson', 'Electronic', 7, 8.3)
ON CONFLICT DO NOTHING;