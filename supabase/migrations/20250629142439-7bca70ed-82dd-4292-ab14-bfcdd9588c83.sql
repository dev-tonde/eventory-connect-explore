
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own social posts" ON public.social_posts;
DROP POLICY IF EXISTS "Users can create their own social posts" ON public.social_posts;

-- Recreate policies with optimized auth function calls
CREATE POLICY "Users can view their own social posts" 
  ON public.social_posts 
  FOR SELECT 
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create their own social posts" 
  ON public.social_posts 
  FOR INSERT 
  WITH CHECK ((SELECT auth.uid()) = user_id);
