import { useData, Cliente } from "@/contexts/DataContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Target, Home, FileText, CheckCircle2, Clock, Send, FileCheck } from "lucide-react";

interface ClienteDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: Cliente | null;
}

const etapaIcons: Record<string, typeof Clock> = {
  Proposta: Send,
  Documentação: FileText,
  Assinatura: FileCheck,
  Concluído: CheckCircle2,
};

export default function ClienteDetailModal({ open, onOpenChange, cliente }: ClienteDetailModalProps) {
  const { contratos, imoveis } = useData();

  if (!cliente) return null;

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("pt-BR") : "—";

  // Get linked contracts for this client
  const linkedContratos = contratos.filter((c) => c.clienteId === cliente.id);

  // Get unique linked properties (via contracts)
  const linkedImovelIds = [...new Set(linkedContratos.map((c) => c.imovelId).filter(Boolean))];
  const linkedImoveis = linkedImovelIds.map((id) => imoveis.find((i) => i.id === id)).filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-neon">Detalhes do Cliente</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          {/* Basic Info */}
          <div className="space-y-2">
            <p><span className="text-muted-foreground">Nome:</span> {cliente.nome}</p>
            <p><span className="text-muted-foreground">Contato:</span> {cliente.contato}</p>
            <p><span className="text-muted-foreground">CPF/CNPJ:</span> <span className="font-mono">{cliente.cpfCnpj}</span></p>
            <div><span className="text-muted-foreground">Interesses:</span>
              <div className="flex gap-1 flex-wrap mt-1">{cliente.interesses.map((int, i) => <Badge key={i} variant="secondary">{int}</Badge>)}</div>
            </div>
          </div>

          {/* Preference */}
          {cliente.preferencia && (
            <div className="border border-accent/30 rounded-lg p-3">
              <Label className="text-xs text-accent inline-flex items-center gap-1 mb-1"><Target className="w-3.5 h-3.5" /> Perfil de Match</Label>
              <div className="text-xs space-y-1 mt-1">
                <p><span className="text-muted-foreground">Tipo:</span> {cliente.preferencia.tipoImovel || "Qualquer"}</p>
                <p><span className="text-muted-foreground">Bairro:</span> {cliente.preferencia.bairro || "Qualquer"}</p>
                <p><span className="text-muted-foreground">Valor Máx:</span> {fmt(cliente.preferencia.valorMax)}</p>
              </div>
            </div>
          )}

          {/* Linked Properties */}
          <div className="border border-primary/30 rounded-lg p-3 space-y-2">
            <Label className="text-xs text-primary inline-flex items-center gap-1">
              <Home className="w-3.5 h-3.5" /> Patrimônio Vinculado
              <Badge variant="outline" className="ml-1 text-[10px] py-0">{linkedImoveis.length}</Badge>
            </Label>
            {linkedImoveis.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">Nenhum imóvel vinculado</p>
            ) : (
              <div className="space-y-2 mt-1">
                {linkedImoveis.map((imovel) => {
                  if (!imovel) return null;
                  // Find the contract for this property+client
                  const relatedContract = linkedContratos.find((c) => c.imovelId === imovel.id);
                  return (
                    <div key={imovel.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50 border border-border/30">
                      {imovel.fotoUrl ? (
                        <img src={imovel.fotoUrl} alt={imovel.endereco} className="w-12 h-12 rounded-lg object-cover border border-border/50" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                          <Home className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{imovel.endereco}</p>
                        <p className="text-[10px] text-muted-foreground">{imovel.tipo} · {imovel.bairro}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge
                            variant="outline"
                            className={`text-[10px] py-0 ${
                              imovel.status === "Disponível" ? "border-accent/50 text-accent" :
                              imovel.status === "Vendido" ? "border-chart-orange/50 text-chart-orange" :
                              "border-primary/50 text-primary"
                            }`}
                          >
                            {imovel.status}
                          </Badge>
                          {relatedContract && (
                            <Badge variant="outline" className="text-[10px] py-0 border-primary/50 text-primary">
                              {relatedContract.tipo}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-mono text-accent">{fmt(imovel.valor)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Linked Contracts */}
          <div className="border border-chart-purple/30 rounded-lg p-3 space-y-2">
            <Label className="text-xs text-chart-purple inline-flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Contratos Vinculados
              <Badge variant="outline" className="ml-1 text-[10px] py-0">{linkedContratos.length}</Badge>
            </Label>
            {linkedContratos.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">Nenhum contrato vinculado</p>
            ) : (
              <div className="space-y-2 mt-1">
                {linkedContratos.map((contrato) => {
                  const imovel = imoveis.find((i) => i.id === contrato.imovelId);
                  const EtapaIcon = etapaIcons[contrato.etapa] || Clock;
                  return (
                    <div key={contrato.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50 border border-border/30">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        contrato.etapa === "Concluído" ? "bg-accent/10" :
                        contrato.etapa === "Assinatura" ? "bg-chart-purple/10" :
                        contrato.etapa === "Documentação" ? "bg-chart-blue/10" :
                        "bg-chart-orange/10"
                      }`}>
                        <EtapaIcon className={`w-4 h-4 ${
                          contrato.etapa === "Concluído" ? "text-accent" :
                          contrato.etapa === "Assinatura" ? "text-chart-purple" :
                          contrato.etapa === "Documentação" ? "text-chart-blue" :
                          "text-chart-orange"
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{imovel?.endereco || "—"}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge variant="outline" className={`text-[10px] py-0 ${contrato.tipo === "Venda" ? "border-chart-orange/50 text-chart-orange" : "border-primary/50 text-primary"}`}>
                            {contrato.tipo}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">{contrato.etapa}</span>
                          {contrato.comissaoPaga && <CheckCircle2 className="w-3 h-3 text-accent" />}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-mono text-accent">{fmt(contrato.valorTotal)}</p>
                        <p className="text-[10px] text-muted-foreground">{fmtDate(contrato.dataInicio)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
