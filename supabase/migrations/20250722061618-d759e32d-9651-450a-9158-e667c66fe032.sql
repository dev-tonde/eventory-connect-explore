-- CRITICAL SECURITY FIX: Enable RLS on all missing tables and create proper policies

-- 1. challenge_submissions table
ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own challenge submissions"
ON public.challenge_submissions FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own challenge submissions"
ON public.challenge_submissions FOR INSERT
WITH CHECK (user_id = auth.uid());

-- 2. challenges table
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active challenges"
ON public.challenges FOR SELECT
USING (status = 'active');

CREATE POLICY "Event organizers can create challenges"
ON public.challenges FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = challenges.event_id 
    AND organizer_id = auth.uid()
  )
);

CREATE POLICY "Event organizers can update their challenges"
ON public.challenges FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = challenges.event_id 
    AND organizer_id = auth.uid()
  )
);

-- 3. event_chat table
ALTER TABLE public.event_chat ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view chat for events they're attending"
ON public.event_chat FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.tickets 
      WHERE event_id = event_chat.event_id 
      AND user_id = auth.uid()
    )
  )
);

CREATE POLICY "Authenticated users can post in event chat"
ON public.event_chat FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 4. event_invites table
ALTER TABLE public.event_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view invites sent to them"
ON public.event_invites FOR SELECT
USING (
  invited_email IN (
    SELECT email FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Event organizers can create invites"
ON public.event_invites FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = event_invites.event_id 
    AND organizer_id = auth.uid()
  )
);

-- 5. event_polls table
ALTER TABLE public.event_polls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view polls for events they're attending"
ON public.event_polls FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tickets 
    WHERE event_id = event_polls.event_id 
    AND user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = event_polls.event_id 
    AND organizer_id = auth.uid()
  )
);

CREATE POLICY "Event organizers can create polls"
ON public.event_polls FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = event_polls.event_id 
    AND organizer_id = auth.uid()
  )
);

-- 6. follows table
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own follows"
ON public.follows FOR SELECT
USING (follower_id = auth.uid() OR following_id = auth.uid());

CREATE POLICY "Users can create their own follows"
ON public.follows FOR INSERT
WITH CHECK (follower_id = auth.uid());

CREATE POLICY "Users can delete their own follows"
ON public.follows FOR DELETE
USING (follower_id = auth.uid());

-- 7. guest_sessions table
ALTER TABLE public.guest_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public access to guest sessions"
ON public.guest_sessions FOR ALL
USING (true);

-- 8. payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments"
ON public.payments FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own payments"
ON public.payments FOR INSERT
WITH CHECK (user_id = auth.uid());

-- 9. photos table
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved photos"
ON public.photos FOR SELECT
USING (moderation_status = 'approved');

CREATE POLICY "Anyone can upload photos"
ON public.photos FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can update photo moderation"
ON public.photos FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- 10. referrals table
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referrals"
ON public.referrals FOR SELECT
USING (referrer_id = auth.uid() OR referred_id = auth.uid());

CREATE POLICY "Users can create referrals"
ON public.referrals FOR INSERT
WITH CHECK (referrer_id = auth.uid());

-- 11. stories table
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active stories"
ON public.stories FOR SELECT
USING (expires_at > now());

CREATE POLICY "Organizers can create their own stories"
ON public.stories FOR INSERT
WITH CHECK (organizer_id = auth.uid());

CREATE POLICY "Organizers can update their own stories"
ON public.stories FOR UPDATE
USING (organizer_id = auth.uid());

-- 12. user_rewards table  
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rewards"
ON public.user_rewards FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "System can create rewards"
ON public.user_rewards FOR INSERT
WITH CHECK (true);

-- 13. user_subscriptions table
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
ON public.user_subscriptions FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own subscriptions"
ON public.user_subscriptions FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own subscriptions"
ON public.user_subscriptions FOR UPDATE
USING (user_id = auth.uid());

-- 14. users table (this appears to be a duplicate of profiles)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own user record"
ON public.users FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Users can update their own user record"
ON public.users FOR UPDATE
USING (id = auth.uid());