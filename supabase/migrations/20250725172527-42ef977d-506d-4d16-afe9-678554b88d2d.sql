-- Fix the handle_new_user function to properly handle null metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
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
    CASE 
      WHEN new.raw_user_meta_data IS NOT NULL THEN new.raw_user_meta_data->>'first_name'
      ELSE NULL
    END,
    CASE 
      WHEN new.raw_user_meta_data IS NOT NULL THEN new.raw_user_meta_data->>'last_name'
      ELSE NULL
    END,
    new.email,
    generate_unique_username(
      CASE 
        WHEN new.raw_user_meta_data IS NOT NULL THEN new.raw_user_meta_data->>'first_name'
        ELSE 'user'
      END
    ),
    COALESCE(
      CASE 
        WHEN new.raw_user_meta_data IS NOT NULL AND 
             new.raw_user_meta_data->>'first_name' IS NOT NULL AND 
             new.raw_user_meta_data->>'last_name' IS NOT NULL 
        THEN new.raw_user_meta_data->>'first_name' || ' ' || new.raw_user_meta_data->>'last_name'
        WHEN new.raw_user_meta_data IS NOT NULL AND new.raw_user_meta_data->>'first_name' IS NOT NULL
        THEN new.raw_user_meta_data->>'first_name'
        ELSE 'User'
      END
    ),
    COALESCE(
      CASE 
        WHEN new.raw_user_meta_data IS NOT NULL THEN new.raw_user_meta_data->>'role'
        ELSE NULL
      END,
      'attendee'
    )
  );
  RETURN new;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();