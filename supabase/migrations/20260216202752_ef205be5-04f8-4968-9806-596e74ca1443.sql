
-- Add multi-tenant profile fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS slug text UNIQUE,
  ADD COLUMN IF NOT EXISTS bio text DEFAULT '',
  ADD COLUMN IF NOT EXISTS foto_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS logo_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS whatsapp text DEFAULT '';

-- Create index for fast slug lookups
CREATE INDEX IF NOT EXISTS idx_profiles_slug ON public.profiles (slug) WHERE slug IS NOT NULL;

-- Allow public read access to profiles by slug (for public storefronts)
CREATE POLICY "Public can view profiles by slug"
  ON public.profiles
  FOR SELECT
  USING (slug IS NOT NULL AND slug != '');

-- Allow public read access to imoveis for public storefronts
CREATE POLICY "Public can view available imoveis"
  ON public.imoveis
  FOR SELECT
  USING (status = 'Disponível');

-- Allow public read access to imovel_fotos for public storefronts
CREATE POLICY "Public can view imovel fotos"
  ON public.imovel_fotos
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.imoveis
    WHERE imoveis.id = imovel_fotos.imovel_id
    AND imoveis.status = 'Disponível'
  ));

-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-assets', 'profile-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for profile assets
CREATE POLICY "Profile assets are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-assets');

CREATE POLICY "Users can upload their own profile assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'profile-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own profile assets"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'profile-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile assets"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'profile-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
