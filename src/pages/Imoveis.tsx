import { useState, useMemo } from "react";
import { useData, Imovel } from "@/contexts/DataContext";
import { BAIRROS, TIPOS_IMOVEL } from "@/data/mockData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Eye, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Label } from "@/components/ui/label";

const STATUSES = ["Disponível", "Vendido", "Alugado"] as const;
const PAGE_SIZE = 8;
const bairrosOpts = BAIRROS.slice(1);
const tiposOpts = TIPOS_IMOVEL.slice(1);

const emptyForm: Omit<Imovel, "id"> = { endereco: "", bairro: bairrosOpts[0], tipo: tiposOpts[0], valor: 0, status: "Disponível" };

export default function ImoveisPage() {
  const { imoveis, addImovel, updateImovel, deleteImovel } = useData();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<keyof Imovel>("endereco");
  const [sortAsc, setSortAsc] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Imovel | null>(null);
  const [viewing, setViewing] = useState<Imovel | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Imovel, "id">>(emptyForm);

  const filtered = useMemo(() => {
    let list = imoveis.filter((i) =>
      i.endereco.toLowerCase().includes(search.toLowerCase()) ||
      i.bairro.toLowerCase().includes(search.toLowerCase()) ||
      i.tipo.toLowerCase().includes(search.toLowerCase())
    );
    list.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") return sortAsc ? av - bv : bv - av;
      return sortAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return list;
  }, [imoveis, search, sortKey, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const openNew = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (i: Imovel) => { setEditing(i); setForm({ endereco: i.endereco, bairro: i.bairro, tipo: i.tipo, valor: i.valor, status: i.status }); setModalOpen(true); };
  const openView = (i: Imovel) => { setViewing(i); setViewOpen(true); };
  const openDelete = (id: string) => { setDeleteId(id); setDeleteOpen(true); };

  const handleSave = () => {
    if (!form.endereco.trim()) return;
    if (editing) updateImovel({ ...form, id: editing.id });
    else addImovel(form);
    setModalOpen(false);
  };

  const handleSort = (key: keyof Imovel) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const SortHeader = ({ k, label }: { k: keyof Imovel; label: string }) => (
    <th className="py-2 px-3 text-left text-xs uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-primary select-none" onClick={() => handleSort(k)}>
      {label} {sortKey === k ? (sortAsc ? "↑" : "↓") : ""}
    </th>
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neon">Imóveis</h2>
        <Button onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary/80">
          <Plus className="w-4 h-4 mr-1.5" /> Adicionar Novo
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} placeholder="Buscar imóveis..." className="pl-9 bg-secondary border-border" />
      </div>

      <div className="neon-border card-inset rounded-lg bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border/50">
            <SortHeader k="endereco" label="Endereço" />
            <SortHeader k="bairro" label="Bairro" />
            <SortHeader k="tipo" label="Tipo" />
            <SortHeader k="valor" label="Valor" />
            <SortHeader k="status" label="Status" />
            <th className="py-2 px-3 text-right text-xs uppercase tracking-wider text-muted-foreground">Ações</th>
          </tr></thead>
          <tbody>
            {paged.map((i) => (
              <tr key={i.id} className="border-b border-border/20 hover:bg-secondary/30 transition-colors">
                <td className="py-2 px-3">{i.endereco}</td>
                <td className="py-2 px-3 text-muted-foreground">{i.bairro}</td>
                <td className="py-2 px-3 text-muted-foreground">{i.tipo}</td>
                <td className="py-2 px-3 font-mono text-green-neon">{i.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                <td className="py-2 px-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${i.status === "Disponível" ? "bg-accent/20 text-accent" : i.status === "Vendido" ? "bg-chart-orange/20 text-chart-orange" : "bg-primary/20 text-primary"}`}>
                    {i.status}
                  </span>
                </td>
                <td className="py-2 px-3 text-right space-x-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-primary" onClick={() => openView(i)}><Eye className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-primary" onClick={() => openEdit(i)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive" onClick={() => openDelete(i.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </td>
              </tr>
            ))}
            {paged.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Nenhum imóvel encontrado</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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
          <DialogHeader><DialogTitle className="text-neon">{editing ? "Editar Imóvel" : "Novo Imóvel"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs text-muted-foreground">Endereço</Label><Input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} className="bg-secondary border-border" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs text-muted-foreground">Bairro</Label>
                <Select value={form.bairro} onValueChange={(v) => setForm({ ...form, bairro: v })}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50">{bairrosOpts.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs text-muted-foreground">Tipo</Label>
                <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50">{tiposOpts.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs text-muted-foreground">Valor (R$)</Label><Input type="number" value={form.valor} onChange={(e) => setForm({ ...form, valor: Number(e.target.value) })} className="bg-secondary border-border" /></div>
              <div><Label className="text-xs text-muted-foreground">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Imovel["status"] })}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50">{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
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
          <DialogHeader><DialogTitle className="text-neon">Detalhes do Imóvel</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Endereço:</span> {viewing.endereco}</p>
              <p><span className="text-muted-foreground">Bairro:</span> {viewing.bairro}</p>
              <p><span className="text-muted-foreground">Tipo:</span> {viewing.tipo}</p>
              <p><span className="text-muted-foreground">Valor:</span> <span className="font-mono text-green-neon">{viewing.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span></p>
              <p><span className="text-muted-foreground">Status:</span> {viewing.status}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/80" onClick={() => { if (deleteId) deleteImovel(deleteId); setDeleteOpen(false); }}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
