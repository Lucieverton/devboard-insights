import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getTenantSlug } from "@/lib/tenant";
import { ImageCarousel } from "@/components/imoveis/ImageCarousel";
import { Loader2, MessageCircle, MapPin, Home, Building2, ChevronRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VitrineProfile {
  id: string;
  nome: string;
  bio: string;
  foto_url: string;
  logo_url: string;
  whatsapp: string;
  slug: string;
}

interface VitrineImovel {
  id: string;
  endereco: string;
  bairro: string;
  cidade: string;
  tipo: string;
  valor: number;
  fotos: string[];
}

const FAQ_ITEMS = [
  { q: "Como funciona a visita ao imóvel?", a: "Entre em contato pelo WhatsApp e agendamos a visita no melhor horário para você. Sem burocracia!" },
  { q: "Os valores anunciados são negociáveis?", a: "Sim! Cada proprietário tem sua flexibilidade. Converse conosco para encontrar as melhores condições." },
  { q: "Vocês auxiliam com financiamento?", a: "Com certeza! Temos parceiros que facilitam todo o processo de financiamento imobiliário para você." },
];

export default function VitrinePage() {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<VitrineProfile | null>(null);
  const [imoveis, setImoveis] = useState<VitrineImovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const slug = paramSlug || getTenantSlug();
    if (!slug) { setNotFound(true); setLoading(false); return; }

    (async () => {
      const { data: prof } = await supabase
        .from("profiles")
        .select("id, nome, slug, bio, foto_url, logo_url, whatsapp")
        .eq("slug", slug)
        .maybeSingle();

      if (!prof) { setNotFound(true); setLoading(false); return; }

      const p = prof as any;
      setProfile({
        id: p.id, nome: p.nome, bio: p.bio || "", foto_url: p.foto_url || "",
        logo_url: p.logo_url || "", whatsapp: p.whatsapp || "", slug: p.slug,
      });

      const { data: imoveisData } = await supabase
        .from("imoveis")
        .select("id, endereco, bairro, cidade, tipo, valor")
        .eq("user_id", p.id)
        .eq("status", "Disponível")
        .order("criado_em", { ascending: false });

      const ids = (imoveisData || []).map(i => i.id);
      let fotosMap: Record<string, string[]> = {};
      if (ids.length > 0) {
        const { data: fotosData } = await supabase
          .from("imovel_fotos")
          .select("imovel_id, url, is_capa")
          .in("imovel_id", ids)
          .order("ordem", { ascending: true });
        (fotosData || []).forEach((f: any) => {
          if (!fotosMap[f.imovel_id]) fotosMap[f.imovel_id] = [];
          fotosMap[f.imovel_id].push(f.url);
        });
      }

      setImoveis((imoveisData || []).map(i => ({
        id: i.id, endereco: i.endereco, bairro: i.bairro || "",
        cidade: i.cidade || "", tipo: i.tipo, valor: Number(i.valor),
        fotos: fotosMap[i.id] || [],
      })));

      setLoading(false);
    })();
  }, [paramSlug]);

  const openWhatsApp = (imovel?: VitrineImovel) => {
    if (!profile?.whatsapp) return;
    const phone = profile.whatsapp.replace(/\D/g, "");
    const msg = imovel
      ? encodeURIComponent(`Olá, vi o imóvel ${imovel.endereco} no seu link da DevStores e gostaria de mais informações.`)
      : encodeURIComponent(`Olá, vi sua vitrine na DevStores e gostaria de mais informações.`);
    window.open(`https://wa.me/55${phone}?text=${msg}`, "_blank");
  };

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-center p-6">
        <div className="space-y-3">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto" />
          <h1 className="text-xl font-bold text-foreground">Vitrine não encontrada</h1>
          <p className="text-sm text-muted-foreground">O corretor que você procura não possui uma vitrine ativa.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-4 px-3">
      {/* === MAIN CONTAINER (template-style centered card) === */}
      <div className="w-full max-w-md neon-border card-inset rounded-xl bg-card overflow-hidden">

        {/* --- HEADER --- */}
        <header className="text-center px-5 pt-5 pb-4 border-b border-border/30">
          {profile.logo_url && (
            <img
              src={profile.logo_url}
              alt="Logo"
              className="w-14 h-14 mx-auto mb-3 object-contain drop-shadow-[0_0_6px_hsl(var(--primary)/0.4)]"
            />
          )}
          <h1 className="text-xl font-bold text-neon tracking-wide animate-pulse-glow">
            {profile.nome}
          </h1>
          {profile.bio && (
            <p className="text-xs text-muted-foreground mt-1.5 opacity-80 line-clamp-2">{profile.bio}</p>
          )}
          {profile.whatsapp && (
            <button
              onClick={() => openWhatsApp()}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider border border-primary/40 rounded-md text-primary bg-primary/5 hover:bg-primary/15 hover:border-primary hover:shadow-[0_0_10px_hsl(var(--primary)/0.3)] transition-all duration-300 hover:-translate-y-0.5"
            >
              <Phone className="w-3.5 h-3.5" />
              Fale Comigo
            </button>
          )}
        </header>

        {/* --- SECTION TITLE: IMÓVEIS --- */}
        <div className="text-center my-4 px-4">
          <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-[3px] text-primary-foreground bg-primary rounded shadow-[0_2px_6px_hsl(var(--primary)/0.3),inset_0_1px_1px_hsl(0_0%_100%/0.2)]">
            Imóveis Disponíveis
          </span>
        </div>

        {/* --- PROPERTY HORIZONTAL CAROUSEL --- */}
        {imoveis.length === 0 ? (
          <div className="text-center py-10 px-4 text-muted-foreground">
            <Home className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">Nenhum imóvel disponível no momento.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto scrollbar-hide pb-4">
            <div className="flex gap-3 px-4" style={{ width: "max-content" }}>
              {imoveis.map(imovel => (
                <div
                  key={imovel.id}
                  className="w-[280px] flex-shrink-0 bg-secondary/30 border border-border/40 rounded-lg overflow-hidden hover:-translate-y-1 hover:shadow-[0_4px_12px_hsl(var(--primary)/0.2),0_0_8px_hsl(var(--primary)/0.15)] transition-all duration-300 snap-center"
                >
                  {/* Carousel inside card */}
                  <ImageCarousel images={imovel.fotos} aspectRatio="aspect-[4/3]" />

                  <div className="p-3 space-y-1.5">
                    <h3 className="text-sm font-semibold text-foreground truncate">{imovel.endereco}</h3>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {imovel.bairro}{imovel.cidade ? `, ${imovel.cidade}` : ""}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-base font-bold font-mono text-neon">{fmt(imovel.valor)}</span>
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{imovel.tipo}</span>
                    </div>
                    <button
                      onClick={() => openWhatsApp(imovel)}
                      className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-md bg-accent text-accent-foreground hover:bg-accent/90 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Tenho Interesse
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- PROFILE / ABOUT SECTION --- */}
        <section className="text-center px-5 py-5 border-t border-border/30">
          {profile.foto_url && (
            <div className="w-16 h-16 mx-auto mb-3 rounded-full border-2 border-primary overflow-hidden shadow-[0_0_10px_hsl(var(--primary)/0.3),inset_0_0_6px_hsl(var(--primary)/0.2)]">
              <img src={profile.foto_url} alt={profile.nome} className="w-full h-full object-cover" />
            </div>
          )}
          <h2 className="text-base font-bold text-neon">{profile.nome}</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5 opacity-70">Corretor(a) de Imóveis</p>

          {/* Social buttons */}
          {profile.whatsapp && (
            <div className="flex justify-center gap-3 mt-3">
              <button
                onClick={() => openWhatsApp()}
                className="w-10 h-10 rounded-full border-2 border-primary/40 bg-primary/5 flex items-center justify-center text-primary hover:bg-primary/15 hover:border-primary hover:shadow-[0_0_8px_hsl(var(--primary)/0.4)] transition-all duration-300 hover:scale-110 active:scale-90"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
          )}
        </section>

        {/* --- FAQ SECTION --- */}
        <section className="px-4 pb-5">
          <div className="text-center mb-3">
            <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-[3px] text-primary-foreground bg-primary rounded shadow-[0_2px_6px_hsl(var(--primary)/0.3)]">
              Dúvidas Frequentes
            </span>
          </div>

          <div className="space-y-2">
            {FAQ_ITEMS.map((item, idx) => (
              <div key={idx}>
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 text-left text-xs font-semibold border border-border/40 bg-secondary/30 rounded-md transition-all duration-300 hover:shadow-[0_2px_8px_hsl(var(--primary)/0.2),0_0_6px_hsl(var(--primary)/0.15)]",
                    activeFaq === idx && "rounded-b-none border-primary/50 shadow-[0_2px_8px_hsl(var(--primary)/0.25)]"
                  )}
                >
                  <span className="text-foreground">{idx + 1}. {item.q}</span>
                  <ChevronRight className={cn(
                    "w-4 h-4 text-primary shrink-0 transition-transform duration-300",
                    activeFaq === idx && "rotate-90"
                  )} />
                </button>
                <div className={cn(
                  "overflow-hidden transition-all duration-400 ease-out",
                  activeFaq === idx ? "max-h-40 border border-t-0 border-border/40 rounded-b-md px-3 py-2.5" : "max-h-0"
                )}>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* --- FOOTER --- */}
      <footer className="text-center py-5">
        <p className="text-[10px] text-muted-foreground">
          Powered by <span className="text-neon font-semibold">DevStores</span>
        </p>
      </footer>
    </div>
  );
}
