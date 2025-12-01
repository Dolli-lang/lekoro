-- Ajouter colonne email et suspended à profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended BOOLEAN NOT NULL DEFAULT false;

-- Mettre à jour le trigger pour inclure l'email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, ufr_id, departement_id)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    (NEW.raw_user_meta_data->>'ufr_id')::uuid,
    (NEW.raw_user_meta_data->>'departement_id')::uuid
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Fonction pour obtenir l'email d'un utilisateur (pour admin)
CREATE OR REPLACE FUNCTION public.get_user_email(user_id uuid)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT email INTO user_email 
  FROM auth.users 
  WHERE id = user_id;
  
  RETURN user_email;
END;
$$;

-- Mettre à jour les emails existants pour les profils qui n'en ont pas
DO $$
DECLARE
  profile_record RECORD;
  user_email TEXT;
BEGIN
  FOR profile_record IN SELECT id FROM public.profiles WHERE email IS NULL
  LOOP
    SELECT email INTO user_email FROM auth.users WHERE id = profile_record.id;
    IF user_email IS NOT NULL THEN
      UPDATE public.profiles SET email = user_email WHERE id = profile_record.id;
    END IF;
  END LOOP;
END $$;