-- Créer la table exercices
CREATE TABLE IF NOT EXISTS public.exercices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ue_id UUID NOT NULL REFERENCES public.ues(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  annee TEXT NOT NULL,
  numero INTEGER NOT NULL,
  description TEXT,
  visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(ue_id, type, annee, numero)
);

-- Enable RLS
ALTER TABLE public.exercices ENABLE ROW LEVEL SECURITY;

-- Politique pour les admins
CREATE POLICY "Admins can manage exercices"
ON public.exercices
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Politique pour voir les exercices visibles
CREATE POLICY "Everyone can view visible exercices"
ON public.exercices
FOR SELECT
TO authenticated
USING (visible = true OR has_role(auth.uid(), 'admin'::app_role));

-- Ajouter le trigger pour updated_at
CREATE TRIGGER update_exercices_updated_at
BEFORE UPDATE ON public.exercices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Modifier la table corriges pour lier aux exercices
ALTER TABLE public.corriges 
  DROP COLUMN IF EXISTS type,
  DROP COLUMN IF EXISTS annee,
  ADD COLUMN IF NOT EXISTS exercice_id UUID REFERENCES public.exercices(id) ON DELETE CASCADE;

-- Créer un index pour les requêtes
CREATE INDEX IF NOT EXISTS idx_corriges_exercice_id ON public.corriges(exercice_id);
CREATE INDEX IF NOT EXISTS idx_exercices_ue_id ON public.exercices(ue_id);