import { useState, useMemo } from "react";
import { useData, Imovel, Contrato } from "@/contexts/DataContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Home, FileText, Link2, CheckCircle2 } from "lucide-react";

interface LinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clienteId: string;
  clienteNome: string;
}

export default function LinkModal({ open, onOpenChange, clienteId, clienteNome }: LinkModalProps) {
  const { imoveis, contratos, updateContrato, addContrato, clientes } = useData();
  const [tab, setTab] = useState("imoveis");
  const [search, setSearch] = useState("");

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // Filter available properties
  const availableImoveis = useMemo(() => {
    const s = search.toLowerCase();
    return imoveis
      .filter((i) => i.status === "Disponível")
      .filter((i) => !s || i.endereco.toLowerCase().includes(s) || i.bairro.toLowerCase().includes(s) || i.tipo.toLowerCase().includes(s));
  }, [imoveis, search]);

  // Filter contracts not yet linked to this client
  const availableContratos = useMemo(() => {
    const s = search.toLowerCase();
    return contratos
      .filter((c) => !c.clienteId || c.clienteId === clienteId)
      .filter((c) => {
        if (!s) return true;
        const imovel = imoveis.find((i) => i.id === c.imovelId);
        return (imovel?.endereco.toLowerCase().includes(s) ?? false) || c.tipo.toLowerCase().includes(s) || c.etapa.toLowerCase().includes(s);
      });
  }, [contratos, search, clienteId, imoveis]);

  const isImovelLinked = (imovelId: string) => contratos.some((c) => c.imovelId === imovelId && c.clienteId === clienteId);

  const handleLinkImovel = async (imovel: Imovel) => {
    // Create a new contract linking this client to the property
    await addContrato({
      imovelId: imovel.id,
      clienteId,
      tipo: "Venda",
      valorTotal: imovel.valor,
      comissaoPercent: 5,
      dataInicio: new Date().toISOString().split("T")[0],
      dataFim: "",
      etapa: "Proposta",
      notas: [{ id: crypto.randomUUID(), texto: `Imóvel vinculado ao cliente ${clienteNome}`, data: new Date().toISOString() }],
      dataRecebimento: "",
      comissaoPaga: false,
      documentoUrl: "",
    });
    onOpenChange(false);
  };

  const handleLinkContrato = async (contrato: Contrato) => {
    if (contrato.clienteId === clienteId) return; // Already linked
    await updateContrato({ ...contrato, clienteId });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-neon inline-flex items-center gap-2">
            <Link2 className="w-5 h-5" /> Conectar a {clienteNome}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => { setTab(v); setSearch(""); }}>
          <TabsList className="bg-secondary border border-border/50 w-full">
            <TabsTrigger value="imoveis" className="flex-1 gap-1.5 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <Home className="w-3.5 h-3.5" /> Imóveis
            </TabsTrigger>
            <TabsTrigger value="contratos" className="flex-1 gap-1.5 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <FileText className="w-3.5 h-3.5" /> Contratos
            </TabsTrigger>
          </TabsList>

          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tab === "imoveis" ? "Buscar imóvel disponível..." : "Buscar contrato..."}
              className="pl-9 bg-secondary border-border"
            />
          </div>

          <TabsContent value="imoveis" className="mt-3 space-y-2 max-h-[40vh] overflow-y-auto">
            {availableImoveis.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhum imóvel disponível encontrado</p>
            )}
            {availableImoveis.map((i) => {
              const linked = isImovelLinked(i.id);
              return (
                <div key={i.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/30 hover:border-primary/50 transition-colors">
                  {i.fotoUrl ? (
                    <img src={i.fotoUrl} alt={i.endereco} className="w-14 h-14 rounded-lg object-cover border border-border/50" />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center">
                      <Home className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{i.endereco}</p>
                    <p className="text-xs text-muted-foreground">{i.tipo} · {i.bairro}</p>
                    <p className="text-xs font-mono text-accent">{fmt(i.valor)}</p>
                  </div>
                  {linked ? (
                    <Badge variant="secondary" className="gap-1 text-accent">
                      <CheckCircle2 className="w-3 h-3" /> Vinculado
                    </Badge>
                  ) : (
                    <Button size="sm" onClick={() => handleLinkImovel(i)} className="bg-primary text-primary-foreground hover:bg-primary/80 gap-1">
                      <Link2 className="w-3.5 h-3.5" /> Vincular
                    </Button>
                  )}
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="contratos" className="mt-3 space-y-2 max-h-[40vh] overflow-y-auto">
            {availableContratos.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhum contrato encontrado</p>
            )}
            {availableContratos.map((c) => {
              const imovel = imoveis.find((i) => i.id === c.imovelId);
              const alreadyLinked = c.clienteId === clienteId;
              return (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/30 hover:border-primary/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{imovel?.endereco || "Imóvel não encontrado"}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-[10px] py-0">{c.tipo}</Badge>
                      <Badge variant="outline" className="text-[10px] py-0">{c.etapa}</Badge>
                    </div>
                    <p className="text-xs font-mono text-accent mt-0.5">{fmt(c.valorTotal)}</p>
                  </div>
                  {alreadyLinked ? (
                    <Badge variant="secondary" className="gap-1 text-accent">
                      <CheckCircle2 className="w-3 h-3" /> Vinculado
                    </Badge>
                  ) : (
                    <Button size="sm" onClick={() => handleLinkContrato(c)} className="bg-primary text-primary-foreground hover:bg-primary/80 gap-1">
                      <Link2 className="w-3.5 h-3.5" /> Vincular
                    </Button>
                  )}
                </div>
              );
            })}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
