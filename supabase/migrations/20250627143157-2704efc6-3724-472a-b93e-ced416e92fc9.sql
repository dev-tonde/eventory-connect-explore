
-- Add indexes to optimize the most frequently queried tables (fixed version)

-- Events table indexes for common filtering and sorting
CREATE INDEX IF NOT EXISTS idx_events_is_active_created_at ON public.events(is_active, created_at DESC) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_events_category_date ON public.events(category, date) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_events_organizer_active ON public.events(organizer_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_events_date_active ON public.events(date) WHERE is_active = true;

-- Profiles table index for user lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email) WHERE email IS NOT NULL;

-- Pricing rules table indexes for dynamic pricing queries
CREATE INDEX IF NOT EXISTS idx_pricing_rules_event_active ON public.pricing_rules(event_id, is_active) WHERE is_active = true;

-- Add composite index for the most common events query pattern
CREATE INDEX IF NOT EXISTS idx_events_active_date_category ON public.events(is_active, date, category) WHERE is_active = true;

-- Add index for events by date (removed the CURRENT_DATE predicate)
CREATE INDEX IF NOT EXISTS idx_events_date_created ON public.events(date, created_at DESC) WHERE is_active = true;

-- Add index for favorites table
CREATE INDEX IF NOT EXISTS idx_favorites_user_event ON public.favorites(user_id, event_id);

-- Add index for tickets table
CREATE INDEX IF NOT EXISTS idx_tickets_user_event ON public.tickets(user_id, event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event_status ON public.tickets(event_id, status);
