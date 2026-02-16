
-- Create leads table for pre-registration
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  qtd_imoveis TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public form)
CREATE POLICY "Anyone can submit lead form"
ON public.leads
FOR INSERT
WITH CHECK (true);

-- Only authenticated users can read leads (admin)
CREATE POLICY "Authenticated users can read leads"
ON public.leads
FOR SELECT
USING (auth.uid() IS NOT NULL);
