import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getTenantSlug } from "@/lib/tenant";
import { PropertyCarousel } from "@/components/vitrine/PropertyCarousel";
import { PropertyDrawer } from "@/components/vitrine/PropertyDrawer";
import {
  Loader2, MessageCircle, MapPin, Home, Building2,
  ChevronRight, Search, Zap, Star, Share2, Phone, X,
} from "lucide-react";
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
  quartos?: number;
  banheiros?: number;
  vagas?: number;
  area_m2?: number;
  destaque?: boolean;
}

const FAQ_ITEMS = [
  { q: "Como funciona a visita ao imóvel?", a: "Entre em contato pelo WhatsApp e agendamos a visita no melhor horário para você. Sem burocracia!" },
  { q: "Os valores anunciados são negociáveis?", a: "Sim! Cada proprietário tem sua flexibilidade. Converse conosco para encontrar as melhores condições." },
  { q: "Vocês auxiliam com financiamento?", a: "Com certeza! Temos parceiros que facilitam todo o processo de financiamento imobiliário para você." },
];

const TABS = ["Todos", "Apartamento", "Casa", "Comercial"];

export default function VitrinePage() {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<VitrineProfile | null>(null);
  const [imoveis, setImoveis] = useState<VitrineImovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("Todos");
  const [search, setSearch] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<VitrineImovel | null>(null);

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
        .select("id, endereco, bairro, cidade, tipo, valor, quartos, banheiros, vagas, area_m2, destaque")
        .eq("user_id", p.id)
        .eq("status", "Disponível")
        .order("criado_em", { ascending: false });

      const ids = (imoveisData || []).map((i: any) => i.id);
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

      setImoveis((imoveisData || []).map((i: any) => ({
        id: i.id, endereco: i.endereco, bairro: i.bairro || "",
        cidade: i.cidade || "", tipo: i.tipo, valor: Number(i.valor),
        fotos: fotosMap[i.id] || [],
        quartos: i.quartos, banheiros: i.banheiros, vagas: i.vagas,
        area_m2: i.area_m2 ? Number(i.area_m2) : undefined,
        destaque: i.destaque || false,
      })));

      setLoading(false);
    })();
  }, [paramSlug]);

  const filteredItems = useMemo(() => {
    return imoveis.filter(item => {
      const matchesTab = activeTab === "Todos" || item.tipo === activeTab;
      const matchesSearch = !search || item.endereco.toLowerCase().includes(search.toLowerCase()) ||
        item.bairro.toLowerCase().includes(search.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [imoveis, activeTab, search]);

  const featured = filteredItems.filter(i => i.destaque);
  const others = filteredItems.filter(i => !i.destaque);

  const openWhatsApp = (msg?: string) => {
    if (!profile?.whatsapp) return;
    const phone = profile.whatsapp.replace(/\D/g, "");
    const text = encodeURIComponent(msg || `Olá, vi sua vitrine na DevStores e gostaria de mais informações.`);
    window.open(`https://wa.me/55${phone}?text=${text}`, "_blank");
  };

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", notation: "compact" as any });
  const fmtFull = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: profile?.nome, url }); } catch {}
    } else {
      navigator.clipboard.writeText(url);
    }
  };

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
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 font-sans">

      {/* === HEADER FIXO === */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/20 p-4">
        <div className="max-w-md mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {profile.logo_url ? (
                <img src={profile.logo_url} alt="Logo" className="w-7 h-7 object-contain" />
              ) : (
                <Zap className="text-primary" size={20} />
              )}
              <span className="font-black tracking-tighter text-lg">
                {profile.nome.split(" ")[0].toUpperCase()}{" "}
                <span className="text-primary font-light italic">STORES</span>
              </span>
            </div>
            <div className="flex gap-2">
              <button onClick={handleShare} className="p-2 bg-secondary rounded-full">
                <Share2 size={16} className="text-muted-foreground" />
              </button>
              {profile.foto_url ? (
                <img src={profile.foto_url} alt={profile.nome} className="w-8 h-8 rounded-full object-cover border-2 border-primary shadow-[0_0_12px_hsl(var(--primary)/0.4)]" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs shadow-[0_0_12px_hsl(var(--primary)/0.4)]">
                  {profile.nome.charAt(0)}
                </div>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Ex: Ponta Verde, 3 quartos..."
              className="w-full bg-secondary border border-border/30 rounded-2xl py-3 pl-12 pr-4 text-sm focus:border-primary/50 outline-none transition-all text-foreground placeholder:text-muted-foreground"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                  activeTab === tab
                    ? "bg-primary border-primary text-primary-foreground shadow-[0_0_16px_hsl(var(--primary)/0.2)]"
                    : "bg-transparent border-border/30 text-muted-foreground"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* === MAIN CONTENT === */}
      <main className="max-w-md mx-auto p-4 space-y-10 pb-32">

        {/* Destaques VIP */}
        {featured.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
              <Star size={14} fill="currentColor" /> Destaques VIP
            </h2>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
              {featured.map(item => (
                <div key={item.id} className="min-w-[85%] snap-center">
                  <div
                    className="aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-border/30 relative cursor-pointer"
                    onClick={() => setSelectedProperty(item)}
                  >
                    <PropertyCarousel images={item.fotos} />
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none">
                      <p className="text-primary text-[10px] font-black uppercase tracking-widest mb-1">{item.tipo}</p>
                      <h3 className="text-xl font-black tracking-tighter text-white mb-1">{item.endereco}</h3>
                      <p className="text-lg font-mono font-bold text-white">{fmt(item.valor)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Mais Oportunidades */}
        <section className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
            {featured.length > 0 ? "Mais Oportunidades" : "Imóveis Disponíveis"}
          </h2>
          {others.length === 0 && featured.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Home className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">Nenhum imóvel disponível no momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {others.map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelectedProperty(item)}
                  className="bg-secondary/30 border border-border/30 rounded-[1.5rem] overflow-hidden cursor-pointer hover:border-primary/30 transition-all"
                >
                  <div className="aspect-square relative">
                    <img
                      src={item.fotos[0] || "/placeholder.svg"}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    {item.fotos.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[8px] font-bold text-white">
                        {item.fotos.length} fotos
                      </div>
                    )}
                  </div>
                  <div className="p-3 space-y-1">
                    <h4 className="text-[11px] font-black uppercase truncate text-foreground">{item.endereco}</h4>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <MapPin size={10} /> {item.bairro}
                    </p>
                    <p className="text-primary font-mono text-xs font-bold pt-1">{fmt(item.valor)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Perfil do Corretor */}
        <section className="text-center py-6 space-y-3">
          {profile.foto_url && (
            <div className="w-20 h-20 mx-auto rounded-full border-2 border-primary overflow-hidden shadow-[0_0_20px_hsl(var(--primary)/0.4)]">
              <img src={profile.foto_url} alt={profile.nome} className="w-full h-full object-cover" />
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold text-neon">{profile.nome}</h2>
            <p className="text-xs text-muted-foreground">Corretor(a) de Imóveis</p>
          </div>
          {profile.bio && (
            <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">{profile.bio}</p>
          )}
          {profile.whatsapp && (
            <button
              onClick={() => openWhatsApp()}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider border border-primary/40 rounded-xl text-primary bg-primary/5 hover:bg-primary/15 transition-all"
            >
              <Phone size={14} /> WhatsApp
            </button>
          )}
        </section>

        {/* FAQ */}
        <section className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground text-center">
            Dúvidas Frequentes
          </h2>
          <div className="space-y-2">
            {FAQ_ITEMS.map((item, idx) => (
              <div key={idx}>
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 text-left text-xs font-semibold border border-border/30 bg-secondary/30 rounded-xl transition-all",
                    activeFaq === idx && "rounded-b-none border-primary/40"
                  )}
                >
                  <span className="text-foreground">{item.q}</span>
                  <ChevronRight className={cn(
                    "w-4 h-4 text-primary shrink-0 transition-transform duration-300",
                    activeFaq === idx && "rotate-90"
                  )} />
                </button>
                <div className={cn(
                  "overflow-hidden transition-all duration-300",
                  activeFaq === idx ? "max-h-40 border border-t-0 border-border/30 rounded-b-xl px-4 py-3" : "max-h-0"
                )}>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* === DRAWER DE DETALHES === */}
      <PropertyDrawer
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
        onWhatsApp={(msg) => openWhatsApp(msg)}
      />

      {/* === BOTÃO FLUTUANTE === */}
      {profile.whatsapp && !selectedProperty && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50">
          <button
            onClick={() => openWhatsApp()}
            className="w-full bg-foreground text-background py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 shadow-2xl border border-border/20"
          >
            <MessageCircle size={16} /> Falar com Especialista
          </button>
        </div>
      )}

      {/* === FOOTER === */}
      <footer className="text-center py-6 pb-24">
        <p className="text-[10px] text-muted-foreground">
          Powered by <span className="text-neon font-semibold">DevStores</span>
        </p>
      </footer>
    </div>
  );
}
