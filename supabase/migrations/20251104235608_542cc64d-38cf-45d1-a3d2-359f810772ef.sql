-- Update the handle_new_user trigger to accept ufr_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, ufr_id)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name',
    (NEW.raw_user_meta_data->>'ufr_id')::uuid
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;