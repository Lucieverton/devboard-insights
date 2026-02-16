import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import mockupDashboard from "@/assets/mockup-dashboard.jpg";
import mockupVitrine from "@/assets/mockup-vitrine.jpg";
import {
  BarChart3,
  Link2,
  Users,
  Camera,
  ChevronRight,
  Zap,
  Shield,
  TrendingUp,
  MessageCircle,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Star,
  Instagram,
  Linkedin,
} from "lucide-react";

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
    >
      {children}
    </div>
  );
}

const features = [
  {
    icon: BarChart3,
    title: "Dashboard Inteligente",
    desc: "Visualize faturamento bruto e comissões líquidas com gráficos neon de fácil leitura. Saiba exatamente quanto você ganha.",
  },
  {
    icon: Link2,
    title: "Vitrine Link na Bio",
    desc: "Gere automaticamente um catálogo estilo Instagram para seus imóveis disponíveis. Compartilhe em segundos.",
  },
  {
    icon: Users,
    title: "Gestão de Match",
    desc: "O sistema avisa quando um imóvel novo combina com o perfil de um cliente cadastrado. Nunca perca uma oportunidade.",
  },
  {
    icon: Camera,
    title: "Upload de Campo",
    desc: "Tire fotos dos imóveis direto da câmera e suba para o sistema instantaneamente. Sem intermediários.",
  },
];

