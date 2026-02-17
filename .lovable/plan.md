

# Redesign Visual da Vitrine + Link Bio Estilo Instagram

## Resumo

Transformar a vitrine publica do corretor em uma experiencia visual moderna inspirada no codigo de referencia, com layout fullscreen escuro, carrossel de destaques, grid de imoveis, busca/filtro por tipo, drawer de detalhes e botao flutuante de WhatsApp. Tambem melhorar a integracao do link da vitrine com o painel de configuracoes.

---

## 1. Migracao de Banco de Dados

Adicionar colunas extras na tabela `imoveis` para exibir dados ricos na vitrine:

- `quartos` (integer, nullable, default null)
- `banheiros` (integer, nullable, default null)  
- `vagas` (integer, nullable, default null)
- `area_m2` (numeric, nullable, default null)
- `destaque` (boolean, default false) -- para separar imoveis VIP

Estas colunas sao opcionais (nullable) para nao quebrar os cadastros existentes.

---

## 2. Redesign Completo do `src/pages/Vitrine.tsx`

Substituir o layout atual (card centralizado max-w-md) por uma pagina fullscreen estilo app mobile:

**Header fixo (sticky top)**
- Logo do corretor + nome "DEVBOARD STORES" com icone Zap
- Campo de busca com placeholder "Ex: Ponta Verde, 3 quartos..."
- Abas de filtro: Todos | Apartamento | Casa | Comercial
- Botao de compartilhar (Share2)

**Secao Destaques VIP**
- Carrossel horizontal snap-scroll com cards grandes (aspect-[4/5]) com bordas arredondadas (rounded-[2.5rem])
- Sobreposicao de gradiente na parte inferior com tipo, titulo e preco
- Navegacao por setas e indicadores estilo Instagram (barras finas em cyan)
- Filtrado por `destaque = true`

**Secao "Mais Oportunidades"**
- Grid 2 colunas com cards menores
- Foto principal + contador de fotos
- Nome, bairro, preco em cyan

**Drawer de Detalhes (ao clicar em um imovel)**
- Ocupa tela inteira, desliza de baixo para cima (sem framer-motion, usando CSS transitions)
- Carrossel de fotos no topo (45vh)
- Informacoes: tipo, bairro, titulo, preco
- Grid 4 colunas com icones: Area m2, Quartos, Banheiros, Vagas
- Descricao gerada automaticamente
- Botao "Agendar Visita" via WhatsApp

**Botao Flutuante Global**
- Fixo no bottom da tela
- "Falar com Especialista" abrindo WhatsApp do corretor

**Secao Perfil do Corretor**
- Foto circular com glow neon
- Nome, bio, botao WhatsApp

**FAQ em acordeao** (mantido, com visual atualizado)

**Footer** com "Powered by DevStores"

---

## 3. Novo Componente de Carrossel para Vitrine

Criar `src/components/vitrine/PropertyCarousel.tsx`:
- Navegacao por estado React (sem dependencia extra)
- Setas laterais com backdrop-blur
- Indicadores de posicao estilo Instagram (barras finas)
- Transicao de opacidade entre imagens

---

## 4. Componente Drawer de Detalhes

Criar `src/components/vitrine/PropertyDrawer.tsx`:
- Slide-up fullscreen com CSS transition (transform translateY)
- Carrossel de fotos, grid de specs, descricao, botao CTA
- Botao X para fechar

---

## 5. Melhorias no Link da Vitrine (Configuracoes)

No `src/pages/Configuracoes.tsx`:
- Adicionar secao visual de "Preview da Vitrine" com miniatura do link
- Botao grande e destacado "Abrir Minha Vitrine" com icone ExternalLink
- Botao "Copiar Link" mais visivel com feedback visual
- Adicionar QR Code simplificado (usando URL como texto)

---

## 6. Atualizar Formulario de Imoveis

No formulario de cadastro/edicao de imoveis em `src/pages/Imoveis.tsx`:
- Adicionar campos: Quartos, Banheiros, Vagas, Area (m2)
- Adicionar toggle "Destaque VIP" para marcar imoveis que aparecem no carrossel principal
- Campos opcionais, nao obrigatorios

---

## 7. Estilos CSS Adicionais

No `src/index.css`, adicionar:
- Classe `.no-scrollbar` (ja existe como `.scrollbar-hide`)
- Animacoes de slide-up para o drawer
- Utilitarios de gradiente para overlay de imagens

---

## Detalhes Tecnicos

- **Sem framer-motion**: O codigo de inspiracao usa framer-motion, mas como nao esta instalado no projeto, usaremos CSS transitions e `useState` para animacoes
- **Sem dependencias novas**: Tudo sera feito com React, Tailwind e Lucide icons ja existentes
- **Icones usados**: `MapPin`, `BedDouble`, `Bath`, `Car`, `Square`, `Search`, `Zap`, `Star`, `Share2`, `ChevronLeft`, `ChevronRight`, `X`, `Phone`, `MessageCircle`
- **Dados da vitrine**: Query Supabase adicionara `quartos`, `banheiros`, `vagas`, `area_m2`, `destaque` na select
- **Responsividade**: Layout mobile-first com max-w-md centralizado

