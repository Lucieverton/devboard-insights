
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL DEFAULT '',
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', ''), NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Clientes table
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  contato TEXT NOT NULL DEFAULT '',
  cpf_cnpj TEXT NOT NULL DEFAULT '',
  interesses TEXT[] DEFAULT '{}',
  pref_tipo_imovel TEXT,
  pref_bairro TEXT,
  pref_valor_max NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own clientes" ON public.clientes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Imoveis table
CREATE TABLE public.imoveis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endereco TEXT NOT NULL,
  cep TEXT DEFAULT '',
  bairro TEXT DEFAULT '',
  cidade TEXT DEFAULT 'Maceió',
  complemento TEXT DEFAULT '',
  tipo TEXT NOT NULL,
  valor NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Disponível',
  foto_capa_url TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  ultima_visita TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.imoveis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own imoveis" ON public.imoveis FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Imovel fotos table (references storage URLs)
CREATE TABLE public.imovel_fotos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imovel_id UUID NOT NULL REFERENCES public.imoveis(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  storage_path TEXT,
  is_capa BOOLEAN DEFAULT false,
  ordem INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.imovel_fotos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own imovel fotos" ON public.imovel_fotos FOR ALL
  USING (EXISTS (SELECT 1 FROM public.imoveis WHERE imoveis.id = imovel_fotos.imovel_id AND imoveis.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.imoveis WHERE imoveis.id = imovel_fotos.imovel_id AND imoveis.user_id = auth.uid()));

-- Contratos table
CREATE TABLE public.contratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  imovel_id UUID REFERENCES public.imoveis(id) ON DELETE SET NULL,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL DEFAULT 'Venda',
  valor_total NUMERIC NOT NULL DEFAULT 0,
  comissao_percent NUMERIC NOT NULL DEFAULT 5,
  data_inicio DATE,
  data_fim DATE,
  etapa TEXT NOT NULL DEFAULT 'Proposta',
  data_recebimento DATE,
  comissao_paga BOOLEAN DEFAULT false,
  documento_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own contratos" ON public.contratos FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Contrato notas table
CREATE TABLE public.contrato_notas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL REFERENCES public.contratos(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contrato_notas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own contrato notas" ON public.contrato_notas FOR ALL
  USING (EXISTS (SELECT 1 FROM public.contratos WHERE contratos.id = contrato_notas.contrato_id AND contratos.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.contratos WHERE contratos.id = contrato_notas.contrato_id AND contratos.user_id = auth.uid()));

-- Storage bucket for property photos
INSERT INTO storage.buckets (id, name, public) VALUES ('imovel-fotos', 'imovel-fotos', true);

CREATE POLICY "Authenticated users can upload photos" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'imovel-fotos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update own photos" ON storage.objects FOR UPDATE
  USING (bucket_id = 'imovel-fotos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authenticated users can delete own photos" ON storage.objects FOR DELETE
  USING (bucket_id = 'imovel-fotos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public can view photos" ON storage.objects FOR SELECT
  USING (bucket_id = 'imovel-fotos');
