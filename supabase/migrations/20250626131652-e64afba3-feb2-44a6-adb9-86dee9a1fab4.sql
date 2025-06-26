
-- Create email_notifications table for the email system
CREATE TABLE public.email_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  template_data JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create split_payments table for group purchases
CREATE TABLE public.split_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  organizer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'complete', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '7 days')
);

-- Create split_payment_participants table
CREATE TABLE public.split_payment_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  split_payment_id UUID REFERENCES public.split_payments(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  payment_method TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create location_cache table for geocoding results
CREATE TABLE public.location_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  address TEXT NOT NULL UNIQUE,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  city TEXT,
  country TEXT,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.split_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.split_payment_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_cache ENABLE ROW LEVEL SECURITY;

-- RLS policies for email_notifications
CREATE POLICY "Users can view their own email notifications" ON public.email_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage email notifications" ON public.email_notifications
  FOR ALL USING (true);

-- RLS policies for split_payments
CREATE POLICY "Users can view split payments they organize or participate in" ON public.split_payments
  FOR SELECT USING (
    auth.uid() = organizer_id OR 
    EXISTS (
      SELECT 1 FROM public.split_payment_participants 
      WHERE split_payment_id = id AND email = (
        SELECT email FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create split payments" ON public.split_payments
  FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Users can update their own split payments" ON public.split_payments
  FOR UPDATE USING (auth.uid() = organizer_id);

-- RLS policies for split_payment_participants
CREATE POLICY "Users can view split payment participants" ON public.split_payment_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.split_payments 
      WHERE id = split_payment_id AND (
        organizer_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM public.split_payment_participants sp2
          WHERE sp2.split_payment_id = split_payment_id AND sp2.email = (
            SELECT email FROM public.profiles WHERE id = auth.uid()
          )
        )
      )
    )
  );

CREATE POLICY "Users can manage split payment participants" ON public.split_payment_participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.split_payments 
      WHERE id = split_payment_id AND organizer_id = auth.uid()
    )
  );

-- RLS policies for location_cache (public read, authenticated write)
CREATE POLICY "Anyone can read location cache" ON public.location_cache
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage location cache" ON public.location_cache
  FOR ALL TO authenticated USING (true);

-- Create functions for split payments
CREATE OR REPLACE FUNCTION public.create_split_payment(
  _event_id UUID,
  _total_amount DECIMAL(10,2),
  _quantity INTEGER,
  _participant_emails TEXT[]
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _split_id UUID;
  _amount_per_person DECIMAL(10,2);
  _email TEXT;
BEGIN
  -- Calculate amount per person
  _amount_per_person := _total_amount / array_length(_participant_emails, 1);
  
  -- Create split payment
  INSERT INTO public.split_payments (event_id, organizer_id, total_amount, quantity)
  VALUES (_event_id, auth.uid(), _total_amount, _quantity)
  RETURNING id INTO _split_id;
  
  -- Add participants
  FOREACH _email IN ARRAY _participant_emails
  LOOP
    INSERT INTO public.split_payment_participants (split_payment_id, email, amount)
    VALUES (_split_id, _email, _amount_per_person);
  END LOOP;
  
  RETURN _split_id;
END;
$$;

-- Create function for geocoding cache
CREATE OR REPLACE FUNCTION public.cache_location(
  _address TEXT,
  _latitude DECIMAL(10,8),
  _longitude DECIMAL(11,8),
  _city TEXT DEFAULT NULL,
  _country TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.location_cache (address, latitude, longitude, city, country)
  VALUES (_address, _latitude, _longitude, _city, _country)
  ON CONFLICT (address) DO UPDATE SET
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    city = EXCLUDED.city,
    country = EXCLUDED.country,
    cached_at = now();
END;
$$;

-- Create function for getting cached location
CREATE OR REPLACE FUNCTION public.get_cached_location(_address TEXT)
RETURNS TABLE (
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  city TEXT,
  country TEXT
)
LANGUAGE sql
STABLE
AS $$
  SELECT latitude, longitude, city, country
  FROM public.location_cache
  WHERE address = _address
  AND cached_at > now() - INTERVAL '30 days';
$$;

-- Create function to process split payment
CREATE OR REPLACE FUNCTION public.process_split_payment_contribution(
  _split_id UUID,
  _participant_email TEXT,
  _payment_method TEXT DEFAULT 'mock'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _participant_count INTEGER;
  _paid_count INTEGER;
BEGIN
  -- Update participant status
  UPDATE public.split_payment_participants
  SET status = 'paid', payment_method = _payment_method, paid_at = now()
  WHERE split_payment_id = _split_id AND email = _participant_email;
  
  -- Check if all participants have paid
  SELECT COUNT(*) INTO _participant_count
  FROM public.split_payment_participants
  WHERE split_payment_id = _split_id;
  
  SELECT COUNT(*) INTO _paid_count
  FROM public.split_payment_participants
  WHERE split_payment_id = _split_id AND status = 'paid';
  
  -- Update split payment status
  IF _paid_count = _participant_count THEN
    UPDATE public.split_payments
    SET status = 'complete'
    WHERE id = _split_id;
  ELSIF _paid_count > 0 THEN
    UPDATE public.split_payments
    SET status = 'partial'
    WHERE id = _split_id;
  END IF;
  
  RETURN TRUE;
END;
$$;
