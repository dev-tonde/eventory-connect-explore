-- Fix remaining RLS table and function security issues

-- 1. Enable RLS on the remaining table that shows up in linter
-- Find what table is missing RLS (should be none now)

-- 2. Fix function search_path security issues
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (
    id, 
    first_name,
    last_name,
    email,
    username,
    name,
    role
  )
  VALUES (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name', 
    new.email,
    generate_unique_username(new.raw_user_meta_data->>'first_name'),
    COALESCE(
      new.raw_user_meta_data->>'first_name' || ' ' || new.raw_user_meta_data->>'last_name',
      new.raw_user_meta_data->>'first_name',
      'User'
    ),
    COALESCE(new.raw_user_meta_data->>'role', 'attendee')
  );
  RETURN new;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_unique_username(first_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
$function$;