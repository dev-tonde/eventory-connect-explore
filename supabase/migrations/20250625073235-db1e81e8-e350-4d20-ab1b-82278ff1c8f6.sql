
-- Update the profiles table to include all the fields needed by the application
ALTER TABLE public.profiles 
ADD COLUMN username text,
ADD COLUMN first_name text,
ADD COLUMN last_name text,
ADD COLUMN email text,
ADD COLUMN secondary_email text,
ADD COLUMN bio text,
ADD COLUMN social_links jsonb DEFAULT '{}',
ADD COLUMN updated_at timestamp with time zone DEFAULT now();

-- Update the handle_new_user function to populate the new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;
