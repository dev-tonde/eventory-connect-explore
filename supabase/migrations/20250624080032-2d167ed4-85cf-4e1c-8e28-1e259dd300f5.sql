
-- Create profiles table for user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  first_name text,
  last_name text,
  email text,
  secondary_email text,
  avatar_url text,
  role text DEFAULT 'attendee',
  bio text,
  social_links jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  date date NOT NULL,
  time time NOT NULL,
  venue text NOT NULL,
  address text,
  category text NOT NULL,
  image_url text,
  price decimal(10,2) NOT NULL DEFAULT 0,
  max_attendees integer DEFAULT 100,
  current_attendees integer DEFAULT 0,
  organizer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  tags text[] DEFAULT '{}',
  social_links jsonb DEFAULT '{}',
  location_coordinates point,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create tickets/purchases table
CREATE TABLE IF NOT EXISTS public.tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  total_price decimal(10,2) NOT NULL,
  purchase_date timestamp with time zone DEFAULT now(),
  status text DEFAULT 'active'
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Create pricing rules table for dynamic pricing
CREATE TABLE IF NOT EXISTS public.pricing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  rule_type text NOT NULL, -- 'early_bird', 'time_based', 'capacity_based'
  threshold_value numeric,
  price_multiplier decimal(4,2) NOT NULL DEFAULT 1.0,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Create function to generate unique username
CREATE OR REPLACE FUNCTION generate_unique_username(first_name text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    base_username text;
    final_username text;
    counter integer := 1;
BEGIN
    -- Create base username from first name (lowercase, no spaces)
    base_username := lower(regexp_replace(coalesce(first_name, 'user'), '[^a-zA-Z0-9]', '', 'g'));
    
    -- If base_username is empty, use 'user'
    IF base_username = '' THEN
        base_username := 'user';
    END IF;
    
    final_username := base_username;
    
    -- Check if username exists and increment until we find a unique one
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
        final_username := base_username || counter;
        counter := counter + 1;
    END LOOP;
    
    RETURN final_username;
END;
$$;

-- Create trigger function for new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    first_name,
    last_name,
    email,
    username
  )
  VALUES (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name', 
    new.email,
    generate_unique_username(new.raw_user_meta_data->>'first_name')
  );
  RETURN new;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for events
CREATE POLICY "Anyone can view active events" ON public.events FOR SELECT USING (is_active = true);
CREATE POLICY "Organizers can create events" ON public.events FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Organizers can update own events" ON public.events FOR UPDATE USING (auth.uid() = organizer_id);

-- Create RLS policies for tickets
CREATE POLICY "Users can view own tickets" ON public.tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own tickets" ON public.tickets FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for favorites
CREATE POLICY "Users can view own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own favorites" ON public.favorites FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for pricing rules
CREATE POLICY "Anyone can view pricing rules" ON public.pricing_rules FOR SELECT USING (true);
CREATE POLICY "Event organizers can manage pricing rules" ON public.pricing_rules 
  FOR ALL USING (EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND organizer_id = auth.uid()));

-- Create function to get dynamic price for an event
CREATE OR REPLACE FUNCTION get_dynamic_price(event_uuid uuid)
RETURNS decimal(10,2)
LANGUAGE plpgsql
AS $$
DECLARE
    base_price decimal(10,2);
    final_price decimal(10,2);
    event_date date;
    max_attendees integer;
    current_attendees integer;
    days_until_event integer;
    attendance_ratio decimal(4,2);
    price_multiplier decimal(4,2) := 1.0;
BEGIN
    -- Get event details
    SELECT price, date, max_attendees, current_attendees
    INTO base_price, event_date, max_attendees, current_attendees
    FROM public.events
    WHERE id = event_uuid;
    
    IF base_price IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Calculate days until event
    days_until_event := event_date - CURRENT_DATE;
    
    -- Calculate attendance ratio
    attendance_ratio := CASE 
        WHEN max_attendees > 0 THEN current_attendees::decimal / max_attendees::decimal
        ELSE 0
    END;
    
    -- Apply early bird discount (more than 30 days out)
    IF days_until_event > 30 THEN
        price_multiplier := 0.8; -- 20% discount
    -- Apply time-based surge pricing (less than 7 days)
    ELSIF days_until_event <= 7 AND days_until_event > 0 THEN
        price_multiplier := 1.2; -- 20% increase
    -- Apply capacity-based pricing
    ELSIF attendance_ratio >= 0.8 THEN
        price_multiplier := 1.5; -- 50% increase when 80%+ sold
    ELSIF attendance_ratio >= 0.5 THEN
        price_multiplier := 1.3; -- 30% increase when 50%+ sold
    END IF;
    
    final_price := base_price * price_multiplier;
    RETURN final_price;
END;
$$;
