-- Update generate_unique_username function to use firstname.lastname format
CREATE OR REPLACE FUNCTION public.generate_unique_username(first_name text, last_name text DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    base_username text;
    final_username text;
    counter integer := 1;
BEGIN
    -- Create base username from first_name.last_name (lowercase, no spaces)
    IF last_name IS NOT NULL AND last_name != '' THEN
        base_username := lower(regexp_replace(coalesce(first_name, 'user'), '[^a-zA-Z0-9]', '', 'g')) || 
                        '.' || 
                        lower(regexp_replace(last_name, '[^a-zA-Z0-9]', '', 'g'));
    ELSE
        -- Fallback to just first name if no last name
        base_username := lower(regexp_replace(coalesce(first_name, 'user'), '[^a-zA-Z0-9]', '', 'g'));
    END IF;
    
    -- If base_username is empty, use 'user'
    IF base_username = '' OR base_username = '.' THEN
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