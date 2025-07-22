-- Add RLS for event_invites table with correct column name
ALTER TABLE public.event_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view invites sent to them"
ON public.event_invites FOR SELECT
USING (
  invitee_email IN (
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