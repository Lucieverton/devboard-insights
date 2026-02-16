import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getTenantSlug } from "@/lib/tenant";
import { ImageCarousel } from "@/components/imoveis/ImageCarousel";
import { Loader2, MessageCircle, MapPin, Home, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function VitrinePage() {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<VitrineProfile | null>(null);
  const [imoveis, setImoveis] = useState<VitrineImovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const slug = paramSlug || getTenantSlug();
    if (!slug) { setNotFound(true); setLoading(false); return; }

    (async () => {
      // Fetch profile by slug
      const { data: prof } = await supabase
        .from("profiles")
        .select("id, nome, slug, bio, foto_url, logo_url, whatsapp")
        .eq("slug", slug)
        .maybeSingle();

      if (!prof) { setNotFound(true); setLoading(false); return; }

      const profileData = prof as any;
      setProfile({
        id: profileData.id,
        nome: profileData.nome,
        bio: profileData.bio || "",
        foto_url: profileData.foto_url || "",
        logo_url: profileData.logo_url || "",
        whatsapp: profileData.whatsapp || "",
        slug: profileData.slug,
      });

      // Fetch available imoveis for this user
      const { data: imoveisData } = await supabase
        .from("imoveis")
        .select("id, endereco, bairro, cidade, tipo, valor")
        .eq("user_id", profileData.id)
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
        id: i.id,
        endereco: i.endereco,
        bairro: i.bairro || "",
        cidade: i.cidade || "",
        tipo: i.tipo,
        valor: Number(i.valor),
        fotos: fotosMap[i.id] || [],
      })));

      setLoading(false);
    })();
  }, [paramSlug]);

  const openWhatsApp = (imovel: VitrineImovel) => {
    if (!profile?.whatsapp) return;
    const phone = profile.whatsapp.replace(/\D/g, "");
    const msg = encodeURIComponent(`Olá, vi o imóvel ${imovel.endereco} no seu link da DevStores e gostaria de mais informações.`);
    window.open(`https://wa.me/55${phone}?text=${msg}`, "_blank");
  };

  const formatCurrency = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-2xl mx-auto px-4 py-5 flex items-center gap-4">
          {profile.logo_url && (
            <img src={profile.logo_url} alt="Logo" className="w-10 h-10 rounded-lg object-cover border border-primary/20" />
          )}
          {profile.foto_url && (
            <img src={profile.foto_url} alt={profile.nome} className="w-12 h-12 rounded-full object-cover border-2 border-primary/30" />
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-foreground truncate">{profile.nome}</h1>
            {profile.bio && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{profile.bio}</p>}
          </div>
          {profile.whatsapp && (
            <a
              href={`https://wa.me/55${profile.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <Button size="sm" variant="outline" className="gap-1.5 border-accent text-accent hover:bg-accent/10">
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Contato</span>
              </Button>
            </a>
          )}
        </div>
      </header>

      {/* Property Grid */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {imoveis.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Home className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Nenhum imóvel disponível no momento.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {imoveis.map(imovel => (
              <div key={imovel.id} className="neon-border card-inset rounded-xl bg-card overflow-hidden">
                {/* Carousel */}
                <ImageCarousel images={imovel.fotos} aspectRatio="aspect-[4/3]" />

                {/* Info */}
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{imovel.endereco}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {imovel.bairro}{imovel.cidade ? `, ${imovel.cidade}` : ""}
                      </p>
                    </div>
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground shrink-0">{imovel.tipo}</span>
                  </div>

                  <p className="text-lg font-bold font-mono text-neon">{formatCurrency(imovel.valor)}</p>

                  <Button
                    onClick={() => openWhatsApp(imovel)}
                    className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                    disabled={!profile.whatsapp}
                  >
                    <MessageCircle className="w-4 h-4" />
                    Tenho Interesse
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <footer className="text-center py-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Powered by <span className="text-primary font-semibold">DevStores</span>
          </p>
        </footer>
      </main>
    </div>
  );
}
