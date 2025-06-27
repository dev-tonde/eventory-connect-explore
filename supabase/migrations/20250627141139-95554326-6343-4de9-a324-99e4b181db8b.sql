
-- Fix remaining multiple permissive policies issues

-- Fix favorites table - remove old separate policies
DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;

-- Fix location_cache table - consolidate policies
DROP POLICY IF EXISTS "Anyone can read location cache" ON public.location_cache;
DROP POLICY IF EXISTS "Authenticated users can manage location cache" ON public.location_cache;

CREATE POLICY "Location cache access" ON public.location_cache
  FOR ALL 
  USING (true);

-- Fix pricing_rules table - consolidate policies
DROP POLICY IF EXISTS "Anyone can view pricing rules" ON public.pricing_rules;
DROP POLICY IF EXISTS "Event organizers can manage pricing rules" ON public.pricing_rules;

CREATE POLICY "Pricing rules access" ON public.pricing_rules
  FOR SELECT 
  USING (true);

CREATE POLICY "Event organizers can manage pricing rules" ON public.pricing_rules
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE id = pricing_rules.event_id 
      AND organizer_id = (SELECT auth.uid())
    )
  );

-- Fix profiles table - consolidate duplicate policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;

CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE 
  USING (id = (SELECT auth.uid()));

-- Fix split_payment_participants table - remove duplicate view policy
DROP POLICY IF EXISTS "Users can view split payment participants" ON public.split_payment_participants;

-- Fix user_sessions table - remove duplicate view policy
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.user_sessions;
