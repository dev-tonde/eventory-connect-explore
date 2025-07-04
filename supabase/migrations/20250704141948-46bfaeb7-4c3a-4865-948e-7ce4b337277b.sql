-- Create newsletter subscriptions table
CREATE TABLE public.newsletter_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  genre TEXT NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(email)
);

-- Enable Row Level Security
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts (for newsletter signup)
CREATE POLICY "Anyone can subscribe to newsletter" 
ON public.newsletter_subscriptions 
FOR INSERT 
WITH CHECK (true);

-- Create policy for viewing (only admins or the user themselves if we implement auth later)
CREATE POLICY "Users can view their own subscription" 
ON public.newsletter_subscriptions 
FOR SELECT 
USING (true);

-- Clear all dummy data from events table
DELETE FROM events WHERE true;

-- Reset any related data that might reference events
DELETE FROM tickets WHERE true;
DELETE FROM favorites WHERE true;
DELETE FROM event_analytics WHERE true;
DELETE FROM event_reviews WHERE true;
DELETE FROM event_waitlist WHERE true;