-- Add missing fields to profiles table for organizer data
ALTER TABLE public.profiles 
ADD COLUMN organization_name TEXT,
ADD COLUMN experience TEXT,
ADD COLUMN username_last_changed TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN events_attended_count INTEGER DEFAULT 0,
ADD COLUMN followed_count INTEGER DEFAULT 0;