
ALTER TABLE public.imoveis ADD COLUMN quartos integer DEFAULT NULL;
ALTER TABLE public.imoveis ADD COLUMN banheiros integer DEFAULT NULL;
ALTER TABLE public.imoveis ADD COLUMN vagas integer DEFAULT NULL;
ALTER TABLE public.imoveis ADD COLUMN area_m2 numeric DEFAULT NULL;
ALTER TABLE public.imoveis ADD COLUMN destaque boolean DEFAULT false;
