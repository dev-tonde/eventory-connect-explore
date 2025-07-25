-- Enhanced handle_new_user function with error handling and logging
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  user_first_name text;
  user_last_name text;
  user_role text;
  generated_username text;
  full_name text;
BEGIN
  -- Extract metadata safely with explicit null checks
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

  -- Generate username with fallback
  generated_username := generate_unique_username(COALESCE(user_first_name, 'user'));
  
  -- Build full name
  full_name := CASE 
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
    
    RAISE LOG 'Successfully created profile for user: %', new.id;
    
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