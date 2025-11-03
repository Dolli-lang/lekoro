-- Créer la table UFRs
CREATE TABLE public.ufrs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Renommer la table disciplines en departements
ALTER TABLE public.disciplines RENAME TO departements;

-- Ajouter la colonne ufr_id à la table departements
ALTER TABLE public.departements 
ADD COLUMN ufr_id UUID REFERENCES public.ufrs(id) ON DELETE CASCADE;

-- Activer RLS sur la table ufrs
ALTER TABLE public.ufrs ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS pour ufrs
CREATE POLICY "Everyone can view visible UFRs" 
ON public.ufrs 
FOR SELECT 
USING ((visible = true) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage UFRs" 
ON public.ufrs 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Mettre à jour le nom de la politique pour departements
DROP POLICY IF EXISTS "Everyone can view visible disciplines" ON public.departements;
DROP POLICY IF EXISTS "Admins can manage disciplines" ON public.departements;

CREATE POLICY "Everyone can view visible departements" 
ON public.departements 
FOR SELECT 
USING ((visible = true) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage departements" 
ON public.departements 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Créer les triggers pour updated_at
CREATE TRIGGER update_ufrs_updated_at
BEFORE UPDATE ON public.ufrs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Le trigger pour departements existe déjà (anciennement disciplines)