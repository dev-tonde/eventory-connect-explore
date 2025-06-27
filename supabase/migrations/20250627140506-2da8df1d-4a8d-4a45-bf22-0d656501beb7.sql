
-- Fix remaining RLS policies that need optimization for better performance

-- Fix poll_votes table policies
DROP POLICY IF EXISTS "Users can vote on polls" ON public.poll_votes;

CREATE POLICY "Users can vote on polls" ON public.poll_votes
  FOR INSERT 
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Fix event_sentiment table policies
DROP POLICY IF EXISTS "Users can submit sentiment" ON public.event_sentiment;

CREATE POLICY "Users can submit sentiment" ON public.event_sentiment
  FOR INSERT 
  WITH CHECK (user_id = (SELECT auth.uid()) OR user_id IS NULL);

-- Fix calendar_sync table policies
DROP POLICY IF EXISTS "Users can view their own calendar sync" ON public.calendar_sync;

CREATE POLICY "Users can view their own calendar sync" ON public.calendar_sync
  FOR SELECT 
  USING (user_id = (SELECT auth.uid()));

-- Fix profiles table policies
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE 
  USING (id = (SELECT auth.uid()));

-- Fix events table policies
DROP POLICY IF EXISTS "Organizers can create events" ON public.events;
DROP POLICY IF EXISTS "Organizers can update own events" ON public.events;

CREATE POLICY "Organizers can create events" ON public.events
  FOR INSERT 
  WITH CHECK (organizer_id = (SELECT auth.uid()));

CREATE POLICY "Organizers can update own events" ON public.events
  FOR UPDATE 
  USING (organizer_id = (SELECT auth.uid()));

-- Fix tickets table policies
DROP POLICY IF EXISTS "Users can view own tickets" ON public.tickets;
DROP POLICY IF EXISTS "Users can create own tickets" ON public.tickets;

CREATE POLICY "Users can view own tickets" ON public.tickets
  FOR SELECT 
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can create own tickets" ON public.tickets
  FOR INSERT 
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Fix favorites table policies
DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can manage own favorites" ON public.favorites;

CREATE POLICY "Users can view own favorites" ON public.favorites
  FOR SELECT 
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can manage own favorites" ON public.favorites
  FOR ALL 
  USING (user_id = (SELECT auth.uid()));

-- Fix pricing_rules table policies
DROP POLICY IF EXISTS "Event organizers can manage pricing rules" ON public.pricing_rules;

CREATE POLICY "Event organizers can manage pricing rules" ON public.pricing_rules
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE id = pricing_rules.event_id 
      AND organizer_id = (SELECT auth.uid())
    )
  );

-- Fix event_reviews table policies
DROP POLICY IF EXISTS "Users can create their own reviews" ON public.event_reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.event_reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.event_reviews;

CREATE POLICY "Users can create their own reviews" ON public.event_reviews
  FOR INSERT 
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own reviews" ON public.event_reviews
  FOR UPDATE 
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own reviews" ON public.event_reviews
  FOR DELETE 
  USING (user_id = (SELECT auth.uid()));

-- Fix user_notifications table policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.user_notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.user_notifications;

CREATE POLICY "Users can view their own notifications" ON public.user_notifications
  FOR SELECT 
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own notifications" ON public.user_notifications
  FOR UPDATE 
  USING (user_id = (SELECT auth.uid()));

-- Fix push_subscriptions table policies
DROP POLICY IF EXISTS "Users can manage their push subscriptions" ON public.push_subscriptions;

CREATE POLICY "Users can manage their push subscriptions" ON public.push_subscriptions
  FOR ALL 
  USING (user_id = (SELECT auth.uid()));

-- Fix refund_requests table policies
DROP POLICY IF EXISTS "Users can view their own refund requests" ON public.refund_requests;
DROP POLICY IF EXISTS "Users can create their own refund requests" ON public.refund_requests;

CREATE POLICY "Users can view their own refund requests" ON public.refund_requests
  FOR SELECT 
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can create their own refund requests" ON public.refund_requests
  FOR INSERT 
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Fix user_reports table policies
DROP POLICY IF EXISTS "Users can create reports" ON public.user_reports;
DROP POLICY IF EXISTS "Users can view their own reports" ON public.user_reports;

CREATE POLICY "Users can create reports" ON public.user_reports
  FOR INSERT 
  WITH CHECK (reporter_id = (SELECT auth.uid()));

CREATE POLICY "Users can view their own reports" ON public.user_reports
  FOR SELECT 
  USING (reporter_id = (SELECT auth.uid()));

-- Fix email_notifications table policies
DROP POLICY IF EXISTS "Users can view their own email notifications" ON public.email_notifications;

CREATE POLICY "Users can view their own email notifications" ON public.email_notifications
  FOR SELECT 
  USING (user_id = (SELECT auth.uid()));
