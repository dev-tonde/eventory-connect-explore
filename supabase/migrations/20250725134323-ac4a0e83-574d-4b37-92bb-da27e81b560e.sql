-- Add photo downloads and affiliate tracking features

-- Create photo_downloads table for tracking guest downloads
CREATE TABLE IF NOT EXISTS public.photo_downloads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id UUID NOT NULL,
  event_id UUID NOT NULL,
  download_type TEXT NOT NULL CHECK (download_type IN ('standard', 'high_res', 'print_ready')),
  guest_email TEXT,
  guest_name TEXT,
  ip_address INET,
  user_agent TEXT,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  file_size_bytes BIGINT,
  resolution TEXT -- e.g., '1920x1080', '4K', 'print_300dpi'
);

-- Create print_orders table for framed print orders
CREATE TABLE IF NOT EXISTS public.print_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id UUID NOT NULL,
  event_id UUID NOT NULL,
  guest_email TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  phone_number TEXT,
  shipping_address JSONB NOT NULL,
  print_size TEXT NOT NULL CHECK (print_size IN ('4x6', '5x7', '8x10', '11x14', '16x20')),
  frame_type TEXT CHECK (frame_type IN ('none', 'black', 'white', 'wood', 'gold')),
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_reference TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  tracking_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create affiliate_links table for promoter tracking
CREATE TABLE IF NOT EXISTS public.affiliate_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  organizer_id UUID NOT NULL,
  promoter_name TEXT NOT NULL,
  promoter_email TEXT,
  affiliate_code TEXT NOT NULL UNIQUE,
  commission_rate DECIMAL(5,2) DEFAULT 10.00 CHECK (commission_rate >= 0 AND commission_rate <= 100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT
);

-- Create affiliate_clicks table for tracking link clicks
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_link_id UUID NOT NULL,
  event_id UUID NOT NULL,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  converted BOOLEAN DEFAULT false,
  conversion_value DECIMAL(10,2) DEFAULT 0,
  session_id TEXT
);

-- Create affiliate_conversions table for tracking sales/RSVPs
CREATE TABLE IF NOT EXISTS public.affiliate_conversions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_link_id UUID NOT NULL,
  affiliate_click_id UUID,
  event_id UUID NOT NULL,
  user_id UUID,
  ticket_id UUID,
  conversion_type TEXT NOT NULL CHECK (conversion_type IN ('rsvp', 'ticket_purchase', 'registration')),
  conversion_value DECIMAL(10,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  commission_status TEXT DEFAULT 'pending' CHECK (commission_status IN ('pending', 'approved', 'paid', 'rejected')),
  converted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  guest_email TEXT,
  guest_name TEXT
);

-- Enable RLS on all tables
ALTER TABLE public.photo_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.print_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_conversions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for photo_downloads
CREATE POLICY "Anyone can download photos" ON public.photo_downloads FOR INSERT WITH CHECK (true);
CREATE POLICY "Event organizers can view download stats" ON public.photo_downloads FOR SELECT 
  USING (event_id IN (SELECT id FROM events WHERE organizer_id = auth.uid()));

-- RLS Policies for print_orders
CREATE POLICY "Anyone can create print orders" ON public.print_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Event organizers can view print orders" ON public.print_orders FOR SELECT 
  USING (event_id IN (SELECT id FROM events WHERE organizer_id = auth.uid()));
CREATE POLICY "Event organizers can update print orders" ON public.print_orders FOR UPDATE 
  USING (event_id IN (SELECT id FROM events WHERE organizer_id = auth.uid()));

-- RLS Policies for affiliate_links
CREATE POLICY "Event organizers can manage their affiliate links" ON public.affiliate_links FOR ALL 
  USING (organizer_id = auth.uid()) 
  WITH CHECK (organizer_id = auth.uid());

-- RLS Policies for affiliate_clicks
CREATE POLICY "Anyone can create affiliate clicks" ON public.affiliate_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "Event organizers can view affiliate clicks" ON public.affiliate_clicks FOR SELECT 
  USING (event_id IN (SELECT id FROM events WHERE organizer_id = auth.uid()));

-- RLS Policies for affiliate_conversions
CREATE POLICY "System can create affiliate conversions" ON public.affiliate_conversions FOR INSERT WITH CHECK (true);
CREATE POLICY "Event organizers can view affiliate conversions" ON public.affiliate_conversions FOR SELECT 
  USING (event_id IN (SELECT id FROM events WHERE organizer_id = auth.uid()));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_photo_downloads_photo_id ON public.photo_downloads(photo_id);
