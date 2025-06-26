
-- Create RLS policies for tables that have RLS enabled but no policies

-- Error logs - should be accessible by admins and the user who created the error
CREATE POLICY "Users can view their own error logs" 
  ON public.error_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own error logs" 
  ON public.error_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Event analytics - should be accessible by event organizers and admins
CREATE POLICY "Event organizers can view analytics for their events" 
  ON public.event_analytics 
  FOR SELECT 
  USING (
    event_id IN (
      SELECT id FROM public.events WHERE organizer_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert analytics data" 
  ON public.event_analytics 
  FOR INSERT 
  WITH CHECK (true);

-- Event approvals - should be accessible by admins only
CREATE POLICY "Admins can manage event approvals" 
  ON public.event_approvals 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Platform analytics - should be accessible by admins only
CREATE POLICY "Admins can view platform analytics" 
  ON public.platform_analytics 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can insert platform analytics" 
  ON public.platform_analytics 
  FOR INSERT 
  WITH CHECK (true);

-- Rate limits - should be accessible by system functions
CREATE POLICY "System can manage rate limits" 
  ON public.rate_limits 
  FOR ALL 
  USING (true);
