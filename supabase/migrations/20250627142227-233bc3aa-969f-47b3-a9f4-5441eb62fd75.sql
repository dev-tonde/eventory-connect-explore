
-- Fix pricing_rules table policy overlap with correct syntax
DROP POLICY IF EXISTS "Pricing rules access" ON public.pricing_rules;
DROP POLICY IF EXISTS "Event organizers can manage pricing rules" ON public.pricing_rules;

-- Create separate policies for different operations
CREATE POLICY "Anyone can view pricing rules" ON public.pricing_rules
  FOR SELECT 
  USING (true);

CREATE POLICY "Event organizers can insert pricing rules" ON public.pricing_rules
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE id = pricing_rules.event_id 
      AND organizer_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Event organizers can update pricing rules" ON public.pricing_rules
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE id = pricing_rules.event_id 
      AND organizer_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Event organizers can delete pricing rules" ON public.pricing_rules
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE id = pricing_rules.event_id 
      AND organizer_id = (SELECT auth.uid())
    )
  );
