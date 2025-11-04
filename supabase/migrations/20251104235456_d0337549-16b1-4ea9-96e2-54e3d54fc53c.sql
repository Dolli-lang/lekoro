-- Add ufr_id to profiles table
ALTER TABLE public.profiles ADD COLUMN ufr_id uuid REFERENCES public.ufrs(id);

-- Update RLS policy for profiles to include ufr_id
CREATE POLICY "Users can insert their own profile with ufr"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);