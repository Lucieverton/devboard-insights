import { useState, useMemo } from "react";
import { useData, Contrato } from "@/contexts/DataContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Eye, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Label } from "@/components/ui/label";

const PAGE_SIZE = 8;

const emptyForm: Omit<Contrato, "id"> = { imovelId: "", clienteId: "", tipo: "Locação", valorTotal: 0, comissaoPercent: 10, dataInicio: "", dataFim: "" };

export default function ContratosPage() {
  const { contratos, imoveis, clientes, addContrato, updateContrato, deleteContrato } = useData();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<string>("dataInicio");
  const [sortAsc, setSortAsc] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Contrato | null>(null);
  const [viewing, setViewing] = useState<Contrato | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Contrato, "id">>(emptyForm);

  const getImovelLabel = (id: string) => { const i = imoveis.find((x) => x.id === id); return i ? `${i.endereco} (${i.bairro})` : id; };
  const getClienteLabel = (id: string) => { const c = clientes.find((x) => x.id === id); return c ? c.nome : id; };

  const filtered = useMemo(() => {
    let list = contratos.filter((c) => {
      const s = search.toLowerCase();
      return getImovelLabel(c.imovelId).toLowerCase().includes(s) || getClienteLabel(c.clienteId).toLowerCase().includes(s) || c.tipo.toLowerCase().includes(s);
    });
    list.sort((a, b) => {
      const av = (a as any)[sortKey], bv = (b as any)[sortKey];
      if (typeof av === "number") return sortAsc ? av - bv : bv - av;
      return sortAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return list;
  }, [contratos, search, sortKey, sortAsc, imoveis, clientes]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const openNew = () => {
    setEditing(null);
    setForm({ ...emptyForm, imovelId: imoveis[0]?.id || "", clienteId: clientes[0]?.id || "" });
    setModalOpen(true);
  };
  const openEdit = (c: Contrato) => { setEditing(c); setForm({ imovelId: c.imovelId, clienteId: c.clienteId, tipo: c.tipo, valorTotal: c.valorTotal, comissaoPercent: c.comissaoPercent, dataInicio: c.dataInicio, dataFim: c.dataFim }); setModalOpen(true); };
  const openView = (c: Contrato) => { setViewing(c); setViewOpen(true); };
  const openDelete = (id: string) => { setDeleteId(id); setDeleteOpen(true); };

  const handleSave = () => {
    if (!form.imovelId || !form.clienteId) return;
    if (editing) updateContrato({ ...form, id: editing.id });
    else addContrato(form);
    setModalOpen(false);
  };

  const handleSort = (key: string) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const SortHeader = ({ k, label }: { k: string; label: string }) => (
    <th className="py-2 px-3 text-left text-xs uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-primary select-none" onClick={() => handleSort(k)}>
      {label} {sortKey === k ? (sortAsc ? "↑" : "↓") : ""}
    </th>
  );

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="p-3 md:p-6 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg md:text-xl font-bold text-neon">Contratos</h2>
        <Button onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary/80"><Plus className="w-4 h-4 mr-1.5" /> Adicionar Novo</Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} placeholder="Buscar contratos..." className="pl-9 bg-secondary border-border" />
      </div>
      <div className="neon-border card-inset rounded-lg bg-card overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead><tr className="border-b border-border/50">
            <SortHeader k="tipo" label="Tipo" />
            <th className="py-2 px-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Imóvel</th>
            <th className="py-2 px-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Cliente</th>
            <SortHeader k="valorTotal" label="Valor" />
            <SortHeader k="comissaoPercent" label="Comissão %" />
            <SortHeader k="dataInicio" label="Início" />
            <th className="py-2 px-3 text-right text-xs uppercase tracking-wider text-muted-foreground">Ações</th>
          </tr></thead>
          <tbody>
            {paged.map((c) => (
              <tr key={c.id} className="border-b border-border/20 hover:bg-secondary/30 transition-colors">
                <td className="py-2 px-3"><span className={`text-xs px-2 py-0.5 rounded-full ${c.tipo === "Venda" ? "bg-chart-orange/20 text-chart-orange" : "bg-primary/20 text-primary"}`}>{c.tipo}</span></td>
                <td className="py-2 px-3 text-muted-foreground truncate max-w-[200px]">{getImovelLabel(c.imovelId)}</td>
                <td className="py-2 px-3">{getClienteLabel(c.clienteId)}</td>
                <td className="py-2 px-3 font-mono text-green-neon">{fmt(c.valorTotal)}</td>
                <td className="py-2 px-3 font-mono text-neon">{c.comissaoPercent}%</td>
                <td className="py-2 px-3 text-muted-foreground">{c.dataInicio}</td>
                <td className="py-2 px-3 text-right space-x-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-primary" onClick={() => openView(c)}><Eye className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-primary" onClick={() => openEdit(c)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive" onClick={() => openDelete(c.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </td>
              </tr>
            ))}
            {paged.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">Nenhum contrato encontrado</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{filtered.length} registro(s)</span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft className="w-4 h-4" /></Button>
          <span>{page + 1} / {totalPages}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}><ChevronRight className="w-4 h-4" /></Button>
        </div>
      </div>

      {/* Form Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle className="text-neon">{editing ? "Editar Contrato" : "Novo Contrato"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs text-muted-foreground">Imóvel</Label>
                <Select value={form.imovelId} onValueChange={(v) => setForm({ ...form, imovelId: v })}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50 max-h-48">{imoveis.map((i) => <SelectItem key={i.id} value={i.id}>{i.endereco} ({i.bairro})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs text-muted-foreground">Cliente</Label>
                <Select value={form.clienteId} onValueChange={(v) => setForm({ ...form, clienteId: v })}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50 max-h-48">{clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label className="text-xs text-muted-foreground">Tipo</Label>
                <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v as "Locação" | "Venda", comissaoPercent: v === "Venda" ? 5 : 10 })}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50"><SelectItem value="Locação">Locação</SelectItem><SelectItem value="Venda">Venda</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs text-muted-foreground">Valor Total (R$)</Label><Input type="number" value={form.valorTotal} onChange={(e) => setForm({ ...form, valorTotal: Number(e.target.value) })} className="bg-secondary border-border" /></div>
              <div><Label className="text-xs text-muted-foreground">Comissão %</Label><Input type="number" value={form.comissaoPercent} onChange={(e) => setForm({ ...form, comissaoPercent: Number(e.target.value) })} className="bg-secondary border-border" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs text-muted-foreground">Data Início</Label><Input type="date" value={form.dataInicio} onChange={(e) => setForm({ ...form, dataInicio: e.target.value })} className="bg-secondary border-border" /></div>
              <div><Label className="text-xs text-muted-foreground">Data Fim</Label><Input type="date" value={form.dataFim} onChange={(e) => setForm({ ...form, dataFim: e.target.value })} className="bg-secondary border-border" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} className="border-border">Cancelar</Button>
            <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/80">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle className="text-neon">Detalhes do Contrato</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Tipo:</span> {viewing.tipo}</p>
              <p><span className="text-muted-foreground">Imóvel:</span> {getImovelLabel(viewing.imovelId)}</p>
              <p><span className="text-muted-foreground">Cliente:</span> {getClienteLabel(viewing.clienteId)}</p>
              <p><span className="text-muted-foreground">Valor:</span> <span className="font-mono text-green-neon">{fmt(viewing.valorTotal)}</span></p>
              <p><span className="text-muted-foreground">Comissão:</span> <span className="font-mono text-neon">{viewing.comissaoPercent}% = {fmt(viewing.valorTotal * viewing.comissaoPercent / 100)}</span></p>
              <p><span className="text-muted-foreground">Período:</span> {viewing.dataInicio} a {viewing.dataFim}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader><AlertDialogTitle>Confirmar exclusão</AlertDialogTitle><AlertDialogDescription>Tem certeza que deseja excluir este contrato?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/80" onClick={() => { if (deleteId) deleteContrato(deleteId); setDeleteOpen(false); }}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
