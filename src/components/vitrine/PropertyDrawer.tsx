import { PropertyCarousel } from "./PropertyCarousel";
import { X, Square, BedDouble, Bath, Car, MessageCircle } from "lucide-react";

interface PropertyDrawerProps {
  property: {
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
  } | null;
  onClose: () => void;
  onWhatsApp: (msg: string) => void;
}

export function PropertyDrawer({ property, onClose, onWhatsApp }: PropertyDrawerProps) {
  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col transition-transform duration-500 ease-out ${
        property ? "translate-y-0" : "translate-y-full pointer-events-none"
      }`}
      style={{ background: "hsl(var(--background))" }}
    >
      {property && (
        <>
          {/* Photo carousel */}
          <div className="relative h-[45vh] shrink-0">
            <PropertyCarousel images={property.fotos} />
            <button
              onClick={onClose}
              className="absolute top-5 right-5 bg-black/60 backdrop-blur-xl p-3 rounded-full border border-white/20 z-10"
            >
              <X size={20} className="text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 rounded-t-[2rem] -mt-8 border-t border-border/30" style={{ background: "hsl(var(--background))" }}>
            <div className="space-y-1">
              <p className="text-primary text-[10px] font-black uppercase tracking-widest">
                {property.tipo} em {property.bairro}
              </p>
              <h2 className="text-2xl font-black tracking-tight text-foreground">
                {property.endereco}
              </h2>
              <p className="text-xl font-mono font-bold text-foreground">
                {fmt(property.valor)}
              </p>
            </div>

            {/* Specs grid */}
            {(property.area_m2 || property.quartos || property.banheiros || property.vagas) && (
              <div className="grid grid-cols-4 gap-3 py-4 border-y border-border/20">
                {property.area_m2 ? (
                  <div className="text-center space-y-1">
                    <div className="mx-auto w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary">
                      <Square size={18} />
                    </div>
                    <p className="text-[10px] text-muted-foreground font-bold">{property.area_m2}m²</p>
                  </div>
                ) : null}
                {property.quartos ? (
                  <div className="text-center space-y-1">
                    <div className="mx-auto w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary">
                      <BedDouble size={18} />
                    </div>
                    <p className="text-[10px] text-muted-foreground font-bold">{property.quartos} Qts</p>
                  </div>
                ) : null}
                {property.banheiros ? (
                  <div className="text-center space-y-1">
                    <div className="mx-auto w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary">
                      <Bath size={18} />
                    </div>
                    <p className="text-[10px] text-muted-foreground font-bold">{property.banheiros} Bans</p>
                  </div>
                ) : null}
                {property.vagas ? (
                  <div className="text-center space-y-1">
                    <div className="mx-auto w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary">
                      <Car size={18} />
                    </div>
                    <p className="text-[10px] text-muted-foreground font-bold">{property.vagas} Vagas</p>
                  </div>
                ) : null}
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Descrição</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Localizado no coração de {property.bairro}, este {property.tipo.toLowerCase()} oferece
                o que há de melhor em design e conforto. Com acabamentos de alto padrão e uma localização
                privilegiada, é a escolha ideal para quem busca exclusividade.
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={() =>
                onWhatsApp(
                  `Olá, vi o imóvel ${property.endereco} (${property.bairro}) e gostaria de agendar uma visita.`
                )
              }
              className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
            >
              <MessageCircle size={18} /> Agendar Visita
            </button>
          </div>
        </>
      )}
    </div>
  );
}
