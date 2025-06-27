
-- Fix final batch of RLS policies for optimal performance

-- Fix split_payments table policies
DROP POLICY IF EXISTS "Users can view split payments they organize or participate in" ON public.split_payments;
DROP POLICY IF EXISTS "Users can create split payments" ON public.split_payments;
DROP POLICY IF EXISTS "Users can update their own split payments" ON public.split_payments;

CREATE POLICY "Users can view split payments they organize or participate in" ON public.split_payments
  FOR SELECT 
  USING (
    organizer_id = (SELECT auth.uid()) OR 
    EXISTS (
      SELECT 1 FROM public.split_payment_participants 
      WHERE split_payment_id = id AND email = (
        SELECT email FROM public.profiles WHERE id = (SELECT auth.uid())
      )
    )
  );

CREATE POLICY "Users can create split payments" ON public.split_payments
  FOR INSERT 
  WITH CHECK (organizer_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own split payments" ON public.split_payments
  FOR UPDATE 
  USING (organizer_id = (SELECT auth.uid()));

-- Fix split_payment_participants table policies
DROP POLICY IF EXISTS "Users can view split payment participants" ON public.split_payment_participants;
DROP POLICY IF EXISTS "Users can manage split payment participants" ON public.split_payment_participants;

CREATE POLICY "Users can view split payment participants" ON public.split_payment_participants
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.split_payments 
      WHERE id = split_payment_id AND (
        organizer_id = (SELECT auth.uid()) OR 
        EXISTS (
          SELECT 1 FROM public.split_payment_participants sp2
          WHERE sp2.split_payment_id = split_payment_id AND sp2.email = (
            SELECT email FROM public.profiles WHERE id = (SELECT auth.uid())
          )
        )
      )
    )
  );

CREATE POLICY "Users can manage split payment participants" ON public.split_payment_participants
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.split_payments 
      WHERE id = split_payment_id AND organizer_id = (SELECT auth.uid())
    )
  );

-- Fix error_logs table policies
DROP POLICY IF EXISTS "Users can view their own error logs" ON public.error_logs;
DROP POLICY IF EXISTS "Users can insert their own error logs" ON public.error_logs;

CREATE POLICY "Users can view their own error logs" ON public.error_logs
  FOR SELECT 
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert their own error logs" ON public.error_logs
  FOR INSERT 
  WITH CHECK (user_id = (SELECT auth.uid()) OR user_id IS NULL);

-- Fix event_analytics table policies
DROP POLICY IF EXISTS "Event organizers can view analytics for their events" ON public.event_analytics;

CREATE POLICY "Event organizers can view analytics for their events" ON public.event_analytics
  FOR SELECT 
  USING (
    event_id IN (
      SELECT id FROM public.events WHERE organizer_id = (SELECT auth.uid())
    )
  );

-- Fix event_approvals table policies
DROP POLICY IF EXISTS "Admins can manage event approvals" ON public.event_approvals;

CREATE POLICY "Admins can manage event approvals" ON public.event_approvals
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- Fix platform_analytics table policies
DROP POLICY IF EXISTS "Admins can view platform analytics" ON public.platform_analytics;

CREATE POLICY "Admins can view platform analytics" ON public.platform_analytics
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- Fix admin_audit_logs table policies
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.admin_audit_logs;

CREATE POLICY "Admins can view all audit logs" ON public.admin_audit_logs
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- Fix user_sessions table policies
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can manage their own sessions" ON public.user_sessions;

CREATE POLICY "Users can view their own sessions" ON public.user_sessions
  FOR SELECT 
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can manage their own sessions" ON public.user_sessions
  FOR ALL 
  USING (user_id = (SELECT auth.uid()));

-- Fix file_uploads table policies
DROP POLICY IF EXISTS "Users can view their own file uploads" ON public.file_uploads;
DROP POLICY IF EXISTS "Users can create file uploads" ON public.file_uploads;

CREATE POLICY "Users can view their own file uploads" ON public.file_uploads
  FOR SELECT 
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can create file uploads" ON public.file_uploads
  FOR INSERT 
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Fix user_2fa table policies
DROP POLICY IF EXISTS "Users can manage their own 2FA" ON public.user_2fa;

CREATE POLICY "Users can manage their own 2FA" ON public.user_2fa
  FOR ALL 
  USING (user_id = (SELECT auth.uid()));

-- Fix multiple permissive policies issue for email_notifications
DROP POLICY IF EXISTS "System can manage email notifications" ON public.email_notifications;
DROP POLICY IF EXISTS "Users can view their own email notifications" ON public.email_notifications;

-- Create a single optimized policy for email_notifications
CREATE POLICY "Email notifications access" ON public.email_notifications
  FOR SELECT 
  USING (user_id = (SELECT auth.uid()) OR user_id IS NULL);

-- Fix multiple permissive policies issue for favorites
DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can manage own favorites" ON public.favorites;

-- Create a single optimized policy for favorites
CREATE POLICY "Users can manage favorites" ON public.favorites
  FOR ALL 
  USING (user_id = (SELECT auth.uid()));
