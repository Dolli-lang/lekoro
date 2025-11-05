-- Create storage bucket for hero images
INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-images', 'hero-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create site_settings table for hero image URL
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can view site settings
CREATE POLICY "Everyone can view site settings"
  ON public.site_settings
  FOR SELECT
  USING (true);

-- Only admins can manage site settings
CREATE POLICY "Admins can manage site settings"
  ON public.site_settings
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default hero image URL
INSERT INTO public.site_settings (key, value)
VALUES ('hero_image_url', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1920&q=80')
ON CONFLICT (key) DO NOTHING;

-- Storage policies for hero-images bucket
CREATE POLICY "Hero images are publicly accessible"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'hero-images');

CREATE POLICY "Admins can upload hero images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'hero-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update hero images"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'hero-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete hero images"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'hero-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at trigger for site_settings
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();