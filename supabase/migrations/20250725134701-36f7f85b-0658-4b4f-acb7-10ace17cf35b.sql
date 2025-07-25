-- Add trigger to auto-generate affiliate codes
CREATE OR REPLACE FUNCTION public.set_affiliate_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only generate if not already set or is temporary
  IF NEW.affiliate_code IS NULL OR NEW.affiliate_code LIKE 'TEMP_%' THEN
    NEW.affiliate_code := generate_affiliate_code();
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for affiliate code generation
DROP TRIGGER IF EXISTS trigger_set_affiliate_code ON public.affiliate_links;
CREATE TRIGGER trigger_set_affiliate_code
  BEFORE INSERT ON public.affiliate_links
  FOR EACH ROW
  EXECUTE FUNCTION public.set_affiliate_code();