const painPoints = [
  { icon: "📊", pain: "Planilhas confusas que ninguém entende", solution: "Dashboard visual com dados em tempo real" },
  { icon: "😵", pain: "Esquecimento de leads e oportunidades", solution: "Sistema de match automático cliente-imóvel" },
  { icon: "🔗", pain: "Falta de um link profissional na bio", solution: "Vitrine exclusiva com seu domínio personalizado" },
  { icon: "💸", pain: "Comissões perdidas por falta de controle", solution: "Cálculo automático de comissões e VGV" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [qtdImoveis, setQtdImoveis] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !whatsapp.trim() || !qtdImoveis.trim()) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("leads").insert({ nome: nome.trim(), whatsapp: whatsapp.trim(), qtd_imoveis: qtdImoveis.trim() });
    setSubmitting(false);
    if (error) {
      toast({ title: "Erro ao enviar", description: error.message, variant: "destructive" });
    } else {
      setSubmitted(true);
      toast({ title: "Pré-cadastro enviado!", description: "Entraremos em contato em breve." });
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(0,0%,5%)] text-foreground overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-[hsl(0,0%,5%)]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
          <span className="text-xl font-bold text-neon tracking-tight font-mono">DevBoard<span className="text-foreground">Stores</span></span>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/auth")}
            >
              Entrar
            </Button>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/80 shadow-[0_0_15px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_25px_hsl(var(--primary)/0.6)] transition-shadow"
              onClick={() => document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" })}
            >
              Começar Agora
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(183_100%_50%/0.06)_0%,transparent_60%)]" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <Section>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-mono mb-6">
              <Zap className="w-3 h-3" /> Feito para corretores de elite
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              Transforme sua Gestão Imobiliária em uma{" "}
              <span className="text-neon animate-pulse-glow">Máquina de Vendas</span>{" "}
              High-Tech
            </h1>
            <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              O CRM que organiza seus contratos, calcula suas comissões em tempo real e cria sua vitrine exclusiva no Instagram em segundos.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/80 shadow-[0_0_20px_hsl(var(--primary)/0.5)] hover:shadow-[0_0_35px_hsl(var(--primary)/0.7)] transition-all text-base px-8"
                onClick={() => document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" })}
              >
                Começar Agora Gratuitamente <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-border hover:border-primary/50 text-base"
                onClick={() => navigate("/auth")}
              >
                Já sou cliente <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </Section>
          <Section className="mt-14">
            <div className="relative mx-auto max-w-4xl rounded-xl overflow-hidden neon-border">
              <img src={mockupDashboard} alt="Dashboard DevBoard Stores" className="w-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-[hsl(0,0%,5%)] via-transparent to-transparent" />
            </div>
          </Section>
        </div>
      </section>

      {/* Problem vs Solution */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <Section>
            <h2 className="text-2xl sm:text-4xl font-bold text-center mb-4">
              Chega de perder dinheiro por{" "}
              <span className="text-destructive">falta de organização</span>
            </h2>
            <p className="text-center text-muted-foreground max-w-xl mx-auto mb-12">
              Não perca mais nenhuma comissão por falta de organização. Tenha o controle total do seu VGV na palma da mão.
            </p>
          </Section>
          <div className="grid sm:grid-cols-2 gap-5">
            {painPoints.map((p, i) => (
              <Section key={i}>
                <div className="rounded-lg border border-border bg-card p-5 card-inset hover:border-primary/40 transition-colors">
                  <span className="text-2xl">{p.icon}</span>
                  <p className="text-sm text-destructive/80 line-through mt-2">{p.pain}</p>
                  <div className="flex items-start gap-2 mt-2">
                    <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground">{p.solution}</p>
                  </div>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 bg-[hsl(0,0%,7%)]">
        <div className="max-w-5xl mx-auto">
          <Section>
            <h2 className="text-2xl sm:text-4xl font-bold text-center mb-3">
              Recursos <span className="text-neon">Poderosos</span>
            </h2>
            <p className="text-center text-muted-foreground mb-12">Tudo que você precisa em um só painel.</p>
          </Section>
          <div className="grid sm:grid-cols-2 gap-5">
            {features.map((f, i) => (
              <Section key={i}>
                <div className="group rounded-lg border border-border bg-card p-6 card-inset hover:border-primary/50 hover:shadow-[0_0_20px_hsl(var(--primary)/0.1)] transition-all">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* Vitrine Showcase */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <Section>
              <div className="relative mx-auto max-w-[280px]">
                <img src={mockupVitrine} alt="Vitrine Mobile DevBoard" className="w-full rounded-2xl" />
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
              </div>
            </Section>
            <Section>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Sua <span className="text-neon">Vitrine Exclusiva</span> no link da bio
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Crie um catálogo profissional dos seus imóveis disponíveis em segundos. Compartilhe no Instagram, WhatsApp e redes sociais. Seus clientes compram direto pelo link.
              </p>
              <ul className="space-y-3">
                {["Domínio personalizado: seunome.devstores.com.br", "Carrossel estilo Instagram", "Botão direto pro WhatsApp", "Atualização em tempo real"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Section>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-4 sm:px-6 bg-[hsl(0,0%,7%)]">
        <div className="max-w-4xl mx-auto text-center">
          <Section>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent/5 text-accent text-xs font-mono mb-6">
              <Shield className="w-3 h-3" /> Feito no Brasil, para o Brasil
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Desenvolvido para a realidade do <span className="text-neon">mercado imobiliário brasileiro</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
              Nascido em Maceió/AL e testado com corretores reais. Entendemos as dores do corretor que trabalha na rua, não na frente do computador.
            </p>
            <div className="grid grid-cols-3 gap-6">
              {[
                { value: "500+", label: "Imóveis gerenciados" },
                { value: "R$ 12M", label: "em VGV rastreado" },
                { value: "98%", label: "de satisfação" },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-neon font-mono">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </Section>
          <Section className="mt-12">
            <div className="neon-border rounded-lg bg-card p-6 card-inset text-left max-w-lg mx-auto">
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground italic leading-relaxed">
                "Antes eu usava três planilhas e ainda perdia acompanhamento de clientes. Com o DevBoard, tudo tá na palma da mão. Em 2 meses, minha comissão subiu 40%."
              </p>
              <p className="text-xs text-foreground mt-3 font-semibold">— Rodrigo S., Corretor em Maceió/AL</p>
            </div>
          </Section>
        </div>
      </section>

      {/* Lead Form */}
      <section id="lead-form" className="py-20 px-4 sm:px-6">
        <div className="max-w-md mx-auto">
          <Section>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">
              Comece <span className="text-neon">Agora</span>
            </h2>
            <p className="text-center text-muted-foreground text-sm mb-8">
              Preencha seus dados e entraremos em contato para liberar seu acesso.
            </p>
            {submitted ? (
              <div className="neon-border rounded-lg bg-card p-8 card-inset text-center">
                <CheckCircle2 className="w-12 h-12 text-accent mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Pré-cadastro enviado!</h3>
                <p className="text-sm text-muted-foreground mb-4">Entraremos em contato pelo WhatsApp em breve.</p>
                <Button variant="outline" onClick={() => navigate("/auth")}>
                  Já tenho conta — Entrar <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="neon-border rounded-lg bg-card p-6 card-inset space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Nome completo</Label>
                  <Input
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome"
                    className="bg-secondary border-border mt-1"
                    maxLength={100}
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">WhatsApp</Label>
                  <Input
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="(82) 99999-9999"
                    className="bg-secondary border-border mt-1"
                    maxLength={20}
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Quantos imóveis você gerencia hoje?</Label>
                  <Input
                    value={qtdImoveis}
                    onChange={(e) => setQtdImoveis(e.target.value)}
                    placeholder="Ex: 15"
                    className="bg-secondary border-border mt-1"
                    maxLength={50}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/80 shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)] transition-all"
                  disabled={submitting}
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MessageCircle className="w-4 h-4 mr-2" />}
                  Quero meu acesso gratuito
                </Button>
                <p className="text-[10px] text-muted-foreground text-center">
                  Seus dados estão seguros. Sem spam, prometemos.
                </p>
              </form>
            )}
          </Section>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-4 sm:px-6 bg-[hsl(0,0%,7%)]">
        <div className="max-w-3xl mx-auto text-center">
          <Section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3">
              Já é cliente DevBoard? <span className="text-neon">Acesse seu painel.</span>
            </h2>
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/80 shadow-[0_0_20px_hsl(var(--primary)/0.5)] hover:shadow-[0_0_35px_hsl(var(--primary)/0.7)] transition-all"
              onClick={() => navigate("/auth")}
            >
              Acessar Dashboard <TrendingUp className="w-4 h-4 ml-2" />
            </Button>
          </Section>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-10 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-lg font-bold text-neon font-mono">DevBoard<span className="text-foreground">Stores</span></span>
            <p className="text-xs text-muted-foreground mt-1">O CRM imobiliário high-tech. Maceió/AL.</p>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Instagram className="w-5 h-5" /></a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Linkedin className="w-5 h-5" /></a>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 DevStores. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
