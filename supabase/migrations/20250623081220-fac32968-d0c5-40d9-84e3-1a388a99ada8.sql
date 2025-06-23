
-- Create communities table
CREATE TABLE public.communities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  invite_code TEXT UNIQUE,
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community members table
CREATE TABLE public.community_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID REFERENCES public.communities ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(community_id, user_id)
);

-- Create community messages table (for chat feature)
CREATE TABLE public.community_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID REFERENCES public.communities ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'event')),
  image_url TEXT,
  event_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community polls table
CREATE TABLE public.community_polls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID REFERENCES public.communities ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_id TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create poll options table
CREATE TABLE public.poll_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES public.community_polls ON DELETE CASCADE NOT NULL,
  option_text TEXT NOT NULL,
  votes_count INTEGER DEFAULT 0
);

-- Create poll votes table
CREATE TABLE public.poll_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES public.community_polls ON DELETE CASCADE NOT NULL,
  option_id UUID REFERENCES public.poll_options ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

-- Create event sentiment tracking table
CREATE TABLE public.event_sentiment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users,
  sentiment TEXT CHECK (sentiment IN ('very_positive', 'positive', 'neutral', 'negative', 'very_negative')),
  feedback TEXT,
  is_anonymous BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create calendar sync table
CREATE TABLE public.calendar_sync (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  event_id TEXT NOT NULL,
  calendar_provider TEXT CHECK (calendar_provider IN ('google', 'outlook', 'apple')),
  calendar_event_id TEXT,
  prep_time_minutes INTEGER DEFAULT 30,
  travel_time_minutes INTEGER,
  reminder_sent BOOLEAN DEFAULT false,
  synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Enable RLS on all tables
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_sentiment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_sync ENABLE ROW LEVEL SECURITY;

-- RLS policies for communities
CREATE POLICY "Users can view public communities" 
  ON public.communities 
  FOR SELECT 
  USING (is_public = true OR id IN (
    SELECT community_id FROM public.community_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create communities" 
  ON public.communities 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Community admins can update communities" 
  ON public.communities 
  FOR UPDATE 
  USING (id IN (
    SELECT community_id FROM public.community_members 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- RLS policies for community members
CREATE POLICY "Members can view community membership" 
  ON public.community_members 
  FOR SELECT 
  USING (community_id IN (
    SELECT community_id FROM public.community_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can join communities" 
  ON public.community_members 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for community messages
CREATE POLICY "Members can view community messages" 
  ON public.community_messages 
  FOR SELECT 
  USING (community_id IN (
    SELECT community_id FROM public.community_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Members can send messages" 
  ON public.community_messages 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id AND community_id IN (
    SELECT community_id FROM public.community_members WHERE user_id = auth.uid()
  ));

-- RLS policies for polls
CREATE POLICY "Members can view polls" 
  ON public.community_polls 
  FOR SELECT 
  USING (community_id IN (
    SELECT community_id FROM public.community_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Members can create polls" 
  ON public.community_polls 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by AND community_id IN (
    SELECT community_id FROM public.community_members WHERE user_id = auth.uid()
  ));

-- RLS policies for poll options
CREATE POLICY "Members can view poll options" 
  ON public.poll_options 
  FOR SELECT 
  USING (poll_id IN (
    SELECT id FROM public.community_polls WHERE community_id IN (
      SELECT community_id FROM public.community_members WHERE user_id = auth.uid()
    )
  ));

-- RLS policies for poll votes
CREATE POLICY "Users can view poll votes" 
  ON public.poll_votes 
  FOR SELECT 
  USING (poll_id IN (
    SELECT id FROM public.community_polls WHERE community_id IN (
      SELECT community_id FROM public.community_members WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can vote on polls" 
  ON public.poll_votes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for event sentiment
CREATE POLICY "Users can view event sentiment" 
  ON public.event_sentiment 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can submit sentiment" 
  ON public.event_sentiment 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- RLS policies for calendar sync
CREATE POLICY "Users can view their own calendar sync" 
  ON public.calendar_sync 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create calendar sync" 
  ON public.calendar_sync 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their calendar sync" 
  ON public.calendar_sync 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Function to generate unique invite codes
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
BEGIN
  RETURN upper(substr(md5(random()::text), 1, 8));
END;
$$ LANGUAGE plpgsql;

-- Trigger to generate invite codes for communities
CREATE OR REPLACE FUNCTION set_invite_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invite_code IS NULL THEN
    NEW.invite_code = generate_invite_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER communities_invite_code_trigger
  BEFORE INSERT ON public.communities
  FOR EACH ROW
  EXECUTE FUNCTION set_invite_code();
