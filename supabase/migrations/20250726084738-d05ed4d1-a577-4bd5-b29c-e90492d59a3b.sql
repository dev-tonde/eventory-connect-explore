-- Update handle_new_user function to properly handle Google OAuth name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_first_name text;
  user_last_name text;
  user_role text;
  generated_username text;
  full_name text;
  google_name text;
BEGIN
  -- Extract Google OAuth name first
  google_name := CASE 
    WHEN new.raw_user_meta_data IS NOT NULL 
    THEN NULLIF(trim(new.raw_user_meta_data->>'name'), '')
    ELSE NULL 
  END;
  
  -- Extract individual names from metadata
  user_first_name := CASE 
    WHEN new.raw_user_meta_data IS NOT NULL 
    THEN NULLIF(trim(new.raw_user_meta_data->>'first_name'), '')
    ELSE NULL 
  END;
  
  user_last_name := CASE 
    WHEN new.raw_user_meta_data IS NOT NULL 
    THEN NULLIF(trim(new.raw_user_meta_data->>'last_name'), '')
    ELSE NULL 
  END;
  
  user_role := CASE 
    WHEN new.raw_user_meta_data IS NOT NULL 
    THEN NULLIF(trim(new.raw_user_meta_data->>'role'), '')
    ELSE NULL 
  END;

  -- If we have Google OAuth name but no separate first/last names, split the Google name
  IF google_name IS NOT NULL AND user_first_name IS NULL THEN
    user_first_name := split_part(google_name, ' ', 1);
    -- Only set last name if there are multiple parts
    IF array_length(string_to_array(google_name, ' '), 1) > 1 THEN
      user_last_name := split_part(google_name, ' ', 2);
    END IF;
  END IF;
  
  -- Fallback: extract first name from email if no other name available
  IF user_first_name IS NULL THEN
    user_first_name := split_part(split_part(new.email, '@', 1), '.', 1);
    user_first_name := initcap(replace(replace(replace(user_first_name, '_', ' '), '-', ' '), '.', ' '));
    user_first_name := split_part(user_first_name, ' ', 1);
  END IF;

  -- Generate username with fallback
  generated_username := generate_unique_username(COALESCE(user_first_name, 'user'));
  
  -- Build full name priority: Google name > first+last > first > fallback
  full_name := CASE 
    WHEN google_name IS NOT NULL THEN google_name
    WHEN user_first_name IS NOT NULL AND user_last_name IS NOT NULL 
    THEN user_first_name || ' ' || user_last_name
    WHEN user_first_name IS NOT NULL 
    THEN user_first_name
    ELSE 'User'
  END;

  -- Insert with explicit error handling
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
      user_first_name,
      user_last_name,
      new.email,
      generated_username,
      full_name,
      COALESCE(user_role, 'attendee')
    );
    
    RAISE LOG 'Successfully created profile for user: % with name: %', new.id, full_name;
    
  EXCEPTION 
    WHEN unique_violation THEN
      RAISE LOG 'Username conflict for user %, retrying with different username', new.id;
      -- Retry with timestamp-based username
      generated_username := generate_unique_username(COALESCE(user_first_name, 'user') || '_' || extract(epoch from now())::text);
      
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
        user_first_name,
        user_last_name,
        new.email,
        generated_username,
        full_name,
        COALESCE(user_role, 'attendee')
      );
      
    WHEN OTHERS THEN
      RAISE LOG 'Failed to create profile for user %: % %', new.id, SQLSTATE, SQLERRM;
      RAISE EXCEPTION 'Profile creation failed: %', SQLERRM;
  END;
  
  RETURN new;
END;
$$;