CREATE INDEX IF NOT EXISTS idx_photo_downloads_event_id ON public.photo_downloads(event_id);
CREATE INDEX IF NOT EXISTS idx_print_orders_event_id ON public.print_orders(event_id);
CREATE INDEX IF NOT EXISTS idx_print_orders_status ON public.print_orders(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_event_id ON public.affiliate_links(event_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_code ON public.affiliate_links(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_affiliate_link_id ON public.affiliate_clicks(affiliate_link_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_session_id ON public.affiliate_clicks(session_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_affiliate_link_id ON public.affiliate_conversions(affiliate_link_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_ticket_id ON public.affiliate_conversions(ticket_id);

-- Function to generate unique affiliate code
CREATE OR REPLACE FUNCTION public.generate_affiliate_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code TEXT;
  counter INTEGER := 1;
BEGIN
  -- Generate base code with timestamp and random component
  code := 'AF' || to_char(now(), 'YYMMDD') || substr(md5(random()::text), 1, 6);
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.affiliate_links WHERE affiliate_code = code) LOOP
    code := 'AF' || to_char(now(), 'YYMMDD') || substr(md5((random() + counter)::text), 1, 6);
    counter := counter + 1;
  END LOOP;
  
  RETURN upper(code);
END;
$$;

-- Function to track affiliate conversion
CREATE OR REPLACE FUNCTION public.track_affiliate_conversion(
  p_affiliate_code TEXT,
  p_event_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_ticket_id UUID DEFAULT NULL,
  p_conversion_type TEXT DEFAULT 'ticket_purchase',
  p_conversion_value DECIMAL DEFAULT 0,
  p_guest_email TEXT DEFAULT NULL,
  p_guest_name TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affiliate_link_record RECORD;
  conversion_id UUID;
  commission_amount DECIMAL(10,2);
BEGIN
  -- Get affiliate link info
  SELECT * INTO affiliate_link_record
  FROM public.affiliate_links 
  WHERE affiliate_code = p_affiliate_code AND event_id = p_event_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  -- Calculate commission
  commission_amount := p_conversion_value * (affiliate_link_record.commission_rate / 100);
  
  -- Create conversion record
  INSERT INTO public.affiliate_conversions (
    affiliate_link_id,
    event_id,
    user_id,
    ticket_id,
    conversion_type,
    conversion_value,
    commission_amount,
    guest_email,
    guest_name
  ) VALUES (
    affiliate_link_record.id,
    p_event_id,
    p_user_id,
    p_ticket_id,
    p_conversion_type,
    p_conversion_value,
    commission_amount,
    p_guest_email,
    p_guest_name
  ) RETURNING id INTO conversion_id;
  
  RETURN conversion_id;
END;
$$;

-- Function to get affiliate stats
CREATE OR REPLACE FUNCTION public.get_affiliate_stats(p_affiliate_link_id UUID)
RETURNS TABLE(
  total_clicks BIGINT,
  total_conversions BIGINT,
  total_revenue DECIMAL(10,2),
  total_commission DECIMAL(10,2),
  conversion_rate DECIMAL(5,2),
  avg_order_value DECIMAL(10,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(clicks.click_count, 0) as total_clicks,
    COALESCE(conversions.conversion_count, 0) as total_conversions,
    COALESCE(conversions.total_value, 0) as total_revenue,
    COALESCE(conversions.total_commission, 0) as total_commission,
    CASE 
      WHEN COALESCE(clicks.click_count, 0) > 0 
      THEN (COALESCE(conversions.conversion_count, 0)::DECIMAL / clicks.click_count * 100)
      ELSE 0 
    END as conversion_rate,
    CASE 
      WHEN COALESCE(conversions.conversion_count, 0) > 0 
      THEN (COALESCE(conversions.total_value, 0) / conversions.conversion_count)
      ELSE 0 
    END as avg_order_value
  FROM (
    SELECT COUNT(*) as click_count
    FROM public.affiliate_clicks 
    WHERE affiliate_link_id = p_affiliate_link_id
  ) clicks
  CROSS JOIN (
    SELECT 
      COUNT(*) as conversion_count,
      COALESCE(SUM(conversion_value), 0) as total_value,
      COALESCE(SUM(commission_amount), 0) as total_commission
    FROM public.affiliate_conversions 
    WHERE affiliate_link_id = p_affiliate_link_id
  ) conversions;
END;
$$;

-- Add trigger for updated_at columns
CREATE TRIGGER update_print_orders_updated_at
  BEFORE UPDATE ON public.print_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_affiliate_links_updated_at
  BEFORE UPDATE ON public.affiliate_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();