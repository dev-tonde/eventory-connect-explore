
-- Optimize RLS policies for better performance by using subqueries
-- This prevents auth.uid() from being re-evaluated for each row

-- Fix profiles table policies
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;

CREATE POLICY "Users can insert their own profile." ON public.profiles
  FOR INSERT 
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own profile." ON public.profiles
  FOR UPDATE 
  USING (id = (SELECT auth.uid()));

-- Fix generated_posters table policies
DROP POLICY IF EXISTS "Users can view their own generated posters" ON public.generated_posters;
DROP POLICY IF EXISTS "Users can create their own generated posters" ON public.generated_posters;
DROP POLICY IF EXISTS "Users can update their own generated posters" ON public.generated_posters;
DROP POLICY IF EXISTS "Users can delete their own generated posters" ON public.generated_posters;

CREATE POLICY "Users can view their own generated posters" ON public.generated_posters
  FOR SELECT 
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can create their own generated posters" ON public.generated_posters
  FOR INSERT 
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own generated posters" ON public.generated_posters
  FOR UPDATE 
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own generated posters" ON public.generated_posters
  FOR DELETE 
  USING (user_id = (SELECT auth.uid()));

-- Fix scheduled_posts table policies
DROP POLICY IF EXISTS "Users can view their own scheduled posts" ON public.scheduled_posts;
DROP POLICY IF EXISTS "Users can create their own scheduled posts" ON public.scheduled_posts;
DROP POLICY IF EXISTS "Users can update their own scheduled posts" ON public.scheduled_posts;
DROP POLICY IF EXISTS "Users can delete their own scheduled posts" ON public.scheduled_posts;

CREATE POLICY "Users can view their own scheduled posts" ON public.scheduled_posts
  FOR SELECT 
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can create their own scheduled posts" ON public.scheduled_posts
  FOR INSERT 
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own scheduled posts" ON public.scheduled_posts
  FOR UPDATE 
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own scheduled posts" ON public.scheduled_posts
  FOR DELETE 
  USING (user_id = (SELECT auth.uid()));

-- Fix calendar_sync table policies
DROP POLICY IF EXISTS "Users can create calendar sync" ON public.calendar_sync;
DROP POLICY IF EXISTS "Users can update their calendar sync" ON public.calendar_sync;

CREATE POLICY "Users can create calendar sync" ON public.calendar_sync
  FOR INSERT 
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their calendar sync" ON public.calendar_sync
  FOR UPDATE 
  USING (user_id = (SELECT auth.uid()));

-- Fix communities table policies
DROP POLICY IF EXISTS "Users can view public communities" ON public.communities;
DROP POLICY IF EXISTS "Users can create communities" ON public.communities;
DROP POLICY IF EXISTS "Community admins can update communities" ON public.communities;

CREATE POLICY "Users can view public communities" ON public.communities
  FOR SELECT 
  USING (
    is_public = true 
    OR created_by = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.community_members 
      WHERE community_id = communities.id AND user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can create communities" ON public.communities
  FOR INSERT 
  WITH CHECK (created_by = (SELECT auth.uid()));

CREATE POLICY "Community admins can update communities" ON public.communities
  FOR UPDATE 
  USING (
    created_by = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.community_members 
      WHERE community_id = communities.id 
      AND user_id = (SELECT auth.uid()) 
      AND role = 'admin'
    )
  );

-- Fix community_members table policies
DROP POLICY IF EXISTS "Members can view community membership" ON public.community_members;
DROP POLICY IF EXISTS "Users can join communities" ON public.community_members;

CREATE POLICY "Members can view community membership" ON public.community_members
  FOR SELECT 
  USING (
    user_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.community_members cm 
      WHERE cm.community_id = community_members.community_id 
      AND cm.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can join communities" ON public.community_members
  FOR INSERT 
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Fix community_messages table policies
DROP POLICY IF EXISTS "Members can view community messages" ON public.community_messages;
DROP POLICY IF EXISTS "Members can send messages" ON public.community_messages;

CREATE POLICY "Members can view community messages" ON public.community_messages
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.community_members 
      WHERE community_id = community_messages.community_id 
      AND user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Members can send messages" ON public.community_messages
  FOR INSERT 
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.community_members 
      WHERE community_id = community_messages.community_id 
      AND user_id = (SELECT auth.uid())
    )
  );

-- Fix community_polls table policies
DROP POLICY IF EXISTS "Members can view polls" ON public.community_polls;
DROP POLICY IF EXISTS "Members can create polls" ON public.community_polls;

CREATE POLICY "Members can view polls" ON public.community_polls
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.community_members 
      WHERE community_id = community_polls.community_id 
      AND user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Members can create polls" ON public.community_polls
  FOR INSERT 
  WITH CHECK (
    created_by = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.community_members 
      WHERE community_id = community_polls.community_id 
      AND user_id = (SELECT auth.uid())
    )
  );

-- Fix poll_options table policies
DROP POLICY IF EXISTS "Members can view poll options" ON public.poll_options;

CREATE POLICY "Members can view poll options" ON public.poll_options
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.community_polls cp
      JOIN public.community_members cm ON cp.community_id = cm.community_id
      WHERE cp.id = poll_options.poll_id 
      AND cm.user_id = (SELECT auth.uid())
    )
  );

-- Fix poll_votes table policies
DROP POLICY IF EXISTS "Users can view poll votes" ON public.poll_votes;

CREATE POLICY "Users can view poll votes" ON public.poll_votes
  FOR SELECT 
  USING (
    user_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.community_polls cp
      JOIN public.community_members cm ON cp.community_id = cm.community_id
      WHERE cp.id = poll_votes.poll_id 
      AND cm.user_id = (SELECT auth.uid())
    )
  );
