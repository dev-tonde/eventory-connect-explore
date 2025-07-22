-- Enable RLS on the final missing table
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Create appropriate policies for performance_metrics
CREATE POLICY "Admins can view performance metrics"
ON public.performance_metrics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "System can insert performance metrics"
ON public.performance_metrics FOR INSERT
WITH CHECK (true);