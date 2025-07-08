-- Create user_storage table for secure storage instead of localStorage
CREATE TABLE public.user_storage (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_key text NOT NULL,
  storage_value text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, storage_key)
);

-- Enable RLS
ALTER TABLE public.user_storage ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own storage data"
ON public.user_storage
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_storage_updated_at
BEFORE UPDATE ON public.user_storage
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();