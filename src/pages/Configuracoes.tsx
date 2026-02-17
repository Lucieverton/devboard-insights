import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useData } from "@/contexts/DataContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { buildVitrineUrl } from "@/lib/tenant";
import { Camera, Upload, Link, Loader2, ExternalLink, Copy } from "lucide-react";

interface ProfileData {
  nome: string;
  slug: string;
  bio: string;
  foto_url: string;
  logo_url: string;
  whatsapp: string;
}

export default function ConfiguracoesPage() {
  const { user } = useAuth();
  const { imoveis, contratos, clientes } = useData();
  const [profile, setProfile] = useState<ProfileData>({ nome: "", slug: "", bio: "", foto_url: "", logo_url: "", whatsapp: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slugError, setSlugError] = useState("");
  const fotoRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("nome, slug, bio, foto_url, logo_url, whatsapp").eq("id", user.id).single()
      .then(({ data }) => {
        if (data) setProfile({
          nome: data.nome || "",
          slug: (data as any).slug || "",
          bio: (data as any).bio || "",
          foto_url: (data as any).foto_url || "",
          logo_url: (data as any).logo_url || "",
          whatsapp: (data as any).whatsapp || "",
        });
        setLoading(false);
      });
  }, [user]);

  const uploadAsset = async (file: File, type: "foto" | "logo") => {
    if (!user) return;
    const path = `${user.id}/${type}_${Date.now()}.jpg`;
    const { error } = await supabase.storage.from("profile-assets").upload(path, file, { contentType: file.type, upsert: true });
    if (error) { toast({ title: "Erro no upload", description: error.message, variant: "destructive" }); return; }
    const { data } = supabase.storage.from("profile-assets").getPublicUrl(path);
    setProfile(p => ({ ...p, [type === "foto" ? "foto_url" : "logo_url"]: data.publicUrl }));
  };

  const validateSlug = async (slug: string) => {
    if (!slug) { setSlugError(""); return true; }
    if (!/^[a-z0-9_-]+$/.test(slug)) { setSlugError("Use apenas letras minúsculas, números, - e _"); return false; }
    if (slug.length < 3) { setSlugError("Mínimo 3 caracteres"); return false; }
    const { data } = await supabase.from("profiles").select("id").eq("slug", slug).neq("id", user!.id).maybeSingle();
    if (data) { setSlugError("Este slug já está em uso"); return false; }
    setSlugError("");
    return true;
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const slugValid = await validateSlug(profile.slug);
    if (!slugValid) { setSaving(false); return; }
    const { error } = await supabase.from("profiles").update({
      nome: profile.nome,
      slug: profile.slug || null,
      bio: profile.bio,
      foto_url: profile.foto_url,
      logo_url: profile.logo_url,
      whatsapp: profile.whatsapp,
    } as any).eq("id", user.id);
    if (error) toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    else toast({ title: "Perfil salvo!", description: "Suas configurações foram atualizadas." });
    setSaving(false);
  };

  const vitrineUrl = profile.slug ? buildVitrineUrl(profile.slug) : "";

  if (loading) return <div className="p-6 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <h2 className="text-xl font-bold text-neon">Configurações</h2>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="neon-border card-inset rounded-lg bg-card p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Imóveis</p>
          <p className="text-2xl font-bold font-mono text-neon">{imoveis.length}</p>
        </div>
        <div className="neon-border card-inset rounded-lg bg-card p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Contratos</p>
          <p className="text-2xl font-bold font-mono text-neon">{contratos.length}</p>
        </div>
        <div className="neon-border card-inset rounded-lg bg-card p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Clientes</p>
          <p className="text-2xl font-bold font-mono text-neon">{clientes.length}</p>
        </div>
      </div>

      {/* Profile Section */}
      <div className="neon-border card-inset rounded-lg bg-card p-6 space-y-5">
        <h3 className="text-sm font-semibold text-foreground">Perfil da Vitrine</h3>

        {/* Avatar & Logo */}
        <div className="flex gap-6 items-start">
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">Foto de Perfil</p>
            <div
              onClick={() => fotoRef.current?.click()}
              className="w-20 h-20 rounded-full bg-secondary border-2 border-primary/30 flex items-center justify-center cursor-pointer hover:border-primary/60 transition-colors overflow-hidden"
            >
              {profile.foto_url ? (
                <img src={profile.foto_url} alt="Foto" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <input ref={fotoRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadAsset(e.target.files[0], "foto")} />
          </div>

          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">Logo Imobiliária</p>
            <div
              onClick={() => logoRef.current?.click()}
              className="w-20 h-20 rounded-lg bg-secondary border-2 border-primary/30 flex items-center justify-center cursor-pointer hover:border-primary/60 transition-colors overflow-hidden"
            >
              {profile.logo_url ? (
                <img src={profile.logo_url} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Upload className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadAsset(e.target.files[0], "logo")} />
          </div>
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="nome">Nome</Label>
          <Input id="nome" value={profile.nome} onChange={e => setProfile(p => ({ ...p, nome: e.target.value }))} placeholder="Seu nome completo" />
        </div>

        {/* Bio */}
        <div className="space-y-1.5">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} placeholder="Fale sobre você e sua experiência no mercado imobiliário..." rows={3} />
        </div>

        {/* WhatsApp */}
        <div className="space-y-1.5">
          <Label htmlFor="whatsapp">WhatsApp (com DDD)</Label>
          <Input id="whatsapp" value={profile.whatsapp} onChange={e => setProfile(p => ({ ...p, whatsapp: e.target.value }))} placeholder="82999999999" />
        </div>

        {/* Slug */}
        <div className="space-y-1.5">
          <Label htmlFor="slug" className="flex items-center gap-1.5">
            <Link className="w-3.5 h-3.5" />
            Slug do Link
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="slug"
              value={profile.slug}
              onChange={e => { setProfile(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "") })); setSlugError(""); }}
              onBlur={() => validateSlug(profile.slug)}
              placeholder="seu-nome"
              className="flex-1"
            />
          </div>
          {slugError && <p className="text-xs text-destructive">{slugError}</p>}
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Salvar Configurações
        </Button>
      </div>

      {/* Vitrine Link Preview */}
      {profile.slug && !slugError && (
        <div className="neon-border card-inset rounded-lg bg-card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-primary" />
            Sua Vitrine Pública
          </h3>
          <div className="bg-secondary/50 rounded-lg p-3 border border-border/30">
            <p className="text-xs text-muted-foreground mb-1">Link da sua vitrine:</p>
            <p className="text-sm font-mono text-primary break-all">{vitrineUrl}</p>
          </div>
          <div className="flex gap-2">
            <a
              href={vitrineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Abrir Vitrine
            </a>
            <button
              onClick={() => { navigator.clipboard.writeText(vitrineUrl); toast({ title: "Link copiado!" }); }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-primary/40 text-primary text-xs font-bold uppercase tracking-wider hover:bg-primary/10 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" /> Copiar
            </button>
          </div>
        </div>
      )}

      {/* About */}
      <div className="neon-border card-inset rounded-lg bg-card p-5 text-sm text-muted-foreground space-y-1">
        <p><span className="text-foreground">Versão:</span> 2.0.0</p>
        <p><span className="text-foreground">Plataforma:</span> DevBoard Stores</p>
        <p><span className="text-foreground">Domínio:</span> devstores.com.br</p>
      </div>
    </div>
  );
}
