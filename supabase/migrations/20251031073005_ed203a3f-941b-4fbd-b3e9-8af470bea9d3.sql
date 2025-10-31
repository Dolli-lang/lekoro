-- Create disciplines table
CREATE TABLE public.disciplines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on disciplines
ALTER TABLE public.disciplines ENABLE ROW LEVEL SECURITY;

-- Create policies for disciplines
CREATE POLICY "Admins can manage disciplines"
ON public.disciplines
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Everyone can view visible disciplines"
ON public.disciplines
FOR SELECT
USING (visible = true OR has_role(auth.uid(), 'admin'::app_role));

-- Add discipline_id to ues table
ALTER TABLE public.ues
ADD COLUMN discipline_id UUID REFERENCES public.disciplines(id) ON DELETE CASCADE;

-- Create trigger for disciplines updated_at
CREATE TRIGGER update_disciplines_updated_at
BEFORE UPDATE ON public.disciplines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for discipline images
INSERT INTO storage.buckets (id, name, public)
VALUES ('discipline-images', 'discipline-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for discipline images
CREATE POLICY "Admins can upload discipline images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'discipline-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Everyone can view discipline images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'discipline-images');

CREATE POLICY "Admins can update discipline images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'discipline-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete discipline images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'discipline-images' AND has_role(auth.uid(), 'admin'::app_role));