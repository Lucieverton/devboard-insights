import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Imovel, useData } from "@/contexts/DataContext";
import { HandshakeIcon, Home, User, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imovel: Imovel;
}

// Commission defaults based on property type
function getDefaultComissao(tipo: string, operacao: "Venda" | "Locação"): number {
  if (operacao === "Locação") return 100; // 1 month rent typically
  // Sale commissions by type
  switch (tipo) {
    case "Casa":
    case "Apartamento":
    case "Terreno":
      return 6; // Urban: 6%
    case "Ponto Comercial":
    case "Sala Comercial":
    case "Galpão":
      return 7; // Commercial: 6-8%
    default:
      return 6;
  }
}

export function FinalizarNegocioModal({ open, onOpenChange, imovel }: Props) {
  const { clientes, contratos, addContrato, updateContrato, updateImovel } = useData();

  const [operacao, setOperacao] = useState<"Venda" | "Locação">("Venda");
  const [clienteId, setClienteId] = useState("");
  const [valorTotal, setValorTotal] = useState(imovel.valor);
  const [comissaoPercent, setComissaoPercent] = useState(getDefaultComissao(imovel.tipo, "Venda"));
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split("T")[0]);
  const [dataFim, setDataFim] = useState("");
  const [comissaoPaga, setComissaoPaga] = useState(false);
  const [saving, setSaving] = useState(false);

  // Check if there's already an active contract for this property
  const existingContract = useMemo(() => {
    return contratos.find(
      (c) => c.imovelId === imovel.id && !["Cancelado", "Concluído"].includes(c.etapa)
    );
  }, [contratos, imovel.id]);

  // Pre-fill client if existing contract
  const effectiveClienteId = clienteId || existingContract?.clienteId || "";

  const comissaoValor = operacao === "Locação"
    ? valorTotal // For rent, commission = first month
    : valorTotal * comissaoPercent / 100;

  const handleOperacaoChange = (v: "Venda" | "Locação") => {
    setOperacao(v);
    setComissaoPercent(getDefaultComissao(imovel.tipo, v));
  };

  const handleFinalizar = async () => {
    if (!effectiveClienteId) {
      toast({ title: "Selecione um cliente", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const newStatus = operacao === "Venda" ? "Vendido" : "Alugado";

      // If there's an existing active contract, update it to Concluído
      if (existingContract) {
        await updateContrato({
          ...existingContract,
          tipo: operacao,
          valorTotal,
          comissaoPercent: operacao === "Locação" ? 100 : comissaoPercent,
          clienteId: effectiveClienteId,
          dataInicio,
          dataFim,
          etapa: "Concluído",
          notas: [...existingContract.notas, { id: "", texto: `Negócio finalizado: ${operacao} por ${valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`, data: new Date().toISOString() }],
          dataRecebimento: comissaoPaga ? dataInicio : "",
          comissaoPaga,
        });
      } else {
        // Create a new contract as Concluído
        await addContrato({
          imovelId: imovel.id,
          clienteId: effectiveClienteId,
          tipo: operacao,
          valorTotal,
          comissaoPercent: operacao === "Locação" ? 100 : comissaoPercent,
          dataInicio,
          dataFim,
          etapa: "Concluído",
          notas: [{ id: "", texto: `Negócio finalizado: ${operacao} por ${valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`, data: new Date().toISOString() }],
          dataRecebimento: comissaoPaga ? dataInicio : "",
          comissaoPaga,
          documentoUrl: "",
        });
      }

      // Update property status
      await updateImovel({ ...imovel, status: newStatus as Imovel["status"] });

      toast({
        title: `Imóvel ${newStatus}!`,
        description: `Contrato registrado com comissão de ${comissaoValor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
      });
      onOpenChange(false);
    } catch (err) {
      toast({ title: "Erro ao finalizar negócio", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-neon flex items-center gap-2">
            <HandshakeIcon className="w-5 h-5" /> Finalizar Negócio
          </DialogTitle>
        </DialogHeader>

        {/* Property Info */}
        <div className="neon-border card-inset rounded-lg bg-secondary/30 p-3 flex items-center gap-3">
          <Home className="w-8 h-8 text-primary shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{imovel.endereco}</p>
            <p className="text-xs text-muted-foreground">{imovel.tipo} · {imovel.bairro} · {imovel.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
          </div>
          <Badge className={`shrink-0 ${imovel.status === "Disponível" ? "bg-accent/20 text-accent" : "bg-chart-orange/20 text-chart-orange"}`}>
            {imovel.status}
          </Badge>
        </div>

        {existingContract && (
          <div className="flex items-center gap-2 text-xs p-2 rounded bg-chart-orange/10 border border-chart-orange/20 text-chart-orange">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Existe um contrato ativo na etapa "{existingContract.etapa}". Um novo contrato será criado como "Concluído".</span>
          </div>
        )}

        <div className="space-y-3">
          {/* Operation type */}
          <div>
            <Label className="text-xs text-muted-foreground">Tipo de Operação</Label>
            <Select value={operacao} onValueChange={(v) => handleOperacaoChange(v as "Venda" | "Locação")}>
              <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                <SelectItem value="Venda">🏷️ Venda</SelectItem>
                <SelectItem value="Locação">🔑 Locação</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Client */}
          <div>
            <Label className="text-xs text-muted-foreground">Cliente Comprador/Locatário</Label>
            <Select value={effectiveClienteId} onValueChange={setClienteId}>
              <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
              <SelectContent className="bg-popover border-border z-50 max-h-48">
                {clientes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="flex items-center gap-2">
                      <User className="w-3 h-3" /> {c.nome}
                    </span>
                  </SelectItem>
                ))
                }
              </SelectContent>
            </Select>
          </div>

          {/* Values */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">
                {operacao === "Venda" ? "Valor da Venda (R$)" : "Valor do Aluguel (R$)"}
              </Label>
              <Input
                type="number"
                value={valorTotal}
                onChange={(e) => setValorTotal(Number(e.target.value))}
                className="bg-secondary border-border"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                {operacao === "Venda" ? "Comissão (%)" : "Comissão (meses)"}
              </Label>
              <Input
                type="number"
                value={comissaoPercent}
                onChange={(e) => setComissaoPercent(Number(e.target.value))}
                className="bg-secondary border-border"
                step={operacao === "Venda" ? 0.5 : 1}
              />
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {operacao === "Venda"
                  ? `Urbano: 6-7% · Rural: 8-10% · Comercial: 6-8%`
                  : `Padrão: 1 mês de aluguel`}
              </p>
            </div>
          </div>

          {/* Commission preview */}
          <div className="neon-border card-inset rounded-lg bg-accent/5 p-3 text-center">
            <p className="text-xs text-muted-foreground">Comissão do Corretor</p>
            <p className="text-xl font-bold font-mono text-green-neon">
              {comissaoValor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Data do Negócio</Label>
              <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="bg-secondary border-border" />
            </div>
            {operacao === "Locação" && (
              <div>
                <Label className="text-xs text-muted-foreground">Fim do Contrato</Label>
                <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="bg-secondary border-border" />
              </div>
            )}
          </div>

          {/* Commission paid? */}
          <div className="flex items-center gap-3 p-2 rounded bg-secondary/50">
            <Switch checked={comissaoPaga} onCheckedChange={setComissaoPaga} />
            <Label className="text-xs text-muted-foreground">Comissão já foi paga?</Label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-border">Cancelar</Button>
          <Button
            onClick={handleFinalizar}
            disabled={saving || !effectiveClienteId}
            className="bg-accent text-accent-foreground hover:bg-accent/80"
          >
            <HandshakeIcon className="w-4 h-4 mr-1.5" />
            {saving ? "Salvando..." : `Confirmar ${operacao}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
